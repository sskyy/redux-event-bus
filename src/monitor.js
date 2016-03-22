import { Component, createElement } from 'react'
import { DEFAULT_GROUP_NAME } from './util'
import { shallowEqual } from './helpers'
import hoistStatics from 'hoist-non-react-statics'
import storeShape from './storeShape'

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default function monitor(mapStateToProps, mapEmitToProps) {

  const finalMapEmitToProps = mapEmitToProps || ( emit => { return { emit } } )

  return function (WrappedComponent) {

    class MonitorComponent extends Component {
      shouldComponentUpdate() {
        return this.haveOwnPropsChanged || this.hasStatusChanged
      }

      constructor(props, context) {
        super(props, context)
        if (context.store.reduxTaskLiftedStore === undefined) {
          throw new Error('Did you forget to use enhancer to create store?')
        }
        this.bus = context.store.reduxTaskLiftedStore.bus
        const groupState = { ...this.bus.state }
        delete groupState[DEFAULT_GROUP_NAME]

        this.state = {
          taskState: mapStateToProps(
            { ...this.bus.state[DEFAULT_GROUP_NAME] }, { ...groupState }
          )
        }
      }

      componentDidMount() {
        this.unsubscrib = this.bus.onStateChange(this.handleStatusChange.bind(this))
      }

      componentWillUnmount() {
        this.unsubscrib()
      }

      handleStatusChange(state) {
        const groupState = { ...state }
        delete groupState[DEFAULT_GROUP_NAME]
        const newMappedStates = mapStateToProps( { ...state[DEFAULT_GROUP_NAME] }, { ...groupState })
        if (! shallowEqual(newMappedStates, this.state.taskState)) {
          this.hasStatusChanged = true
          this.setState({ taskState: newMappedStates })
        }else {
          // nothing happened
        }
      }

      componentWillReceiveProps() {
        this.haveOwnPropsChanged = true
      }

      render() {
        this.haveOwnPropsChanged = false
        this.hasStatusChanged = false

        const emitProps = finalMapEmitToProps(this.bus.emit.bind(this.bus))

        return createElement(WrappedComponent, { ...this.state.taskState, ...this.props, ...emitProps })

      }
    }

    MonitorComponent.displayName = `Monitor(${getDisplayName(WrappedComponent)})`
    MonitorComponent.WrappedComponent = WrappedComponent
    MonitorComponent.contextTypes = {
      store: storeShape
    }
    MonitorComponent.propTypes = {
      store: storeShape
    }

    return hoistStatics(MonitorComponent, WrappedComponent)
  }

}

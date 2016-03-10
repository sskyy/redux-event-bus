import { Component, createElement } from 'react'
import { DEFAULT_GROUP_NAME } from './util'
import { shallowEqual } from './helpers'
import hoistStatics from 'hoist-non-react-statics'
import storeShape from './storeShape'
import assign from 'object-assign'

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default function monitor(mapStateToProps) {
  return function (WrappedComponent) {

    class MonitorComponent extends Component {
      shouldComponentUpdate() {
        return this.haveOwnPropsChanged || this.hasStatusChanged
      }

      constructor(props, context) {
        super(props, context)
        if (context.store.liftedStore === undefined) {
          throw new Error('Did you forget to use enhancer to create store?')
        }
        this.bus = context.store.liftedStore.bus
        const groupState = assign({}, this.bus.state)
        delete groupState[DEFAULT_GROUP_NAME]
        this.state = { taskState: mapStateToProps(this.bus.state[DEFAULT_GROUP_NAME], groupState)  }
      }

      componentDidMount() {
        this.unsubscrib = this.bus.onStateChange(this.handleStatusChange.bind(this))
      }

      componentWillUnmount() {
        this.unsubscrib()
      }

      handleStatusChange(state) {
        const groupState = assign({}, state)
        delete groupState[DEFAULT_GROUP_NAME]
        const newMappedStatus = mapStateToProps(state[DEFAULT_GROUP_NAME], groupState)
        if (! shallowEqual(newMappedStatus, this.state.taskState)) {
          this.hasStatusChanged = true
          this.setState({ taskState: newMappedStatus })
        }
      }

      componentWillReceiveProps() {
        this.haveOwnPropsChanged = true
      }

      render() {
        this.haveOwnPropsChanged = false
        this.hasStatusChanged = false
        return createElement(WrappedComponent, { ...this.state.taskState, ...this.props })

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

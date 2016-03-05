import {Component,createElement} from 'react'
import {shallowEqual} from './helpers'
import hoistStatics from 'hoist-non-react-statics'
import storeShape from './storeShape'

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export default function monitor(mapStateToProps, connected){
    return function(ComponentToWrap){

        const WrappedComponent =  typeof connected === 'undefined' ? ComponentToWrap : connected(ComponentToWrap)


        class MonitorComponent extends Component {
            shouldComponentUpdate(){
                return this.haveOwnPropsChanged || this.hasStatusChanged
            }
            constructor(props,context){
                super(props, context)
                if( context.store.bus === undefined){
                    throw new Error('Did you forget to use enhancer to create store?')
                }
                this.bus = context.store.bus
                this.state = {status:mapStateToProps(this.bus.status)}
            }
            componentDidMount(){
                this.unsubscrib = this.bus.onStatusChange(this.handleStatusChange.bind(this))
            }
            componentWillUnmount(){
                this.unsubscrib()
            }
            handleStatusChange(status) {
                const newMappedStatus = mapStateToProps(status)
                if (!shallowEqual(newMappedStatus, this.state.status)) {
                    this.hasStatusChanged = true
                    this.setState({status: newMappedStatus})
                }
            }
            componentWillReceiveProps(nextProps) {
                this.haveOwnPropsChanged = true
            }
            render(){
                this.haveOwnPropsChanged = false
                this.hasStatusChanged = false
                console.log(1111, JSON.stringify(this.state.status))
                return createElement(WrappedComponent, {...this.state.status, ...this.props})

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

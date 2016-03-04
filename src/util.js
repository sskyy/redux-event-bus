import React from 'react'
import {NamedYieldable, Listener} from './types'


export function listen( eventName, handler ){
  return new Listener({
    listenTo : eventName,
    handler
  })
}

export function name(yieldable, name){
  return new NamedYieldable({
    yieldable,
    name
  })
}


export function monitor(){
  return WrappedComponent=>{
    return ()=>{
      return <div></div>
    }

    return (props)=>{
      return <WrappedComponent {...props} />
    }
  }
}


export function fromReduxAction( ReduxActionType ){
  return function(action){
    return action.type === ReduxActionType
  }
}
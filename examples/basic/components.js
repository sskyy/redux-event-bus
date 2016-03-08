import React from 'react'
import { ACTION_ADD, ACTION_ADD_ASYNC } from './reducer'
import { connect } from 'react-redux'
import { monitor } from 'redux-task'
import { TASK_ADDING } from './listener'


export const Input = connect(state=> {
  return { count: state.count }
})(
  (props)=> {
    return (
      <div>
        <input value={props.count}/>
        <button onClick={()=>props.dispatch({ type:ACTION_ADD })}>add</button>
        <button onClick={()=>props.dispatch({ type:ACTION_ADD_ASYNC })}>add(async action)</button>
      </div>
    )
  }
)

export const Message = connect()(
  (props)=> {
    return <div>message from reducer : {props.message}</div>
  }
)


function mapPromiseToState(state) {
  return {
    addingState: state[TASK_ADDING]
  }
}

export const Indicator = monitor(mapPromiseToState)(connect(f=>f)(
  (props)=> {
    return <div>current promise state:<strong>{props.addingState}</strong></div>
  }
))

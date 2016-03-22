import React from 'react'
import { ACTION_ADD, ACTION_ADD_ASYNC } from './reducer'
import { connect } from 'react-redux'
import { monitor } from 'redux-task'
import { TASK_ADDING } from './listener'
import assign from 'object-assign'


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


function mapPromiseToState(state, groupState) {
  return {
    groupState : assign({}, groupState)
  }
}

export const Indicator = monitor(mapPromiseToState)(connect(f=>f)(
  (props)=> {
    return (
      <div>
        state of tasks:
        {Object.keys(props.groupState).map(groupName=>{
          return (
            <div>
              <div>{groupName}</div>
              <ul>
                {Object.keys(props.groupState[groupName]).map(taskName=>{
                  return (
                    <li>{taskName}:{props.groupState[groupName][taskName]}</li>
                  )
                })
              }
              </ul>
            </div>
          )
        })}
      </div>
    )
  }
))

import { listen, name, fromReduxAction } from 'redux-task'
import { ACTION_ADD_ASYNC, ACTION_ADD, ACTION_FAILED, ACTION_CANCEL } from './reducer'

export const TASK_ADDING = 'adding'

const PENDING_STATE = 'pending'

function doSomeAjaxCount() {
  return new Promise((resolve,reject)=>{
    //do some ajax
    setTimeout(()=>Math.random() > 0? resolve({ r:'success' }) : reject({ e:'random error' }) ,2000)
  })
}

export const addListener =  listen( fromReduxAction(ACTION_ADD_ASYNC), name(function* thisIsAsyncListener({ dispatch }) {

  const { r, e } = yield doSomeAjaxCount()

  if( e ) {
    dispatch({ type:ACTION_FAILED, payload :r })
  }else {
    dispatch({ type:ACTION_ADD, payload :r })
  }

}, TASK_ADDING))

export const cancelListener =  listen( fromReduxAction(ACTION_CANCEL), function* thisWillCancel({ getTaskState, cancel }) {
  if( getTaskState(TASK_ADDING) ===  PENDING_STATE ) {
    cancel(TASK_ADDING)
  }
})

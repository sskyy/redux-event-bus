import { listen, nameGroup, fromReduxAction } from 'redux-task/util'

import { ACTION_ADD_ASYNC, ACTION_ADD, ACTION_FAILED } from './reducer'

export const TASK_ADDING = 'adding'

function doSomeAjaxCount() {
  return new Promise((resolve,reject)=>{
    //do some ajax
    setTimeout(()=>Math.random() > 0? resolve({ r:'success' }) : reject({ e:'random error' }) ,100)
  })
}


export default listen( fromReduxAction(ACTION_ADD_ASYNC), nameGroup(function* thisIsAsyncListener({ dispatch }) {

  //const { r, e } = yield doSomeAjaxCount()
  const { r, e } = yield doSomeAjaxCount()

  if( e ) {
    dispatch({ type:ACTION_FAILED, payload :r })
  }else {
    dispatch({ type:ACTION_ADD, payload :r })
  }

}, TASK_ADDING))

import { listen, name, fromReduxAction } from 'redux-task/util'

import { ACTION_ADD_ASYNC, ACTION_ADD, ACTION_FAILED } from './reducer'

export const TASK_ADDING = 'adding'

function doSomeAjaxCount() {
  return new Promise((resolve,reject)=>{
    //do some ajax
    setTimeout(()=>Math.random() > 0? resolve({ r:'success' }) : reject({ e:'random error' }) ,100)
  })
}


export default listen( fromReduxAction(ACTION_ADD_ASYNC), function* thisIsAsyncListener({ dispatch }) {

  const { r, e } = yield name(doSomeAjaxCount(), TASK_ADDING)

  if( e ) {
    dispatch({ type:ACTION_FAILED, payload :r })
  }else {
    dispatch({ type:ACTION_ADD, payload :r })
  }

})

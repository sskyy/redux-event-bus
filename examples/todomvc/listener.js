import {listen, name, fromReduxAction, monitor} from 'redux-event-bus/util'
//import r from 'redux-event-bus'
//console.log(r.fromReduxAction)
import {ACTION_ADD_ASYNC,ACTION_ADD, ACTION_FAILED} from './reducer'

export const TASK_ADDING = 'adding'

function doSomeAjaxCount(){
  return new Promise((resolve,reject)=>{
    //do some ajax
    setTimeout(()=>Math.random() > 0.5? resolve({r:'aaaa'}) : reject({e:1111}) ,100)
  })
}


export default listen( fromReduxAction(ACTION_ADD_ASYNC), function* thisIsAsyncListener({dispatch, getState, getTaskState, cancel}){

  const {r, e} = yield name(doSomeAjaxCount(), TASK_ADDING)

  if( e ){
    dispatch({type:ACTION_FAILED, payload :r})
  }else{
    dispatch({type:ACTION_ADD, payload :r})
  }

})
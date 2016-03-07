import {listen, name, fromReduxAction, monitor} from 'redux-task/util'
//import r from 'redux-task'
//console.log(r.fromReduxAction)
import {ACTION_ADD_ASYNC,ACTION_ADD, ACTION_FAILED, ACTION_CANCEL} from './reducer'
import {PENDING_STATE} from 'redux-task/bus'

export const TASK_ADDING = 'adding'

function doSomeAjaxCount(){
  return new Promise((resolve,reject)=>{
    //do some ajax
    setTimeout(()=>Math.random() > 0.5? resolve({r:'aaaa'}) : reject({e:1111}) ,2000)
  })
}


export const addListener =  listen( fromReduxAction(ACTION_ADD_ASYNC), function* thisIsAsyncListener({dispatch, getState, getTaskState, cancel}){

  const {r, e} = yield name(doSomeAjaxCount(), TASK_ADDING)

  if( e ){
    dispatch({type:ACTION_FAILED, payload :r})
  }else{
    dispatch({type:ACTION_ADD, payload :r})
  }

})

export const cancelListener =  listen( fromReduxAction(ACTION_CANCEL), function* thisWillCancel({getTaskState, cancel}){


  if( getTaskState()[TASK_ADDING] ===  PENDING_STATE ){
    cancel(TASK_ADDING)
  }


})
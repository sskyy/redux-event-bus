import {listen, name, fromReduxAction, monitor} from 'redux-event-bus/util'
//import r from 'redux-event-bus'
//console.log(r.fromReduxAction)
import {ACTION_ADD_ASYNC,ACTION_ADD, ACTION_FAILED} from './reducer'

export const PROMISE_ADDING = 'adding'

function doSomeAjaxCount(){
  return new Promise((resolve,reject)=>{
    //do some ajax
    setTimeout(()=>Math.random() > 0? resolve({responce:'aaaa'}) : reject({error:1111}) ,100)
  })
}


export default listen( fromReduxAction(ACTION_ADD_ASYNC), function* ({dispatch, getState}){

  //const {response, error} = yield name(doSomeAjaxCount(), PROMISE_ADDING)
  const {response, error} = yield doSomeAjaxCount()
  debugger
  if( error ){
    dispatch({type:ACTION_FAILED, payload :response})
  }else{
    dispatch({type:ACTION_ADD, payload :response})
  }

})
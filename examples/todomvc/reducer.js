import {combineReducers} from 'redux'
// reducer
export const ACTION_ADD = 'add'
export const ACTION_ADD_ASYNC = 'add-async'
export const ACTION_SUCCESS = 'add-success'
export const ACTION_FAILED = 'add-failed'

const defaultCount = 0
const defaultMessage = ''


export default combineReducers({
  count : function(state, action){
    console.log( action , state)
    if( action.type === ACTION_ADD ){
      return state +1
    }else{
      return defaultCount
    }
  },
  message : function( state, action){
    if( action.type === ACTION_SUCCESS ){
      return 'add success'
    }else if( action.type === ACTION_FAILED){
      return 'add failed'
    }else{
      return defaultMessage
    }
  }
})




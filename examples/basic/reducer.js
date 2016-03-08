import { combineReducers } from 'redux'
// reducer
export const ACTION_ADD = 'add'
export const ACTION_ADD_ASYNC = 'add-async'
export const ACTION_FAILED = 'add-failed'
export const ACTION_CANCEL = 'add-cancel'

const defaultCount = 0
const defaultMessage = ''


export default combineReducers({
  count : function (state=defaultCount, action) {
    if( action.type === ACTION_ADD ) {
      return state +1
    }else {
      return state
    }
  },
  message : function ( state, action) {
    if( action.type === ACTION_ADD ) {
      return 'add 1 succeed'
    }else {
      return defaultMessage
    }
  }
})

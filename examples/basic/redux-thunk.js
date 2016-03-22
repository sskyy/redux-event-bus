import React from 'react'
import { Provider, connect } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'


function fetch() {
  return new Promise((resolve,reject) => setTimeout(() => Math.random() > 0.5 ? resolve('fetched') : reject('failed'), 1000))
}

// reducer
function reducer(state, action) {
  switch(action.type) {
    case 'START':
      return {
        disabled: true,
        result: ''
      }
    case 'SUCCESS':
      return {
        disabled: false,
        result: 'success'
      }
    case 'FAILED':
      return {
        disabled: false,
        result: 'failed'
      }
    default:
      return {
        disabled: false,
        result: ''
      }
  }
}

// action
function start(dispatch) {

  dispatch({ type: 'START' })
  return fetch('data_url')
    .then(() => dispatch({ type: 'SUCCESS' }))
    .catch(() => dispatch({ type: 'FAILED' }))

}

// component
const App = (props) => (
  <div>
    <button
      onClick={ () => props.dispatch(start) } disabled={ props.disabled }
    >click
    </button>
    <span>{ props.result }</span>
  </div>
)


const ConnectedApp = connect(f => f)(App)

// store
const store = createStore(
  reducer,
  applyMiddleware(thunk)
)


export default ()=>(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
)



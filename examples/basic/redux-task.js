import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { createEnhancer, listen, name, monitor  } from 'redux-task'

function fetch() {
  return new Promise((resolve,reject) => setTimeout(()=>Math.random()>0.5 ? resolve('fetched') : reject('failed'), 1000))
}

// listener
const EVENT = 'fetch_event'
const TASK = 'fetch_task'

const listener =  listen(EVENT, function* listener() {
  yield name(fetch('data_url'), TASK)
})

// component
const App = (props) => {
  let message = ''
  if( props.task[TASK] === 'fulfilled') {
    message = 'success'
  }else if(props.task[TASK] === 'rejected') {
    message = 'failed'
  }

  return (
    <div>
      <button
        onClick={ () => props.emit(EVENT) }
        disabled={ props.task[ TASK ] === 'pending' }
      >click</button>
      <span>{ message }</span>
    </div>
  )
}

const MonitorApp = monitor(task => { return { task } })(App)

// store
const enhancer = createEnhancer([ listener ])
const store = createStore(()=>{}, {}, enhancer)

// export
export default ()=>(
  <Provider store={store}>
    <MonitorApp />
  </Provider>
)

# redux-task


[![build status](https://img.shields.io/travis/sskyy/redux-task/master.svg?style=flat-square)](https://travis-ci.org/sskyy/redux-task)
[![npm version](https://img.shields.io/npm/v/redux-task.svg?style=flat-square)](https://www.npmjs.com/package/redux-task)

[Documents](http://sskyy.github.io/redux-task).
A Side Effects manager for redux. The idea is really simple: give an asynchronous task (such as fetch data from server) a name, then we can use the name to get the state of the task or cancel it if we want. You will no longer need to set state like `isSubmitting` to indicate asynchronous action state.

## Usage Example

Scenario: Render a `button` and a `span`. When user click the button, a ajax API will be called. When ajax finished, show result in `span`.

Let's compare the solution between `redux-thunk` and `redux-task`.

### redux-thunk

**reducer.js**

```javascript
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
```

**action.js**

```javascript
function start(dispatch) {

  dispatch({ type: 'START' })
  return fetch('data_url')
    .then(() => dispatch({ type: 'SUCCESS' }))
    .catch(() => dispatch({ type: 'FAILED' }))

}
```

**component.js**

```javascript
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
```

### redux-task

**listener.js**

```javascript
const EVENT = 'fetch_event'
const TASK = 'fetch_task'

const listener =  listen(EVENT, function* listener() {
  yield name(fetch('data_url'), TASK)
})
```

**component.js**

```javascript
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
```

Code can be found here: [https://github.com/sskyy/redux-task/examples/basic](https://github.com/sskyy/redux-task/examples/basic).

## Why Another Side Effects Library?

 - Save your time to create state for async actions.
 - Generator and Promise are perfect for async flow control. Advanced scenario like **cancel a async action** can be handled easily. See [example](https://github.com/sskyy/redux-task/tree/master/examples). Thanks redux-saga for the thought.
 - It's much intuitive than competitors.

## License

MIT




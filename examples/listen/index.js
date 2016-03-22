import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { Provider } from 'react-redux'
import { createStore, compose } from 'redux'
import { createEnhancer } from 'redux-task'
import countListener from './listener'
import reducer from './reducer'

// store
const enhancer = compose(
  window.devToolsExtension ? window.devToolsExtension() : f => f,
  createEnhancer([ countListener ])
)

const store = createStore(reducer, {}, enhancer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

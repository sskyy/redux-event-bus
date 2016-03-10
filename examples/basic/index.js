import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import ReduxTask from './redux-task'
import ReduxThunk from './redux-thunk'

render(
  <div>
    <h1>Redux Thunk</h1>
    <ReduxThunk />
    <h1>Redux Task</h1>
    <ReduxTask />
  </div>,
  document.getElementById('root')
)

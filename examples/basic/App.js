'use strict'

import React from 'react'

import {Message,Input, Indicator} from './components'

const App = React.createClass({
  render(){
    return <div>
      <Input />
      <Message />
      <Indicator />
    </div>
  }
})


export default App

// React
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'

class App extends Component {
  render() {
    return <div>Mental React Example</div>
  }
}

ReactDOM.render(<App />, document.getElementById('root-react'))

const socket = io({
  transports: ['websocket']
})

socket.emit('hi')
console.log('io', socket)

import React, { Component } from 'react'

import { sendMessage, onData } from './tunnel.websocket.client'

export default class Counter extends Component {
  constructor() {
    super()
    this.state = {
      count: 0
    }
    onData(this.onData.bind(this))
  }
  onData(data) {
    this.setState(data)
  }
  increment() {
    sendMessage('increment', { n: 1 })
  }
  decrement() {
    sendMessage('decrement', { n: 1 })
  }

  render() {
    return (
      <div>
        <button onClick={this.increment}>+</button>
        {this.state.count}
        <button onClick={this.decrement}>-</button>
      </div>
    )
  }
}

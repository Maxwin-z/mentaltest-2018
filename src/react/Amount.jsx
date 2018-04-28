import React, { Component } from 'react'
import tunnel from '../tunnel'

const { sendMessage, onData } = tunnel.client('Amount', 'websocket')

class Amount extends Component {
  render() {
    return (
      <div>
        <button
          onClick={() => {
            sendMessage('add')
          }}
        >
          +
        </button>
        {count}
        <button
          onClick={() => {
            sendMessage('minus')
          }}
        >
          -
        </button>
      </div>
    )
  }
}

export default Amount

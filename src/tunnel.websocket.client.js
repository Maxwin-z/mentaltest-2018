import io from 'socket.io-client'

const socket = io()
let callback = null

export function sendMessage(type, data) {
  socket.emit('message', {
    type,
    data
  })
}

export function onData(cb) {
  callback = cb
}

socket.on('data', data => {
  callback(data)
})

let callback = null
let ws = null
export function onConnection(ws_) {
  ws = ws_
  ws.on('message', body => {
    callback && callback(body)
  })
}

export function onMessage(cb) {
  callback = cb
}

export function sendData(data) {
  console.log('has ws', !!ws)
  ws && ws.emit('data', data)
}

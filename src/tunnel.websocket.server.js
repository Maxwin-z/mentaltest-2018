export default function onConnection(ws) {
  ws.on('message', body => {
    console.log(body)
  })
  ws.emit('data', {
    count: 1000
  })
}

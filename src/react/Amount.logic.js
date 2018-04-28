import tunnel from '../tunnel'

const store = {
  count
}
const { onMessage, sendData } = tunnel('Amount', 'websocket')

onMessage('add', () => {
  ++store.count
  sendData(store)
})

onMessage('minus', () => {
  --store.count
  sendData(store)
})

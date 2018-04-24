// tunnel.server interface {onMessage, sendData}, defined by env
import { onMessage, sendData } from './tunnel.websocket.server'
const store = {
  count: 0
}

onMessage(async body => {
  console.log('get', body)
  const { type, data } = body
  if (type === 'increment') {
    await increment()
  }
  if (type === 'decrement') {
    await decrement()
  }
})

async function increment() {
  ++store.count
  sendData(store)
}

async function decrement() {
  --store.count
  sendData(store)
}

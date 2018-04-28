export function client(id, type) {
  return {
    sendMessage() {},
    onData() {}
  }
}

export function server(id, type) {
  return {
    onMessage() {},
    sendData() {}
  }
}

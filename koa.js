import Koa from 'koa'
import socket from 'socket.io'
import http from 'http'

const app = new Koa()
const server = http.createServer(app.callback())

const io = new socket(app)
io.on('connection', ws => {
  console.log('socket connect')
})

server.listen(3000)

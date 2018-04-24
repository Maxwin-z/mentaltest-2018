import Koa from 'koa'
import serve from 'koa-static'
import koaWebpack from 'koa-webpack'
import Webpack from 'webpack'
import config from './webpack/webpack.config.react.js'

import socket from 'socket.io'
import http from 'http'

import tunnelServer from './src/tunnel.websocket.server.js'

const compiler = Webpack(config)
const app = new Koa()
app.use(serve('public'))
app.use(
  koaWebpack({
    compiler
  })
)

const server = http.createServer(app.callback())

const io = new socket(server)
io.on('connection', tunnelServer)

server.listen(3000)

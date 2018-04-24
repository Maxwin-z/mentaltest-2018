import Koa from 'koa'
import kosStatic from 'koa-static'
import koaWebpack from 'koa-webpack'
import Webpack from 'webpack'
import config from './webpack/webpack.config.react.js'

import socket from 'socket.io'
import http from 'http'

import { onConnection } from './src/tunnel.websocket.server.js'
import './src/counter.logic.js'

const compiler = Webpack(config)
const app = new Koa()
app.use(kosStatic('public'))
app.use(
  koaWebpack({
    compiler
  })
)

const server = http.createServer(app.callback())

const io = new socket(server)
io.on('connection', onConnection)

server.listen(3000)

import Koa from 'koa'
import kosStatic from 'koa-static'
import koaWebpack from 'koa-webpack'
import Webpack from 'webpack'
import watch from 'node-watch'
import socket from 'socket.io'
import http from 'http'
import path from 'path'
import {convertPage, convertComponent} from './vue2mp/index.js'

import config from './webpack/webpack.config.react.js'

import {onConnection} from './src/tunnel.websocket.server.js'
import './src/counter.logic.js'

const compiler = Webpack(config)
const app = new Koa()
app.use(kosStatic('public'))
app.use(
  koaWebpack({
    compiler
  })
)

// for vue
watch(
  path.join(__dirname, 'src/vue/'),
  {
    filter: /\.vue$/
  },
  async (event, name) => {
    if (event === 'update') {
      const page = path
        .basename(name)
        .replace('.vue', '')
        .toLowerCase()
      await convertPage(page)
    }
  }
)

watch(
  path.join(__dirname, 'src/vue/components/'),
  {
    filter: /\.vue$/
  },
  async (event, name) => {
    if (event === 'update') {
      const page = path
        .basename(name)
        .replace('.vue', '')
        .toLowerCase()
      await convertComponent(page)
    }
  }
)

const server = http.createServer(app.callback())

const io = new socket(server)
io.on('connection', onConnection)

server.listen(3000, () => {
  console.log('Server: http://localhost:3000')
})

const fs = require('fs')
const path = require('path')
const {convertPage} = require('./index.js')

const vueDir = path.join(__dirname, '../src/vue')

fs.readdir(vueDir, (error, files) => {
  files.forEach(async (file) => {
    if (/\.vue$/.test(file)) {
      console.log(`convert ${file}`)
      await convertPage(file.replace(/\.vue$/, ''))
    }
  })
})

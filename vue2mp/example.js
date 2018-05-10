const fs = require('fs')
const path = require('path')
const {convertPage} = require('./index.js')

const vueDir = path.join(__dirname, '../src/vue')

fs.readdir(vueDir, async (error, files) => {
  const pages = []
  for (let i in files) {
    const file = files[i].toLowerCase()
    if (/\.vue$/.test(file)) {
      console.log(`convert ${file}`)
      const pagename = file.replace(/\.vue$/, '')
      pages.push(`pages/${pagename}/${pagename}`)
      await convertPage(pagename)
    }
  }
  const appConfig = path.join(__dirname, '../dist/app.json')
  const appJSON = JSON.parse(fs.readFileSync(appConfig, 'utf-8'))
  appJSON.pages = pages.concat(appJSON.pages.filter((p) => !pages.includes(p)))
  fs.writeFileSync(appConfig, JSON.stringify(appJSON, true, 2))
})

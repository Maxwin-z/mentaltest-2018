const fs = require('fs')
const path = require('path')
const watch = require('node-watch')

const out = 'dv-level'
const level = 5

generateJS()
generateWXML()
generateJSON()

watch(path.join(__dirname, 'dynamicview.js'), {}, generateJS)
watch(path.join(__dirname, 'dynamicview.wxml'), {}, generateWXML)

function generateJS() {
  const js = fs.readFileSync(path.join(__dirname, 'dynamicview.js'))
  for (let i = 0; i != level; ++i) {
    const name = `${out}-${i + 1}`
    fs.writeFileSync(path.join(__dirname, 'subviews', `${name}.js`), js)
    console.log(`${name}.js done`)
  }
}

function generateWXML() {
  const wxml = fs.readFileSync(path.join(__dirname, 'dynamicview.wxml'))
  for (let i = 0; i != level; ++i) {
    const name = `${out}-${i + 1}`
    fs.writeFileSync(path.join(__dirname, 'subviews', `${name}.wxml`), wxml)
    console.log(`${name}.wxml done`)
  }
}

function generateJSON() {
  const json = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'dynamicview.json'), 'utf-8')
  )
  for (let i = 0; i != level; ++i) {
    const name = `${out}-${i + 1}`
    json.usingComponents.subview = `./${out}-${i + 2}`
    if (i === level - 1) {
      delete json.usingComponents.subview
    }
    fs.writeFileSync(
      path.join(__dirname, 'subviews', `${name}.json`),
      JSON.stringify(json, true, 2)
    )
    console.log(`${name}.json done`)
  }
}

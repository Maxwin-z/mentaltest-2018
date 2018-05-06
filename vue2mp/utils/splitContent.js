const fs = require('fs')
const path = require('path')

function splitContent(content) {
  let template = []
  let script = []
  let style = []

  let lines = null
  content.split('\n').forEach((line) => {
    if (line.trim() === '<template>') {
      lines = template
      return
    }
    if (line.trim() === '<script>') {
      lines = script
      return
    }
    if (line.trim().indexOf('<style') === 0) {
      lines = style
      return
    }
    if (
      ['template', 'script', 'style']
        .map((tag) => `</${tag}>`)
        .includes(line.trim())
    ) {
      lines = null
      return
    }

    lines && lines.push(line)
  })

  return {
    template: template.join('\n'),
    script: script.join('\n'),
    style: style.join('\n')
  }
}

function generatePageConfig(components) {
  const ret = {usingComponents: {}}
  components.map((component) => {
    ret.usingComponents[
      component
    ] = `../../components/${component}/${component}`
  })
  return ret
}

function _mkdirs(dirpath, mode, callback) {
  fs.exists(dirpath, function(exists) {
    if (exists) {
      callback(null)
    } else {
      _mkdirs(path.dirname(dirpath), mode, function() {
        fs.mkdir(dirpath, mode, callback)
      })
    }
  })
}

async function mkdirs(dirpath) {
  return new Promise((resolve, reject) => {
    _mkdirs(dirpath, null, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

async function writeFile(file, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, content, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  splitContent,
  generatePageConfig,
  mkdirs,
  writeFile
}

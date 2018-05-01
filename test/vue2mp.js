const fs = require('fs')
const path = require('path')
const babylon = require('babylon')

const vueDir = path.join(__dirname, '../src/vue/')

// pase page
const pageFile = path.join(vueDir, 'HomePage.vue')
const content = fs.readFileSync(pageFile, 'utf-8')

const {template, script, style} = splitContent(content)

const json = babylon.parse(script, {
  sourceType: 'module',
  plugins: ['jsx', 'flow']
})
console.log(json)

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

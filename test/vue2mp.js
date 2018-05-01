const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const traverse = require('@babel/traverse').default

const vueDir = path.join(__dirname, '../src/vue/')

// pase page
const pageFile = path.join(vueDir, 'HomePage.vue')
const content = fs.readFileSync(pageFile, 'utf-8')

const {template, script, style} = splitContent(content)

const ast = babylon.parse(script, {
  sourceType: 'module',
  plugins: ['jsx', 'flow']
})
traverse(ast, {
  ImportDeclaration(path) {
    // console.log('ImportDeclaration', path.node)
  },
  ObjectExpression(path) {
    console.log('ObjectExpression', path.node.start, path.node.end)
  }
})

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

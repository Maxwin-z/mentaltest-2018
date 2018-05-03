const fs = require('fs')
const path = require('path')
const babylon = require('babylon')
const babel = require('babel-core')
const traverse = require('@babel/traverse').default
const generator = require('babel-generator').default
const t = require('babel-types')
const prettier = require('prettier')

// console.log(t)
const vueDir = path.join(__dirname, '../src/vue/')

// pase page
const pageFile = path.join(vueDir, 'HomePage.vue')
const content = fs.readFileSync(pageFile, 'utf-8')

const {template, script, style} = splitContent(content)

const ast = babylon.parse(script, {
  sourceType: 'module',
  plugins: ['jsx', 'flow']
})

// console.log(script)
class ComponentItem {
  constructor({specifier, source, name}) {
    this.specifier = specifier
    this.source = source
    this.name = name
  }
}

const componentItemMap = {
  /*
   * specifier: ComponentItem
   */
}
const componentItems = []

// parse imports to build components map
traverse(ast, {
  ImportDeclaration(path) {
    const specifier = path.get('specifiers.0').get('local').node.name
    const source = path.get('source').node.value
    componentItemMap[specifier] = new ComponentItem({
      specifier,
      source
    })
  }
})

// page's components map
traverse(ast, {
  ExportDefaultDeclaration(path) {
    path.get('declaration').traverse({
      Property(componentsPath) {
        if (
          componentsPath.parentPath.parentPath === path &&
          componentsPath.node.key.name === 'components'
        ) {
          componentsPath.traverse({
            Property(fieldPath) {
              const specifier = fieldPath.node.value.name
              const name = fieldPath.node.key.name
              const componentItem = componentItemMap[specifier]
              componentItem.name = name
              componentItems.push(componentItem)
            }
          })
          componentsPath.remove()
        }
      }
    })
  }
})

// delete import components, FIXME optimize
traverse(ast, {
  ImportDeclaration(path) {
    const specifier = path.get('specifiers.0').get('local').node.name
    if (componentItems.map((item) => item.specifier).includes(specifier)) {
      path.remove()
    }
  }
})

// move methods out && move data() {obj} out as data:obj
traverse(ast, {
  ExportDefaultDeclaration(path) {
    const properties = path.get('declaration').get('properties')

    const props = []
    properties.forEach((p) => {
      if (p.node.key.name === 'methods') {
        p
          .get('value')
          .get('properties')
          .forEach((method) => {
            props.push(method.node)
          })
      } else if (p.node.key.name === 'data' && p.node.method === true) {
        p.traverse({
          ObjectExpression(dataObjectPath) {
            const dataObject = t.ObjectProperty(
              t.Identifier('data'),
              dataObjectPath.node
            )
            props.push(dataObject)
          }
        })
      } else {
        props.push(p.node)
      }
    })
    // const n = properties
    const newProps = t.ObjectExpression(props)
    path.get('declaration').replaceWith(newProps)
    // path
    // .get('declaration')
    // .replaceWith(t.ExpressionStatement(t.StringLiteral('hello')))
  }
})

// move to Page function
traverse(ast, {
  ExportDefaultDeclaration(path) {
    const node = path.get('declaration').node
    const page = t.ExpressionStatement(
      t.CallExpression(t.Identifier('Page'), [node])
    )
    path.replaceWith(page)
  }
})

const output = generator(ast, {}, script)
console.log(prettier.format(output.code))

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

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
const distDir = path.join(__dirname, '../dist')

// pase page
const pageFile = path.join(vueDir, 'HomePage.vue')
const content = fs.readFileSync(pageFile, 'utf-8')

const {template, script, style} = splitContent(content)

const {componentItems, components, ast} = script2js(script)
const scriptOutput = generator(ast, {}, script)
const code = prettier.format(scriptOutput.code)

// console.log(prettier.format(output.code))
const wxml = template2wxml(template)
generateFiles()

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection', error)
})

function _mkdirs(dirpath, mode, callback) {
  fs.exists(dirpath, function(exists) {
    if (exists) {
      callback(dirpath)
    } else {
      _mkdirs(path.dirname(dirpath), mode, function() {
        fs.mkdir(dirpath, mode, callback)
      })
    }
  })
}

async function mkdirs(dirpath) {
  return new Promise((rs) => {
    _mkdirs(dirpath, null, rs)
  })
}

async function writeFile(file, content) {
  return new Promise((rs) => {
    fs.writeFile(file, content, rs)
  })
}

async function generateFiles() {
  await mkdirs(path.join(distDir, 'pages'))
  await mkdirs(path.join(distDir, 'components'))
  // hardcode test
  // create page dir
  const page = 'homepage'
  const pageDir = path.join(distDir, `pages/${page}`)
  await mkdirs(pageDir)
  // generate page.json
  const pageJsonFile = path.join(pageDir, `${page}.json`)
  const pageJson = {
    usingComponents: {}
  }
  components.map((component) => {
    pageJson.usingComponents[
      component
    ] = `../../components/${component}/${component}`
  })
  await writeFile(pageJsonFile, JSON.stringify(pageJson, true, 2))

  // write page.js
  await writeFile(path.join(pageDir, `${page}.js`), code)

  // write page.wxml
  await writeFile(path.join(pageDir, `${page}.wxml`), wxml)

  // write page.wxss
  await writeFile(path.join(pageDir, `${page}.wxss`), style || '')
}

function template2wxml(template) {
  const ast = babylon.parse(template, {
    plugins: ['jsx']
  })

  // replace tags
  const tagMap = {
    div: 'view'
  }
  traverse(ast, {
    JSXOpeningElement(path) {
      if (tagMap[path.node.name.name]) {
        path.node.name.name = tagMap[path.node.name.name]
      }
    },
    JSXClosingElement(path) {
      if (tagMap[path.node.name.name]) {
        path.node.name.name = tagMap[path.node.name.name]
      }
    }
  })

  // replace v-bind:[name]
  traverse(ast, {
    JSXAttribute(path) {
      if (t.isJSXNamespacedName(path.get('name'))) {
        const namespace = path.node.name.namespace.name
        const name = path.node.name.name.name
        const value = path.node.value.value
        console.log(namespace, name, value)
        if (namespace === 'v-bind') {
          // prop is component
          if (components.includes(value)) {
            path.node.name.namespace.name = 'generic'
          } else {
            path.get('name').replaceWith(t.JSXIdentifier(name))
          }
        }
        if (namespace === 'v-on') {
          // TODO: handle other events
          if (name === 'click') {
            path.get('name').replaceWith(t.JSXIdentifier('ontap'))
          }
        }
      }
    }
  })

  const wxml = generator(ast, {}, template)
  return prettier
    .format(wxml.code, {
      semi: false
    })
    .replace(/^;/, '')
}

function script2js(script) {
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
    }
  })

  // get data.members
  let members = []
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      members = path
        .get('declaration')
        .get('properties')
        .find((p) => t.isIdentifier(p.node.key, {name: 'data'}))
        .get('value')
        .get('properties')
        .map((_) => _.node.key.name)
    }
  })
  // console.log(members)

  // replace this.[member] to this.data[member]
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      path.traverse({
        MemberExpression(path) {
          if (path.node.object.type === 'ThisExpression') {
            let mem = null
            if (
              path.node.property.type === 'Identifier' &&
              path.node.computed === false
            ) {
              mem = path.node.property.name
            }
            if (path.node.property.type === 'Literal') {
              mem = path.node.property.value
            }
            if (members.includes(mem)) {
              path.get('object').replaceWithSourceString('this.data')
              if (
                (t.isAssignmentExpression(path.parentPath) &&
                  path.parentPath.get('left') === path) ||
                t.isUpdateExpression(path.parentPath)
              ) {
                const expressStatement = path.findParent((parent) =>
                  parent.isExpressionStatement()
                )
                if (expressStatement) {
                  // console.log('insert', expressStatement.node.start)
                  expressStatement.insertAfter(
                    t.ExpressionStatement(
                      t.CallExpression(
                        t.MemberExpression(
                          t.ThisExpression(),
                          t.Identifier('setData')
                        ),
                        [
                          t.ObjectExpression([
                            t.ObjectProperty(
                              t.Identifier(mem),
                              t.Identifier(`this.data.${mem}`)
                            )
                          ])
                        ]
                      )
                    )
                  )
                }
              }
            }
          }
        }
      })
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

  return {
    componentItems,
    components: componentItems.map((c) => c.name.toLowerCase()),
    ast
  }
}
// const output = generator(ast, {}, script)
// console.log(prettier.format(output.code))

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

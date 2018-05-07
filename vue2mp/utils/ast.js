const traverse = require('@babel/traverse').default
const t = require('babel-types')

function replaceJSXTag(ast, tagMap) {
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
}

function replaceJSXAttribute(ast, components) {
  traverse(ast, {
    JSXAttribute(path) {
      if (t.isJSXNamespacedName(path.get('name'))) {
        const namespace = path.node.name.namespace.name
        const name = path.node.name.name.name
        const value = path.node.value.value
        // console.log(namespace, name, value)
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
}

function replaceJSXGenericComponent(ast) {
  traverse(ast, {
    JSXElement(path) {
      if (
        t.isJSXIdentifier(path.node.openingElement.name, {name: 'component'})
      ) {
        // get 'is' property
        let compName = null
        path
          .get('openingElement')
          .get('attributes')
          .forEach((prop) => {
            if (prop.node.name.name === 'is') {
              compName = prop.node.value.value
              prop.remove()
            }
          })
        if (compName === null) {
          throw new Error(`cannot find component name in ${path.node}`)
        }
        path.node.openingElement.name.name = compName
        if (path.node.closingElement) {
          path.node.closingElement.name.name = compName
        }
      }
    }
  })
}

function getImportedComponents(ast) {
  const componentItemMap = {}
  const componentItems = []

  // parse imports to build components map
  traverse(ast, {
    ImportDeclaration(path) {
      const specifier = path.get('specifiers.0').get('local').node.name
      const source = path.get('source').node.value
      componentItemMap[specifier] = {
        specifier,
        source
      }
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

  return componentItems
}

function removeImports(ast, specifiers) {
  traverse(ast, {
    ImportDeclaration(path) {
      const specifier = path.get('specifiers.0').get('local').node.name
      if (specifiers.includes(specifier)) {
        path.remove()
      }
    }
  })
}

function moveMethodsOut(ast) {
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const props = []
      path
        .get('declaration')
        .get('properties')
        .forEach((p) => {
          if (p.node.key.name === 'methods') {
            p
              .get('value')
              .get('properties')
              .forEach((method) => {
                props.push(method.node)
              })
          } else {
            props.push(p.node)
          }
        })
      const newProps = t.ObjectExpression(props)
      path.get('declaration').replaceWith(newProps)
    }
  })
}

function moveDataOut(ast) {
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const props = []
      path
        .get('declaration')
        .get('properties')
        .forEach((p) => {
          if (p.node.key.name === 'data' && p.node.method === true) {
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
      const newProps = t.ObjectExpression(props)
      path.get('declaration').replaceWith(newProps)
    }
  })
}

function renameProperty(ast, propertyMap) {
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      path
        .get('declaration')
        .get('properties')
        .forEach((p) => {
          if (propertyMap[p.node.key.name]) {
            p.node.key.name = propertyMap[p.node.key.name]
          }
        })
    }
  })
}

// used for change this[property] to this.data[property]
function getDataProperties(ast) {
  const properties = []
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const dataPath = path
        .get('declaration')
        .get('properties')
        .find((p) => t.isIdentifier(p.node.key, {name: 'data'}))
      if (dataPath) {
        dataPath
          .get('value')
          .get('properties')
          .forEach((p) => properties.push(p.node.key.name))
      }
    }
  })
  return properties
}

// used for remove component properties
function removeDataPropertiesByValue(ast, properties) {
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const dataPath = path
        .get('declaration')
        .get('properties')
        .find((p) => t.isIdentifier(p.node.key, {name: 'data'}))
      if (dataPath) {
        dataPath
          .get('value')
          .get('properties')
          .forEach((p) => {
            if (properties.includes(p.node.value.name)) {
              p.remove()
            }
          })
      }
    }
  })
}

function replacePropertyAsData(ast, properties) {
  // replace this.[member] to this.data[member]
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      path.traverse({
        MemberExpression(path) {
          if (path.node.object.type === 'ThisExpression') {
            let property = null
            if (
              path.node.property.type === 'Identifier' &&
              path.node.computed === false
            ) {
              property = path.node.property.name
            }
            if (path.node.property.type === 'Literal') {
              property = path.node.property.value
            }
            if (properties.includes(property)) {
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
                              t.Identifier(property),
                              t.Identifier(`this.data.${property}`)
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
}

function moveExportToFunction(ast, fnName) {
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const node = path.get('declaration').node
      const page = t.ExpressionStatement(
        t.CallExpression(t.Identifier(fnName), [node])
      )
      path.replaceWith(page)
    }
  })
}

module.exports = {
  replaceJSXTag,
  replaceJSXAttribute,
  replaceJSXGenericComponent,
  getImportedComponents,
  removeImports,
  moveMethodsOut,
  moveDataOut,
  renameProperty,
  getDataProperties,
  removeDataPropertiesByValue,
  replacePropertyAsData,
  moveExportToFunction
}

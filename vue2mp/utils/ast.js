const babylon = require('babylon')
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

function replaceJSXEventAttribute(ast) {
  const handlers = []
  traverse(ast, {
    JSXAttribute(path) {
      if (
        path.node.name.namespace &&
        path.node.name.namespace.name === 'v-on'
      ) {
        const expValue = path.node.value.value
        const expAst = babylon.parse(expValue, {})
        traverse(expAst, {
          ExpressionStatement(expPath) {
            if (t.isArrowFunctionExpression(expPath.get('expression'))) {
              let eventParam = null
              const params = expPath.get('expression').get('params')
              if (params.length > 0) {
                eventParam = params[0].node.name
              }
              const fnBody = expPath.get('expression').get('body')
              const callee = fnBody.get('callee').node.name
              const args = fnBody.get('arguments').map((argNode, index) => {
                if (t.isIdentifier(argNode)) {
                  return {
                    name: argNode.node.name,
                    value: argNode.node.name
                  }
                } else {
                  return {
                    name: `vue2mp_arg_${index}`,
                    value: expValue.substring(
                      argNode.node.start,
                      argNode.node.end
                    )
                  }
                }
              })
              // console.log(eventParam, callee, args)
              handlers.push({
                param: eventParam,
                callee,
                args
              })

              // replace body
              path.node.value.value = callee
              // add args as data-[prop]
              args.forEach((arg) => {
                if (arg.name != eventParam) {
                  path.insertAfter(
                    t.JSXAttribute(
                      t.JSXIdentifier(`data-${arg.name}`),
                      t.StringLiteral(`{{${arg.value}}}`)
                    )
                  )
                }
              })
            }
          }
        })
      }
    }
  })
  return handlers
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
            if (name !== 'is') {
              // DONOT replace <component v-bind:is="cell" />
              path.get('value').replaceWith(t.StringLiteral(`{{${value}}}`))
            }
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
  const genericMap = {}
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
        genericMap[compName] = true
        path.node.openingElement.name.name = compName
        if (path.node.closingElement) {
          path.node.closingElement.name.name = compName
        }
      }
    }
  })
  return genericMap
}

function replaceJSXFor(ast) {
  traverse(ast, {
    JSXAttribute(path) {
      if (path.node.name.name === 'v-for') {
        // find reuse key
        path.parentPath.get('attributes').forEach((attr) => {
          if (attr.node.name.name === 'key') {
            attr
              .get('name')
              .replaceWith(
                t.JSXNamespacedName(
                  t.JSXIdentifier('wx'),
                  t.JSXIdentifier('key')
                )
              )
          }
        })

        const vfor = path.node.value.value
        const [items, obj] = vfor.split(' in ')
        const [val, index] = items.replace(/(^\(|\)$)/g, '').split(',')

        path.insertBefore(
          t.JSXAttribute(
            t.JSXNamespacedName(t.JSXIdentifier('wx'), t.JSXIdentifier('for')),
            t.StringLiteral(`{{${obj.trim()}}}`)
          )
        )

        path.insertBefore(
          t.JSXAttribute(
            t.JSXNamespacedName(
              t.JSXIdentifier('wx'),
              t.JSXIdentifier('for-item')
            ),
            t.StringLiteral(val.trim())
          )
        )

        if (index) {
          path.insertBefore(
            t.JSXAttribute(
              t.JSXNamespacedName(
                t.JSXIdentifier('wx'),
                t.JSXIdentifier('for-index')
              ),
              t.StringLiteral(index.trim())
            )
          )
        }

        path.remove()
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
                dataObjectPath.skip()
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

function _removeElementFromArray(arr, ele) {
  const cloneArr = arr.concat([])
  const index = cloneArr.indexOf(ele)
  if (index > -1) {
    cloneArr.splice(index, 1)
  }
  return cloneArr
}

function replaceEventHandlers(ast, handlers) {
  const handlerMap = {}
  handlers.forEach((h) => {
    handlerMap[h.callee] = h
  })
  traverse(ast, {
    ObjectExpression(path) {
      path.skip()
      path.get('properties').forEach((p) => {
        if (p.node.method === true && handlerMap[p.node.key.name]) {
          const callee = p.node.key.name
          const handler = handlerMap[callee]
          const args = handler.args.map((_) => _.name)
          const keys = _removeElementFromArray(args, handler.param)

          p.node.key.name = `_vue2mp_${callee}`
          // hack origin method
          p.insertAfter(
            t.ObjectProperty(
              t.Identifier(callee),
              t.FunctionExpression(
                null,
                [t.Identifier('_vue2mp_event')],
                t.BlockStatement([
                  t.VariableDeclaration('const', [
                    t.VariableDeclarator(
                      t.ObjectPattern(
                        keys.map((key) =>
                          t.ObjectProperty(
                            t.Identifier(key),
                            t.Identifier(key),
                            false,
                            true
                          )
                        )
                      ),
                      t.MemberExpression(
                        t.MemberExpression(
                          t.Identifier('_vue2mp_event'),
                          t.Identifier('currentTarget')
                        ),
                        t.Identifier('dataset')
                      )
                    )
                  ]),
                  handler.param
                    ? t.VariableDeclaration('const', [
                        t.VariableDeclarator(
                          t.Identifier(handler.param),
                          t.Identifier('_vue2mp_event')
                        )
                      ])
                    : t.ExpressionStatement(t.StringLiteral('')),
                  t.ExpressionStatement(
                    t.CallExpression(
                      t.MemberExpression(
                        t.ThisExpression(),
                        t.Identifier(`_vue2mp_${callee}`)
                      ),
                      args.map((arg) => t.Identifier(arg))
                    )
                  )
                ])
              )
            )
          )
        }
      })
    }
  })
}

module.exports = {
  replaceJSXTag,
  replaceJSXEventAttribute,
  replaceJSXAttribute,
  replaceJSXGenericComponent,
  replaceJSXFor,
  getImportedComponents,
  removeImports,
  moveMethodsOut,
  moveDataOut,
  renameProperty,
  getDataProperties,
  removeDataPropertiesByValue,
  replacePropertyAsData,
  moveExportToFunction,
  replaceEventHandlers
}

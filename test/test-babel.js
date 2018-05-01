const babylon = require('babylon')
const traverse = require('@babel/traverse').default
const generator = require('babel-generator').default
const t = require('babel-types')

const code = `
export default {a: 1, b: 2}
`

const ast = babylon.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'flow']
})

traverse(ast, {
  ObjectExpression(path) {
    console.log('ObjectExpression')
  },
  ExportDefaultDeclaration(path) {
    console.log('ExportDefaultDeclaration')
    const obj = path.get('declaration')

    const arg = t.StringLiteral('hello')
    const node = t.ExpressionStatement(
      t.CallExpression(t.Identifier('A'), [obj.node])
    )
    path.replaceWith(node)
  }
})

const output = generator(ast, {}, code)
console.log(output.code)

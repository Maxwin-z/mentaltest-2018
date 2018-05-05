const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const babylon = require('babylon')
const generator = require('babel-generator').default
const utils = require('./utils/splitContent')
const astUtils = require('./utils/ast')

const vueDir = path.join(__dirname, '../src/vue')
const distDir = path.join(__dirname, '../dist')

const pagename = 'homepage.vue'
convertPage(pagename)

function convertPage(pagename) {
  const pageFile = path.join(vueDir, `${pagename}`)
  const content = fs.readFileSync(pageFile, 'utf-8')
  const {template, script, style} = utils.splitContent(content)
  const {code, componentItems} = script2js(script)
  const pageJSON = utils.generatePageConfig(
    componentItems.map((_) => _.specifier.toLowerCase())
  )
  console.log(code, pageJSON)
}

function script2js(script) {
  const ast = babylon.parse(script, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })

  const componentItems = astUtils.getImportedComponents(ast)
  astUtils.removeImports(ast, componentItems.map((_) => _.specifier))
  astUtils.moveMethodsOut(ast)
  astUtils.moveDataOut(ast)
  const dataProperties = astUtils.getDataProperties(ast)
  astUtils.replacePropertyAsData(ast, dataProperties)
  astUtils.moveExportToFunction(ast, 'Page')
  const code = prettier.format(generator(ast, {}, script).code)
  return {
    code,
    componentItems
  }
}

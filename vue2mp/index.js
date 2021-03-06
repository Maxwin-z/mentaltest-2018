const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const babylon = require('babylon')
const generator = require('babel-generator').default
const utils = require('./utils/splitContent')
const astUtils = require('./utils/ast')

const vueDir = path.join(__dirname, '../src/vue')
const distDir = path.join(__dirname, '../dist')

// const pagename = 'homepage'
// convertPage(pagename)

module.exports = {
  convertPage,
  convertComponent
}

process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', error)
})

async function convertPage(pagename) {
  const pageFile = path.join(vueDir, `${pagename}.vue`)
  const content = fs.readFileSync(pageFile, 'utf-8')
  const {template, script, style} = utils.splitContent(content)
  // convert script
  const {codeAst, componentItems} = script2js(script, false)
  const components = componentItems.map((_) => _.specifier.toLowerCase())
  const pageJSON = utils.generatePageConfig(components)
  const pageDistPath = path.join(distDir, `pages/${pagename}/`)

  await utils.mkdirs(pageDistPath)
  // convert template
  const {wxml, handlers} = template2wxml(template, components)
  await utils.writeFile(path.join(pageDistPath, `${pagename}.wxml`), wxml)
  await astUtils.replaceEventHandlers(codeAst, handlers)

  // code
  const code = prettier.format(generator(codeAst, {}, script).code)
  await utils.writeFile(path.join(pageDistPath, `${pagename}.js`), code)
  await utils.writeFile(
    path.join(pageDistPath, `${pagename}.json`),
    JSON.stringify(pageJSON, true, 2)
  )

  // convert style
  await utils.writeFile(path.join(pageDistPath, `${pagename}.wxss`), style)
  // console.log(code, pageJSON)

  // convert components
  Promise.all(components.map(convertComponent))
}

async function convertComponent(component) {
  // console.log(`start convertComponent ${component}`)
  const compFile = path.join(vueDir, `/components/${component}.vue`)
  const content = fs.readFileSync(compFile, 'utf-8')
  const {template, script, style} = utils.splitContent(content)
  // console.log(template)
  const {codeAst, componentItems} = script2js(script, true)
  const components = componentItems.map((_) => _.specifier)
  const compJSON = utils.generatePageConfig(components)
  const compDistPath = path.join(distDir, `components/${component}/`)

  await utils.mkdirs(compDistPath)

  // wxml
  const {wxml, componentGenerics, handlers} = template2wxml(
    template,
    components
  )
  astUtils.replaceEventHandlers(codeAst, handlers)

  // code
  const code = prettier.format(generator(codeAst, {}, script).code)
  await utils.writeFile(path.join(compDistPath, `${component}.js`), code)
  await utils.writeFile(
    path.join(compDistPath, `${component}.json`),
    JSON.stringify(compJSON, true, 2)
  )

  await utils.writeFile(path.join(compDistPath, `${component}.wxml`), wxml)
  await utils.writeFile(path.join(compDistPath, `${component}.wxss`), style)
  await utils.writeFile(
    path.join(compDistPath, `${component}.json`),
    JSON.stringify(
      {
        component: true,
        usingComponents: {},
        componentGenerics
      },
      true,
      2
    )
  )
}

function script2js(script, isComponent) {
  const ast = babylon.parse(script, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })

  const componentItems = astUtils.getImportedComponents(ast)
  const components = componentItems.map((_) => _.specifier)
  astUtils.removeImports(ast, components)
  if (isComponent) {
    astUtils.renameProperty(ast, {
      props: 'properties'
    })
  } else {
    astUtils.moveMethodsOut(ast)
  }

  astUtils.moveDataOut(ast)
  astUtils.removeDataPropertiesByValue(ast, components)
  const dataProperties = astUtils.getDataProperties(ast)
  astUtils.replacePropertyAsData(ast, dataProperties)
  astUtils.moveExportToFunction(ast, isComponent ? 'Component' : 'Page')
  // const code = prettier.format(generator(ast, {}, script).code)
  return {
    codeAst: ast,
    componentItems
  }
}

function template2wxml(template, components) {
  const ast = babylon.parse(template, {
    plugins: ['jsx']
  })

  // replace tags
  const tagMap = {
    div: 'view'
  }
  astUtils.replaceJSXTag(ast, tagMap)
  const handlers = astUtils.replaceJSXEventAttribute(ast)
  astUtils.replaceJSXAttribute(ast, components)
  astUtils.replaceJSXFor(ast)
  const genericMap = astUtils.replaceJSXGenericComponent(ast)

  const wxml = generator(ast, {}, template)
  return {
    wxml: prettier
      .format(wxml.code, {
        semi: false
      })
      .replace(/^;/, ''),
    componentGenerics: genericMap,
    handlers
  }
}

// component
function componentScript2js(script) {
  const ast = babylon.parse(script, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })

  // TODO sub components
  const componentItems = astUtils.getImportedComponents(ast)
  const components = componentItems.map((_) => _.specifier)
  astUtils.removeImports(ast, components)
  astUtils.moveDataOut(ast)
  astUtils.renameProperty(ast, {
    props: 'properties'
  })
  astUtils.removeDataPropertiesByValue(ast, components)
  const dataProperties = astUtils.getDataProperties(ast)
  astUtils.replacePropertyAsData(ast, dataProperties)
  astUtils.moveExportToFunction(ast, 'Component')
  // const code = prettier.format(generator(ast, {}, script).code)
  return {
    codeAst: ast,
    componentItems
  }
}

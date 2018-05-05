const util = require('../utils/ast')
const babylon = require('babylon')
const generator = require('babel-generator').default

const assert = require('assert')

function parse(code) {
  return babylon.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  })
}

function gen(ast, code, isJSX = false) {
  let ret = generator(ast, {}, code).code
  if (isJSX) {
    ret = ret.replace(/(^;|;$)/, '')
  }
  return ret
}

describe('ast', function() {
  it('ok', () => {
    assert.equal('ok', 'ok')
  })

  it('replaceJSXTag', () => {
    const code = `<div>A</div>`
    const ast = parse(code)
    util.replaceJSXTag(ast, {
      div: 'view'
    })
    const ret = gen(ast, code, true)
    assert.equal(ret, '<view>A</view>')
  })

  it('replaceJSXAttribute', () => {
    const code = `<div v-bind:item="itemData" v-bind:cell="cellComponent">A</div>`
    const ast = parse(code)
    util.replaceJSXAttribute(ast, ['cellComponent'])
    const ret = gen(ast, code, true)
    assert.equal(
      ret,
      '<div item="itemData" generic:cell="cellComponent">A</div>'
    )
  })

  it('getImportedComponents', () => {
    const code = `
import cell from 'cell'
import grid from 'grid'
export default {
  components: {
    cell
  }
}
    `
    const ast = parse(code)
    const componentItems = util.getImportedComponents(ast)
    // console.log(componentItems)
    assert.equal(componentItems.length, 1)
    assert.equal(componentItems[0].specifier, 'cell')
  })

  it('removeImports', () => {
    const code = `
import cell from 'cell'
`
    const ast = parse(code)
    util.removeImports(ast, ['cell'])
    const ret = gen(ast, code)
    assert.equal(ret.trim(), '')
  })

  it('moveMethodsOut', () => {
    const code = `
export default {
  methods: {
    add() {},
    minus() {}
  }
}
    `
    const ast = parse(code)
    util.moveMethodsOut(ast)
    assert.equal(ast.program.body[0].declaration.properties.length, 2)
    // const ret = gen(ast, code)
  })

  it('moveDataOut', () => {
    const code = `
export default {
  data() {
    return {
      a: 1,
      b: 2
    }
  }
}
    `
    const ast = parse(code)
    util.moveDataOut(ast)
    const ret = gen(ast, code)
    // console.log(ret)
    assert.equal(
      ast.program.body[0].declaration.properties[0].value.properties.length,
      2
    )
  })

  it('getDataProperties', () => {
    const code = `
export default {
  data: {
    a: Cell,
    b: 2
  }
}
    `
    const ast = parse(code)
    const props = util.getDataProperties(ast)
    assert.equal(props.length, 2)
    // console.log(props)
  })

  it('removeDataPropertiesByValue', () => {
    const code = `
export default {
  data: {
    a: Cell,
    b: 2
  }
}
    `
    const ast = parse(code)
    util.removeDataPropertiesByValue(ast, ['Cell'])
    const ret = gen(ast, code)
    assert.equal(
      ast.program.body[0].declaration.properties[0].value.properties.length,
      1
    )
  })

  it('replacePropertyAsData', () => {
    const code = `
export default {
  data: {
    count: 0
  },
  add() {
    let v = this.count
    ++v
    this.count = v
  },
  minus() {
    --this.count
  }
}
    `
    const ast = parse(code)
    util.replacePropertyAsData(ast, ['count'])
    const ret = gen(ast, code)
    // view logs plz...
    // console.log(ret)
  })

  it('moveExportToFunction', () => {
    const code = `
export default {
}
`
    const ast = parse(code)
    util.moveExportToFunction(ast, 'Page')
    const ret = gen(ast, code)
    assert.equal(ret, 'Page({});')
    // console.log(ret)
  })
})

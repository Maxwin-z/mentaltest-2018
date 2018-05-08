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
      '<div item="{{itemData}}" generic:cell="cellComponent">A</div>'
    )
  })

  it('replaceJSXEventAttribute', () => {
    const code = `<div v-on:click="e => click(e, item, index)" v-on:touch="e => touch(e, 1, 's', ['arr'])"/>`
    const ast = parse(code)
    const handlers = util.replaceJSXEventAttribute(ast)
    // console.log(JSON.stringify(handlers, true, 2))
    assert.equal(handlers.length, 2)
    const ret = gen(ast, code, true)
    // console.log(ret)
    assert(
      ret.indexOf(
        `
<div v-on:click="click" data-index="{{index}}" data-item="{{item}}" v-on:touch="touch" data-vue2mp_arg_3="{{['arr']}}" data-vue2mp_arg_2="{{'s'}}" data-vue2mp_arg_1="{{1}}" />
    `.trim()
      ) != -1
    )
  })

  it('replaceJSXGenericComponent', () => {
    const code = `
    <div>
      <component is="cell" title="item" />
      <component is="cell" title="item"></component>
    </div>
      `
    const ast = parse(code)
    util.replaceJSXGenericComponent(ast)
    const ret = gen(ast, code, true)
    assert(ret.indexOf('component') === -1)
    assert(ret.indexOf('<cell ') >= 0)
    assert(ret.indexOf('</cell>') >= 0)
  })

  it('replaceJSXFor', () => {
    const code = `
<div>
  <div v-for="val in object"></div>
  <div v-for="(val, key) in object"></div>
</div>
    `
    const ast = parse(code)
    util.replaceJSXFor(ast)
    const ret = gen(ast, code, true)
    // FIXME view log plz
    // console.log(ret)
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
      b: {
        c: 2
      }
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

  it('renameProperty', () => {
    const code = `
export default {
  props: {}
}
    `
    const ast = parse(code)
    util.renameProperty(ast, {
      props: 'properties'
    })
    assert.equal(
      ast.program.body[0].declaration.properties[0].key.name,
      'properties'
    )
    // const ret = gen(ast, code)
    // console.log(ret)
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

  it('replaceEventHandlers', () => {
    const code = `
Page({
  click(e, item) {
    // do sth...
  }
})
    `
    const ast = parse(code)
    util.replaceEventHandlers(ast, [
      {
        param: 'e',
        callee: 'click',
        args: [
          {
            name: 'e',
            value: 'e'
          },
          {
            name: 'item',
            value: 'item'
          },
          {
            name: 'index',
            value: 'index'
          }
        ]
      },
      {
        param: 'e',
        callee: 'touch',
        args: [
          {
            name: 'e',
            value: 'e'
          },
          {
            name: 'vue2mp_arg_1',
            value: '1'
          },
          {
            name: 'vue2mp_arg_2',
            value: "'s'"
          },
          {
            name: 'vue2mp_arg_3',
            value: "['arr']"
          }
        ]
      }
    ])
    const ret = gen(ast, code)
    console.log(ret)
    assert(
      ret.indexOf(
        `
Page({
  _vue2mp_click(e, item) {
    // do sth...
  },
  click: function (_vue2mp_event) {
    const {
      item,
      index
    } = _vue2mp_event.currentTarget.dataset;
    const e = _vue2mp_event;

    this._vue2mp_click(e, item, index);
  }
});
    `.trim()
      ) != -1
    )
  })
})

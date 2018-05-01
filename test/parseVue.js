const fs = require('fs')
const path = require('path')
const babylon = require('babylon')

// const file = path.join(__dirname, '../src/main.react.js')
// const file = path.join(__dirname, '../src/App.vue')
const file = path.join(__dirname, '../src/vue/HomePage.vue')

let code = fs.readFileSync(file).toString()

// split vue
let tpl, script
code
  .replace(/<template>((.|\s)*?)<\/template>/, ($0, tpl_) => {
    tpl = tpl_
    return $0
  })
  .replace(/<script>((.|\s)*?)<\/script>/, ($0, code_) => {
    script = code_
    return $0
  })

console.log(tpl, script)
let result

/*
result = babylon.parse(tpl, {
  // parse in strict mode and allow module declarations
  sourceType: 'module',

  plugins: [
    // enable jsx and flow syntax
    'jsx',
    'flow'
  ]
})

fs.writeFileSync('tpl.json', JSON.stringify(result, true, 2))
*/

result = babylon.parse(script, {
  // parse in strict mode and allow module declarations
  sourceType: 'module',

  plugins: [
    // enable jsx and flow syntax
    'jsx',
    'flow'
  ]
})

fs.writeFileSync('script.json', JSON.stringify(result, true, 2))
console.log('done')

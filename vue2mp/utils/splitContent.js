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

function generatePageConfig(components) {
  const ret = {usingComponents: {}}
  components.map((component) => {
    ret.usingComponents[
      component
    ] = `../../components/${component}/${component}`
  })
  return ret
}

module.exports = {
  splitContent,
  generatePageConfig
}

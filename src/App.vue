<template>
  <div>Hi: {{message}}
    <button v-on:click="add">+</button>
    {{count}}
    <button v-on:click="minus">-</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'hello vue',
      count: 0
    }
  },
  methods: {
    add() {
      ++this.count
    },
    minus() {
      --this.count
    }
  }
}
</script>

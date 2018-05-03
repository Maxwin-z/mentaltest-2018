<template>
  <div>
    <grid v-bind:items="items" v-bind:cell="cell" />
    <div>Grid {{grid}}</div>
    <div>Counter{{count}}<button v-on:click="e => add(e, 1)" >Add</button></div>
  </div>
</template>

<script>
import Grid from './components/grid.vue'
import Cell from './components/cell.vue'
import {sendMessage, onData} from '../tunnel.websocket.client'

export default {
  components: {
    Grid,
    Cell
  },
  data() {
    return {
      count: 0,
      cell: Cell,
      grid: 'test',
      items: new Array(5)
        .fill(0)
        .map((_, i) => new Array(3).fill(0).map((_, j) => `${i}-${j}`))
    }
  },
  methods: {
    add() {
      console.log(arguments)
      let c = this.count
      ++c
      this.count = c
    },
    minus(delta) {
      this.count -= delta
    }
  }
}
</script>

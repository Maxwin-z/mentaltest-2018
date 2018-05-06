<template>
  <div>
    <grid v-bind:items="items" v-bind:cell="cell" />
    <div>Grid {{grid}}</div>
    <div>Counter{{count}}<button v-on:click="add" >Add</button></div>
  </div>
</template>

<script>
import grid from './components/grid.vue'
import cell from './components/cell.vue'

export default {
  components: {
    grid,
    cell
  },
  data() {
    return {
      count: 0,
      cell: cell,
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

      ++this.count
    },
    minus(delta) {
      this.count -= delta
    }
  }
}
</script>

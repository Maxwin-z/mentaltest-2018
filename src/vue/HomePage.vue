<template>
  <div>
    <grid :items="items" :cell="cell" />
    <div>Grid {{grid}}</div>
    <div>Counter</div>
  </div>
</template>

<script>
import Grid from './components/grid.vue'
import Cell from './components/cell.vue'

export default {
  components: {
    Grid,
    Cell
  },
  data() {
    return {
      cell: Cell,
      grid: 'test',
      items: new Array(5)
        .fill(0)
        .map((_, i) => new Array(3).fill(0).map((_, j) => `${i}-${j}`))
    }
  }
}
</script>

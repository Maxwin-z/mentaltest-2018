<template>
  <div>
    <grid :items="items" :cell="cell" />
    <div>Grid {{grid}}</div>
    <div>Counter{{count}}<button v-on:click="e => add(e, 3, [], 'str')" >Add</button></div>
    <div v-for="(val, key, index) in array" v-bind:key="key">
      val: {{val}}; 
      key: {{key}};
      index: {{index}}
    </div>
    <div v-for="(val, key, index) in obj" v-bind:key="key">
      val: {{val}}; 
      key: {{key}};
      index: {{index}}
    </div>
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
      grid: 'this is test data',
      array: [1, 2, 3, 4],
      obj: {
        a: 1,
        b: 'ssss'
      },
      items: new Array(5)
        .fill(0)
        .map((_, i) => new Array(3).fill(0).map((_, j) => `${i}-${j}`))
    }
  },
  methods: {
    add(e, n, arr, str) {
      console.log(e, n, arr, str)
      let c = this.count
      c += n
      this.count = c
    },
    minus(delta) {
      this.count -= delta
    }
  }
}
</script>

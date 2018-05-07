<template>
  <div class="r">
    <div class="flex-row" v-for="(rows, idx) in items" v-bind:key="idx">
      <div class="flex1" v-for="item in rows" v-bind:key="item">
       <component v-bind:is="cell" v-bind:title="item" /> 
      </div>
    </div>
  </div>
</template>

<script>
// import Cell from './cell.vue'

export default {
  props: {
    items: {
      type: Array,
      default: ['a', 'b', 'c']
    },
    cell: {
      type: Object
    }
  }
}
</script>

<style>
.flex-row {
  display: flex;
  flex-direction: row;
}
.flex-column {
  display: flex;
  flex-direction: column;
}

.flex1 {
  flex: 1;
}
.flex2 {
  flex: 2;
}
.flex3 {
  flex: 3;
}
</style>

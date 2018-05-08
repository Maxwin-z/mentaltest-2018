<template>
  <div class="item" v-on:click="e => click(e, title)">
    <div>Icon Img</div>
    <div>{{title}}</div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String
    }
  },
  methods: {
    click(e, title) {
      console.log(e, title)
    }
  }
}
</script>

<style scoped>
.item {
  margin: 10px;
  border: 1px solid red;
}
</style>

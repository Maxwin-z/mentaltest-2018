<template>
  <div class="item" v-on:click="click">
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
    click(e) {
      console.log(e, this.title)
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

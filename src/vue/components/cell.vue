<template>
  <div class="item">
    <div>Icon</div>
    <div>{{title}}</div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String
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

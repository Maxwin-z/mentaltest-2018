import Vue from 'vue'
import App from './App.vue'
import HomePage from './vue/HomePage.vue'

const MainCtrl = new Vue({
  el: '#root-vue',
  render: (h) => h(HomePage)
})

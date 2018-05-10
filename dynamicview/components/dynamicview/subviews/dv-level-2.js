// components/dynamicview/dynamicview.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    nodes: Array
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    ontap(e) {
      // handle different event via data. such as: navigator ...
      console.log(e.currentTarget.dataset.data)
    }
  }
})

# Just some tests

## vue2mp

convert vue page & component to wechat mini program.

```
yarn install
yarn start
```

vue 预览`http://localhost:3000`
小程序在`dist`下

## DynamicView

**Note**

小程序自定义组件只支持 1 级嵌套，即`<A><A /></A>`不会被递归渲染。因此这里采用了多级组件解决嵌套问题。

小程序在`dynamicview`目录下

扩展`dynamicview`能力，请运行`node dynamicview/components/dynamicview/generator.js`用于生产多级组件

修改`pages/index.js`中的视图数据查看效果

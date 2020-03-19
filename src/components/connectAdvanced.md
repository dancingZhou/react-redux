# forwardRef 部分

调用connect方法的时候可以如下调用

```javascript
connect(
  state => ({}),
  dispatch => ({}),
  {
    forwardRef: true
  }
)(WrappedComponent)
```

源码中connect()()返回的是一个组件 ConnectFunction 或者 React.memo(ConnectFunction)

所以我们使用如下代码

```javascript
const Wrapped = connect()(Wrapper)

ref = React.createRef()

render() {
  return <Wrapped ref={ref} />
}
```
这样是获取不到组件Wrapper的实例，因为Wrapped组件新版的是一个函数，函数组件的实例不能获取，需要使用forwardRef来处理

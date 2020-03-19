# step1 实现简单的react-redux

redux核心是返回了一个响应变化并且可被监听的store，基本API如下：

```javascript
// 监听store变动
store.subscribe(() => {
  // 获取store当前state
  store.getState()
})

// 发布变化
store.dispatch({
  type: ...,
  payload: ...
})
```

react-redux要让React组件可以响应store的变化。

在react中引起组件变化的总结起来只有state的变化（hooks中对应的就是useState useReducer）。

注：在其他解释中组件的更新会由state或者context或者props的变动引起，但是再追溯上去其实就是变动的组件的祖先组件的state更新引起的。

所以思路就是监听store的变动，然后更新相关组件的state，在组件中使用store.getState获取最新的state用于渲染子组件。

redux的store是单例，为了方便共享可以通过context来完成共享。

## 关于redux的简单使用

```javascript
const store = createStore(() => 1)

store.subscribe(() => {})

store.dispatch({
  type: ...,
  payload: ...
})
```

## 关于context的简单使用
context的存在是为了方便跨后代组件传递信息，使用方法如下。

```javascript
// 这里的defaultValue只有在子组件没有找到context.Provider的时候才会被应用
const context = React.createContext(defaultValue)

<context.Provider value={0}>
  <ChildComponent />
</context.Provider>

// 类组件获取context
class ChildComponent extends Component {
  // 定义一个静态属性表明要获取的context
  static contextType = context

  componentDidMount() {
    // 之后context就被挂在了组件context属性上
    this.context
  }
}

// 函数式组件获取context
<context.Consumer>
  contextValue => {
    return <div>{contextValue}</div>
  }
</context.Consumer>

// 函数式组件还可以通过useContext获取contextValue

function comp() {
  const contextValue = useContext(context)
}
```

# Step2 实现pure功能

# step3 实现forwdRef功能
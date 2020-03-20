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

这个数据来源有两个，一个是store，一个是父组件传递下来的props

mapStateToProps(state, props)

mapDispatchToProps(dispatch, props)

其中 state 和 dispatch 来自 store

而会更新的基本只有 state 和 props。store不变dispatch就不会变ss

## 引起connect包裹的组件变化的因素

  - store的变化
    - mapStateToProps订阅的元素变化
    - mapStateToProps未订阅元素的变化：因为connect组件订阅的是store.subscribe，所以如果不是pure的话，一个属性的更新会引起所有connect的组件更新
  - props的变化
  - 组件自身setState / forceUpdate / useState之类

## 怎么才能完成纯组件的效果

  - 需要用React.memo包裹组件，这样就会对props就行浅比较
  - QUESTION: 这样的话在merge函数中mapSateToProps和mapDispatchToProps的处理就没用了？现在看不出来有啥用
  - ANWSER: 是有用的，如果allProps没变，那么是不会触发 当前的state组件更新的，connect组件的更新原理是监听store的dispatch然后修改state，引起组件更新，所以只要不修改组件的state那么组件就不会更新
    并且组件来自props的属性没有变，所以确实不用更新

## childSelector的缓存策略

  - 输出的props主要有两个来源，一个是store.getState的返回值，另一个是props
    - 精确一点是被过滤后的store.getState的返回值和props
    - ** childSelectolr的缓存为的是减少mapStateToProps和mapDispatchToProps的计算，和是否是pure无关 **

## connect的pure策略
  - 和pure直接相关的就只有React.memo才对
  - 其实不是的，如果每次都重新计算的，比如说没有监听的store中的state变化，那么mapToState 和 mapDispatch会重新计算，那么浅比较是通不过的，也就是说React.memo也无能为力


# step3 实现forwdRef功能
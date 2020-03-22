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
  - 为什么浅比较通不过？mapDispatchToProps是通不过的，因为主要注入function，每次重新计算都会生成新的函数

### 纯函数实现的根本

引起组件变更的因素有

ownProps store.getState()

mapStateToProps mapDispatchToProps

整个组件的props来源有 ownProps mapStateToProps的返回值，mapDispatchToProps的返回值

其中mapStateToProps和mapDispatchToProps的返回值直接依赖store.getState，可能依赖ownProps。

会变化的有store的state，ownProps

store被需要的部分，和不被当前组件需要的部分，还有ownProps

其中不应该引起变化的有：

不被监听的store中state的变化

不依赖ownProps的mapState和mapDispatch中ownProps的变化

也有什么都没变，却被重新渲染。父组件的render重新执行

导致不必要变化的体现：

上面不被需要的信息的变化会引起 mapStateToProps重新计算，直接导致重新计算后的值无法通过浅比较，例如return {a: {}} 从新计算a的值一定会变化。何况是mapDispatch，返回的主要是函数。

如何避免？

做到上面值变化的时候allProps不要变化

检测mapToState和mapToDispatch是否依赖ownProps，如果不依赖只有ownProps变化的时候不要重新计算

所以需要区别是否只有ownProps变化

为什么要区分是否依赖ownProps，即使不依赖ownProps，props变化的时候整个组件也是需要重新渲染的，区别就是这个props是否会影响子元素

store中其他state变化是不会影响到当前state变化的，所以可以通过钱比较判断 state

现在主要原因是不依赖的store的变化直接引起mapState和mapDispatch的重新计算，从而导致通不过浅比较

## 具体实现方法

有三个变化，父元素render、store的state、ownprops

父元素的render 没涉及当前组件的变化

store 没涉及当前组件的变化

ownprops总会变化

入参 state ownProps 总是会变化的

state的变化用强比较, ownProps用前比较

mapStateToProps的返回值被缓存，用作比较

mapDispatchToProps 的返回值比较没意义啊

所以值分为三个部分，被注入，也分别被缓存

因为所有数据都来自两部分，一个是store，一个是ownProps

首先判断 store是否改变和ownProps是否改变

还是两个都改变了

1 store变了 重新根据 mapStateToProps重新计算 其他不动

2 ownProps变了 

mapStateToProps
分为是否监听ownProps

如果监听ownProps 只有props的时候也要重新计算

如果不监听，则只有props变的时候不需要计算

mapDispatchToProps同理

3 都变了，上面的事情都要做


可以省略的变更有

# step3 实现forwdRef功能
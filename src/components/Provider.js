import React, { useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ReactReduxContext } from './Context'
import Subscription from '../utils/Subscription'

// QUESTION: React 中可以更新组件的应该只有 state 的更新，和 forceUpdate ，但是
// 这里的 context 没有放到state里面即使store被dispatch更新了，当前组件也不会更新才对啊
// Provider 并不一定会被作为顶级组件哦，可能会被用作子组件
// Provider 只是用 Context 跨组件提供了 {store: subscription} 对象
// Provider 本身并不响应 state 的变化
// 这个 store 还能换掉，这的有意思
function Provider({ store, context, children }) {
  const contextValue = useMemo(() => {
    const subscription = new Subscription(store)
    // 真正通知 subscription 监听者的是方法 notifyNestedSubs
    // 但是响应 store 的回调的确是 onStateChange 现在 onStateChange === notifyNestedSubs
    subscription.onStateChange = subscription.notifyNestedSubs
    // QUESTION: 为什么要做一个 subscription 来响应 store 的变动？
    return {
      store,
      subscription
    }
  }, [store]) //QUESTION redux 的store为什么会变？

  // QUESTION: 为什么叫上一个状态，不应该是 currentState 吗？
  const previousState = useMemo(() => store.getState(), [store])

  useEffect(() => {
    const { subscription } = contextValue
    // 这里手动尝试启动监听，没有通过 addNestedSub 方法隐式调用
    // 这个方法调用之后 整个 subscription 就会响应 store 的变化
    subscription.trySubscribe()

    // QUESTION: 这是什么意思？为什么会不等于 previousState ?
    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }
    return () => {
      subscription.tryUnsubscribe()
      // 这个必须断开，否则 notifyNestedSubs 执行 this.listeners.notify 会报错，
      // 因为 this.listeners 是null
      subscription.onStateChange = null
    }
  }, [contextValue, previousState])

  // 一般是不会传 context 给 Provider 组件的
  const Context = context || ReactReduxContext

  return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

if (process.env.NODE_ENV !== 'production') {
  Provider.propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }),
    context: PropTypes.object,
    children: PropTypes.any
  }
}

export default Provider

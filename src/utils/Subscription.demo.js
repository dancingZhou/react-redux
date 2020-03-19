/**
 * Subsciption.js 是怎么用的
 * 1 let a = new Subscription(store, parentSub)
 * 2 a.addNestedSub
 * 3 a.notifyNestedSubs
 * 4 a.handleChangeWrapper
 * 5 a.onStateChange
 * 
 * Subscription 是一个事件节点，可以理解为 DOM事件冒泡过程中的节点
 * 
 * 响应store事件或者parentSub事件的是方法 handleChangeWrapper 但是这只是一个wrapper
 * wrapper里面又调用了实例的onStateChange
 * 
 * 通知实例a的监听者的方法是 a.notifyNestedSubs
 * 
 * 所以可以看出来当前节点响应事件和通知自身的监听者并不是连起来的
 * 需要自己手动关联上
 * a.onStateChange = a.notifyNestedSubs
 */

import Subscription from './Subscription'
import { createStore } from 'redux'

let count = 0

let store = createStore(() => {
  return count++
})

let action = () => store.dispatch({type: 1})

let sub = new Subscription(store)

sub.addNestedSub(() => {
  console.log('sub', store.getState())
})

sub.addNestedSub(() => {
  console.log('sub', store.getState())
})

// 如果没有这一行上面的监听是不会执行的
sub.onStateChange = sub.notifyNestedSubs

setTimeout(() => {
  console.log('开始触发dispatch')
  action()
}, 2000)

// 添加一个事件处理的节点

let b = new Subscription(store, sub)

b.addNestedSub(() => {
  console.log('b')
})

// 这一段最是关键
b.onStateChange = b.notifyNestedSubs
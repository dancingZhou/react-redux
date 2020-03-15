import { bindActionCreators } from 'redux'
import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

// QUESTION: 这里都表明了当mapDispatchTo为function，下面还是在判断是否是function
// 有点啰嗦，IsFunction 和 IsMissing 是在哪里判断的呢
// 其实看懂了就还好，下面的undefined是必须的，因为链式调用的时候依赖
// 非法值来判断是否合法，时候要接下来调用
// ANSWER: match方法中并没有判断是否是function才指定对应的函数，用的是对于的函数返回的是或否是和法值来判断的
// 具体可看connect.js中的match方法
export function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === 'function'
    ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')
    : undefined
}

export function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  return !mapDispatchToProps
    ? wrapMapToPropsConstant(dispatch => ({ dispatch }))
    : undefined
}

export function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object'
    ? wrapMapToPropsConstant(dispatch =>
        bindActionCreators(mapDispatchToProps, dispatch)
      )
    : undefined
}

// QUESTION: 原料准备好，需要工厂了，所以才有selector ?
// ANWSER: connect.js 中有match方法，就是消费该原料的地方
// 有了match方法和这类思想，添加一个IsObject坚实很方便
export default [
  whenMapDispatchToPropsIsFunction,
  whenMapDispatchToPropsIsMissing,
  whenMapDispatchToPropsIsObject
]

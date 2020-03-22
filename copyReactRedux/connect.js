import React, { useReducer, useContext, useMemo, useRef } from 'react'
import context from './context'
import { useEffect } from 'react'
import shadowEqual1 from '../src/utils/shallowEqual'

function mergeObj1(obj1, obj2, obj3) {
  return {...obj1, ...obj2, ...obj3}
}

function childSelector(mapStateToProps, mapDispatchToProps, {
  shadowEqual = shadowEqual1,
  strictEqual = () => false,
  dispatch,
  mergeObj
}) {
  let propsFromState
  let propsFromDispatch
  let cacheOwnProps
  let cacheState
  let cacheAllProps
  let hasOnce = true

  function getFromNewState(newState, ownProps) {
    let newPropsFromState = mapStateToProps(newState, ownProps)
    if (shadowEqual(newPropsFromState, propsFromState)) {
      propsFromState = newPropsFromState
      return cacheAllProps
    } else {
      // 这里需要写两遍吗？
      propsFromState = newPropsFromState
      return cacheAllProps = mergeObj(newPropsFromState, cacheOwnProps, propsFromDispatch)
    }
  }

  function getFromNewProps(newState, ownProps) {
    let newPropsFromState = mapStateToProps(newState, ownProps)

    if (shadowEqual(newPropsFromState, propsFromState)) {
      propsFromState = newPropsFromState
      return cacheAllProps
    } else {
      // 这里需要写两遍吗？
      propsFromState = newPropsFromState
      return cacheAllProps = mergeObj(newPropsFromState, cacheOwnProps, propsFromDispatch)
    }
  }

  function getNewPropsAndState(newState, ownProps) {

  }

  return function(newState, ownProps) {
    if (hasOnce) {
      cacheState = newState
      cacheOwnProps = ownProps
      propsFromState = mapStateToProps(newState, ownProps)
      propsFromDispatch = mapDispatchToProps(dispatch, ownProps)
      cacheAllProps = mergeObj(cacheOwnProps, propsFromState, propsFromDispatch)
      hasOnce = false
      return cacheAllProps
    } else {
      const stateChanged = strictEqual(newState, cacheState)
      const ownPropsChanged = shadowEqual(cacheOwnProps, ownProps)
      const propsAndStateChanged = stateChanged && ownPropsChanged

      if (propsAndStateChanged) return getNewPropsAndState(newState, ownProps)
      if (stateChanged) return getFromNewState(newState, ownProps)
      if (ownPropsChanged) return getFromNewProps(newState, ownProps)

      return cacheAllProps
    }
  }
}

function defaultMergeFactory(mapStateToProps, mapDispatchToProps, {
  shadowEqual = shadowEqual1,
  strictEqual = () => false,
  dispatch = () => {},
  mergeObj = mergeObj1
} = {}) {

  return childSelector(mapStateToProps, mapDispatchToProps, {
    shadowEqual,
    strictEqual,
    dispatch,
    mergeObj
  })
}

function subUpdate(updateFn, cacheAllProps, newProps) {
  if (cacheAllProps !== newProps) updateFn()
}

export default (mapStateToProps, mapDispatchToProps, mergeProps,
  {
    // 这里表示需要透传ref属性
    forwardRef = false,
    pure = true,
  } = {}) => {

  return WrapperedComponent => {

    function ConnectComponent(props) {
      const { forwardedRef, ...lastestOwnProps } = props

      const cacheAllProps = useRef(null)

      const [_, forceUpdate] = useReducer(count => count + 1, 0)
      const store = useContext(context)
      

      // const propsFromStore = mapStateToProps(store.getState(), props)
      // const propsFromDispatch = mapDispatchToProps(store.dispatch, props)

      const getActulProps = useMemo(() => defaultMergeFactory(mapStateToProps, mapDispatchToProps, {dispatch: store.dispatch}), [store])

      // 这里有一个先有鸡还是先有蛋的问题
      const allProps = getActulProps(store.getState(), lastestOwnProps)

      // 不调用 forceUpdate 不是因为 store的改变没有别订阅，而是因为props的改变没有被订阅
      // store的改变当前组件一定会被执行，但是被包裹的组件不一定被执行

      useEffect(() => store.subscribe(forceUpdate))

      cacheAllProps.current = allProps

      let ArapperedComponent = useMemo(() => {
        return <WrapperedComponent ref={forwardedRef} {...allProps} />
      }, [allProps])

      return ArapperedComponent
    }

    // 这里包一层是为了获取外面传进来的 ref，默认情况下子元素是没有机会处理ref属性的
    const connect = forwardRef ?
      React.forwardRef((props, ref) => <ConnectComponent {...props} forwardedRef={ref} />) :
      ConnectComponent

    return connect
  }
}
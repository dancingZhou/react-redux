import React, { useReducer, useContext } from 'react'
import context from './context'
import { useEffect } from 'react'

function mergeObj1(obj1, obj2, obj3) {
  return {...obj1, ...obj2, ...obj3}
}

function wrapMapToProps() {

}

function childSelector(mapStateToProps, mapDispatchToProps, {
  shadowEqual,
  strickEqual,
  dispatch,
  mergeObj
}) {
  let propsFromState
  let propsFromDispatch
  let cacheOwnProps
  let hasOnce = true

  return function(newState, ownProps) {
    if (hasOnce) {
      propsFromState = mapStateToProps(newState, ownProps)
      propsFromDispatch = mapDispatchToProps(dispatch, ownProps)
      cacheOwnProps = ownProps
      hasOnce = false
    } else {
      let newPropsFromState = mapStateToProps(newState, ownProps)
      let newPropsFromDispatch = mapDispatchToProps(dispatch, ownProps)
      let newCacheOwnProps = ownProps
      // 相等又怎么样呢？
      if (shadowEqual(newPropsFromState, propsFromState)) {

      }
    }
    
    return mergeObj(propsFromState, propsFromDispatch, cacheOwnProps)
  }
}

function defaultMergeFactory(mapStateToProps, mapDispatchToProps, {
  shadowEqual = () => false,
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

export default (mapStateToProps, mapDispatchToProps, mergeProps,
  {
    // 这里表示需要透传ref属性
    forwardRef = false,
    pure = true,
  } = {}) => {

  return WrapperedComponent => {

    function ConnectComponent(props) {
      const { forwardedRef, ...lastestOwnProps } = props

      const [_, forceUpdate] = useReducer(count => count + 1, 0)
      const store = useContext(context)
      useEffect(() => store.subscribe(forceUpdate))

      // const propsFromStore = mapStateToProps(store.getState(), props)
      // const propsFromDispatch = mapDispatchToProps(store.dispatch, props)

      const getActulProps = defaultMergeFactory(mapStateToProps, mapDispatchToProps, {dispatch: store.dispatch})

      const allProps = getActulProps(store.getState(), lastestOwnProps)

      let ArapperedComponent = (props) => {
        return <WrapperedComponent ref={forwardedRef} {...props} />
      }
      if (pure) {
        ArapperedComponent = React.memo(ArapperedComponent)
      }
      return <ArapperedComponent {...allProps}  />
    }

    // 这里包一层是为了获取外面传进来的 ref，默认情况下子元素是没有机会处理ref属性的
    const connect = forwardRef ?
      React.forwardRef((props, ref) => <ConnectComponent {...props} forwardedRef={ref} />) :
      ConnectComponent

    return connect
  }
}
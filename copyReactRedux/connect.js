import React, { useReducer, useContext } from 'react'
import context from './context'
import { useEffect } from 'react'

function mergeObj(obj1, obj2, obj3) {
  return {...obj1, ...obj2, ...obj3}
}

export default (mapStateToProps, mapDispatchToProps, mergeProps, 
  {
    // 这里表示需要透传ref属性
    forwardRef = false
  } = {}) => {

  return WrapperedComponent => {

    function ConnectComponent(props) {
      const { forwardedRef, ...lastestOwnProps } = props

      const [_, forceUpdate] = useReducer(count => count + 1, 0)
      const store = useContext(context)
      useEffect(() => store.subscribe(forceUpdate))

      const propsFromStore = mapStateToProps(store.getState(), props)
      const propsFromDispatch = mapDispatchToProps(store.dispatch, props)

      const allProps = mergeObj(propsFromStore, propsFromDispatch, lastestOwnProps)

      return <WrapperedComponent {...allProps} ref={forwardedRef} />
    }

    // 这里包一层是为了获取外面传进来的 ref，默认情况下子元素是没有机会处理ref属性的
    const connect = forwardRef ?
      React.forwardRef((props, ref) => <ConnectComponent {...props} forwardedRef={ref} />) :
      ConnectComponent

    return connect
  }
}
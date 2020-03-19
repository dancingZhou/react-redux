import React, { useReducer, useContext } from 'react'
import context from './context'
import { useEffect } from 'react'

function mergeObj(obj1, obj2, obj3) {
  return {...obj1, ...obj2, ...obj3}
}

export default (mapStateToProps, mapDispatchToProps) => {
  return WrapperedComponent => {
    return props => {
      const [_, forceUpdate] = useReducer(count => count + 1, 0)
      const store = useContext(context)
      useEffect(() => store.subscribe(forceUpdate))

      const propsFromStore = mapStateToProps(store.getState(), props)
      const propsFromDispatch = mapDispatchToProps(store.dispatch, props)

      const allProps = mergeObj(propsFromStore, propsFromDispatch, props)

      return <WrapperedComponent {...allProps} />
    }
  }
}
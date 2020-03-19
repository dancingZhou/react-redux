import React from 'react'
import context from './context'

export default props => {
  const { store } = props
  return <context.Provider value={store}>
    {props.children}
  </context.Provider>
}
import React from 'react'

// 导出的 { ReactReduxContext } 和默认导出是同一个对象（reactContext）

export const ReactReduxContext = /*#__PURE__*/ React.createContext(null)

if (process.env.NODE_ENV !== 'production') {
  ReactReduxContext.displayName = 'ReactRedux'
}

export default ReactReduxContext

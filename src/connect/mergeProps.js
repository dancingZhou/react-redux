import verifyPlainObject from '../utils/verifyPlainObject'

// 通过connect的props有
// mapStateToProps 的返回值 
// mapDispatchToProps 的返回值
// 父元素传进来的 ownProps
export function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return { ...ownProps, ...stateProps, ...dispatchProps }
}

// 整个思想可以说是依赖注入
export function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(
    dispatch,
    { displayName, pure, areMergedPropsEqual }
  ) {
    // 整个组件的props也被缓存了
    // 并且是否是首次处理的判断很明确，用了一个变量完成 hasRunOnce
    // 整个框架中这是第二个需要区别是否首次调用的地方
    // 第一个地方是 wrapMapToProps 方法的实现
    let hasRunOnce = false
    let mergedProps

    // 被代理的 mergeProps 函数
    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps)

      // QUESTION: 如果不区分第一次会怎么样
      if (hasRunOnce) {
        // 非第一次执行
        // 有可能props不更新，pure === true && areMergedPropsEqual(nextMergedProps, mergedProps) === true
        // areMergedPropsEqual 这个函数在做一些比较
        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps))
          mergedProps = nextMergedProps
      } else {
        // 第一次执行直接设置新的 props
        hasRunOnce = true
        mergedProps = nextMergedProps

        // 验证函数返回的是不是简单对象
        if (process.env.NODE_ENV !== 'production')
          verifyPlainObject(mergedProps, displayName, 'mergeProps')
      }

      return mergedProps
    }
  }
}

export function whenMergePropsIsFunction(mergeProps) {
  return typeof mergeProps === 'function'
    ? wrapMergePropsFunc(mergeProps)
    : undefined
}

export function whenMergePropsIsOmitted(mergeProps) {
  // 如果省略，不对 defaultMergeProps 进行代理，因为默认的merge函数可信
  return !mergeProps ? () => defaultMergeProps : undefined
}

export default [whenMergePropsIsFunction, whenMergePropsIsOmitted]

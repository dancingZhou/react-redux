/* eslint-disable import/no-unresolved */
// 两次同步的 setState 会被React自动同步成一次render
// 但是没有通过React触发的setState并不能被监控到 例如:
// setTimeout(() => {
//    this.setState()
//    this.setState()
// })
// 上面会触发两次render，修改如下，只会触发一次
// setTimeout(() => {
//   unstable_batchedUpdates(() => {
//     this.setState()
//     this.setState()
//   })
// })
// https://zhuanlan.zhihu.com/p/78516581 参考链接
export { unstable_batchedUpdates } from 'react-dom'

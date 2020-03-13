// 该文件是一个单例 batch 的单例
// 默认情况下 batch 仅执行传进来的回调 callback
// 为什么要这么处理，一无所知
// QUESTION: 为什么回调要传进来执行

// Default to a dummy "batch" implementation that just runs the callback
function defaultNoopBatch(callback) {
  callback()
}

let batch = defaultNoopBatch

// Allow injecting another batching function later
export const setBatch = newBatch => (batch = newBatch)

// Supply a getter just to skip dealing with ESM bindings
export const getBatch = () => batch

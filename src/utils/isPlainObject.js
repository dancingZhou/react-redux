/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
// 只有两种对象会通过 一个是 Object.create(null) 的对象
// 一个是 new Object() 或者 {} 并且它们的原型没有被修改的对象
// new Fn() 这就过不了，因为 Function.prototyp一定在原型链中
export default function isPlainObject(obj) {
  // 如果不是对象直接 false
  if (typeof obj !== 'object' || obj === null) return false

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj)
  // 如果原型为null Object.create(null) 就是一个纯粹的对象
  if (proto === null) return true

  // 获取整个原型链倒数第二层，第一层是null，第二层是 Object.prototype
  // 用于检测对象是否是一个简单对象
  let baseProto = proto
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto)
  }

  return proto === baseProto
}

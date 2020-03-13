
// 模拟Object.is的实现
// 和 === 不一样的地方在于 
// -0 !== 0 false
// NaN === NaN true
function is(x, y) {
  if (x === y) {
    // 检测 1 / -0 === 1 / 0 不相等
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {
    // 检测 NaN !== NaN 相等
    return x !== x && y !== y
  }
}

// 浅比较
export default function shallowEqual(objA, objB) {
  // 如果是基础知识相等直接返回 true
  if (is(objA, objB)) return true

  // 不是基础值
  // 如果 objA 或者 objB 有一个不是对象就返回false
  // 如果 objA 或者 objB 有一个是null直接返回false
  // 不可能两个都是 null
  // 之所以要单独判断 null 是因为 typeof null === 'object'
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  // 到这一步说明 objA 和 objB 名副其实，都是对象

  // 首先查找 objA & B 的可枚举key
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  // 如果可枚举key长度不一样一定不会浅比较相等
  if (keysA.length !== keysB.length) return false

  // keys的长度都相同，逐一比较key对应的值
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  // 上面相同key对应的值都相同，返回true。浅比较完成
  return true
}

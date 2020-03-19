import { getBatch } from './batch'

// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

// 这是一个接口的性质，表明了createListenerCollection的返回值类型
const nullListeners = { notify() {} }

// 这是一个事件模型 的一部分（处理一个节点上多个监听事件）
// 事项的方法是双向链表
// 监听的时候就是在双向链表尾端加一个 然后 notify 就是执行链表上所有的 callback

function createListenerCollection() {
  const batch = getBatch()
  // 因为是双向链表所以从头和从尾都可以遍历，这里就存了两个指针
  let first = null
  let last = null

  return {
    // 清除头尾节点，这个节点就找不到了
    // 即使重新subscribe也是一个新的链表
    clear() {
      first = null
      last = null
    },

    // 遍历整个链表执行每个节点的callback方法
    notify() {
      batch(() => {
        let listener = first
        while (listener) {
          listener.callback()
          listener = listener.next
        }
      })
    },

    // 整个链表转成数组返回
    get() {
      let listeners = []
      let listener = first
      while (listener) {
        listeners.push(listener)
        listener = listener.next
      }
      return listeners
    },

    subscribe(callback) {
      let isSubscribed = true
    
      // listener 是一个双向链表
      let listener = (last = {
        callback,
        next: null,
        // 如果是首次执行，这个last为null
        // 先建立当前node的prev指针，指向当前链表的最后一位
        prev: last
      })

      // 如果当前节点不是头节点，将当前节点添加到当前节点的上一个节点的下一个节点上
      // 建立上一次last节点的next指针指向当前的last节点
      if (listener.prev) {
        listener.prev.next = listener
      } else {
        first = listener
      }

      // 订阅方法返回一个取消订阅的函数，和Redux的subscribe一样
      // 双向链表的好处就是可以从从任一节点删除
      return function unsubscribe() {
        // 如果被取消过 或者 整个链都没了就直接返回
        if (!isSubscribed || first === null) return
        isSubscribed = false

        // 双向链表删除都麻烦些，需要修改两个指正 prev 和 next

        // 先修改next指针
        // 如果不是最后一个节点，修改当前节点下一个节点的上一个节点指向当前节点上一个节点
        // 如果是最后一个节点，直接last指向当前节点上一个节点
        if (listener.next) {
          listener.next.prev = listener.prev
        } else {
          last = listener.prev
        }
        // 再修改prev指针
        // 如果不是第一个节点，修改当前节点上一个节点的下一个节点指向当前节点下一个节点
        // 如果是第一个节点，直接first指向当前节点下一个节点
        if (listener.prev) {
          listener.prev.next = listener.next
        } else {
          first = listener.next
        }
      }
    }
  }
}

// 这个类的对象不仅会作为 响应 者，还会作为时间的触发者
// 这就是事件链中的一个节点
export default class Subscription {
  // 这两个入参都是当前Subscription的监听对象
  // 所以这两个被监听的对象都实现了同样的接口，subscribe 然后返回一个函数 unsubscribe
  // 如果提供了parentSub那么就会监听parentSub的事件，否则田径store的subscribe
  constructor(store, parentSub) {
    // store就是redux的方法createStore出来的对象 {subscribe, getState, dispatch}
    this.store = store
    this.parentSub = parentSub
    this.unsubscribe = null
    this.listeners = nullListeners

    this.handleChangeWrapper = this.handleChangeWrapper.bind(this)
  }

  // 添加添加自己的监听者
  // 该方法违反了单一职责原则，一个方法做了两件事，一个是初始化监听器，一个是设置上监听回调
  // 但是确实简化了上层接口的调用，否则需要用户手动去 trySubscribe 
  // QUESTION: 但是为什么不在 constructor 中完成初始化工作？
  // ANSWER: 因为当前对象会被重复利用，可以 tryUnsubscribe 如果在 constructor 中初始化，会有问题
  addNestedSub(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
  }

  // 通知自己的监听者事件发生了
  // 监听对象事件的发生并没有直接通知该方法，而是通知了 handleChangeWrapper
  // 所以这个方法是否被调用需要看 onStateChange 这个方法是怎么实现的
  // 但是 onStateChange 又是后期注入的，所以具体要看业务逻辑
  // QUESTION: 为什么不在 handleChangeWrapper 中直接调用该方法？
  notifyNestedSubs() {
    this.listeners.notify()
  }

  handleChangeWrapper() {
    // QUESTION
    // 这个onStateChange 看样子是后期注入的？
    // 监听的事件发生之后触发回调 onStateChage
    // ANWSER: 是的
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  // 有卸载监听的方法就说明当前对象有监听某个事件
  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  // 1. 尝试监听某个事件，事件发生之后执行 handleChageWrapper
  // 2. 初始化自己的监听者列表
  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.handleChangeWrapper)
        : this.store.subscribe(this.handleChangeWrapper)

      this.listeners = createListenerCollection()
    }
  }

  // 尝试取消监听
  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}

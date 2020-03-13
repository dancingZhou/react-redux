import { createStore  } from '../../redux/src/index'

const actionType = {
  add: 'ADD'
}

export const actions = {
  add(payload) {
    return {
      type: actionType.add,
      payload
    }
  }
}

export default createStore((state = {val: 1}, action) => {

  const { type, payload } = action

  switch(type) {
    case actionType.add:
      return {val: payload}
  }
  return state
})

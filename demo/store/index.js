import { createStore  } from '../../redux/src/index'

const actionType = {
  add: 'ADD',
  updateOther: 'UPDATE_OTHER',
}

export const actions = {
  add(payload) {
    return {
      type: actionType.add,
      payload
    }
  },
  updateOtherInfo(payload) {
    return {
      type: actionType.updateOther,
      payload
    }
  }
}

export default createStore((state = {val: 1, otherInfo: 'z'}, action) => {

  const { type, payload } = action

  switch(type) {
    case actionType.add:
      return Object.assign({}, state, {val: payload})
    case actionType.updateOtherInfo:
      return Object.assign({}, state, {otherInfo: payload})
  }
  return state
})

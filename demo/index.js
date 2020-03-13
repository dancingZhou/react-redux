import ReactDOM from 'react-dom'
import React from 'react'
import { Provider, connect } from '../src/index'
import store, { actions } from './store'

function _App(props) {

  function handleClick() {
    props.add(props.val + 1)
  }

  return <div onClick={handleClick}>
    增加
    <div>{props.val}</div>
  </div>
}

function mapStateToProps(state) {

  return {
    val: state.val
  }

}

function mapDispatchToProps(dispatch) {

  return {
    add(payload) {
      dispatch(actions.add(payload))
    }
  }

}

const App = connect(mapStateToProps, mapDispatchToProps)(_App)

ReactDOM.render(<Provider store={store}>
  <App />
</Provider>, document.querySelector('#root'))

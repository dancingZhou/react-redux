import ReactDOM from 'react-dom'
import React, { useEffect } from 'react'
// import { Provider, connect } from '../src/index'
import { Provider, connect } from '../copyReactRedux'
import store, { actions } from './store'

class AppWrapped extends React.Component {

  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    this.props.add(this.props.val + 1)
  }

  render() {
    return <div onClick={this.handleClick}>
      增加
      <div>{this.props.val}</div>
    </div>
  }
  
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

const App = connect(mapStateToProps, mapDispatchToProps, undefined, {forwardRef: true})(AppWrapped)

const ref = React.createRef()

function Wrapper() {
  useEffect(() => {
    console.log("我是原组件AppWrapped的ref", ref.current)
  })

  return <App ref={ref} />
}

ReactDOM.render(<Provider store={store}>
  <Wrapper />
</Provider>, document.querySelector('#root'))

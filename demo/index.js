import ReactDOM from 'react-dom'
import React, { useEffect } from 'react'
// import { Provider, connect } from '../src/index'
import { Provider, connect } from '../copyReactRedux'
import store, { actions } from './store'
window.i = 0
class AppWrapped extends React.Component {

  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.i = 0
  }
  
  componentDidMount() {
    console.log('zzzz')
  }

  handleClick() {
    this.props.add(this.props.val + 1)
  }

  render() {
    console.log('渲染了' + (this.i++) + '次')
    return <div>
        <div onClick={() => this.props.updateOtherInfo('zzzzzzz')}>修改</div>
        <div onClick={this.handleClick}>
        增加
        <div>{this.props.val}</div>
      </div>
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
    },
    updateOtherInfo(payload) {
      dispatch(actions.updateOtherInfo(payload))
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

/**
 * function createAction(payload) {
 *  return {
 *    type: 'ADD',
 *    payload
 *  }
 * }
 * 
 * function mapDispatchToProps(dispathc, ownProps) {
 *  retrun bindActionCreators({createAction}, dispatch)
 * }
 * 
 * 摘抄自redux源码
 * function bindActionCreator(actionCreator, dispatch) {
 *   return function() {
 *     return dispatch(actionCreator.apply(this, arguments))
 *   }
 * }
 */
import { bindActionCreators } from 'redux'

export default function wrapActionCreators(actionCreators) {
  return dispatch => bindActionCreators(actionCreators, dispatch)
}

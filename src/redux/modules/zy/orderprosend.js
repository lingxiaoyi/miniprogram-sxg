import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_ORDER_SEND: 'LEAR_ORDER_SEND',
  LOAD_ORDER_SEND: 'LOAD_ORDER_SEND',
  LOAD_ORDER_SEND_SUCCESS: 'LOAD_ORDER_SEND_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearOrderSend: () => ({
    type: types.LEAR_ORDER_SEND
  }),
  loadOrderSend: () => ({
    type: types.LOAD_ORDER_SEND,
    loading: true
  }),
  loadOrderSendSuccess: data => ({
    type: types.LOAD_ORDER_SEND_SUCCESS,
    data
  }),
  loadFailed:msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadOrderSendAsync(operName= '',time='') {
    return async dispatch => {
      dispatch(this.loadOrderSend());

      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        operName:operName,
        time:time,
      }
      const res = await request(URL.orderProSend, publicParameters, 'get');
      if(res.stat === 0){
        dispatch(this.loadOrderSendSuccess(res.data));
      } else {
        dispatch(this.loadFailed(res.msg));
      }
    };
  }
};

// ============================================================
// reducer
// ============================================================
function orderSend(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_ORDER_SEND:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_ORDER_SEND:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_ORDER_SEND_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    case types.LOAD_FAILED:
      return {
        ...state,
        loading: false,
        data: action.msg
      };    
    default:
      return state;
  }
}

export default orderSend;
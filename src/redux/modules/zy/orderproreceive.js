import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_ORDER_RECEIVE: 'LEAR_ORDER_RECEIVE',
  LOAD_ORDER_RECEIVE: 'LOAD_ORDER_RECEIVE',
  LOAD_ORDER_RECEIVE_SUCCESS: 'LOAD_ORDER_RECEIVE_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearOrderReceive: () => ({
    type: types.LEAR_ORDER_RECEIVE
  }),
  loadOrderReceive: () => ({
    type: types.LOAD_ORDER_RECEIVE,
    loading: true
  }),
  loadOrderReceiveSuccess: data => ({
    type: types.LOAD_ORDER_RECEIVE_SUCCESS,
    data
  }),
  loadFailed:msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadOrderReceiveAsync(operName= '',time='',tradeId='',logisticsId='') {
    return async dispatch => {
      dispatch(this.loadOrderReceive());
      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        operName:operName,
        time:time,
        tradeId:tradeId,
        logisticsId:logisticsId
      }
      const res = await request(URL.orderProReceive, publicParameters, 'get');
      if(res.stat === 0){
        dispatch(this.loadOrderReceiveSuccess(res.data));
      } else {
        dispatch(this.loadFailed(res.msg));
      }
    };
  }
};

// ============================================================
// reducer
// ============================================================
function orderReceive(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_ORDER_RECEIVE:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_ORDER_RECEIVE:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_ORDER_RECEIVE_SUCCESS:
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

export default orderReceive;
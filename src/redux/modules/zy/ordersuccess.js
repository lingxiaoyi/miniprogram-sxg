import { request, getPublicParameters  } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_ORDER_SUCCESS: 'LEAR_ORDER_SUCCESS',
  LOAD_ORDER_SUCCESS: 'LOAD_ORDER_SUCCESS',
  LOAD_ORDER_SUCCESS_SUCCESS: 'LOAD_ORDER_SUCCESS_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearOrderSuccess: () => ({
    type: types.LEAR_ORDER_SUCCESS
  }),
  loadOrderSuccess: () => ({
    type: types.LOAD_ORDER_SUCCESS,
    loading: true
  }),
  loadOrderSuccessSuccess: data => ({
    type: types.LOAD_ORDER_SUCCESS_SUCCESS,
    data
  }),
  loadFailed:msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadOrderSuccessAsync(operName= '',time='',tradeId='') {
    return async dispatch => {
      dispatch(this.loadOrderSuccess());
      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        operName:operName,
        time:time,
        tradeId:tradeId
      }
      const res = await request(URL.orderSuccess, publicParameters, 'get');
      if(res.stat === 0){
        dispatch(this.loadOrderSuccessSuccess(res.data));
      } else {
        dispatch(this.loadFailed(res.msg));
      }
    };
  }
};

// ============================================================
// reducer
// ============================================================
function orderSuccess(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_ORDER_SUCCESS:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_ORDER_SUCCESS:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_ORDER_SUCCESS_SUCCESS:
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

export default orderSuccess;
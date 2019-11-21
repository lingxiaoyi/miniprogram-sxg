import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_RETURN_ORDER: 'LEAR_RETURN_ORDER',
  LOAD_RETURN_ORDER: 'LOAD_RETURN_ORDER',
  LOAD_RETURN_ORDER_SUCCESS: 'LOAD_RETURN_ORDER_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearReturnOrder: () => ({
    type: types.LEAR_RETURN_ORDER
  }),
  loadReturnOrder: () => ({
    type: types.LOAD_RETURN_ORDER,
    loading: true
  }),
  loadReturnOrderSuccess: data => ({
    type: types.LOAD_RETURN_ORDER_SUCCESS,
    data
  }),
  loadFailed:msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadReturnOrderAsync(operName= '',time='',tradeId='') {
    return async dispatch => {
      dispatch(this.loadReturnOrder());

      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        operName:operName,
        time:time,
        tradeId:tradeId,
      }
      const res = await request(URL.returnOder, publicParameters, 'get');
      if(res.stat === 0){
        dispatch(this.loadReturnOrderSuccess(res.data));
      } else {
        dispatch(this.loadFailed(res.msg));
      }
    };
  }
};

// ============================================================
// reducer
// ============================================================
function returnOrder(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_RETURN_ORDER:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_RETURN_ORDER:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_RETURN_ORDER_SUCCESS:
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

export default returnOrder;
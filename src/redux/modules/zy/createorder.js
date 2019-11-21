import { requestWithParametersToken } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';
// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_CREATE_ORDER: 'LEAR_CREATE_ORDER',
  LOAD_CREATE_ORDER: 'LOAD_CREATE_ORDER',
  LOAD_CREATE_ORDER_SUCCESS: 'LOAD_CREATE_ORDER_SUCCESS',
  LOAD_CREATE_ORDER_FAILED: 'LOAD_CREATE_ORDER_FAILED' // 请求失败
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearcreateOrder: () => ({
    type: types.LEAR_CREATE_ORDER
  }),
  loadcreateOrder: () => ({
    type: types.LOAD_CREATE_ORDER,
    loading: true
  }),
  loadcreateOrderSuccess: data => ({
    type: types.LOAD_CREATE_ORDER_SUCCESS,
    data
  }),
  loadcreateOrderFailed: msg => ({
    type: types.LOAD_CREATE_ORDER_FAILED,
    msg
  }),
  createOrderAsync(numIid = '', itemNum = '', addressId = '', goodId = '', shareAccid = 0) {
    return async dispatch => {
      dispatch(this.loadcreateOrder());
      const res = await requestWithParametersToken(URL.zy.createOrder, {
        numIid,
        itemNum,
        addressId,
        goodId,
        shareAccid
      });
      dispatch(this.loadcreateOrderSuccess(res.data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function createOrder(state = { loading: false, data: {} }, action) {
  switch (action.type) {
    case types.LEAR_CREATE_ORDER:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_CREATE_ORDER:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_CREATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    case types.LOAD_CREATE_ORDER_FAILED:
      return {
        ...state,
        loadFailed: true,
        failedMsg: action.msg,
        loading: false
      };

    default:
      return state;
  }
}

export default createOrder;

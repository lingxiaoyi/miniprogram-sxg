import { requestWithParametersToken } from '../../../utils/api';
import { URL } from '../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = { //订单详情页
  LEAR: 'MODULES/ZY/ORDERDETAIL/LEAR',
  LOAD: 'MODULES/ZY/ORDERDETAIL/LOAD',
  SUCC: 'MODULES/ZY/ORDERDETAIL/LOAD_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clear: () => ({
    type: types.LEAR
  }),
  load: () => ({
    type: types.LOAD,
    loading: true
  }),
  loadSuccess: data => ({
    type: types.SUCC,
    data
  }),
  loadOrderdetails(tradeId) {
    return async dispatch => {
      dispatch(this.load());
      const res = await requestWithParametersToken(URL.zy.getownorderdetails, {
        tradeId,
        //accid,
        //pid: 54291221
      });
      if(res.data.stat === 0) {
        dispatch(this.loadSuccess(res.data));
      } else {
        console.error('stat不对,出错了')
      }
    };
  },
  cancelorder(tradeId, numIid) {
    return async dispatch => {
      dispatch(this.load());
      await requestWithParametersToken(URL.zy.cancelorder, {
        tradeId,
        numIid
      });
    };
  },
  confirmgoods(tradeId) {
    return async dispatch => {
      dispatch(this.load());
      await requestWithParametersToken(URL.zy.confirmgoods, {
        tradeId
      });
    };
  }
};

// ============================================================
// reducer
// ============================================================
export default function (state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: { } };
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.SUCC:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

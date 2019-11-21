import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_AGREE_REFUND: 'LEAR_AGREE_REFUND',
  LOAD_AGREE_REFUND: 'LOAD_AGREE_REFUND',
  LOAD_AGREE_REFUND_SUCCESS: 'LOAD_AGREE_REFUND_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearAgreeRefund: () => ({
    type: types.LEAR_AGREE_REFUND
  }),
  loadAgreeRefund: () => ({
    type: types.LOAD_AGREE_REFUND,
    loading: true
  }),
  loadAgreeRefundSuccess: data => ({
    type: types.LOAD_AGREE_REFUND_SUCCESS,
    data
  }),
  loadAgreeRefundFailed:msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadAgreeRefundAsync(operName= '',time='',tradeId='') {
    return async dispatch => {
      dispatch(this.loadAgreeRefund());
      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        operName:operName,
        time:time,
        tradeId:tradeId
      }
      const res = await request(URL.agreeRefund, publicParameters, 'get');
      if(res.stat === 0){
        dispatch(this.loadAgreeRefundSuccess(res.data));
      } else {
        dispatch(this.loadAgreeRefundFailed(res.msg));
      }
      
    };
  }
};

// ============================================================
// reducer
// ============================================================
function agreeRefund(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_AGREE_REFUND:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_AGREE_REFUND:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_AGREE_REFUND_SUCCESS:
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

export default agreeRefund;
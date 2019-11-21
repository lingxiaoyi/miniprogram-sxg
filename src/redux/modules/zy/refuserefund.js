import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_REFUSE_REFUND: 'LEAR_REFUSE_REFUND',
  LOAD_REFUSE_REFUND: 'LOAD_REFUSE_REFUND',
  LOAD_REFUSE_REFUND_SUCCESS: 'LOAD_REFUSE_REFUND_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearRefuseRefund: () => ({
    type: types.LEAR_REFUSE_REFUND
  }),
  loadRefuseRefund: () => ({
    type: types.LOAD_REFUSE_REFUND,
    loading: true
  }),
  loadRefuseRefundSuccess: data => ({
    type: types.LOAD_REFUSE_REFUND_SUCCESS,
    data
  }),
  loadFailed:msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadRefuseRefundAsync(operName= '',time='',tradeId='',refusedDesc='',RefusedImgs='') {
    return async dispatch => {
      dispatch(this.loadRefuseRefund());

      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        operName:operName,
        time:time,
        tradeId:tradeId,
        refusedDesc:refusedDesc,
        RefusedImgs:RefusedImgs
      }
      const res = await request(URL.refuseRefund, publicParameters, 'get');
      if(res.stat === 0){
        dispatch(this.loadRefuseRefundSuccess(res.data));
      } else {
        dispatch(this.loadFailed(res.msg));
      }
      
    };
  }
};

// ============================================================
// reducer
// ============================================================
function refuseRefund(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_REFUSE_REFUND:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_REFUSE_REFUND:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_REFUSE_REFUND_SUCCESS:
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

export default refuseRefund;
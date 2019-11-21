import { requestWithForm, getPublicParameters  } from '../../../utils/api';
import { URL } from '../../../constants/index';
import MD5 from '../../../utils/standardmd5';
// import { formatTime, priceConversion } from '../../../utils/util';
// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_WX_PAY: 'LEAR_WX_PAY',
  LOAD_WX_PAY: 'LOAD_WX_PAY',
  LOAD_WX_PAY_SUCCESS: 'LOAD_WX_PAY_SUCCESS',
  LOAD_WX_PAY_FAILED: 'LOAD_WX_PAY_FAILED', // 请求失败
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearWxPay: () => ({
    type: types.LEAR_WX_PAY
  }),
  loadWxPay: () => ({
    type: types.LOAD_WX_PAY,
    loading: true
  }),
  loadWxPaySuccess: data => ({
    type: types.LOAD_WX_PAY_SUCCESS,
    data
  }),
  loadWxPayFailed: msg => ({
    type: types.LOAD_WX_PAY_FAILED,
    msg
  }),
  wxPayAsync(amount= '', body='', subject='', out_trade_no = '',openid) {

    return async dispatch => {
      dispatch(this.loadWxPay());
      let publicParameters = await getPublicParameters();
      publicParameters = {
        apptypeid:publicParameters.apptypeid,
        ver:publicParameters.ver,
        accid:publicParameters.accid,
        softtype:publicParameters.softtype,
        softname :publicParameters.softname,
        out_trade_no:out_trade_no ,
        amount:parseFloat(amount),
        body:body,
        subject :subject,
        openid
      }
      const res = await requestWithForm(URL.zy.orderWxPay,
        MD5({
          ts: ('' + new Date().getTime()).substring(0, 10) / 1,
          ...publicParameters
        })
      );
        dispatch(this.loadWxPaySuccess(res.data));

    };
  }
};

// ============================================================
// reducer
// ============================================================
function wxPay(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_WX_PAY:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_WX_PAY:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_WX_PAY_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    case types.LOAD_WX_PAY_FAILED:
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

export default wxPay;

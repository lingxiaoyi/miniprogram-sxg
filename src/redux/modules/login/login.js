import Taro from '@tarojs/taro';
import { setGlobalData } from '../../../utils/wx';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD: 'LOAD_LOGIN_INFO',
  LOAD_LOGIN_INFO_SUCCESS: 'LOAD_LOGIN_INFO_SUCCESS',
  LOAD_CLEAR: 'LOAD_LOGIN_INFO_CLEAR' //清空数据
};

// ============================================================
// action creater
// ============================================================
const SXG_OPENID = 'sxg_openid';
const SXG_TOKEN = 'sxg_token';
const SXG_ACCID = 'sxg_accid';
const SXG_WXOPENID = 'sxg_wxopenid';
export const actions = {
  loadLoginInfo: () => ({
    type: types.LOAD_LOGIN_INFO
  }),
  loadLoginInfoSuccess: info => ({
    type: types.LOAD_LOGIN_INFO_SUCCESS,
    info
  }),
  load: () => ({
    type: types.LOAD
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  /**
   * 重新获取登录信息（用于token失效等情况）
   */
  resetLoginInfoAsync() {
    return async dispatch => {
      setGlobalData(SXG_OPENID, '');
      setGlobalData(SXG_TOKEN, '');
      setGlobalData(SXG_ACCID, '');
      setGlobalData(SXG_WXOPENID, '');
      Taro.clearStorageSync(SXG_OPENID);
      Taro.clearStorageSync(SXG_TOKEN);
      Taro.clearStorageSync(SXG_ACCID);
      Taro.clearStorageSync(SXG_WXOPENID);
      dispatch(this.loadClear());
    };
  },
  /**
   * 关联用户unionid
   * @param {*} info 用户信息
   */
  saveLoginInfo(data) {
    return dispatch => {
      let { token, accid, openid, wxOpenid } = data;
      token && setGlobalData(SXG_TOKEN, token) && Taro.setStorageSync(SXG_TOKEN, token);
      accid && setGlobalData(SXG_ACCID, accid) && Taro.setStorageSync(SXG_ACCID, accid);
      openid && setGlobalData(SXG_OPENID, openid) && Taro.setStorageSync(SXG_OPENID, openid);
      wxOpenid && setGlobalData(SXG_WXOPENID, wxOpenid) && Taro.setStorageSync(SXG_WXOPENID, wxOpenid);
      dispatch(this.loadLoginInfoSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function common(
  state = {
    token: '',
    accid: '',
    openid: '',
    loading: false
  },
  action
) {
  switch (action.type) {
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_LOGIN_INFO_SUCCESS:
      return {
        ...state,
        ...action.info,
        loading: false
      };
    case types.LOAD_CLEAR: {
      return {
        token: '',
        accid: '',
        openid: '',
        loading: false
      };
    }
    default:
      return state;
  }
}
export default common;

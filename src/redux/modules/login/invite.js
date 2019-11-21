import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD: 'LOAD_INVITERINFO',
  LOAD_FAIL: 'LOAD_INVITERINFO_FAIL',
  LOAD_INVITERINFO_SUCCESS: 'LOAD_INVITERINFO_SUCCESS',
  LOAD_CLEAR: 'LOAD_INVITERINFO_CLEAR' //清空数据
};

// ============================================================
// reducer
// ============================================================
const INITIAL_STATE = {
  loading: false,
  loadFailed: false,
  failedMsg: '',
  inviterinfo: {}  //邀请人信息
};
const INITIAL_STATE_OLD = JSON.parse(JSON.stringify(INITIAL_STATE));
function login(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_FAIL:
      return {
        ...state,
        loading: false,
        failedMsg: action.msg,
        inviterinfo: {}
      };
    case types.LOAD_INVITERINFO_SUCCESS:
      return {
        ...state,
        loading: false,
        inviterinfo: action.data
      };
      case types.LOAD_CLEAR: {
        return {
          ...INITIAL_STATE_OLD
        };
      }
    default:
      return state;
  }
}
export default login;

// ============================================================
// action creater
// ============================================================
export const actions = {
  load: () => ({
    type: types.LOAD
  }),
  loadFail: msg => ({
    type: types.LOAD_FAIL,
    msg
  }),
  loadInviterinfoSuccess: data => ({
    type: types.LOAD_INVITERINFO_SUCCESS,
    data
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  /**
   * 获取邀请人信息
   * @param {string} invitecode
   */
  loadInviterinfoAsync(invitecode) {
    return async dispatch => {
      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        gettype: 1,
        invitecode,
        invitemobile: ''
      }
      dispatch(this.load());
      try {
        let res = await request(URL.getuserinviterinfo, publicParameters, 'get');
        if (res.data.stat === 0) {
          res.data.invitecode = invitecode;
          dispatch(this.loadInviterinfoSuccess(res.data));
        } else {
          dispatch(this.loadFail(res.data.msg));
        }
      } catch (err) {
        dispatch(this.loadFail('网络错误'));
      }
    }
  },
  loadClearAsync() {
    return async dispatch => {
      dispatch(this.loadClear());
    };
  }
};

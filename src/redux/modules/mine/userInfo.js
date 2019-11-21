import Taro from '@tarojs/taro';
import { request, getPublicParameters } from '../../../utils/api';
import { loginInfoActions } from '../login/index';
import { URL } from '../../../constants/index';
import { setGlobalData } from '../../../utils/wx';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_MINE: 'LOAD_MINE', // 请求中
  LOAD_MINE_FAILED: 'LOAD_MINE_FAILED', // 请求失败
  LOAD_MINE_SUCCESS: 'LOAD_MINE_SUCCESS', // 请求成功
  LOAD_CLEAR: 'LOAD_MINE_CLEAR', //清空数据
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  load: () => ({
    type: types.LOAD_MINE
  }),
  loadFailed: data => ({
    type: types.LOAD_MINE_FAILED,
    data
  }),
  loadMineSuccess: userInfo => ({
    type: types.LOAD_MINE_SUCCESS,
    userInfo
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  loadMineAsync() {
    return async dispatch => {
      let publicParameters = await getPublicParameters();
      dispatch(this.load());
      try {
        let res = await request(URL.getuserbaseinfo, publicParameters, 'get');
        if (res.data.stat === 0) {
          dispatch(this.loadMineSuccess(res.data));
          dispatch(this.saveMyInvitecode(res)); //保存我的邀请码和会员等级,后期优化后可以删除,直接从redux里边去拿
        } else {
          dispatch(loginInfoActions.resetLoginInfoAsync()); //清空登陆信息,重新去登陆
          dispatch(this.loadClear());
        }
      } catch (err) {
        dispatch(this.loadFailed('网络错误'));
      }
    };
  },
  saveMyInvitecode(res) {
    return async () => {
      Taro.setStorageSync('myInvitecode', res.data.invitecode);
      setGlobalData('myInvitecode', res.data.invitecode);
      Taro.setStorageSync('memberlevel', res.data.memberlevel);
      setGlobalData('memberlevel', res.data.memberlevel);
    };
  },
  loadClearAsync() {
    return async dispatch => {
      dispatch(this.loadClear());
    };
  }
};

// ============================================================
// reducer
// ============================================================
const INITIAL_STATE = {
  loading: false,
  loadFailed: false,
  failedData: {},
  data: {}
};
const INITIAL_STATE_OLD = JSON.parse(JSON.stringify(INITIAL_STATE));
function mineBaseInfo(state = INITIAL_STATE, action) {
  // console.log('action>>', action);
  switch (action.type) {
    case types.LOAD_MINE: {
      return {
        ...state,
        loading: true
      };
    }
    case types.LOAD_MINE_FAILED:
      return {
        ...state,
        loadFailed: true,
        failedData: action.data,
        loading: false
      };
    case types.LOAD_MINE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.userInfo
      };
    case types.LOAD_CLEAR: {
      return {
        ...INITIAL_STATE_OLD
      };
    }
    case types.LOAD_RELOGIN: {
      return {
        ...state
      };
    }
    default:
      return state;
  }
}

export default mineBaseInfo;

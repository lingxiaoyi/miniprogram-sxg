import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_MINE: 'LOAD_EARNINGS', // 请求中
  LOAD_MINE_FAILED: 'LOAD_EARNINGS_FAILED', // 请求失败
  LOAD_EARNINGS_SUCCESS: 'LOAD_EARNINGS_SUCCESS',
  LOAD_CLEAR: 'LOAD_EARNINGS_CLEAR' //清空数据
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  load: () => ({
    type: types.LOAD_MINE
  }),
  loadFailed: msg => ({
    type: types.LOAD_MINE_FAILED,
    msg
  }),
  loadEarningsSuccess: data => ({
    type: types.LOAD_EARNINGS_SUCCESS,
    data
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  loadEarningsAsync() {
    return async dispatch => {
      let publicParameters = await getPublicParameters();
      dispatch(this.load());
      try {
        let res = await request(URL.getuserincomelist, publicParameters, 'get');
        if (res.data.stat === 0) {
          dispatch(this.loadEarningsSuccess(res.data));
        } else {
          dispatch(this.loadFailed('请求失败'));
        }
      } catch (err) {
        dispatch(this.loadFailed('网络错误'));
      }
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
  failedMsg: '',
  data: {} //收益页面
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
        failedMsg: action.msg,
        loading: false
      };
    case types.LOAD_EARNINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
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

export default mineBaseInfo;

import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_MINE: 'LOAD_WITHDRAWAL', // 请求中
  LOAD_MINE_FAILED: 'LOAD_WITHDRAWAL_FAILED', // 请求失败
  LOAD_MINE_SUCCESS: 'LOAD_WITHDRAWAL_SUCCESS', // 请求成功
  LOAD_FINISH: 'LOAD_WITHDRAWAL_FINISH', //请求结束无更多数据
  LOAD_CLEAR: 'LOAD_WITHDRAWAL_CLEAR' //清空数据
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
  loadMineSuccess: data => ({
    type: types.LOAD_MINE_SUCCESS,
    data
  }),
  loadFinish: msg => ({
    type: types.LOAD_FINISH,
    msg
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  loadWithdrawalAsync() {
    return async (dispatch, getState) => {
      let publicParameters = await getPublicParameters();
      let { pagesize, pagenum, loadFinish, loading } = getState().mine.withdrawal;
      publicParameters = {
        ...publicParameters,
        pagesize,
        page: pagenum
      };
      if (loadFinish || loading) return;
      dispatch(this.load());
      try {
        let res = await request(URL.getuserwithdrawallist, publicParameters, 'get');
        if (res.data.stat === 0) {
          if (res.data.data.length) {
            dispatch(this.loadMineSuccess(res.data.data));
            if (res.data.data.length < pagesize) {
              dispatch(this.loadFinish('没有更多了哦~'));
            }
          } else {
            dispatch(this.loadFinish('没有更多了哦~'));
          }
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
  requestSuc: false, //请求成功状态,防止暂无数据提示一开始出现
  loading: false,
  loadFailed: false,
  loadFinish: false,
  failedMsg: '',
  pagesize: '10',
  pagenum: 1,
  data: []
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
    case types.LOAD_MINE_SUCCESS:
      return {
        ...state,
        requestSuc: true,
        loading: false,
        pagenum: state.pagenum + 1,
        data: [...state.data, ...action.data]
      };
    case types.LOAD_FINISH: {
      return {
        ...state,
        requestSuc: true,
        loading: false,
        loadFinish: true,
        failedMsg: action.msg
      };
    }
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

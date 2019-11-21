import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD: 'LOAD_COMMISSION', // 请求中
  LOAD_FAILED: 'LOAD_COMMISSION_FAILED', // 请求失败
  LOAD_SUCCESS: 'LOAD_COMMISSION_SUCCESS', // 请求成功
  LOAD_FINISH: 'LOAD_COMMISSION_FINISH', //请求结束无更多数据
  LOAD_CLEAR: 'LOAD_COMMISSION_CLEAR' //清空数据
};
let todoCounter = 0
function createNewTodo() {
  return {
    id: todoCounter++,
  }
}
// ============================================================
// action creater
// ============================================================
  export const actions = {
  load: () => ({
    type: types.LOAD
  }),
  loadFailed: msg => ({
    type: types.LOAD_FAILED,
    msg
  }),
  loadMineSuccess: data => ({
    type: types.LOAD_SUCCESS,
    data
  }),
  loadFinish: msg => ({
    type: types.LOAD_FINISH,
    msg
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  loadCommissionAsync() {
    return async (dispatch, getState) => {
      let publicParameters = await getPublicParameters();
      let { pagesize, pagenum, loadFinish, loading } = getState().mine.commission;
      publicParameters = {
        ...publicParameters,
        pagesize,
        pagenum
      };
      if (loadFinish || loading) return;
      dispatch(this.load());
      try {
        let res = await request(URL.getusercommissionlist, publicParameters, 'get');
        if (res.data.stat === 0) {
          if (res.data.data.length) {
            let length = 0
            res.data.data.forEach((item)=>{
              length += item.list.length
              item.id = createNewTodo().id
            })
            dispatch(this.loadMineSuccess(res.data.data));
            //console.log(length);
            if (length < pagesize) {
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
    case types.LOAD: {
      return {
        ...state,
        loading: true
      };
    }
    case types.LOAD_FAILED:
      return {
        ...state,
        loadFailed: true,
        failedMsg: action.msg,
        loading: false
      };
    case types.LOAD_SUCCESS:
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

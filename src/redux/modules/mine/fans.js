import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_MINE: 'LOAD_FANS', // 请求中
  LOAD_MINE_FAILED: 'LOAD_FANS_FAILED', // 请求失败
  LOAD_FINISH: 'LOAD_FANS_FINISH', // 数据请求结束
  LOAD_FANS_SUCCESS: 'LOAD_FANS_SUCCESS',
  LOAD_FANSNUM_SUCCESS: 'LOAD_FANSNUM_SUCCESS',
  LOAD_FANS_INFO_SUCCESS: 'LOAD_FANS_INFO_SUCCESS',
  LOAD_CLEAR: 'LOAD_FANS_CLEAR' //清空数据
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
  loadFinish: (data, index) => ({
    type: types.LOAD_FINISH,
    data,
    index
  }),
  loadFansSuccess: (data, index) => ({
    type: types.LOAD_FANS_SUCCESS,
    data,
    index
  }),
  loadFansNumSuccess: data => ({
    type: types.LOAD_FANSNUM_SUCCESS,
    data
  }),
  loadFansInfoSuccess: (data, current, index) => ({
    type: types.LOAD_FANS_INFO_SUCCESS,
    data,
    index,
    current
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  loadFansNumAsync() {
    return async dispatch => {
      let publicParameters = await getPublicParameters();
      dispatch(this.load());
      try {
        let res = await request(URL.getuserinviteecnttotal, publicParameters, 'get');
        if (res.data.stat === 0) {
          dispatch(this.loadFansNumSuccess(res.data.inviteecnttotal));
        } else {
          dispatch(this.loadFailed('请求失败'));
        }
      } catch (err) {
        dispatch(this.loadFailed('网络错误'));
      }
    };
  },
  loadFansListAsync(index) {
    return async (dispatch, getState) => {
      let publicParameters = await getPublicParameters();
      let { data, loading } = getState().mine.fans;
      let type = index + 1;
      publicParameters.pagesize = data.pagesize;
      publicParameters.page = data.inviteelist[index].page;
      publicParameters.type = type;
      if (data.inviteelist[index].loadFinish || loading) return;
      dispatch(this.load());
      try {
        let res = await request(URL.getuserinviteelist, publicParameters, 'get');
        if (res.data.stat === 0) {
          if (res.data.data.length) {
            dispatch(this.loadFansSuccess(res.data.data, index));
            if (res.data.data.length < data.pagesize) {
              dispatch(this.loadFinish('没有更多了哦~', index));
            }
          } else {
            dispatch(this.loadFinish('没有更多了哦~', index));
          }
        } else {
          dispatch(this.loadFailed('请求失败'));
        }
      } catch (err) {
        dispatch(this.loadFailed('网络错误'));
      }
    };
  },
  loadFansInfoAsync(current, index, otheraccid = '') {
    return async dispatch => {
      let publicParameters = await getPublicParameters();
      publicParameters.otheraccid = otheraccid;
      dispatch(this.load());
      try {
        let res = await request(URL.getothuserinfo, publicParameters, 'get');
        if (res.data.stat === 0) {
          let { failordernum, incomeEstimateLastmon, incomeEstimateWithdrawTotal, ordernum } = res.data;
          let data = {
            failordernum,
            incomeEstimateLastmon, //上月预估收益
            incomeEstimateWithdrawTotal, //累计预估收益
            ordernum
          };
          dispatch(this.loadFansInfoSuccess(data, current, index));
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
  failedMsg: '',
  data: {
    inviteecnttotal: '', //我的粉丝数
    inviteelist: {
      0: {
        //直属粉丝
        loadFinish: false,
        page: 1,
        data: []
      },
      1: {
        //间接粉丝
        loadFinish: false,
        page: 1,
        data: []
      }
    },
    pagesize: '10'
  }
};
const INITIAL_STATE_OLD = JSON.parse(JSON.stringify(INITIAL_STATE));
function mineBaseInfo(state = INITIAL_STATE, action) {
  //console.log('action>>', action);
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
    case types.LOAD_FANS_SUCCESS: {
      let inviteelistIndex = action.index;
      let result = {
        ...state,
        loading: false,
        requestSuc: true,
        data: {
          ...state.data,
          inviteelist: {
            ...state.data.inviteelist,
            [inviteelistIndex]: {
              loadFinish: false,
              page: state.data.inviteelist[inviteelistIndex].page + 1,
              data: state.data.inviteelist[inviteelistIndex].data.concat(action.data)
            }
          }
        }
      };
      //console.log('result', result);
      return result;
    }
    case types.LOAD_FINISH: {
      let inviteelistIndex = action.index;
      return {
        ...state,
        loading: false,
        requestSuc: true,
        data: {
          ...state.data,
          inviteelist: {
            ...state.data.inviteelist,
            [inviteelistIndex]: {
              ...state.data.inviteelist[inviteelistIndex],
              loadFinish: true
            }
          }
        }
      };
    }
    case types.LOAD_FANS_INFO_SUCCESS: {
      let index = action.index;
      let current = action.current;
      let result = {
        ...state,
        loading: false
      };
      Object.assign(result.data.inviteelist[current].data[index], action.data);
      return result;
    }
    case types.LOAD_FANSNUM_SUCCESS:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          inviteecnttotal: action.data
        }
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

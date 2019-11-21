import { requestWithParametersToken } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/ZY/ORDERLIST/LEAR',
  LOAD: 'MODULES/ZY/ORDERLIST/LOAD',
  SUCC: 'MODULES/ZY/ORDERLIST/LOAD_SUCCESS',
  FINISH: 'MODULES/ZY/ORDERLIST/LOAD_FINISH',
  FAILED: 'MODULES/ZY/ORDERLIST/FAILED' // 请求失败
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clear: () => ({
    type: types.LEAR
  }),
  load: () => ({
    type: types.LOAD,
    loading: true
  }),
  SUCC: (data, index) => ({
    type: types.SUCC,
    data,
    index
  }),
  loadFinish: (data, index) => ({
    type: types.FINISH,
    data,
    index
  }),
  loadFailed: msg => ({
    type: types.FAILED,
    msg
  }),
  loadOrderListAsync(index) {
    return async (dispatch, getState) => {
      let { data, loading, pagesize } = getState().zy.orderList;
      if (data[index].loadFinish || loading) return;
      dispatch(this.load());
      let tkStatus = [
        //订单状态
        '', //全部
        '1', //待付款
        '2', //待发货
        '9', //待收货
        '14' //已完成
      ];
      try {
        const res = await requestWithParametersToken(URL.zy.getownorderlist, {
          pagesize,
          pagenum: data[index].pagenum,
          tkStatus: tkStatus[index]
        });
        if (res.data.stat === 0) {
          if (res.data.data.length) {
            res.data.data.forEach(element => {
              element.failuretime = res.data.failuretime
              element.servertime = res.data.servertime
              element.currentTabIndex = index
            });
            dispatch(this.SUCC(res.data.data, index));
            if (res.data.data.length < pagesize) {
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
  }
};

// ============================================================
// reducer
// ============================================================
const INITIAL_STATE = {
  loading: false,
  loadFailed: false,
  failedMsg: '',
  pagesize: 10,
  data: {
    0: {
      //全部
      requestSuc: false, //请求成功状态,防止暂无数据提示一开始出现
      loadFinish: false,
      pagenum: 1,
      data: []
    },
    1: {
      //已付款
      requestSuc: false,
      loadFinish: false,
      pagenum: 1,
      data: []
    },
    2: {
      //已结算
      requestSuc: false,
      loadFinish: false,
      pagenum: 1,
      data: []
    },
    3: {
      //已失效
      requestSuc: false,
      loadFinish: false,
      pagenum: 1,
      data: []
    },
    4: {
      //已失效
      requestSuc: false,
      loadFinish: false,
      pagenum: 1,
      data: []
    }
  }
};
const INITIAL_STATE_OLD = JSON.parse(JSON.stringify(INITIAL_STATE));
function orderList(state = INITIAL_STATE, action) {
  let index = action.index;
  switch (action.type) {
    case types.LEAR:
      return INITIAL_STATE_OLD;
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.FAILED:
      return {
        ...state,
        loadFailed: true,
        failedMsg: action.msg,
        loading: false
      };
    case types.SUCC:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          [index]: {
            loadFinish: false,
            requestSuc: true,
            pagenum: state.data[index].pagenum + 1,
            data: [...state.data[index].data, ...action.data]
          }
        }
      };
    case types.FINISH:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          [index]: {
            ...state.data[index],
            loadFinish: true,
            requestSuc: true,
            pagenum: state.data[index].pagenum + 1
          }
        }
      };
    default:
      return state;
  }
}

export default orderList;

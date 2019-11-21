import { request, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_MINE: 'LOAD_ORDER', // 请求中
  LOAD_MINE_FAILED: 'LOAD_ORDER_FAILED', // 请求失败
  LOAD_FINISH: 'LOAD_ORDER_FINISH', // 数据请求结束
  LOAD_ORDER_SUCCESS: 'LOAD_ORDER_SUCCESS',
  LOAD_CLEAR: 'LOAD_ORDER_CLEAR' //清空数据
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
    type: types.LOAD_ORDER_SUCCESS,
    data,
    index
  }),
  loadClear: () => ({
    type: types.LOAD_CLEAR
  }),
  loadOrderListAsync(index, orderTypeFilter, orderSourceType = '') {
    return async (dispatch, getState) => {
      let publicParameters = await getPublicParameters();
      let { data, loading } = getState().mine.order;
      let tkStatus = [
        //订单状态
        '', //全部
        '12', //已付款
        '3', //已结算
        '13' //已失效
      ];
      orderTypeFilter = orderTypeFilter.map((item)=>{
        return item + 1
      })
      publicParameters = {
        ...publicParameters,
        pagesize: data.pagesize,
        pagenum: data.orderlist[index].page,
        tkStatus: tkStatus[index],
        orderTypeFilter: orderTypeFilter.join(','),
        orderSourceType: orderSourceType //0 淘宝、2 拼多多
      };
      console.log(orderTypeFilter.join(','));
      if (data.orderlist[index].loadFinish || loading) return;
      dispatch(this.load());
      try {
        let res = await request(URL.getuserorderlist, publicParameters, 'get');
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
  data: {
    orderlist: {
      //订单状态
      0: {
        //全部
        requestSuc: false, //请求成功状态,防止暂无数据提示一开始出现
        loadFinish: false,
        page: 1,
        data: []
      },
      1: {
        //已付款
        requestSuc: false,
        loadFinish: false,
        page: 1,
        data: []
      },
      2: {
        //已结算
        requestSuc: false,
        loadFinish: false,
        page: 1,
        data: []
      },
      3: {
        //已失效
        requestSuc: false,
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
    case types.LOAD_ORDER_SUCCESS: {
      let orderlistIndex = action.index;
      let result = {
        ...state,
        loading: false,
        data: {
          ...state.data,
          orderlist: {
            ...state.data.orderlist,
            [orderlistIndex]: {
              loadFinish: false,
              requestSuc: true,
              page: state.data.orderlist[orderlistIndex].page + 1,
              data: [...state.data.orderlist[orderlistIndex].data, ...action.data]
            }
          }
        }
      };
      //console.log('result', result);
      return result;
    }
    case types.LOAD_FINISH: {
      let orderlistIndex = action.index;
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          orderlist: {
            ...state.data.orderlist,
            [orderlistIndex]: {
              ...state.data.orderlist[orderlistIndex],
              loadFinish: true,
              requestSuc: true
            }
          }
        }
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

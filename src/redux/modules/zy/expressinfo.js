import { requestWithParametersToken } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_EXPRESS_INFO: 'LEAR_EXPRESS_INFO',
  LOAD_EXPRESS_INFO: 'LOAD_EXPRESS_INFO',
  LOAD_EXPRESS_INFO_SUCCESS: 'LOAD_EXPRESS_INFO_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearExpressInfo: () => ({
    type: types.LEAR_EXPRESS_INFO
  }),
  loadExpressInfo: () => ({
    type: types.LOAD_EXPRESS_INFO,
    loading: true
  }),
  loadExpressInfoSuccess: data => ({
    type: types.LOAD_EXPRESS_INFO_SUCCESS,
    data
  }),
  loadExpressInfoAsync(accid='',logisticsId='') {

    return async dispatch => {
      dispatch(this.loadExpressInfo());
      const res = await requestWithParametersToken(URL.zy.getlogisticsinfo,
        {
          accid,
          logisticsId
        }
        );
        dispatch(this.loadExpressInfoSuccess(res.data));      
    };
  }
};

// ============================================================
// reducer
// ============================================================
function expressInfo(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_EXPRESS_INFO:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_EXPRESS_INFO:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_EXPRESS_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default expressInfo;
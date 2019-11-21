import { requestWithParametersToken } from '../../../../utils/api';
import { URL } from '../../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/ZY/ADDRESS/DETAIL/LEAR',
  LOAD: 'MODULES/ZY/ADDRESS/DETAIL/LOAD',
  LOAD_SUCCESS: 'MODULES/ZY/ADDRESS/DETAIL/LOAD_SUCCESS'
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
  loadSuccess: data => ({
    type: types.LOAD_SUCCESS,
    data
  }),
  loadAsync(id) {
    return async dispatch => {
      dispatch(this.load());
      const res = await requestWithParametersToken(URL.zy.getshipaddressdetails, {id});
      dispatch(this.loadSuccess(res.data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function addressDetail(state = { loading: false, data: {} }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: {} };
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default addressDetail;

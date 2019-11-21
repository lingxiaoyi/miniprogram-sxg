import { requestWithParametersToken } from '../../../../utils/api';
import { URL } from '../../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/ZY/ADDRESS/LIST/LEAR',
  LOAD: 'MODULES/ZY/ADDRESS/LIST/LOAD',
  LOAD_SUCCESS: 'MODULES/ZY/ADDRESS/LIST/LOAD_SUCCESS'
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
  loadAsync(data) {
    return async dispatch => {
      dispatch(this.load());
      const res = await requestWithParametersToken(URL.zy.getshipaddresslist, data);
      dispatch(this.loadSuccess(res.data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function addressList(state = { loading: false, data: {} }, action) {
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

export default addressList;

import { requestWithoutLoading, getPublicParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/ZY/CITIES/LEAR',
  LOAD: 'MODULES/ZY/CITIES/LOAD',
  LOAD_SUCCESS: 'MODULES/ZY/CITIES/LOAD_SUCCESS'
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
  loadAsync(code = -1, index = 0) {
    return async dispatch => {
      dispatch(this.load());
      let publicParameters = await getPublicParameters();
      publicParameters = {
        ...publicParameters,
        code
      }
      const res = await requestWithoutLoading(URL.getCitiesData, publicParameters, 'get');
      const {
        pos
      } = res.data;
      const data = {
        citiesData: pos,
        citiesFloor: index
      };
      dispatch(this.loadSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function cities(state = { loading: false, data: { pos: [], index: 0 } }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: { pos: [], index: 0 } };
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

export default cities;

import { requestWithParameters } from '../../../utils/api';
import { URL } from '../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/ZY/DETAILS/LEAR',
  LOAD: 'MODULES/ZY/DETAILS/LOAD',
  SUC: 'MODULES/ZY/DETAILS/LOAD_SUCCESS'
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
    type: types.SUC,
    data
  }),
  loadAsync(id, qid = '', memberlevel = '') {
    return async dispatch => {
      dispatch(this.load());
      let dataOption = {
        id,
        member_level: memberlevel
      }
      if(qid){
        dataOption.appqid = qid
      }
      const res = await requestWithParameters(URL.zy.getgoodsdetailbyid, dataOption);
      let data = res.data.data ===null ? {} : res.data.data
      dispatch(this.loadSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
export default function (state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: { } };
    case types.LOAD:
      return {
        ...state,
        loading: true
      };
    case types.SUC:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

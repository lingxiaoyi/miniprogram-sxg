
// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/ZY/ORDERCONFIRM/LEAR',
  LOAD: 'MODULES/ZY/ORDERCONFIRM/LOAD',
  SUC: 'MODULES/ZY/ORDERCONFIRM/LOAD_SUCCESS'
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
  loadSync(data) {
    return dispatch => {
      dispatch(this.clear());
      dispatch(this.loadSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function pdd(state = { loading: false, data: { goodsGalleryUrls: [], goodsInfo: {} } }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: { goodsGalleryUrls: [], goodsInfo: {} } };
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

export default pdd;

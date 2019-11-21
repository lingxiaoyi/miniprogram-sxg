import { requestWithForm } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { formatTime, priceConversion } from '../../../utils/util';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_DETAILS_GOODS: 'LEAR_DETAILSTB_GOODS',
  LOAD_DETAILS_GOODS: 'LOAD_DETAILSTB_GOODS',
  LOAD_DETAILS_GOODS_SUCCESS: 'LOAD_DETAILSTB_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearDetailsGoods: () => ({
    type: types.LEAR_DETAILS_GOODS
  }),
  loadDetailsGoods: () => ({
    type: types.LOAD_DETAILS_GOODS,
    loading: true
  }),
  loadDetailsGoodsSuccess: data => ({
    type: types.LOAD_DETAILS_GOODS_SUCCESS,
    data
  }),
  loadDetailsGoodsAsync(tkl, accid = '', openid = '') {
    return async dispatch => {
      dispatch(this.loadDetailsGoods());
      const res = await requestWithForm(URL.getdetailbytkl, {
        tkl,
        qid: '',
        uid: openid,
        shareaccid: accid,
        browser: 'xcx'
      });
      dispatch(this.loadDetailsGoodsSuccess(res.data.goods));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function detailsGoods(state = { loading: false, data: { } }, action) {
  switch (action.type) {
    case types.LEAR_DETAILS_GOODS:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_DETAILS_GOODS:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_DETAILS_GOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default detailsGoods;

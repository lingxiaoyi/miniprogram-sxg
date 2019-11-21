import { URL } from '../../constants/index';
import { requestPdd } from '../../utils/api';
// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/FREEGOODS/LEAR',
  LOAD: 'MODULES/FREEGOODS/LOAD',
  LOAD_SUCCESS: 'MODULES/FREEGOODS/LOAD_SUCCESS'
};

// ============================================================
// reducer
// ============================================================
const INITIAL_STATE = {
  loading: false,
  data: []
};

function freegoods(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: [] };
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
export default freegoods;

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
  loadAsync(accid = '', openid = '') {
    return async dispatch => {
      dispatch(this.load());
      const res = await requestPdd(URL.pdd.themeOperationGoodsSearch, {
        theme_id: 5495,
        pid: 54291221,
        accid,
        openid
      });
      let goods_list = res.data.theme_list_get_response.goods_list;
      let data = [];
      goods_list.forEach(element => {
        let {
          goods_name = '',
          goods_thumbnail_url = '',
          goods_id = '',
          coupon_discount = '',
          sold_quantity = '',
          min_normal_price = '',
          min_group_price = ''
        } = element;
        data.push({
          goods_name,
          goods_thumbnail_url,
          goods_id,
          coupon_discount,
          sold_quantity,
          min_normal_price,
          min_group_price
        });
      });
      dispatch(this.loadSuccess(data));
    };
  }
};

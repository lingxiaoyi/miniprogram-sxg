import { requestPdd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CLEAR_THEME_LIST: 'CLEAR_THEME_LIST',
  LOAD_THEME_LIST: 'LOAD_THEME_LIST',
  LOAD_THEME_LIST_SUCCESS: 'LOAD_THEME_LIST_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // 商品列表
  clearThemeList: () => ({
    type: types.CLEAR_THEME_LIST
  }),
  loadThemeList: () => ({
    type: types.LOAD_THEME_LIST,
    loading: true
  }),
  loadThemeListSuccess: (data = []) => ({
    type: types.LOAD_THEME_LIST_SUCCESS,
    data
  }),
  loadThemeListAsync(id, accid = '') {
    return async dispatch => {
      dispatch(this.loadThemeList());
      let data = [];
      const res = await requestPdd(URL.pdd.themeGoodsSearch, {
        theme_id: id,
        accid
      });
      const goodsList = res.data.theme_list_get_response.goods_list;

      goodsList.forEach(gd => {
        const {
          goods_id,
          goods_name,
          goods_thumbnail_url,
          sold_quantity,
          min_group_price,
          coupon_discount,
          promotion_rate
        } = gd;

        data.push({
          id: goods_id, // 商品ID
          name: goods_name, // 商品标题
          thumbnail: goods_thumbnail_url, // 商品缩略图
          soldQuantity: priceConversion(sold_quantity), // 已售数量
          newPrice: minus(min_group_price, coupon_discount) / 100, // 券后价
          oldPrice: min_group_price / 100, // 原价
          coupon: coupon_discount / 100, // 优惠券金额
          commission: Math.floor((promotion_rate / 1000) * (minus(min_group_price, coupon_discount) / 100) * 100) / 100 // 佣金
        });
      });

      dispatch(this.loadThemeListSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================

// 商品列表
/**
 * 单个商品状态
 */
function themeList(state = { loading: false, data: [] }, action) {
  switch (action.type) {
    case types.CLEAR_THEME_LIST:
      return { loading: false, data: [] };
    case types.LOAD_THEME_LIST:
      return { ...state, loading: true };
    case types.LOAD_THEME_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default themeList;

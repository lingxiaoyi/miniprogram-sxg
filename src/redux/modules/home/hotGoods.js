import { requestWithFormMD5, requestPdd, requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CLEAR: 'MODULES/HOME/HOT_GOODS/CLEAR',
  LOAD: 'MODULES/HOME/HOT_GOODS/LOAD',
  LOAD_BY_SCROLL: 'MODULES/HOME/HOT_GOODS/LOAD_BY_SCROLL',
  LOAD_SUCCESS: 'MODULES/HOME/HOT_GOODS/LOAD_SUCCESS',
  LOAD_BY_SCROLL_SUCCESS: 'MODULES/HOME/HOT_GOODS/LOAD_BY_SCROLL_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // 商品列表
  clear: () => ({
    type: types.CLEAR
  }),
  load: () => ({
    type: types.LOAD,
    loading: true
  }),
  loadByScroll: () => ({
    type: types.LOAD_BY_SCROLL,
    loadingByScroll: true
  }),
  loadSuccess: (data = []) => ({
    type: types.LOAD_SUCCESS,
    data
  }),
  loadByScrollSuccess: (data = [], page) => ({
    type: types.LOAD_BY_SCROLL_SUCCESS,
    data,
    page
  }),
  loadAsync(id, accid = '', type) {
    return async dispatch => {
      dispatch(this.load());
      const data = await this.requestHotGoods({ id, accid, type });
      dispatch(this.loadSuccess(data));
    };
  },
  loadByScrollAsync(id, accid = '', type) {
    return async (dispatch, getState) => {
      dispatch(this.loadByScroll());
      const {
        home: {
          hotGoods: { page }
        }
      } = getState();
      if (page < 5) {
        const data = await this.requestHotGoods({ id, accid, page: page + 1, type });
        dispatch(this.loadByScrollSuccess(data, page + 1));
      } else {
        dispatch(this.loadByScrollSuccess([], page));
      }
    };
  },
  async requestHotGoods({ id, accid = '', page = 1, type }) {
    let data = [];
    if (type === 'mix') {
      const res = await requestWithFormMD5(URL.operationList, {
        sub_id: id,
        accid
      });
      const goodsList = res.data;

      goodsList.forEach(gd => {
        const {
          type: tp,
          goods_id,
          goods_name,
          goods_thumbnail_url,
          sales_tip,
          min_group_price,
          coupon_discount,
          promotion_rate
        } = gd;

        data.push({
          id: goods_id, // 商品ID
          type: tp === 0 ? 'pdd' : tp === 1 ? 'jd' : 'zy', // 0:拼多多商品 1:京东商品 2.自营商品
          name: goods_name, // 商品标题
          thumbnail: goods_thumbnail_url, // 商品缩略图
          soldQuantity: sales_tip, // 已售数量
          newPrice: minus(min_group_price, coupon_discount) / 100, // 券后价
          oldPrice: min_group_price / 100, // 原价
          coupon: coupon_discount / 100, // 优惠券金额
          commission: Math.floor((promotion_rate / 1000) * (minus(min_group_price, coupon_discount) / 100) * 100) / 100 // 佣金
        });
      });
    } else if (type === 'pdd') {
      const res = await requestPdd(URL.pdd.goodsRecommendGet, {
        channel_type: id,
        page,
        accid
      });
      const goodsList = res.data.goods_basic_detail_response.list;

      goodsList.forEach(gd => {
        const {
          goods_id,
          goods_name,
          goods_thumbnail_url,
          sales_tip,
          min_group_price,
          coupon_discount,
          promotion_rate
        } = gd;

        data.push({
          id: goods_id, // 商品ID
          name: goods_name, // 商品标题
          thumbnail: goods_thumbnail_url, // 商品缩略图
          soldQuantity: sales_tip, // 已售数量
          newPrice: minus(min_group_price, coupon_discount) / 100, // 券后价
          oldPrice: min_group_price / 100, // 原价
          coupon: coupon_discount / 100, // 优惠券金额
          commission: Math.floor((promotion_rate / 1000) * (minus(min_group_price, coupon_discount) / 100) * 100) / 100 // 佣金
        });
      });
    } else {
      const res = await requestJd(URL.jd.promotionPosition, {
        eliteId: id || 1,
        page,
        accid
      });
      res.data.forEach(gds => {
        let {
          commissionInfo: { commission },
          couponInfo: { couponList },
          priceInfo: { price },
          inOrderCount30DaysSku,
          skuName,
          skuId,
          thumb_img
          // imageInfo: { imageList }
        } = gds;
        const coupon = couponList.length > 0 ? couponList[0].discount : 0;
        data.push({
          id: skuId, // 商品ID
          name: skuName, // 商品标题
          thumbnail: thumb_img, // imageList[0].url, // 商品缩略图
          soldQuantity: priceConversion(inOrderCount30DaysSku), // 已售数量
          newPrice: minus(price, coupon), // 券后价
          oldPrice: price, // 原价
          coupon, // 优惠券金额
          commission: commission // 佣金
        });
      });
    }
    return data;
  }
};

// ============================================================
// reducer
// ============================================================

// 商品列表
function hotGoods(state = { loading: false, page: 1, noMore: false, data: [] }, action) {
  switch (action.type) {
    case types.CLEAR:
      return { loading: false, page: 1, noMore: false, data: [] };
    case types.LOAD:
      return { ...state, loading: true };
    case types.LOAD_BY_SCROLL:
      return { ...state, loadingByScroll: true };
    case types.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        page: 1,
        data: action.data
      };
    case types.LOAD_BY_SCROLL_SUCCESS:
      return {
        ...state,
        loadingByScroll: false,
        page: action.page,
        data: [...state.data, ...action.data],
        noMore: !action.data.length
      };
    default:
      return state;
  }
}

export default hotGoods;

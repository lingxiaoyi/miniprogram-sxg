import { requestPdd, requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CHANGE_MFOPT: 'CHANGE_MFOPT',
  LOAD_MFGOODS: 'LOAD_MFGOODS',
  LOAD_MFGOODS_BY_SCROLL: 'LOAD_MFGOODS_BY_SCROLL',
  LOAD_MFGOODS_SUCCESS: 'LOAD_MFGOODS_SUCCESS',
  LOAD_MFGOODS_BY_SCROLL_SUCCESS: 'LOAD_MFGOODS_BY_SCROLL_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // tab切换
  changeOpt: opt => ({
    type: types.CHANGE_MFOPT,
    opt
  }),
  // 商品列表
  loadMailingFreeGoods: () => ({
    type: types.LOAD_MFGOODS,
    loading: true
  }),
  loadMailingFreeGoodsByScroll: () => ({
    type: types.LOAD_MFGOODS_BY_SCROLL,
    loadingByScroll: true
  }),
  loadMailingFreeGoodsSuccess: (data = []) => ({
    type: types.LOAD_MFGOODS_SUCCESS,
    receiveAt: Date.now(),
    data
  }),
  loadMailingFreeGoodsByScrollSuccess: (data = [], page) => ({
    type: types.LOAD_MFGOODS_BY_SCROLL_SUCCESS,
    receiveAt: Date.now(),
    data,
    page
  }),
  async requestGoods(accid = '', selectedOpt = 'pdd', page = 1) {
    let data = [];
    const isPdd = selectedOpt === 'pdd';
    if (isPdd) {
      const res = await requestPdd(URL.pdd.goodsRecommendGet, {
        channel_type: 0,
        page,
        accid
      });
      const goodsList = res.data.goods_basic_detail_response.list;

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
    } else {
      const res = await requestJd(URL.jd.promotionPosition, {
        eliteId: 10,
        page,
        accid
      });
      res.data.forEach(gd => {
        let {
          commissionInfo: { commission },
          couponInfo: { couponList },
          priceInfo: { price },
          inOrderCount30DaysSku,
          skuName,
          skuId,
          thumb_img
        } = gd;
        const coupon = couponList.length > 0 ? couponList[0].discount : 0;
        data.push({
          id: skuId, // 商品ID
          name: skuName, // 商品标题
          thumbnail: thumb_img, // 商品缩略图
          soldQuantity: priceConversion(inOrderCount30DaysSku), // 已售数量
          newPrice: minus(price, coupon), // 券后价
          oldPrice: price, // 原价
          coupon, // 优惠券金额
          commission: commission // 佣金
        });
      });
    }
    return data;
  },
  // 加载商品数据
  loadMailingFreeGoodsAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          mailingFree: { selectedOpt } // eslint-disable-line
        }
      } = getState();
      dispatch(this.loadMailingFreeGoods());
      const data = await this.requestGoods(accid, selectedOpt);
      dispatch(this.loadMailingFreeGoodsSuccess(data));
    };
  },
  // 滚动加载商品数据（翻页）
  loadMailingFreeGoodsByScrollAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          mailingFree: { goodsByOpt, selectedOpt } // eslint-disable-line
        }
      } = getState();
      const { page } = goodsByOpt[selectedOpt];
      dispatch(this.loadMailingFreeGoodsByScroll());
      // 只允许请求5页
      if (page < 5) {
        const data = await this.requestGoods(accid, selectedOpt, page + 1);
        dispatch(this.loadMailingFreeGoodsByScrollSuccess(data, page + 1));
      } else {
        dispatch(this.loadMailingFreeGoodsByScrollSuccess([], page));
      }
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
function singleGoods(state = { loading: false, data: [] }, action) {
  switch (action.type) {
    case types.LOAD_MFGOODS:
      return { ...state, loading: true };
    case types.LOAD_MFGOODS_BY_SCROLL:
      return { ...state, loadingByScroll: true };
    case types.LOAD_MFGOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        receiveAt: action.receiveAt,
        page: 1,
        data: action.data
      };
    case types.LOAD_MFGOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        loadingByScroll: false,
        receiveAt: action.receiveAt,
        page: action.page,
        data: [...state.data, ...action.data],
        noMore: !action.data.length
      };
    default:
      return state;
  }
}
/**
 * 按optid分类的商品状态
 */
function goodsByOpt(state = {}, action, selectedOpt) {
  switch (action.type) {
    case types.LOAD_MFGOODS:
    case types.LOAD_MFGOODS_BY_SCROLL:
    case types.LOAD_MFGOODS_SUCCESS:
    case types.LOAD_MFGOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        [selectedOpt]: singleGoods(state[selectedOpt], action)
      };
    default:
      return state;
  }
}
/**
 * 商品状态
 */
function mailingFree(
  state = {
    selectedOpt: 'pdd',
    goodsByOpt: {}
  },
  action
) {
  // console.log()
  switch (action.type) {
    case types.CHANGE_MFOPT:
      return {
        ...state,
        selectedOpt: action.opt
      };
    case types.LOAD_MFGOODS:
    case types.LOAD_MFGOODS_BY_SCROLL:
    case types.LOAD_MFGOODS_SUCCESS:
    case types.LOAD_MFGOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        goodsByOpt: goodsByOpt(state.goodsByOpt, action, state.selectedOpt)
      };
    default:
      return state;
  }
}

export default mailingFree;

import { requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CHANGE: 'MODULES/HOME/BRAND_GOODS/CHANGE',
  LOAD: 'MODULES/HOME/BRAND_GOODS/LOAD',
  LOAD_BY_SCROLL: 'MODULES/HOME/BRAND_GOODS/LOAD_BY_SCROLL',
  LOAD_SUCCESS: 'MODULES/HOME/BRAND_GOODS/LOAD_SUCCESS',
  LOAD_BY_SCROLL_SUCCESS: 'MODULES/HOME/BRAND_GOODS/LOAD_BY_SCROLL_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // tab切换
  changeOpt: opt => ({
    type: types.CHANGE,
    opt
  }),
  // 商品列表
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
    receiveAt: Date.now(),
    data
  }),
  loadByScrollSuccess: (data = [], page) => ({
    type: types.LOAD_BY_SCROLL_SUCCESS,
    receiveAt: Date.now(),
    data,
    page
  }),
  async requestGoods(accid = '', selectedOpt, page = 1) {
    let data = [];
    const res = await requestJd(URL.jd.promotionPosition, {
      eliteId: selectedOpt,
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
    return data;
  },
  // 加载商品数据
  loadAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          brandGoods: { selectedOpt } // eslint-disable-line
        }
      } = getState();
      dispatch(this.load());
      const data = await this.requestGoods(accid, selectedOpt);
      dispatch(this.loadSuccess(data));
    };
  },
  // 滚动加载商品数据（翻页）
  loadByScrollAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          brandGoods: { goodsByOpt, selectedOpt } // eslint-disable-line
        }
      } = getState();
      const { page } = goodsByOpt[selectedOpt];
      dispatch(this.loadByScroll());
      // 只允许请求5页
      if (page < 5) {
        const data = await this.requestGoods(accid, selectedOpt, page + 1);
        dispatch(this.loadByScrollSuccess(data, page + 1));
      } else {
        dispatch(this.loadByScrollSuccess([], page));
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
    case types.LOAD:
      return { ...state, loading: true };
    case types.LOAD_BY_SCROLL:
      return { ...state, loadingByScroll: true };
    case types.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        receiveAt: action.receiveAt,
        page: 1,
        data: action.data
      };
    case types.LOAD_BY_SCROLL_SUCCESS:
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
    case types.LOAD:
    case types.LOAD_BY_SCROLL:
    case types.LOAD_SUCCESS:
    case types.LOAD_BY_SCROLL_SUCCESS:
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
function brandGoods(
  state = {
    selectedOpt: 11,
    goodsByOpt: {}
  },
  action
) {
  // console.log()
  switch (action.type) {
    case types.CHANGE:
      return {
        ...state,
        selectedOpt: action.opt
      };
    case types.LOAD:
    case types.LOAD_BY_SCROLL:
    case types.LOAD_SUCCESS:
    case types.LOAD_BY_SCROLL_SUCCESS:
      return {
        ...state,
        goodsByOpt: goodsByOpt(state.goodsByOpt, action, state.selectedOpt)
      };
    default:
      return state;
  }
}

export default brandGoods;

import { requestPdd, requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CHANGE_OPT: 'CHANGE_OPT',
  LOAD_GOODS: 'LOAD_GOODS',
  LOAD_GOODS_BY_SCROLL: 'LOAD_GOODS_BY_SCROLL',
  LOAD_GOODS_SUCCESS: 'LOAD_GOODS_SUCCESS',
  LOAD_GOODS_BY_SCROLL_SUCCESS: 'LOAD_GOODS_BY_SCROLL_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // tab切换
  changeOpt: opt => ({
    type: types.CHANGE_OPT,
    opt
  }),
  // 商品列表
  loadGoods: () => ({
    type: types.LOAD_GOODS,
    loading: true
  }),
  loadGoodsByScroll: () => ({
    type: types.LOAD_GOODS_BY_SCROLL,
    loadingByScroll: true
  }),
  loadGoodsSuccess: (data = []) => ({
    type: types.LOAD_GOODS_SUCCESS,
    receiveAt: Date.now(),
    data
  }),
  loadGoodsByScrollSuccess: (data = [], page) => ({
    type: types.LOAD_GOODS_BY_SCROLL_SUCCESS,
    receiveAt: Date.now(),
    data,
    page
  }),
  async requestGoods(accid = '', selectedOpt = 'pdd', page = 1) {
    let data = [];
    const isPdd = selectedOpt === 'pdd';
    if (isPdd) {
      const res = await requestPdd(URL.pdd.categaryGet, {
        accid,
        opt_id: 0,
        sort_type: 0,
        page
      });

      const goodsList = res.data.goods_search_response.goods_list;

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
      const res = await requestJd(URL.jd.search, {
        accid,
        keyword: '',
        cid: 0,
        page
      });
      res.data.forEach(gd => {
        let {
          commissionInfo: { commission },
          couponInfo: { couponList },
          priceInfo: { price },
          inOrderCount30Days,
          skuName,
          skuId,
          thumb_img
        } = gd;
        const coupon = couponList.length > 0 ? couponList[0].discount : 0;
        data.push({
          id: skuId, // 商品ID
          name: skuName, // 商品标题
          thumbnail: thumb_img, // 商品缩略图
          soldQuantity: priceConversion(inOrderCount30Days), // 已售数量
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
  loadGoodsAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          goods: { selectedOpt } // eslint-disable-line
        }
      } = getState();
      dispatch(this.loadGoods());
      const data = await this.requestGoods(accid, selectedOpt);
      dispatch(this.loadGoodsSuccess(data));
    };
  },
  // 滚动加载商品数据（翻页）
  loadGoodsByScrollAsync(accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          goods: { goodsByOpt, selectedOpt } // eslint-disable-line
        }
      } = getState();
      const { page } = goodsByOpt[selectedOpt];
      dispatch(this.loadGoodsByScroll());
      // 只允许请求10页
      if (page < 5) {
        const data = await this.requestGoods(accid, selectedOpt, page + 1);
        dispatch(this.loadGoodsByScrollSuccess(data, page + 1));
      } else {
        dispatch(this.loadGoodsByScrollSuccess([], page));
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
    case types.LOAD_GOODS:
      return { ...state, loading: true };
    case types.LOAD_GOODS_BY_SCROLL:
      return { ...state, loadingByScroll: true };
    case types.LOAD_GOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        receiveAt: action.receiveAt,
        page: 1,
        data: action.data
      };
    case types.LOAD_GOODS_BY_SCROLL_SUCCESS:
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
    case types.LOAD_GOODS:
    case types.LOAD_GOODS_BY_SCROLL:
    case types.LOAD_GOODS_SUCCESS:
    case types.LOAD_GOODS_BY_SCROLL_SUCCESS:
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
function goods(
  state = {
    selectedOpt: 'pdd',
    goodsByOpt: {}
  },
  action
) {
  // console.log()
  switch (action.type) {
    case types.CHANGE_OPT:
      return {
        ...state,
        selectedOpt: action.opt
      };
    case types.LOAD_GOODS:
    case types.LOAD_GOODS_BY_SCROLL:
    case types.LOAD_GOODS_SUCCESS:
    case types.LOAD_GOODS_BY_SCROLL_SUCCESS:
      return {
        ...state,
        goodsByOpt: goodsByOpt(state.goodsByOpt, action, state.selectedOpt)
      };
    default:
      return state;
  }
}

export default goods;

import { requestPdd, requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // 商品列表（根据tab分类）
  CHANGE: 'MODULES/HOME/SEARCH/CHANGE',
  CHANGE_SORTTYPE: 'MODULES/HOME/SEARCH/CHANGE_SORTTYPE',
  RESET_SORTTYPE: 'MODULES/HOME/SEARCH/RESET_SORTTYPE',
  LOAD: 'MODULES/HOME/SEARCH/LOAD',
  CLEAR: 'MODULES/HOME/SEARCH/CLEAR',
  LOAD_BY_SCROLL: 'MODULES/HOME/SEARCH/LOAD_BY_SCROLL',
  LOAD_SUCCESS: 'MODULES/HOME/SEARCH/LOAD_SUCCESS',
  LOAD_BY_SCROLL_SUCCESS: 'MODULES/HOME/SEARCH/LOAD_BY_SCROLL_SUCCESS'
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
  changeSortType: sortType => ({
    type: types.CHANGE_SORTTYPE,
    sortType
  }),
  resetSortType: () => ({
    type: types.RESET_SORTTYPE
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
  clear: () => ({
    type: types.CLEAR
  }),
  // 加载商品数据
  loadAsync(kw, accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          search: { selectedOpt, sortType } // eslint-disable-line
        }
      } = getState();
      dispatch(this.load());
      const data = await requestGoods({ kw, accid, selectedOpt, sortType });
      dispatch(this.loadSuccess(data));
    };
  },
  // 滚动加载商品数据（翻页）
  loadByScrollAsync(kw, accid = '') {
    return async (dispatch, getState) => {
      const {
        home: {
          search: { goodsByOpt, selectedOpt, sortType } // eslint-disable-line
        }
      } = getState();
      const { page } = goodsByOpt[selectedOpt];
      dispatch(this.loadByScroll());
      const data = await requestGoods({ kw, accid, selectedOpt, sortType, page: page + 1 });
      dispatch(this.loadByScrollSuccess(data, page + 1));
      // 只允许请求10页
      // if (page < 10) {
      //   const data = await requestGoods({ kw, accid, selectedOpt, sortType, page: page + 1 });
      //   dispatch(this.loadByScrollSuccess(data, page + 1));
      // } else {
      //   dispatch(this.loadByScrollSuccess([], page));
      // }
    };
  }
};

function transformSortTypeForJd(sortType) {
  switch (sortType) {
    case 0:
      return {
        sortName: 'goodComments', // 综合-降序
        sort: 'desc'
      };
    case 1:
      return {
        sortName: 'commissionShare', // 佣金比例-升序
        sort: 'asc'
      };
    case 2:
      return {
        sortName: 'commissionShare', // 佣金比例-降序
        sort: 'desc'
      };
    case 3:
      return {
        sortName: 'price', // 价格-升序
        sort: 'asc'
      };
    case 4:
      return {
        sortName: 'price', // 价格-降序
        sort: 'desc'
      };
    case 5:
      return {
        sortName: 'inOrderCount30DaysSku', // 销量-升序
        sort: 'asc'
      };
    case 6:
      return {
        sortName: 'inOrderCount30DaysSku', // 销量-降序
        sort: 'desc'
      };
    default:
      return {
        sortName: 'goodComments', // 综合（好评率）-降序
        sort: 'desc'
      };
  }
}
async function requestGoods({ kw, accid = '', selectedOpt, page = 1, sortType = 0 }) {
  let data = [];
  const isPdd = selectedOpt === 'pdd';
  try {
    if (isPdd) {
      const res = await requestPdd(URL.pdd.search, {
        keyword: encodeURIComponent(kw),
        accid,
        // 0-综合排序;1-按佣金比率升序;2-按佣金比例降序;3-按价格升序;4-按价格降序;5-按销量升序;6-按销量降序;
        sort_type: sortType,
        page
      });
      const goodsList = res.data.goods_search_response.goods_list;
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
      const { sortName, sort } = transformSortTypeForJd(sortType);
      const res = await requestJd(URL.jd.search, {
        keyword: encodeURIComponent(kw),
        sortName,
        sort,
        page,
        accid
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
  } catch (e) {
    console.error('error: ', e);
    return data;
  }
}

// ============================================================
// reducer
// ============================================================

// 商品列表
/**
 * 单个商品状态
 */
function singleGoods(state = { loading: false, page: 1, noMore: false, data: [] }, action) {
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
function search(
  state = {
    selectedOpt: 'pdd',
    sortType: 0,
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
    case types.CHANGE_SORTTYPE:
      return {
        ...state,
        sortType: action.sortType
      };
    case types.RESET_SORTTYPE:
      return {
        ...state,
        sortType: 0
      };
    case types.CLEAR:
      return {
        selectedOpt: 'pdd',
        sortType: 0,
        goodsByOpt: {}
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

export default search;

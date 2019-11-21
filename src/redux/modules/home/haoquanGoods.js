import { requestJd } from '../../../utils/api';
import { priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';
// import { getGlobalData } from '../../../utils/wx';

// ============================================================
// action types
// ============================================================
export const types = {
  LOAD_HAOQUAN_GOODS: 'LOAD_HAOQUAN_GOODS',
  LOAD_HAOQUAN_GOODS_SUCCESS: 'LOAD_HAOQUAN_GOODS_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  loadHaoquanGoods: () => ({
    type: types.LOAD_HAOQUAN_GOODS
  }),
  loadHaoquanGoodsSuccess: data => ({
    type: types.LOAD_HAOQUAN_GOODS_SUCCESS,
    data
  }),
  loadHaoquanGoodsAsync({ accid = '' }) {
    return async dispatch => {
      dispatch(this.loadHaoquanGoods());
      const res = await requestJd(URL.jd.promotionPosition, {
        eliteId: 1,
        pageSize: 2,
        accid
      });
      // console.log('===================');
      // console.log(res);
      // console.log('===================');
      const data = [];
      for (let i = 0; i < 2; i++) {
        let {
          commissionInfo: { commission },
          couponInfo: { couponList },
          priceInfo: { price },
          inOrderCount30DaysSku,
          skuName,
          skuId,
          thumb_img
        } = res.data[i];
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
      }
      dispatch(this.loadHaoquanGoodsSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function haoquanGoods(state = { loading: false, data: [] }, action) {
  switch (action.type) {
    case types.LOAD_HAOQUAN_GOODS:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_HAOQUAN_GOODS_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default haoquanGoods;

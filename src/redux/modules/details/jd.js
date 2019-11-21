import { requestJd } from '../../../utils/api';
import { formatTime, priceConversion, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/DETAILS/JD/LEAR',
  LOAD: 'MODULES/DETAILS/JD/LOAD',
  LOAD_SUCCESS: 'MODULES/DETAILS/JD/LOAD_SUCCESS'
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
    type: types.LOAD_SUCCESS,
    data
  }),
  loadAsync(id, accid = '') {
    return async dispatch => {
      dispatch(this.load());
      let data = [];
      const res = await requestJd(URL.jd.singleGoodsInfo, {
        skuIds: id,
        accid
      });
      let {
        commissionInfo: { commission },
        couponInfo: { couponList },
        priceInfo: { price },
        imageInfo: { imageList },
        inOrderCount30Days,
        skuName,
        materialUrl,
        thumb_img
      } = res.data[0];
      let coupon = 0;
      let startTime = 0;
      let endTime = 0;
      let couponUrl = '';
      if (couponList.length > 0) {
        coupon = couponList[0].discount;
        startTime = couponList[0].useStartTime;
        endTime = couponList[0].useEndTime;
        couponUrl = couponList[0].link;
      }
      // const coupon = couponList.length > 0 ? couponList[0].discount : 0;
      data = {
        goodsGalleryUrls: imageList.map(img => img.url),
        goodsInfo: {
          name: skuName, // 商品名称标题
          materialUrl, // 物料url
          couponUrl, // 优惠券链接
          thumbnail: thumb_img, // 缩略图
          image: imageList[0] ? imageList[0].url : '', // 主图
          startTime: startTime ? formatTime(startTime) : '', // 期限开始时间
          endTime: endTime ? formatTime(endTime) : '', // 期限结束时间
          desc: skuName, // 商品描述
          soldQuantity: priceConversion(inOrderCount30Days), // 已售数量
          newPrice: minus(price, coupon), // 券后价
          oldPrice: price, // 原价
          coupon, // 优惠券金额
          commission: commission // 佣金
        }
      };
      dispatch(this.loadSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function jd(state = { loading: false, data: { goodsGalleryUrls: [], goodsInfo: {} } }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: { goodsGalleryUrls: [], goodsInfo: {} } };
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

export default jd;

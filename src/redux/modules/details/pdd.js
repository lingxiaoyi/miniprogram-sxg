import { requestPdd } from '../../../utils/api';
import { formatTime, minus } from '../../../utils/util';
import { URL } from '../../../constants/index';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/DETAILS/PDD/LEAR',
  LOAD: 'MODULES/DETAILS/PDD/LOAD',
  LOAD_SUCCESS: 'MODULES/DETAILS/PDD/LOAD_SUCCESS'
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
  loadAsync(goods_id, accid = '') {
    return async dispatch => {
      dispatch(this.load());
      const res = await requestPdd(URL.pdd.goodsDetail, {
        goods_id,
        accid,
        pid: 54291221
      });
      const {
        goods_gallery_urls,
        goods_name,
        goods_thumbnail_url,
        goods_image_url,
        coupon_start_time,
        coupon_end_time,
        sales_tip,
        min_group_price,
        coupon_discount,
        promotion_rate,
        goods_desc
      } = res.data.goods_detail_response.goods_details[0];
      const data = {
        goodsGalleryUrls: goods_gallery_urls,
        goodsInfo: {
          name: goods_name, // 商品名称标题
          thumbnail: goods_thumbnail_url, // 缩略图
          image: goods_image_url, // 主图
          startTime: formatTime(coupon_start_time), // 期限开始时间
          endTime: formatTime(coupon_end_time), // 期限结束时间
          desc: goods_desc, // 商品描述
          soldQuantity: sales_tip, // 已售数量
          newPrice: minus(min_group_price, coupon_discount) / 100, // 券后价
          oldPrice: min_group_price / 100, // 原价
          coupon: coupon_discount / 100, // 优惠券金额
          commission: Math.floor((promotion_rate / 1000) * (minus(min_group_price, coupon_discount) / 100) * 100) / 100 // 佣金
        }
      };
      dispatch(this.loadSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
function pdd(state = { loading: false, data: { goodsGalleryUrls: [], goodsInfo: {} } }, action) {
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

export default pdd;

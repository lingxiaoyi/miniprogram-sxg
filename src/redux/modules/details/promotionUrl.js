import { requestPdd, requestJd } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  LEAR: 'MODULES/DETAILS/PROMOTION_URL/LEAR',
  LOAD: 'MODULES/DETAILS/PROMOTION_URL/LOAD',
  LOAD_SUCCESS: 'MODULES/DETAILS/PROMOTION_URL/LOAD_SUCCESS'
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
  loadPddAsync(id, custom_parameters) {
    const isShare = custom_parameters.indexOf('share') !== -1;
    return async dispatch => {
      dispatch(this.load());
      // console.log('=====================');
      // console.log(custom_parameters);
      // console.log('=====================');
      const res = await requestPdd(URL.pdd.urlGenerate, {
        goods_id: id,
        custom_parameters: custom_parameters || 0
      });
      const data = res.data.goods_promotion_url_generate_response.goods_promotion_url_list[0];
      const {
        we_app_info: { app_id, page_path },
        we_app_web_view_short_url
      } = data;
      dispatch(
        this.loadSuccess({
          appId: app_id,
          pagePath: page_path,
          // shortUrl: we_app_web_view_short_url,
          sharePagePath: isShare ? page_path : '',
          shareShortUrl: isShare ? we_app_web_view_short_url : ''
        })
      );
    };
  },
  loadJdAsync(id, custom_parameters, materialUrl, couponUrl) {
    const isShare = custom_parameters.indexOf('share') !== -1;
    return async dispatch => {
      dispatch(this.load());
      const res = await requestJd(URL.jd.promotionLlink, {
        skuId: id, // 商品ID（必须）
        materialUrl, // 物料链接（必须）
        couponUrl, // 优惠券链接
        subUnionId: custom_parameters || 0 // 自定义推广参数
      });
      const { pagePath, shortURL, appid } = res.data.data;
      dispatch(
        this.loadSuccess({
          appId: appid,
          pagePath: pagePath,
          // shortUrl: shortURL,
          sharePagePath: isShare ? pagePath : '',
          shareShortUrl: isShare ? shortURL : ''
        })
      );
    };
  }
};

// ============================================================
// reducer
// ============================================================
function promotionUrl(state = { loading: false, data: {} }, action) {
  switch (action.type) {
    case types.LEAR:
      return { loading: false, data: {} };
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

export default promotionUrl;

import { requestWithFormMD5 } from '../../../utils/api';
import { URL } from '../../../constants/index';
// ============================================================
// action types
// ============================================================
export const types = {
  // banner
  LOAD_BANNER: 'LOAD_BANNER',
  LOAD_BANNER_SUCCESS: 'LOAD_BANNER_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  // banner
  loadBanner: () => ({
    type: types.LOAD_BANNER,
    loading: true
  }),
  loadBannerSuccess: (data = []) => ({
    type: types.LOAD_BANNER_SUCCESS,
    data
  }),
  loadBannerAsync(accid, openid = '') {
    return async dispatch => {
      dispatch(this.loadBanner());
      const res = await requestWithFormMD5(URL.banner, {
        accid,
        openid
      });
      /*
        "open_type": 1, //打开方式：1.专题列表 2,商品详情,3.指定页面(如活动页)
        "category": 2, 位置 1:首页中部,2:弹窗
        "open_url": "", //打开方式为小程序时 小程序地址
        "subject_id": "1", //打开方式为专题列表时 专题id
        "product_id": "",  //打开方式为商品详情时 专题id
        "platform": 0, 平台1:拼多多 2:京东 3:自营
        "frequency": 26000,频次 单位秒
      */
      const data = res.data
        .filter(v => {
          return v.category === 1; // 暂时只做banner，弹窗后面再做。
        })
        .reduce((acc, d) => {
          const { id, title, banner_img, open_type, open_url, subject_id, product_id, platform, frequency } = d;
          acc.push({
            id,
            title,
            bannerImg: banner_img,
            openType: open_type,
            openUrl: open_url,
            subjectId: subject_id,
            productId: product_id,
            platform,
            frequency
          });
          return acc;
        }, [])
        .filter((v, i) => {
          return i < 5; // 不超过5条
        });
      dispatch(this.loadBannerSuccess(data));
    };
  }
};

// ============================================================
// reducer
// ============================================================
// banner
function banners(
  state = {
    loading: false,
    data: []
  },
  action
) {
  switch (action.type) {
    case types.LOAD_BANNER:
      return { ...state, loading: true };
    case types.LOAD_BANNER_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default banners;

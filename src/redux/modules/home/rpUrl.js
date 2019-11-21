import { requestPdd } from '../../../utils/api';
import { URL } from '../../../constants/index';
// import { getGlobalData } from '../../../utils/wx';

// ============================================================
// action types
// ============================================================
export const types = {
  LEAR_RP_URL: 'LEAR_RP_URL',
  LOAD_RP_URL: 'LOAD_RP_URL',
  LOAD_RP_URL_SUCCESS: 'LOAD_RP_URL_SUCCESS'
};

// ============================================================
// action creater
// ============================================================
export const actions = {
  clearRpUrl: () => ({
    type: types.LEAR_RP_URL
  }),
  loadRpUrl: () => ({
    type: types.LOAD_RP_URL,
    loading: true
  }),
  loadRpUrlSuccess: data => ({
    type: types.LOAD_RP_URL_SUCCESS,
    data
  }),
  loadRpUrlAsync(custom_parameters) {
    return async dispatch => {
      dispatch(this.loadRpUrl());
      const res = await requestPdd(URL.pdd.rpUrlGenerate, {
        custom_parameters: custom_parameters || 0
      });
      const data = res.data.rp_promotion_url_generate_response.url_list[0];
      const {
        we_app_info: { app_id, page_path },
        we_app_web_view_short_url
      } = data;
      dispatch(
        this.loadRpUrlSuccess({
          pagePath: page_path,
          appId: app_id,
          shortUrl: we_app_web_view_short_url
        })
      );
    };
  }
};

// ============================================================
// reducer
// ============================================================
function rpUrl(state = { loading: false, data: {} }, action) {
  switch (action.type) {
    case types.LEAR_RP_URL:
      return {
        loading: false,
        data: {}
      };
    case types.LOAD_RP_URL:
      return {
        ...state,
        loading: true
      };
    case types.LOAD_RP_URL_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    default:
      return state;
  }
}

export default rpUrl;

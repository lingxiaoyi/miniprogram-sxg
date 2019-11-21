// import { requestPdd } from '../../../utils/api';
//import { URL } from '../../../constants/index';
// // ============================================================
// // action types
// // ============================================================
// export const types = {
//   LOAD_RECOMMEND: 'LOAD_RECOMMEND',
//   LOAD_RECOMMEND_SUCCESS: 'LOAD_RECOMMEND_SUCCESS'
// };

// // ============================================================
// // action creater
// // ============================================================
// export const actions = {
//   loadRecommend: () => ({
//     type: types.LOAD_RECOMMEND,
//     loading: true
//   }),
//   loadRecommendSuccess: data => ({
//     type: types.LOAD_RECOMMEND_SUCCESS,
//     data
//   }),
//   loadRecommendAsync() {
//     return async dispatch => {
//       dispatch(this.loadRecommend());
//       const res = await requestPdd(URL.pdd.goodsRecommendGet, {
//         channel_type: 3,
//         page: Math.floor(Math.random() * 10 + 1),
//         pid: 54291221
//       });
//       console.log('loadRecommendAsync>>', res);
//     };
//   }
// };

// // ============================================================
// // reducer
// // ============================================================
// function recommend(state = { loading: false, data: [] }, action) {
//   switch (action.type) {
//     case types.LOAD_RECOMMEND:
//       return {
//         ...state,
//         loading: true
//       };
//     case types.LOAD_RECOMMEND_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         receiveAt: action.receiveAt,
//         data: action.data
//       };
//     default:
//       return state;
//   }
// }

// export default recommend;

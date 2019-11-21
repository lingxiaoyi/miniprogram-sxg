// import { requestPdd } from '../../../utils/api';
// import { URL } from '../../../constants/index';

// // ============================================================
// // action types
// // ============================================================
// export const types = {
//   // 标签
//   LOAD_TABS: 'LOAD_TABS',
//   LOAD_TABS_SUCCESS: 'LOAD_TABS_SUCCESS'
// };

// // ============================================================
// // action creater
// // ============================================================
// export const actions = {
//   // 标签
//   loadTabs: () => ({
//     type: types.LOAD_TABS,
//     loading: true
//   }),
//   loadTabsSuccess: (data = []) => ({
//     type: types.LOAD_TABS_SUCCESS,
//     data
//   }),
//   loadTabsAsync() {
//     return async dispatch => {
//       dispatch(this.loadTabs());
//       const res = await requestPdd(URL.pdd.goodsOptGet);
//       // console.log('res>>', res);

//       const data = res.data.goods_opt_get_response.goods_opt_list;
//       // .filter((v, i) => {
//       //   return i < 7;
//       // });
//       data.unshift({
//         opt_name: '精选',
//         opt_id: 0
//       });
//       dispatch(this.loadTabsSuccess(data));
//     };
//   }
// };

// // ============================================================
// // reducer
// // ============================================================

// // tabs
// function tabs(
//   state = {
//     loading: false,
//     data: []
//   },
//   action
// ) {
//   switch (action.type) {
//     case types.LOAD_TABS:
//       return { ...state, loading: true };
//     case types.LOAD_TABS_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         data: action.data
//       };
//     default:
//       return state;
//   }
// }

// export default tabs;

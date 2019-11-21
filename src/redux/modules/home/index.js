import { combineReducers } from 'redux';
import banners, { actions as bannersActions } from './banners';
// import tabs, { actions as tabsActions } from './tabs';
import goods, { actions as goodsActions } from './goods';
import hotGoods, { actions as hotGoodsActions } from './hotGoods';
import mailingFree, { actions as mailingFreeActions } from './mailingFree';
import brandGoods, { actions as brandGoodsActions } from './brandGoods';
import themeList, { actions as themeListActions } from './themeList';
import search, { actions as searchActions } from './search';
import rpUrl, { actions as rpUrlActions } from './rpUrl';
import haoquanGoods, { actions as haoquanGoodslActions } from './haoquanGoods';

// export default combineReducers({ goodsDetails, recommend });
export default combineReducers({
  banners,
  // tabs,
  goods,
  hotGoods,
  mailingFree,
  brandGoods,
  themeList,
  search,
  rpUrl,
  haoquanGoods
});

export {
  bannersActions,
  // tabsActions,
  goodsActions,
  hotGoodsActions,
  mailingFreeActions,
  brandGoodsActions,
  themeListActions,
  searchActions,
  rpUrlActions,
  haoquanGoodslActions
};

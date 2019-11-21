import { combineReducers } from 'redux';
import pdd, { actions as pddActions } from './pdd';
import jd, { actions as jdActions } from './jd';
import detailsTb, { actions as detailsTbActions } from './detailsTb';
import promotionUrl, { actions as promotionUrlActions } from './promotionUrl';
// import recommend from './recommend';

// export default combineReducers({ goods, recommend });
export default combineReducers({ pdd, jd, promotionUrl, detailsTb });
export { pddActions, jdActions, promotionUrlActions, detailsTbActions };

import { combineReducers } from 'redux';
import userInfo, { actions as userInfoActions } from './userInfo';
import fans, { actions as fansInfoActions } from './fans';
import earnings, { actions as earningsInfoActions } from './earnings';
import commission, { actions as commissionActions } from './commission';
import order, { actions as orderInfoActions } from './order';
import withdrawal, { actions as withdrawalActions } from './withdrawal';

export default combineReducers({ userInfo, fans, earnings, commission, order, withdrawal });

export {
  userInfoActions,
  fansInfoActions,
  earningsInfoActions,
  commissionActions,
  orderInfoActions,
  withdrawalActions
};

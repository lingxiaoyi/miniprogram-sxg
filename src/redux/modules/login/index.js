import { combineReducers } from 'redux';
import loginInfo, { actions as loginInfoActions } from './login';
import inviteInfo, { actions as inviteInfoActions } from './invite';

export default combineReducers({ loginInfo, inviteInfo});
export {
  loginInfoActions,
  inviteInfoActions
};

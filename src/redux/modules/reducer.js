import { combineReducers } from 'redux';
import home from './home';
import dailypush from './dailypush';
import parity from './parity';
import mine from './mine/index';
import details from './details/index';
import login from './login/index';
import freegoods from './freegoods';
import zy from './zy';

export default combineReducers({
  home,
  dailypush,
  parity,
  mine,
  details,
  login,
  freegoods,
  zy
});

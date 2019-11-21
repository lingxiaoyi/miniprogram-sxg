import { combineReducers } from 'redux';

import cities, { actions as citiesActions } from './cities';
import wxPay, { actions as wxPayActions } from './pay';
import details, { actions as detailsActions } from './details';
import orderDetail, { actions as orderDetailActions } from './orderdetail';
import orderList, { actions as orderListActions } from './orderlist';
import returnOrder, { actions as returnOrderActions } from './returnorder';
import agreeRefund, { actions as agreeRefundActions } from './agreerefund';
import refuseRefund, { actions as refuseRefundActions } from './refuserefund';
import orderSuccess, { actions as orderSuccessActions } from './ordersuccess';
import orderSend, { actions as orderSendActions } from './orderprosend';
import orderReceive, { actions as orderReceiveActions } from './orderproreceive';
import expressInfo, { actions as expressInfoActions } from './expressinfo';
import createOrder, { actions as createOrderActions } from './createorder';
import orderconfirm, { actions as orderconfirmActions } from './orderconfirm';
import addressList, { actions as addressListActions } from './address/list';
import addressDetail, { actions as addressDetailActions } from './address/detail';
import addressAdd, { actions as addressAddActions } from './address/add';
import addressDel, { actions as addressDelActions } from './address/del';
import addressUpdate, { actions as addressUpdateActions } from './address/update';
import addressUpdateOrder, { actions as addressUpdateOrderActions } from './address/updateorder';

export default combineReducers({
  details,
  cities,
  wxPay,
  orderDetail,
  orderList,
  returnOrder,
  agreeRefund,
  refuseRefund,
  orderSuccess,
  orderSend,
  orderReceive,
  expressInfo,
  createOrder,
  orderconfirm,
  addressList,
  addressDetail,
  addressAdd,
  addressDel,
  addressUpdate,
  addressUpdateOrder
});

export {
  wxPayActions,
  orderDetailActions,
  orderListActions,
  returnOrderActions,
  agreeRefundActions,
  refuseRefundActions,
  orderSuccessActions,
  orderSendActions,
  orderReceiveActions,
  expressInfoActions,
  detailsActions,
  createOrderActions,
  orderconfirmActions,
  citiesActions,
  addressListActions,
  addressDetailActions,
  addressAddActions,
  addressDelActions,
  addressUpdateActions,
  addressUpdateOrderActions
};

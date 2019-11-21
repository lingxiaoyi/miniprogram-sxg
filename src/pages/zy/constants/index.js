let orderHandlerbtns = [
  {
    id: '1',
    text: '取消订单'
  },
  {
    id: '2',
    text: '去支付',
    active: true
  },
  {
    id: '3',
    text: '修改地址'
  },
  {
    id: '4',
    text: '查看物流'
  },
  {
    id: '5',
    text: '确认收货',
    active: true
  },
  {
    id: '6',
    text: '申请售后'
  },
]
const orderStatus = {
  0: {
    //默认显示
    icon: 'paying',
    text1: '', //左上
    text2: ``, //右上
    text3: '', //左下
    text4: '', //右下
    btns: [
      {
        id: '0',
        text: ''
      }
    ]
  },
  1: {
    //待付款 h1右上方提示文字
    icon: 'paying',
    text1: '待付款', //左上
    text2: `支付剩余时间:`, //右上
    text3: '', //左下
    text4: '', //右下
    btns: [ orderHandlerbtns[0], orderHandlerbtns[1] ]
  },
  2: {
    //待发货
    icon: 'waiting-send',
    text1: '待发货',
    text2: '',
    text3: '',
    text4: '',
    btns: [ orderHandlerbtns[0], orderHandlerbtns[2] ]
  },
  3: {
    //交易关闭
    icon: 'close',
    text1: '交易关闭',
    text2: '',
    text3: '支付失败',
    text4: '',
    btns: []
  },
  4: {
    //退货中
    icon: 'success',
    text1: '交易完成',
    text2: '',
    text3: '',
    text4: '退货中',
    btns: [ orderHandlerbtns[3] ]
  },
  5: {
    //同意退款
    icon: 'close',
    text1: '交易关闭',
    text2: '',
    text3: '订单已退款',
    text4: '退款成功',
    btns: []
  },
  6: {
    //拒绝退款
    icon: 'success',
    text1: '交易完成',
    text2: '',
    text3: '',
    text4: '物品破损,退货失败',
    btns: [ orderHandlerbtns[3] ]
  },
  7: {
    //出库中
    icon: 'waiting-get',
    text1: '待收货',
    text2: '商品正在出库',
    text3: '',
    text4: '',
    btns: [ orderHandlerbtns[4] ]
  },
  8: {
    //取消订单
    icon: 'close',
    text1: '交易关闭',
    text2: '取消订单',
    text3: '',
    text4: '',
    btns: []
  },
  9: {
    //待收货
    icon: 'waiting-get',
    text1: '待收货',
    text2: '商品正在路上',
    text3: '',
    text4: '',
    btns: [ orderHandlerbtns[3], orderHandlerbtns[4] ]
  },
  14: {
    //交易成功
    icon: 'success',
    text1: '交易完成',
    text2: '',
    text3: '',
    text4: '',
    btns: [ orderHandlerbtns[5], orderHandlerbtns[3] ]
  }
};
const qid = '111';
export { orderStatus, qid };

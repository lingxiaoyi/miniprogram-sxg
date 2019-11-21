let HOST = 'https://wxucenter.suixingou.com';
let LOGHOST = 'https://logshangbao.maiyariji.com';
let GOODS_HOST = 'https://abc.suixingou.com';
let MAIYARIJI_HOST = 'https://tkl.suixingou.com';
let EWM_HOST = 'https://wxacode.suixingou.com:8083';
let TASKCENTER_HOST = 'https://taskcenter.suixingou.com:8073';
let PAY_HOST = 'https://paymentcenter.suixingou.com:8063';
let HOST_ZY_DETAIL = 'https://selfgoodsdetail.suixingou.com:8053';
let CITY_HOST = 'https://sxgposck.suixingou.com';

if (process.env.NODE_ENV === 'development') {
  HOST = 'http://39.107.113.9';
  CITY_HOST = 'http://39.107.113.9';
  GOODS_HOST = 'http://106.75.73.67:9010';
  LOGHOST = 'http://123.59.60.170';
  MAIYARIJI_HOST = 'http://106.75.35.140';
  TASKCENTER_HOST = 'https://test.mv.dftoutiao.com/taskcenter';
  PAY_HOST = 'https://test.mv.dftoutiao.com/sxgpaymentcenter';
  HOST_ZY_DETAIL = 'https://test.mv.dftoutiao.com/sxgselfgoodsdetail';
}

// let HOST = 'http://39.107.113.9';
// let GOODS_HOST = 'https://abc.suixingou.com';
// let LOGHOST = 'http://123.59.60.170';
// let MAIYARIJI_HOST = 'http://106.75.35.140';
// let EWM_HOST = 'https://wxacode.suixingou.com:8083';

const URL = {
  loginByOpenid: `${HOST}/sxg_wxsa/loginByOpenid`, //根据openid登录
  decryptData: `${HOST}/sxg_wxsa/decryptData`, //解密用户基础信息，并通过解密出来的unionid判断是否可以登录
  registerother: `${HOST}/sxg_wxsa/registerother`, //3.小程序用户注册（判断手机号是否被使用，手机号对应的accid账号是否绑定过微信登录信息）
  getuserinviterinfo: `${HOST}/ucenter_my_wxmini/myuser/getuserinviterinfo`, //获取用户邀请人信息
  getuserbaseinfo: `${HOST}/ucenter_my_wxmini/myuser/getuserbaseinfo`, //获取用户基础信息
  getuserinviteecnttotal: `${HOST}/ucenter_my_wxmini/myuser/getuserinviteecnttotal`, //获取用户总粉丝数
  getuserinviteelist: `${HOST}/ucenter_my_wxmini/myuser/getuserinviteelist`, //获取用户直属粉丝列表
  getuserinviteelistindirect: `${HOST}/ucenter_my_wxmini/myuser/getuserinviteelistindirect`, //获取用户间接粉丝列表
  getothuserinfo: `${HOST}/ucenter_my_wxmini/myuser/getothuserinfo`, //获取其他用户信息，proc_get_user_incomelist
  getuserincomelist: `${HOST}/ucenter_my_wxmini/myuser/getuserincomelist`, //6.获取用户收益面板
  getusercommissionlist: `${HOST}/ucenter_my_wxmini/myuser/getusercommissionlist`, //7.获取用户佣金列表
  getuserwithdrawallist: `${HOST}/ucenter_my_wxmini/myuser/getuserwithdrawallist`, //8.获取用户提现明细列表
  getuserorderlist: `${HOST}/ucenter_my_wxmini/myuser/getuserorderlist`, //9.获取用户订单列表
  banner: `${GOODS_HOST}/api/pinduoduo_service/applets_banner`, // 首页banner
  operationList: `${GOODS_HOST}/api/pinduoduo_service/applets_theme_operation_list`, // 专题列表
  pdd: {
    themeOperationGoodsSearch: `${GOODS_HOST}/api/pinduoduo_service/theme_operation_goods_search`, // 0元购商品
    themeListGet: `${GOODS_HOST}/api/pinduoduo_service/theme_list_get`, // 首页banner
    goodsOptGet: `${GOODS_HOST}/api/pinduoduo_service/goods_opt_get`, // 首页商品分类标签
    categaryGet: `${GOODS_HOST}/api/pinduoduo_service/category_get`, // 首页商品列表
    urlGenerate: `${GOODS_HOST}/api/pinduoduo_service/url_generate`, // 生成pdd路径
    rpUrlGenerate: `${GOODS_HOST}/api/pinduoduo_service/rp_url_generate`, // 生成pdd路径
    goodsDetail: `${GOODS_HOST}/api/pinduoduo_service/goods_detail`, // 详情页商品信息
    goodsRecommendGet: `${GOODS_HOST}/api/pinduoduo_service/goods_recommend_get`, // 详情页-猜你喜欢
    themeGoodsSearch: `${GOODS_HOST}/api/pinduoduo_service/theme_goods_search`, // 详情页商品信息
    search: `${GOODS_HOST}/api/pinduoduo_service/search` // 详情页商品信息
  },
  log: {
    //日志
    online: `${LOGHOST}/maltdiary_log/online`,
    click: `${LOGHOST}/maltdiary_log/click`,
    active: `${LOGHOST}/maltdiary_log/active`,
    clipboard: `${LOGHOST}/maltdiary_log/clipboard`,
    intoscreen: `${LOGHOST}/maltdiary_log/intoscreen`,
    taskReport_wx: `${TASKCENTER_HOST}/task/taskReport_wx` //app分享淘宝商品落地页增加任务上报
  },
  getdetailbytkl: `${MAIYARIJI_HOST}/MaltDiaryDetail/getdetailbytkl`, //淘宝根据商品ID获取商品详情
  ewm: `${EWM_HOST}/wxacode/getwxacode`, // 获取二维码
  ewmopt: `${EWM_HOST}/wxacode/getscene`, // 获取sence参数
  jd: {
    promotionPosition: `${GOODS_HOST}/api/jdlm_service/promotion_position`, // 京东京粉精选商品接口
    search: `${GOODS_HOST}/api/jdlm_service/search`, // 京东搜索接口(精选,搜索)
    singleGoodsInfo: `${GOODS_HOST}/api/jdlm_service/single_goodsinfo`, // 京东商品详情接口(无佣金的情况无返回结果)
    promotionLlink: `${GOODS_HOST}/api/jdlm_service/promotion_link` // 京东商品转链接口
  },
  getCitiesData: `${CITY_HOST}/SxgPos/GetPos`,
  zy: {
    orderWxPay: `${PAY_HOST}/payment/wxpay`, // 微信支付
    getgoodsdetailbyid: `${HOST_ZY_DETAIL}/goodsdetail/getgoodsdetailbyid`, //随心购-代发商品详情
    addshipaddress: `${HOST}/ucenter_my_wxmini/myuser/addshipaddress`, //37.添加收货地址
    delshipaddress: `${HOST}/ucenter_my_wxmini/myuser/delshipaddress`, //38.删除收货地址
    updateshipaddress: `${HOST}/ucenter_my_wxmini/myuser/updateshipaddress`, //39.修改收货地址
    getshipaddresslist: `${HOST}/ucenter_my_wxmini/myuser/getshipaddresslist`, //40.查询收货地址列表
    getshipaddressdetails: `${HOST}/ucenter_my_wxmini/myuser/getshipaddressdetails`, //22.获取收货地址详情
    getlogisticsinfo: `${HOST}/ucenter_my_wxmini/myuser/getlogisticsinfo`, //41.查询物流信息
    getownorderlist: `${HOST}/ucenter_my_wxmini/myuser/getownorderlist`, //42.获取自营商品订单列表
    confirmgoods: `${HOST}/ucenter_my_wxmini/myuser/confirmgoods`, //43.确认收货
    updateordershipaddress: `${HOST}/ucenter_my_wxmini/myuser/updateordershipaddress`, //44.修改订单列表中收货地址
    getownorderdetails: `${HOST}/ucenter_my_wxmini/myuser/getownorderdetails`, //45.获取自营商品订单详情
    cancelorder: `${HOST}/ucenter_my_wxmini/myuser/cancelorder`, //46.取消订单
    createOrder: `${HOST}/ucenter_my_wxmini/myuser/createOrder`, //47.创建订单
    queryOrderByTradeId: `${HOST}/ucenter_my_background/order/queryOrderByTradeId`, //1.查询订单详情信息接口
    queryOrderByTkStatus: `${HOST}/ucenter_my_background/order/queryOrderByTkStatus`, //2.查询根据订单状态查询订单列表接口
    returnOrder: `${HOST}/ucenter_my_background/order/returnOrder`, //3.交易成功的商品，申请退货时，更新订单为退货状态接口
    agreedRefund: `${HOST}/ucenter_my_background/order/agreedRefund`, //4.申请退货后，同意退款接口（加库存，减销量，给用户退钱）
    refusedRefund: `${HOST}/ucenter_my_background/order/refusedRefund`, //5.申请退货后，拒绝退款接口（加库存，减销量）
    updatePayOrderStatus: `${HOST}/ucenter_my_background/order/updatePayOrderStatus`, //6.支付成功时，修改订单状态为支付成功状态
    waitSendOrder: `${HOST}/ucenter_my_background/order/waitSendOrder`, //7.查询所有待发货的订单，并更新状态为待出库
    waitReceiveOrder: `${HOST}/ucenter_my_background/order/waitReceiveOrder` //8.物流信息导入后，更新订单状态为待收货
  }
};
export default URL;

import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Button, Text } from '@tarojs/components';
import TitleBar from '../../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../../utils/wx';
import { formatDate } from '../../../../utils/util';
import Log from '../../../../utils/log';
import ZyModal from '../../component/modal/index';
import '../../component/modal/index.scss';
import ZyGoodsList from '../../component/goods/goodsList';
import ZyGoodsListiItem from '../../component/goods/item';
import '../../component/goods/goodsList.scss';
import './details.scss';
import { orderStatus } from '../../constants/index';
import { orderDetailActions, wxPayActions } from '../../../../redux/modules/zy/index';

class orderDetail extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      showModal: false,
      content: '',
      countdown: 0, //倒计时只有代付款才会有 单位毫秒
      isModifiedAdress: false
    };
    this.btnsId = ''; //下方按钮的id配置文件在../../constants/index
    this.tradeId = '';
    this.timer = [];
  }
  componentDidMount() {
    // 日志展现
    Log.click({ buttonfid: 'x_10173' });
  }
  async componentDidShow() {
    let { dispatch, loginInfo } = this.props;
    let { tradeId } = this.$router.params;
    this.tradeId = tradeId;
    await dispatch(orderDetailActions.loadOrderdetails(tradeId, loginInfo.accid));
    const {
      data: {
        createTime,
        servertime, //服务器当前时间
        failuretime
      }
    } = this.props;
    this.setState({
      countdown: (failuretime / 1) * 1000 - (servertime - createTime)
    });
    this.timer.push(
      // setTimeout解决componentWillReceiveProps进入死循环问题
      setInterval(() => {
        let countdown = this.state.countdown - 1000;
        this.setState({
          countdown: countdown >= 0 ? countdown : 0
        });
      }, 1000)
    );
    if (this.state.isModifiedAdress) {
      Taro.showToast({
        title: '地址修改成功',
        icon: 'none',
        duration: 2000
      });
      this.setState({
        isModifiedAdress: false
      });
    }
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(orderDetailActions.clear());
    this.timer.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
  }
  handleClick(id) {
    if (id === '3') {
      Log.click({ buttonfid: 'x_10174' });
      jumpUrl(`/pages/zy/address/address?from=orderlist&tradeId=${this.tradeId}`);
    } else if (id === '4') {
      Log.click({ buttonfid: 'x_10176' });
      jumpUrl(`/pages/zy/expressinfo/expressinfo?logisticsId=${this.props.data.logisticsId}`);
    } else if (id === '1') {
      Log.click({ buttonfid: 'x_10175' });
      this.setState({
        showModal: true,
        content: '确定要取消此订单吗?'
      });
    } else if (id === '5') {
      Log.click({ buttonfid: 'x_10177' });
      this.setState({
        showModal: true,
        content: '确定收到货物了吗?'
      });
    } else if (id === '2') {
      Log.click({ buttonfid: 'x_10178' });
      this.onPay();
    } else {
      Log.click({ buttonfid: 'x_10180' });
    }
    this.btnsId = id;
  }
  onConfirmFuc() {
    this.setState({
      showModal: false
    });
    if (this.btnsId === '1') {
      this.onCanleOrder();
    } else if (this.btnsId === '5') {
      this.onConfirmGetGoods();
    }
  }
  onCanleOrder() {
    let { dispatch, data } = this.props;
    let { tradeId, numIid } = data;
    dispatch(orderDetailActions.cancelorder(tradeId, numIid)).then(function() {
      dispatch(orderDetailActions.loadOrderdetails(tradeId)).then(() => {
        Taro.showToast({
          title: '订单已取消',
          icon: 'none',
          duration: 2000
        });
      });
    });
  }
  async onPay() {
    let { dispatch, data, loginInfo } = this.props;
    let { tradeId, payPrice, itemTitle } = data;

    await dispatch(wxPayActions.wxPayAsync(payPrice, itemTitle, itemTitle, tradeId, loginInfo.wxOpenid));
    if (this.props.payInfo.stat !== 200) {
      Taro.showToast({
        title: this.props.payInfo.msg,
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (this.isPaying) {
      // 正在支付
      Taro.showToast({
        title: '支付中,请不要重复提交',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const { timeStamp, nonceStr, signType, paySign, prepay_id } = this.props.payInfo.data;
    // 调起微信支付
    Taro.requestPayment({
      timeStamp,
      nonceStr,
      signType,
      paySign,
      package: `prepay_id=${prepay_id}`,
      success: res => {
        // 成功 跳转支付成功页面
        Taro.showToast({
          title: this.props.payInfo.msg,
          icon: 'none',
          duration: 2000
        }).then(function() {
          dispatch(orderDetailActions.loadOrderdetails(tradeId)).then(() => {
            Taro.showToast({
              title: '支付成功',
              icon: 'none',
              duration: 2000
            });
          });
        });
      },
      fail: err => {
        if (err.errMsg === 'requestPayment:fail cancel') {
          //jumpUrl(`/pages/zy/order/details/details?tradeId=${confirmData.tradeId}`)
          Taro.showToast({
            title: '支付失败,请重试',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 跳转支付失败页面
        }
        // 取消支付  跳转订单付款页面 需要参数  订单号 返回页面不能到订单确认页面
        // 支付失败 跳转订单失败页面  需要传参数 订单号
      }
    });
  }
  onConfirmGetGoods() {
    let { dispatch, data } = this.props;
    let { tradeId } = data;
    dispatch(orderDetailActions.confirmgoods(tradeId)).then(function() {
      dispatch(orderDetailActions.loadOrderdetails(tradeId)).then(() => {
        Taro.showToast({
          title: '收货成功',
          icon: 'none',
          duration: 2000
        });
      });
    });
  }
  hideModal() {
    this.setState({
      showModal: false
    });
  }
  render() {
    let { data } = this.props;
    let {
      //accid,
      tradeId,
      // numIid,
      // itemNum,
      // itemTitle,
      payPrice,
      receiveName,
      receiveAddress,
      receiveMobile = '',
      tkStatus = 0,
      success_time,
      payTime,
      createTime
    } = data;
    let { showModal, content, countdown } = this.state;
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='订单详情' />
        <View className='sec1'>
          <View className='items'>
            <View className='item'>
              <View className={`icon ${orderStatus[tkStatus].icon}`} />
              <Text className='t'>{orderStatus[tkStatus].text1}</Text>
            </View>
            <View className='item2'>
              <Text className='t'>
                {orderStatus[tkStatus].text2}
                {tkStatus === 1 ? formatDate(countdown, 'mm:ss') : ''}
              </Text>
            </View>
          </View>
          <View className='text3'>{orderStatus[tkStatus].text3}</View>
        </View>
        {/* 个人信息 */}
        <View className='sec2'>
          {success_time && (
            <View className='info'>
              <View className='row1'>
                <View className='icon deliver' />
                <Text className='t'>已签收</Text>
              </View>
              <View className='address'>{success_time}</View>
              <View className='more' />
            </View>
          )}
          <View className='info'>
            <View className='row1'>
              <View className='icon position' />
              <Text className='t'>{receiveName}</Text>
              <Text className='t'>{receiveMobile.substr(0, 3) + '****' + receiveMobile.substr(7)}</Text>
            </View>
            <View className='address'>{receiveAddress}</View>
          </View>
        </View>
        {/* 商品详细信息 */}
        <ZyGoodsList>
          <ZyGoodsListiItem data={data} key={data.tradeId} isOrder={false} />
        </ZyGoodsList>
        {/* 商品订单号 下单时间 付款时间 */}
        <View className='sec4'>
          <View className='ul'>
            <View className='li'>
              <Text className='p1'>订单号</Text>
              <View className='p2'>
                {tradeId}
                <View
                  className='btn-copy'
                  onClick={() => {
                    Taro.setClipboardData({ data: tradeId.toString() }).then(() => {
                      Log.clipboard({ content: tradeId });
                    });
                    Log.click({ buttonfid: 'x_10120' });
                  }}
                >
                  复制
                </View>
              </View>
            </View>
            <View className='li'>
              <Text className='p1'>下单时间</Text>
              <Text className='p2'>{formatDate(createTime, 'yyyy-MM-dd HH:mm:ss')}</Text>
            </View>
            {payTime && (
              <View className='li'>
                <Text className='p1'>付款时间</Text>
                <Text className='p2'>{formatDate(payTime, 'yyyy-MM-dd HH:mm:ss')}</Text>
              </View>
            )}
            <View className='li'>
              <Text className='p1'>合计金额</Text>
              <Text className='p2'>
                <Text className='span'>￥{payPrice}</Text>
              </Text>
            </View>
          </View>
        </View>
        <View className='sec-bottom-bar' style={orderStatus[tkStatus].btns.length ? '' : 'background:#f5f5f5'}>
          <View className='at-list__item-footer'>
            {orderStatus[tkStatus].btns
              .filter(item => {
                return item.text === '申请售后';
              })
              .map((item, i) => {
                return (
                  <Button
                    key={i}
                    className={item.active ? 'active' : ''}
                    openType='contact'
                    onClick={this.handleClick.bind(this, item.id)}
                  >
                    {item.text}
                  </Button>
                );
              })}
            {orderStatus[tkStatus].btns
              .filter(item => {
                return item.text !== '申请售后';
              })
              .map((item, i) => {
                return (
                  <View key={i} className={item.active ? 'active' : ''} onClick={this.handleClick.bind(this, item.id)}>
                    {item.text}
                  </View>
                );
              })}
          </View>
          <ZyModal
            isOpened={showModal}
            title='提示'
            content={content}
            cancelText='取消'
            confirmText='确定'
            onClose={this.hideModal}
            onCancel={this.hideModal}
            onConfirm={this.onConfirmFuc}
          />
          {/* <ZyToast isOpened={isModifiedAdress} text='地址修改成功'></ZyToast> */}
        </View>
      </View>
    );
  }
}
orderDetail.defaultProps = {
  data: {
    tkStatus: 0,
    tradeId: '',
    payPrice: '',
    receiveName: '',
    receiveAddress: '',
    receiveMobile: '',
    tkStatus: '',
    success_time: '',
    payTime: '',
    createTime: ''
  }
};
function mapStateToProps(state) {
  const { data } = state.zy.orderDetail;
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  const { data: payInfo } = state.zy.wxPay;
  return {
    userInfo,
    loginInfo,
    data,
    payInfo
  };
}

export default connect(mapStateToProps)(orderDetail);

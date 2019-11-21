import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Button, Block } from '@tarojs/components';
import PropTypes from 'prop-types';
import './orderbtns.scss';
import { jumpUrl } from '../../../../utils/wx';
import { orderStatus } from '../../constants/index';
import { orderDetailActions, orderListActions, wxPayActions } from '../../../../redux/modules/zy/index';
import Log from '../../../../utils/log';

class Orderbtns extends Component {
  constructor() {
    super(...arguments);
    this.state = {};
    this.btnsId = ''; //下方按钮的id配置文件在../../constants/index
    this.tradeId = '';
    this.timer = [];
  }
  componentDidMount() {
    let { data } = this.props;
    let { tradeId } = data;
    this.tradeId = tradeId;
  }
  componentWillUnmount() {}

  componentDidHide() {}
  handleClick(id, e) {
    let pages = Taro.getCurrentPages(); // 获取页面栈
    let curPage = pages[pages.length - 1]; // 上一个页面
    e.stopPropagation();
    if (id === '3') {
      Log.click({ buttonfid: 'x_10168' });
      jumpUrl(`/pages/zy/address/address?from=orderlist&tradeId=${this.tradeId}`);
    } else if (id === '4') {
      Log.click({ buttonfid: 'x_10171' });
      jumpUrl(`/pages/zy/expressinfo/expressinfo?logisticsId=${this.props.data.logisticsId}`);
    } else if (id === '1') {
      Log.click({ buttonfid: 'x_10170' });
      curPage.$component.setState({
        showModal: true,
        content: '确定要取消此订单吗?',
        onConfirmFuc: this.onConfirmFuc.bind(this)
      })
    } else if (id === '5') {
      Log.click({ buttonfid: 'x_10172' });
      curPage.$component.setState({
        showModal: true,
        content: '确定收到货物了吗?',
        onConfirmFuc: this.onConfirmFuc.bind(this)
      })
    } else if (id === '2') {
      Log.click({ buttonfid: 'x_10169' });
      this.onPay();
    }
    this.btnsId = id;
  }
  onConfirmFuc() {
    if (this.btnsId === '1') {
      this.onCanleOrder();
    } else if (this.btnsId === '5') {
      this.onConfirmGetGoods();
    }
  }
  onCanleOrder() {
    let { dispatch, data } = this.props;
    let { tradeId, numIid } = data;
    dispatch(orderDetailActions.cancelorder(tradeId, numIid)).then(function () {
      dispatch(orderListActions.clear());
      dispatch(orderListActions.loadOrderListAsync(data.currentTabIndex)).then(()=>{
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
        Taro.showToast({
          title: this.props.payInfo.msg,
          icon: 'none',
          duration: 2000
        }).then(function () {
          dispatch(orderListActions.clear());
          dispatch(orderListActions.loadOrderListAsync(data.currentTabIndex)).then(()=>{
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
    dispatch(orderDetailActions.confirmgoods(tradeId)).then(function () {
      dispatch(orderListActions.clear());
      dispatch(orderListActions.loadOrderListAsync(data.currentTabIndex)).then(()=>{
        Taro.showToast({
          title: '收货成功',
          icon: 'none',
          duration: 2000
        });
      });
    });
  }
  render() {
    let { tkStatus } = this.props;
    return (
      <Block>
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
                  onClick={this.handleClick.bind(this, item.text)}
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
      </Block>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state.mine.order);
  const { loginInfo } = state.login;
  const { data: payInfo } = state.zy.wxPay;
  return {
    loginInfo,
    payInfo
  };
}
export default connect(mapStateToProps)(Orderbtns);
Orderbtns.defaultProps = {
  tkStatus: 0
};

Orderbtns.propTypes = {
  tkStatus: PropTypes.number
};

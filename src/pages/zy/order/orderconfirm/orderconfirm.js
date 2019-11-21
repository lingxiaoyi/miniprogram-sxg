import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image } from '@tarojs/components';
import { getGlobalData, jumpUrl } from '../../../../utils/wx';
import TitleBar from '../../../../components/titleBar/titleBar';
import Log from '../../../../utils/log';
import {
  wxPayActions,
  createOrderActions,
  addressListActions,
  addressDetailActions
} from '../../../../redux/modules/zy';
import './orderconfirm.scss';
import OrderModal from '../../component/modal/index';
import '../../component/modal/index.scss';

class Orderconfirm extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showBackDialog: false,
      orderRequest: {
        title: '',
        numIid: '',
        skuImageUrl: '',
        finalPrice: 0.0,
        stock: 0,
        commission: 0.0,
        num: 1,
        attributesValues: [],
        attr: []
      },
      addressRequest: null,
      addressId: '',
      isModifiedAdress: false
    };
    this.isPaying = false;
  }
  async componentDidShow() {
    let addressRequest = this.addressRequest;
    let { dispatch } = this.props;
    if (this.state.addressId === '') {
      // 接口列表取默认 取不到 取第一条 列表为空设为空
      this.checkAddressList(addressRequest, dispatch);
    } else {
      // 根据addressId请求详情数据
      await dispatch(addressDetailActions.loadAsync(this.state.addressId));
      console.log(this.props.addressDetail);
      addressRequest = this.props.addressDetail;
      if (addressRequest.id) {
        // 请求返回了详情数据
        this.setState({
          addressRequest: addressRequest
        });
      } else {
        // 根据id没有查到详情 再去列表查
        this.checkAddressList(addressRequest, dispatch);
      }
    }
    if (this.state.isModifiedAdress) {
      Taro.showToast({
        title: '地址修改成功',
        icon: 'none',
        duration: 2000
      });
    }
    this.setState({
      isModifiedAdress: false
    });
  }
  async componentDidMount() {
    const { purchaseNum, numIid, itemTitle, attr, activeSkuInfos, shareAccid } = this.props.orderData;
    // 获取订单信息

    const orderRequest = {
      title: itemTitle,
      goodId: numIid,
      skuId: activeSkuInfos.skuId,
      skuImageUrl: activeSkuInfos.skuImageUrl,
      finalPrice: activeSkuInfos.finalPrice,
      stock: activeSkuInfos.stock,
      commission: activeSkuInfos.commission,
      num: purchaseNum,
      attributesValues: activeSkuInfos.attributesValues,
      attr: attr,
      shareAccid: shareAccid || 0
    };
    // 初始化数量 库存
    this.setState({
      orderRequest
    });

    // 日志上报
    Log.click({ buttonfid: 'x_10155' });
  }
  async checkAddressList(addressRequest, dispatch) {
    await dispatch(addressListActions.loadAsync());
    let addressList = this.props.addressList.stat === 0 ? this.props.addressList.data : [];
    if (addressList.length > 0) {
      addressList.map(item => {
        if (item.isdefault === 1) {
          addressRequest = item;
        }
      });
      addressRequest = addressRequest ? addressRequest : addressList[0];
    } else {
      addressRequest = null;
    }
    this.setState({
      addressRequest: addressRequest
    });
  }
  componentWillUnmount() {
    // 清掉 地址列表
    this.props.dispatch(addressListActions.clear());
  }
  goAddress(addressInfo) {
    if (addressInfo) {
      // 去列表页
      Log.click({ buttonfid: 'x_10157' });
      jumpUrl('/pages/zy/address/address?from=orderconfirm');
    } else {
      // 去添加列表页
      Log.click({ buttonfid: 'x_10156' });
      jumpUrl('/pages/zy/address/edit/edit?from=orderconfirm');
    }
  }
  setPronum(type) {
    const { num, stock } = this.state.orderRequest;
    if ((type === -1 && num <= 1) || (type === 1 && num >= stock)) {
      return;
    }
    const newObj = {
      ...this.state.orderRequest,
      num: type + num
    };
    this.setState({
      orderRequest: newObj
    });
  }
  handleBackClick() {
    this.setState({
      showBackDialog: true
    });
  }
  closeModal() {
    this.setState({
      showBackDialog: false
    });
  }
  back() {
    const pages = Taro.getCurrentPages();
    if (pages.length >= 2) {
      Taro.navigateBack();
    } else {
      Taro.switchTab({
        url: '/pages/home/home'
      });
    }
  }
  total(one, num) {
    return {
      all: (one * num).toFixed(2),
      int: parseInt(one * num),
      float: (one * num)
        .toFixed(2)
        .toString()
        .split('.')[1]
    };
  }
  async submit() {
    const { dispatch } = this.props;

    // 创建订单
    let { orderRequest, addressRequest } = this.state;
    if (!addressRequest) {
      // 未获取到地址
      Taro.showToast({
        title: '尚未填写地址信息',
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
    // 日志上报
    Log.click({ buttonfid: 'x_10158' });
    this.isPaying = true;

    await dispatch(
      createOrderActions.createOrderAsync(
        orderRequest.skuId,
        orderRequest.num,
        addressRequest.id,
        orderRequest.goodId,
        orderRequest.shareAccid !== this.props.accid ? orderRequest.shareAccid : 0
      )
    );
    const { confirmData } = this.props;
    if (confirmData.stat !== 0) {
      Taro.showToast({
        title: confirmData.msg,
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 提交订单 传参
    const { all } = this.total(orderRequest.finalPrice, orderRequest.num);

    await dispatch(
      wxPayActions.wxPayAsync(all, orderRequest.title, orderRequest.title, confirmData.tradeId, this.props.wxOpenid)
    );
    if (this.props.payInfo.stat !== 200) {
      Taro.showToast({
        title: this.props.payInfo.msg,
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
        console.log(res);
        jumpUrl(`/pages/zy/paysuccess/paysuccess?tradeId=${confirmData.tradeId}`, { method: 'redirectTo' });
      },
      fail: err => {
        if (err.errMsg === 'requestPayment:fail cancel') {
          jumpUrl(`/pages/zy/order/details/details?tradeId=${confirmData.tradeId}`, { method: 'redirectTo' });
        } else {
          // 跳转支付失败页面
        }
        // 取消支付  跳转订单付款页面 需要参数  订单号 返回页面不能到订单确认页面
        // 支付失败 跳转订单失败页面  需要传参数 订单号
      }
    });
  }
  render() {
    // 从参数中获取
    let { showBackDialog, orderRequest, addressRequest } = this.state;
    const { finalPrice, num, attr } = orderRequest;
    let mobile = '';
    // 手机号脱敏
    if (addressRequest) {
      mobile = addressRequest.mobile;
      let pat = /(\d{3})\d*(\d{4})/;
      mobile = mobile.replace(pat, '$1****$2');
    }
    // 按数量计算总价
    const total = this.total(finalPrice, num);
    const { all, int, float } = total;
    // 从接口中获取默认
    return (
      <View className='detail' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='物流信息' bgstyle='gray' onBack={this.handleBackClick} />
        <View className='space' />
        <View className='postbox' onClick={this.goAddress.bind(this, addressRequest)}>
          {addressRequest ? (
            <View className='address'>
              <View className='text'>
                <Text className='name'>{addressRequest.name}</Text>
                <Text className='phone'>{mobile}</Text>
              </View>
              <View className='adbox'>
                {addressRequest.isdefault === 1 ? <Text className='tag' /> : ``}
                {addressRequest.address}
              </View>
            </View>
          ) : (
            <Text className='noaddress'>点此添加收货地址</Text>
          )}
          <View className='arrow' />
        </View>
        <View className='probox'>
          <View className='tit'>随心精选</View>
          <View className='pro-info'>
            <Image src={orderRequest.skuImageUrl} class='pro-img' />
            <View className='right-info'>
              <View className='pro-tit-box'>
                <Text className='pro-tit'>{orderRequest.title}</Text>
                <Text className='one-price'>¥ {orderRequest.finalPrice}</Text>
              </View>
              <View className='pro-type'>
                {attr.map((item, index) => {
                  return (
                    <Text key={index} style='padding-right:10rpx'>
                      {item.name}:
                      {item.values
                        .filter(item2 => {
                          if (orderRequest.attributesValues.indexOf(item2) !== -1) {
                            return item2;
                          }
                        })
                        .map(v => {
                          return v;
                        })}
                    </Text>
                  );
                })}
              </View>
              <View className='pro-num-box'>
                <Text className='pro-commission'>佣金:{orderRequest.commission}</Text>
                <View className='count'>
                  <Text class='decrease' onClick={this.setPronum.bind(this, -1)} />
                  <Text class='num'>{orderRequest.num}</Text>
                  <Text className='increase' onClick={this.setPronum.bind(this, 1)} />
                </View>
              </View>
            </View>
          </View>
          <View className='method'>
            <Text className='key'>支付方式</Text>
            <Text className='method-value'>微信</Text>
          </View>
          <View className='price'>
            <Text className='key'>商品金额</Text>
            <Text className='price-value'>￥{all}</Text>
          </View>
        </View>
        <View className='bottom'>
          <View className='total'>
            合计金额：<Text className='rmb'>￥</Text>
            <Text className='int'>{int}</Text>
            <Text className='float'>.{float}</Text>
          </View>
          <View className='submit' onClick={this.submit}>
            提交订单
          </View>
        </View>
        <OrderModal
          isOpened={showBackDialog}
          title='提示'
          cancelText='我再想想'
          confirmText='去意已决'
          onClose={this.closeModal}
          onCancel={this.closeModal}
          onConfirm={this.back}
          content='便宜不等人，请三思而行～'
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { wxOpenid, accid } = state.login.loginInfo;
  const { data: confirmData } = state.zy.createOrder;
  const { data: orderData } = state.zy.orderconfirm;
  const { data: payInfo } = state.zy.wxPay;
  const { data: addressList } = state.zy.addressList;
  const { data: addressDetail } = state.zy.addressDetail;
  return {
    orderData,
    confirmData,
    payInfo,
    addressList,
    addressDetail,
    wxOpenid,
    accid
  };
}
export default connect(mapStateToProps)(Orderconfirm);

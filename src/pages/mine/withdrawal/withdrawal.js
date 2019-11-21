import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';
import { formatDate } from '../../../utils/util';
import './withdrawal.scss';
import { withdrawalActions } from '../../../redux/modules/mine/index';
import Nomore from '../../../components/baseNoMore';
import Nodata from '../../../components/baseNoData';

class DefaultComponent extends Component {
  config = {
    navigationBarTitleText: '提现记录'
  };

  constructor() {
    super(...arguments);
    this.state = {};
  }

  componentWillMount() {
    let { dispatch } = this.props;
    dispatch(withdrawalActions.loadWithdrawalAsync());
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(withdrawalActions.loadClearAsync());
  }
  async onReachBottom() {
    let { dispatch } = this.props;
    await dispatch(withdrawalActions.loadWithdrawalAsync());
    let { failedMsg, loadFailed } = this.props;
    if (loadFailed) {
      Taro.showToast({
        title: failedMsg,
        icon: 'none'
      });
    }
  }
  render() {
    let { data, loadFinish, requestSuc } = this.props;
    let html = null;
    if ( data.length > 0) {
      html = (
        <View className='ul'>
          {data.map((item) => {
            return (
              <View className='li' key={item.orderid}>
                <View className='h3'>
                  <Text className='text'>
                    提现方式: {item.type === 1 ? '支付宝' : '微信'}({item.payAccount})
                  </Text>
                  <Text className='status'>成功</Text>
                </View>
                <View className='h4'>
                  <Text className='text'>佣金:</Text>
                  <Text className='num'>{item.money}元</Text>
                </View>
                <View className='h5'>
                  <Text className='text'>结算号:{item.orderid}</Text>
                </View>
                <View className='h5'>
                  <Text className='text'>请注意查收货款</Text>
                  <Text className='date'>{formatDate(item.createtime, 'yyyy／MM／dd')}</Text>
                </View>
              </View>
            );
          })}
          {loadFinish && <Nomore title='没有更多了哦~' />}
        </View>
      );
    } else {
      html = requestSuc && data.length === 0 && <Nodata title='暂无提现记录' imgurl='https://h5.suixingou.com/miniprogram-assets/sxg/mine/nodata-earnings.png'  />
    }

    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='提现记录' />
        {html}
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loading, loadFailed, failedMsg, data, loadFinish, requestSuc } = state.mine.withdrawal;
  return {
    loading,
    loadFailed,
    failedMsg,
    loadFinish,
    data,
    requestSuc
  };
}
export default connect(mapStateToProps)(DefaultComponent);

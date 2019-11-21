import Taro, { Component } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import './paysuccess.scss';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import paysuccessImg from '../../../asset/zy/icon/paysuccess.png';

class Paysuccess extends Component {
  constructor() {
    super(...arguments);
  }

  componentWillUnmount() {}

  componentDidShow() {
    let { tradeId } = this.$router.params;
    this.tradeId = tradeId;
  }

  componentDidHide() {}

  render() {
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='成功' />
        <View className='sec'>
          <Image className='img' src={paysuccessImg} mode='widthFix' />
          <Text className='text'>支付成功</Text>
        </View>
        <View className='btns'>
          <View className='btn' onClick={()=>{
            Taro.switchTab({
              url: '/pages/home/home'
            });
          }}
          >返回首页</View>
          <View className='btn' onClick={()=>{
            jumpUrl(`/pages/zy/order/details/details?tradeId=${this.tradeId}`);
          }}
          >查看订单</View>
        </View>
      </View>
    );
  }
}
export default Paysuccess;

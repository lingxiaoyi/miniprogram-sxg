import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';

class Nodata extends Component {
  constructor() {
    super(...arguments);
  }
  render() {
    let {
      title = '暂无数据',
      imgurl = 'https://h5.suixingou.com/miniprogram-assets/sxg/mine/nodata-fans.png'
    } = this.props;
    return (
      <View className='nodata'>
        {imgurl && <Image mode='widthFix' className='img' src={imgurl} />}
        <Text className='title'>{title}</Text>
      </View>
    );
  }
}

export default Nodata;

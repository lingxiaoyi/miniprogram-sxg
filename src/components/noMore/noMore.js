import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';

import './noMore.scss';

export default class NoMore extends Component {
  constructor() {
    super(...arguments);
  }
  render() {
    return <View className='no-more'>~没有更多数据了~</View>;
  }
}

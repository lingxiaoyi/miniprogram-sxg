import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';

import './loading.scss';

export default class Loading extends Component {
  constructor() {
    super(...arguments);
  }
  render() {
    return <View className='loading'>{this.props.txt ? this.props.txt : '加载中...'}</View>;
  }
}

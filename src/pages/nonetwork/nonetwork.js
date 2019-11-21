import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import TitleBar from '../../components/titleBar/titleBar';
import './nonetwork.scss';

class DownloadApp extends Component {
  constructor () {
    super(...arguments)
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className='no-network'>
      <TitleBar title='暂无网络' />
        无网络
      </View>
    )
  }
}
export default DownloadApp

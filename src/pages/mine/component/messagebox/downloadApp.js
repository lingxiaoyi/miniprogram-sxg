import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import classnames from 'classnames'
import './downloadApp.scss';

class DownloadApp extends Component {
  constructor () {
    super(...arguments)
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    let {onCloseCallback} = this.props
    return (
      <View className='dialog-wrapper'>
        <View className='dialog'>
          <Image className='img' src='https://h5.suixingou.com/miniprogram-assets/sxg/mine/downloadapp.png'></Image>
          <View className='close' onClick={onCloseCallback} ></View>
        </View>
      </View>
    )
  }
}
export default DownloadApp

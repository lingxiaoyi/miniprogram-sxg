import Taro, { Component } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';

import './novice.scss';

class Novice extends Component {
  config = {
    navigationBarTitleText: '新手教程',
    navigationBarTextStyle: 'white'
  };
  constructor() {
    super(...arguments);
    this.state = {
      currentTab: 'pdd'
    };
  }

  changeTabs(tabName) {
    this.setState({
      currentTab: tabName
    });
  }

  render() {
    // https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/jd_01.jpg
    const { currentTab } = this.state;
    return (
      <View className='novice' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='新手教程' bgstyle='black' fontstyle='light' />
        <View className='tabs' style>
          <View
            className={`tab ${currentTab === 'pdd' ? 'tab-pdd active' : 'tab-pdd'}`}
            onClick={this.changeTabs.bind(this, 'pdd')}
          >
            拼多多教程
          </View>
          <View
            className={`tab ${currentTab === 'jd' ? 'tab-jd active' : 'tab-jd'}`}
            onClick={this.changeTabs.bind(this, 'jd')}
          >
            京东教程
          </View>
        </View>
        <View className='course'>
          {currentTab === 'pdd' ? (
            <View className='course-pdd'>
              <Image
                className='img'
                mode='widthFix'
                src='https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/p_01.jpg'
              />
              <Image
                className='img'
                mode='widthFix'
                src='https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/p_02.jpg'
              />
              <Image
                className='img'
                mode='widthFix'
                src='https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/p_03.jpg'
              />
            </View>
          ) : (
            <View className='course-jd'>
              <Image
                className='img'
                mode='widthFix'
                src='https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/jd_01.jpg'
              />
              <Image
                className='img'
                mode='widthFix'
                src='https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/jd_02.jpg'
              />
              <Image
                className='img'
                mode='widthFix'
                src='https://h5.suixingou.com/miniprogram-assets/sxg/home/courses/jd_03.jpg'
              />
            </View>
          )}
        </View>
        <View className='btn-wrap'>
          <View
            className='btn'
            onClick={() => {
              Taro.switchTab({ url: '/pages/home/home' });
            }}
          >
            立即分享赚钱
          </View>
        </View>
      </View>
    );
  }
}

export default Novice;

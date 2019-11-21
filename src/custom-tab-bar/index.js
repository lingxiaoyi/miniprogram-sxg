import Taro, { Component } from '@tarojs/taro';
import { CoverView, CoverImage } from '@tarojs/components';

import './index.scss';

class Index extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      selected: 0,
      color: '#999999',
      selectedColor: '#dcad7c',
      list: [
        {
          pagePath: '/pages/home/home',
          text: '首页',
          iconPath: '/asset/home.png',
          selectedIconPath: '/asset/home_active.png'
        },
        {
          pagePath: '',
          text: '邀请有奖',
          iconPath: 'https://h5.suixingou.com/miniprogram-assets/sxg/invite.png',
          selectedIconPath: 'https://h5.suixingou.com/miniprogram-assets/sxg/invite.png'
        },
        // {
        //   pagePath: '/pages/parity/parity',
        //   text: '比价',
        //   iconPath: '/asset/parity.png',
        //   selectedIconPath: '/asset/parity_active.png'
        // },
        {
          pagePath: '/pages/mine/mine',
          text: '我的',
          iconPath: '/asset/mine.png',
          selectedIconPath: '/asset/mine_active.png'
        }
      ]
    };
  }

  switchTab(url, index) {
    if (index === 1) {
      // 分享
      // console.log('邀请有奖');
    } else {
      Taro.switchTab({ url });
      this.setState({
        selected: index
      });
    }
  }

  handleShare() {
    // 分享
    // console.log('点击了分享！');
  }

  render() {
    const { list, selected, color, selectedColor } = this.state;
    return (
      <CoverView class='tab-bar' style='display:none;'>
        <CoverView className='tab-bar-wrap'>
          {list.map((item, index) => (
            <CoverView
              key={index}
              class={`tab-bar-item item${index}`}
              onClick={this.switchTab.bind(this, item.pagePath, index)}
            >
              <CoverImage className='img' src={selected === index ? item.selectedIconPath : item.iconPath} />
              <CoverView className='txt' style={`color: ${selected === index ? selectedColor : color}`}>
                {item.text}
              </CoverView>
            </CoverView>
          ))}
        </CoverView>
        <CoverView className='share' onClick={this.handleShare}>
          <CoverImage className='img' src='../asset/share.png' />
          <CoverView className='txt'>分享</CoverView>
        </CoverView>
      </CoverView>
    );
  }
}

export default Index;

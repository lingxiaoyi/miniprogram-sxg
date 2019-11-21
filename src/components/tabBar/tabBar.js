import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image, Canvas, Button } from '@tarojs/components';
import { checkSettingStatusAndConfirm } from '../../utils/wx';
import Log from '../../utils/log';
import { generateInvitePoster } from '../../utils/canvas';

import './tabBar.scss';

import shareImg from '../../asset/share.png';
// import invite from '../../asset/invite.png';
// import inviteCard from '../../asset/share/invite_card.png';
import withLogin from '../../components/wrappedComponent/withLogin.js';

@withLogin('didMount')
class Index extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      selected: this.props.index,
      color: '#999999',
      selectedColor: '#dcad7c',
      list: [
        {
          pagePath: '/pages/home/home',
          text: '首页',
          iconPath: '../../asset/home.png',
          selectedIconPath: '../../asset/home_active.png'
        },
        {
          pagePath: '',
          text: '邀请有奖',
          iconPath: 'https://h5.suixingou.com/miniprogram-assets/sxg/invite.png',
          selectedIconPath: 'https://h5.suixingou.com/miniprogram-assets/sxg/invite.png'
        },
        {
          pagePath: '/pages/mine/mine',
          text: '我的',
          iconPath: '../../asset/mine.png',
          selectedIconPath: '../../asset/mine_active.png'
        }
      ],
      canvasImg: '',
      showShareModal: false,
      showInviteCard: false
    };
  }

  componentDidMount() {}
  loginSuccessCallback() {
    console.log('登陆成功'); //下一步任务
  }
  switchTab(url, index) {
    if (index !== 1) {
      Taro.switchTab({ url });
    }
    // 日志上报
    if (index === 0) {
      Log.click({ buttonfid: 'x_10103' });
    } else if (index === 2) {
      Log.click({ buttonfid: 'x_10119' });
    }
  }

  async handleShare() {
    const { userInfo } = this.props;
    const { invitecode } = userInfo.data;
    if (invitecode) {
      this.showSharePoster();
    }
    Log.click({ buttonfid: 'x_10116' });
  }

  /**
   * 生成并显示邀请图片
   */
  showSharePoster() {
    this.setState({
      showShareModal: true
    });
    if (!this.state.canvasImg) {
      Taro.showToast({
        title: '正在生成图片...',
        icon: 'loading'
      });
      const { figureurl, nickname, invitecode } = this.props.userInfo.data;
      let canvasId = 'canvas_show';
      generateInvitePoster({
        ctx: Taro.createCanvasContext(canvasId, this.$scope),
        nickName: nickname,
        avatarUrl: figureurl,
        scene: encodeURIComponent(`invitecode=${invitecode}`)
      }).then(() => {
        Taro.canvasToTempFilePath(
          {
            canvasId,
            fileType: 'jpg',
            quality: 0.8,
            destWidth: 1125,
            destHeight: 2031
          },
          this.$scope
        ).then(({ tempFilePath }) => {
          this.setState({
            canvasImg: tempFilePath
          });
        });
        Taro.hideToast();
      });
    }
  }

  async handleShareByInvite() {
    /* const { dispatch, loginInfo, userInfo } = this.props;
    const { accid } = loginInfo;
    const { invitecode } = userInfo.data;

    if (!accid) {
      // 未登录，跳登录页
      jumpUrl('/pages/login/login');
    } else {
      // 已登录，判断是否有邀请码等信息
      if (!invitecode) {
        await dispatch(userInfoActions.loadMineAsync());
        // 出错跳登录
        if (!this.props.userInfo.isAuth) {
          jumpUrl('/pages/login/login');
        } else {
          // 已登录且有邀请码等信息
          this.setState({
            showInviteCard: true
          });
        }
      } else {
        // 已登录且有邀请码等信息
        this.setState({
          showInviteCard: true
        });
      }
    } */
    this.setState({
      showInviteCard: true
    });
    Log.click({ buttonfid: 'x_10112' });
  }

  savePic() {
    Log.click({ buttonfid: 'x_10118' });
    if (!this.state.canvasImg) {
      return;
    }
    checkSettingStatusAndConfirm(
      'writePhotosAlbum',
      {
        title: '是否要打开设置页',
        content: '获取相册授权，请到小程序设置中打开授权'
      },
      status => {
        if (status || status === null) {
          Taro.saveImageToPhotosAlbum({
            filePath: this.state.canvasImg
          })
            .then(() => {
              Taro.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              });
            })
            .catch(() => {
              Taro.showToast({
                title: '保存失败',
                icon: 'none',
                duration: 2000
              });
            });
        } else {
          Taro.showToast({
            title: '授权失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    );
  }

  // async handleGetUserInfo(e) {
  //   const { userInfo } = e.detail;
  //   if (userInfo) {
  //     // 隐藏邀请图
  //     this.setState({
  //       showInviteCard: false,
  //       wxUserInfo: userInfo
  //     });
  //     // 已授权判断是否登录
  //     const hasLogin = await loginByUserInfo(e);
  //     if (hasLogin) {
  //       await this.getInviteCode();
  //       this.showSharePoster();
  //       // 已登录获取邀请码
  //       this.props.onHasLogin();
  //     }
  //   } else {
  //     Taro.showToast({ title: '授权失败', icon: 'none' });
  //   }
  // }

  // async getInviteCode() {
  //   // 已经登录，无邀请码的情况下，请求邀请码
  //   if (!this.props.userInfo.data.invitecode) {
  //     await this.props.dispatch(userInfoActions.loadMineAsync());
  //   }
  // }

  // async handleGetUserInfoByInvite(e) {
  //   const { userInfo } = e.detail;
  //   if (userInfo) {
  //     await this.getInviteCode();
  //     this.setState({
  //       wxUserInfo: userInfo,
  //       showInviteCard: true
  //     });
  //   } else {
  //     Taro.showToast({ title: '授权失败', icon: 'none' });
  //   }
  // }

  preview(e) {
    e.stopPropagation();
    Taro.previewImage({
      current: this.state.canvasImg, // 当前显示图片的http链接
      urls: [this.state.canvasImg] // 需要预览的图片http链接列表
    });
  }

  render() {
    const { list, selected, color, selectedColor, showShareModal, canvasImg, showInviteCard } = this.state;
    const { figureurl } = this.props.userInfo.data;
    const { userInfo } = this.props;
    const { invitecode } = userInfo.data;
    return (
      <View class='tab-bar'>
        <View className='tab-bar-wrap'>
          {list.map((item, index) => (
            <View
              key={index}
              className={`tab-bar-item item${index}`}
              onClick={this.switchTab.bind(this, item.pagePath, index)}
            >
              <Image className='img' src={selected === index ? item.selectedIconPath : item.iconPath} />
              <View className='txt' style={`color: ${selected === index ? selectedColor : color}`}>
                {item.text}
              </View>
              {index === 1 && invitecode ? (
                <Button className='btn' onClick={this.handleShareByInvite} />
              ) : (
                <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />
              )}
            </View>
          ))}
        </View>
        <View className='share-btn-wrap' onClick={this.handleShare}>
          <View className='share-btn'>
            <Image className='img' src={shareImg} />
            <View className='txt'>分享</View>
          </View>
          {!invitecode && <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />}
        </View>
        {showShareModal && (
          <View className='share-modal'>
            <View
              className='canvas-wrap'
              onClick={() => {
                this.setState({ showShareModal: false });
              }}
            >
              <Canvas
                canvasId='canvas_show'
                className='canvas-show'
                bindError={() => {
                  console.error('canvas_show error!!!');
                }}
              />
              {canvasImg && <Image className='canvas-img' src={canvasImg} onClick={this.preview.bind(this)} />}
            </View>
            <View className='btns-wrap'>
              <View className='item share'>
                <View className='icon wechat' />
                <View className='txt'>分享好友</View>
                <Button
                  openType='share'
                  className='btn'
                  onClick={() => {
                    Log.click({ buttonfid: 'x_10117' });
                  }}
                />
              </View>
              <View className='item save' onClick={this.savePic}>
                <View className='icon download' />
                <View className='txt'>保存图片</View>
              </View>
            </View>
          </View>
        )}
        {showInviteCard && (
          <View className='invite-card-wrap'>
            <View className='invite-card'>
              <Image
                src='https://h5.suixingou.com/miniprogram-assets/sxg/share/invite_card.png'
                className='invite-bg'
              />
              <Image src={figureurl} className='avatar' />
              <Button
                className='btn'
                onClick={() => {
                  this.setState({
                    showInviteCard: false
                  });
                  this.showSharePoster();
                  Log.click({ buttonfid: 'x_10113' });
                }}
              />
              {/* <Button openType='getUserInfo' className='btn' onGetUserInfo={this.handleGetUserInfo} /> */}
              <View
                className='close'
                onClick={() => {
                  this.setState({
                    showInviteCard: false
                  });
                }}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  return {
    userInfo,
    loginInfo
  };
}

export default connect(mapStateToProps)(Index);

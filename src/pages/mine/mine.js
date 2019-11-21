import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Button, Image } from '@tarojs/components';
import LayoutdataBox from './component/layoutdataBox';
import DownloadApp from './component/messagebox/downloadApp';
import TabBar from '../../components/tabBar/tabBar';
import './mine.scss';
import { jumpUrl, getGlobalData } from '../../utils/wx';
import Log from '../../utils/log';
import { userInfoActions } from '../../redux/modules/mine/index';
import TitleBar from '../../components/titleBar/titleBar';
import withLogin from '../../components/wrappedComponent/withLogin.js';

@withLogin('didMount')
class Mine extends Component {
  config = {
    navigationBarTitleText: '我的',
    enablePullDownRefresh: true
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDownloadApp: false
    };
  }
  //空方法不能删除,不然WithLogin包装方法不能执行
  async componentDidMount() {
    /* let { isAuth, token } = this.props;
    if (!isAuth && !token) {
      //如果没有登陆或者注册就跳到登陆页面
      jumpUrl('/pages/login/login');
    } */
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(userInfoActions.loadClearAsync());
  }
  async componentDidShow() {
    const wxThis = this.$scope;
    if (typeof wxThis.getTabBar === 'function' && wxThis.getTabBar()) {
      wxThis.getTabBar().setData({
        selected: 3
      });
    }
    //const { dispatch, userInfo } = this.props;
    //userInfo.accid && dispatch(userInfoActions.loadMineAsync());
  }
  loginSuccessCallback(){
    console.log('登陆成功');
  }
  async onPullDownRefresh() {
    const { dispatch } = this.props;
    await dispatch(userInfoActions.loadMineAsync());
    Taro.stopPullDownRefresh();
  }
  gotoPage(url) {
    jumpUrl(url);
  }
  //点击邀请大图
  handerClickInviteImg() {
    Log.click({ buttonfid: 'x_10125' });
  }
  //点击客服
  handerClickService() {
    Log.click({ buttonfid: 'x_10128' });
  }
  onShareAppMessage({ from }) {
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    let ic = myInvitecode || othersInvitecode;
    const { nickname } = this.props.userInfo;
    const name = nickname || '您的好友';
    if (from === 'menu') {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: ic ? `pages/login/login?invitecode=${ic}` : 'pages/home/home',
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxg//share/poster_invite.jpg'
      };
    } else {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: `pages/login/login?invitecode=${ic || ''}`,
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxg//share/poster_invite.jpg'
      };
    }
  }
  render() {
    const {
      figureurl = '',
      nickname,
      balance,
      incomeEstimateToday,
      incomeEstimateYesterday,
      incomeSettleThismonNew,
      incomeSettleTotal,
      invitecode,
      inviteeCnt,
      inviteecnttotal,
      inviteeCntToday,
      inviteeCntYesterday,
      memberlevel,
      orderCntToday,
      orderCntYesterday
    } = this.props.userInfo;
    const { showDownloadApp } = this.state;
    let urls = {
      fans: '/pages/mine/fans/fans',
      earnings: '/pages/mine/earnings/earnings', //我的收益
      withdrawal: '/pages/mine/withdrawal/withdrawal', //提现纪录
      commission: '/pages/mine/commission/commission', //结算佣金记录
      order: '/pages/mine/order/order'
    };
    let fansBoxInfo = {
      title: '我的粉丝',
      content: [
        {
          text: '全部直属',
          num: inviteeCnt
        },
        {
          text: '今日直属',
          num: inviteeCntToday
        },
        {
          text: '昨日直属',
          num: inviteeCntYesterday
        }
      ],
      jumpToUrl: urls.fans,
      buttonfid: 'x_10122'
    };
    let earningsBoxInfo = {
      title: '我的收益',
      content: [
        {
          text: '今日预估收益',
          num: incomeEstimateToday
        },
        {
          text: '昨日预估收益',
          num: incomeEstimateYesterday
        }
      ],
      jumpToUrl: urls.earnings,
      buttonfid: 'x_10123'
    };
    let orderBoxInfo = {
      title: '我的订单',
      content: [
        {
          text: '今日订单数',
          num: orderCntToday
        },
        {
          text: '昨日订单数',
          num: orderCntYesterday
        }
      ],
      jumpToUrl: urls.order,
      buttonfid: 'x_10124'
    };
    return (
      <View
        className='main-wrapper'
        style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
      >
        <TitleBar title='我的页面' hideBack />
        {invitecode ? (
          <View className='main'>
            {/* {userInfoView} */}
            <View className='sec1'>
              <View className='sec1-con'>
                <View className='head-img'>
                  <Image className='img' src={figureurl} />
                </View>
                <View className='info'>
                  <View className='row1'>
                    <View className='name'>{invitecode ? nickname || '没有昵称' : '未登录'}</View>
                    <View className={memberlevel === 1 ? 'grade-box dls' : 'grade-box cjhy'} />
                  </View>
                  <View className='row2'>
                    <Text className='p'>
                      粉丝 <Text className='num'>{inviteecnttotal}</Text>
                    </Text>
                    <Text className='p'>邀请码：{invitecode}</Text>
                    <View
                      className='btn-copy'
                      onClick={() => {
                        Taro.setClipboardData({ data: invitecode })
                          .then(() => {
                            /* Taro.showToast({
                              title: '复制成功',
                              icon: 'success'
                            }); */
                            Log.clipboard({ content: invitecode });
                          })
                          .catch(() => {
                            /* Taro.showToast({
                              title: '复制失败',
                              icon: 'fail'
                            }); */
                          });
                        Log.click({ buttonfid: 'x_10120' });
                      }}
                    >
                      复制
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View className='sec2' onClick={this.gotoPage.bind(this, urls.earnings)}>
              <View className='ul'>
                <View className='li'>
                  <Text className='h3'>{incomeSettleThismonNew}</Text>
                  <Text className='text'>即将到账佣金(元)</Text>
                </View>
                <View className='li'>
                  <Text className='h3'>{incomeEstimateToday}</Text>
                  <Text className='text'>今日预估佣金(元)</Text>
                </View>
                <View className='li'>
                  <Text className='h3'>{incomeSettleTotal}</Text>
                  <Text className='text'>累计预估收益(元)</Text>
                </View>
              </View>
            </View>
            <View className='sec3'>
              <View className='left'>
                <Text className='num'>{balance}</Text>
                <Text className='h3'>可提现金额</Text>
              </View>
              <View
                className='btn-down-app'
                onClick={() => {
                  this.setState({
                    showDownloadApp: true
                  });
                  Log.click({ buttonfid: 'x_10121' });
                }}
              >
                提现
              </View>
            </View>
            <View className='sec4'>
              <LayoutdataBox boxInfo={fansBoxInfo} />
              {/* <View className='sec-invite' onClick={this.handerClickInviteImg} /> */}
              <LayoutdataBox boxInfo={earningsBoxInfo} />
              <LayoutdataBox boxInfo={orderBoxInfo} />
              {showDownloadApp && (
                <DownloadApp
                  onCloseCallback={() => {
                    this.setState({
                      showDownloadApp: false
                    });
                  }}
                />
              )}
            </View>
            <View className='sec5'>
              <View
                className='btn'
                onClick={() => {
                  jumpUrl('/pages/zy/order/list/list');
                }}
              >
                <Text className='text'>随心购物精选订单</Text>
                <Text className='icon' />
              </View>
            </View>
            <View className='sec5'>
              <Button className='btn' openType='contact' onClick={this.handerClickService}>
                <Text className='text'>联系客服</Text>
                <Text className='icon' />
              </Button>
            </View>
            <View className='sec-fill' />
          </View>
        ) : (
          <View className='main-login'>
            <View className='head'>
              <View className='head-img' />
              <View className='p'>未登录</View>
            </View>
            {/* <Button className='btn-confirm'>授权登录</Button> */}
            <Button
              className='btn-confirm'
              openType='getUserInfo'
              onGetUserInfo={this.onAuthConfirmClick}
            >
              授权登录
            </Button>
          </View>
        )}
        <TabBar index={2} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loading, loadFailed, data, isAuth } = state.mine.userInfo;
  const { token } = state.login.loginInfo;
  return {
    loading,
    loadFailed,
    userInfo: data,
    isAuth,
    token
  };
}

export default connect(mapStateToProps)(Mine);

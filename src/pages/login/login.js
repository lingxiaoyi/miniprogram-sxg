import Taro, { Component } from '@tarojs/taro';
import { View, Button, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './login.scss';
import { getGlobalData, jumpUrl, register, loginAndConnection, saveMyInvitecode } from '../../utils/wx';
import TitleBar from '../../components/titleBar/titleBar';
import { loginInfoActions, inviteInfoActions } from '../../redux/modules/login/index';
import Log from '../../utils/log';
import headImg from '../../asset/mine/head.png';

class Login extends Component {
  config = {
    navigationBarTitleText: '授权登录'
  };
  constructor() {
    super(...arguments);
    this.state = { showSkip: false };
    this.data = {
      token: ''
    };
    this.invitecode = '';
    this.flag = true;
  }
  async componentDidMount() {
    const { dispatch } = this.props;
    const token = getGlobalData('sxg_token'); //没有token说明用户第一次进来需要注册
    this.data.token = token;
    /* this.data.params = this.$router.params;
    let { invitecode, scene } = this.$router.params;
    if (!invitecode && scene) {
      let dsence = await getScene(scene);
      invitecode = dsence.invitecode;
    } */
    let invitecode = getGlobalData('othersInvitecode');
    if (invitecode) {
      this.invitecode = invitecode;
      await dispatch(inviteInfoActions.loadInviterinfoAsync(invitecode));
      Log.click({ buttonfid: 'x_10140' });
    }
    const curPages = Taro.getCurrentPages();
    if (curPages.length >= 2) {
      this.from = curPages[curPages.length - 2].route;
    }
    if (curPages.length === 1 && invitecode) {
      //如果是页面路由只有1个并且有邀请码显示跳过按钮
      this.setState({
        showSkip: true
      });
    }
    getGlobalData('login').then(res => {
      if (res.accid) {
        this.skipNextPage();
      }
    });
    //this.checkUserAuth();
  }
  componentDidShow() {
    if (this.props.token) {
      this.skipNextPage();
    }
  }
  componentWillUnmount() {
    //清空邀请人的信息
    let { dispatch } = this.props;
    dispatch(inviteInfoActions.loadClearAsync());
  }
  /* componentWillReceiveProps(nextProps) {
    //console.log('nextProps', nextProps);
    if (nextProps.token) {
      this.skipNextPage();
    }
  } */
  //检查用户是否授权
  checkUserAuth() {
    if (this.data.token) {
      this.skipNextPage();
    }
  }
  async onAuthConfirmClick(info) {
    let token = getGlobalData('sxg_token'); //可能token保存的慢,会晚于loginAndConnection接口返回的 所以判断一下,后期有没有
    if (token) {
      this.skipNextPage();
      return;
    }
    if (this.props.loading) {
      /* Taro.showToast({
        title: '登陆太频繁,稍等重试',
        icon: 'none'
      }); */
      return;
    } //app.js中loginAndConnection请求还在进行中  不容许用户点击登录2次,不然时间间隔短.服务器会解密失败
    let openid = getGlobalData('sxg_openid');
    if (!this.flag) return; //防止多次请求
    if (!openid && this.flag) {
      //无openid重新请求获取
      this.flag = false;
      try {
        let data = await loginAndConnection();
        await this.props.dispatch(loginInfoActions.saveLoginInfo(data));
        if (data.stat === 0) {
          this.skipNextPage();
          return;
        }
      } catch (error) {
        console.error(error);
        return;
      } finally {
        this.flag = true;
      }
    }
    let { stat, data, msg } = await register(info); //获得openid但还没有注册走这一步
    if (stat === 0) {
      await this.props.dispatch(loginInfoActions.saveLoginInfo(data));
      saveMyInvitecode();
      //授权登陆成功
      this.skipNextPage();
    } else if (stat === 2) {
      //进入手机号注册的步骤
      if (!this.invitecode) {
        //有邀请码别人邀请链接 无邀请码我的页面过来
        jumpUrl('/pages/login/invitecode/invitecode');
      } else {
        jumpUrl('/pages/login/phone/phone');
      }
    } else if (stat === -5) {
      Taro.showToast({
        title: '登陆太频繁,稍等重试',
        icon: 'none'
      });
    } else {
      Taro.showToast({
        title: msg,
        icon: 'none'
      });
      console.error('出错了!!!');
    }
    Log.click({ buttonfid: 'x_10141' });
  }
  skipNextPage(value) {
    //console.log('skipNextPage>>>>>>>>>>>', this.from);
    if (this.from) {
      if (this.from.indexOf('mine') >= 0 || this.from.indexOf('home') >= 0) {
        Taro.switchTab({ url: `/${this.from}` });
      } else {
        //jumpUrl(`/${this.from}`);
        Taro.navigateBack();
      }
    } else {
      Taro.switchTab({ url: '/pages/home/home' });
    }
    if (value === 'log') {
      //这个值相等的时候才上报  点击跳过按钮
      Log.click({ buttonfid: 'x_10142' });
    }
  }
  render() {
    const { inviterinfo, loading } = this.props;
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='授权登录' />
        <View className='sec1 invite'>
          <Image className='img-banner' src='https://h5.suixingou.com/miniprogram-assets/sxg/mine/login-bg.png' />
          {this.state.showSkip && inviterinfo.figureurl && (
            <View className='sec'>
              <Image className='img-head' src={inviterinfo.figureurl || headImg} />
              <Text className='text'>邀请人 {inviterinfo.nickname}</Text>
            </View>
          )}
        </View>
        <View className='sec2'>
          <Button
            /* disabled={loading} */ loading={loading}
            className='btn-confirm'
            openType='getUserInfo'
            onGetUserInfo={this.onAuthConfirmClick}
          >
            微信授权登录
          </Button>
          {this.state.showSkip && (
            <View className='btn-skip' onClick={this.skipNextPage.bind('log')}>
              暂不注册
            </View>
          )}
        </View>
        <Text className='bottom-tips'>完成注册，享受购物省钱返利</Text>
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loadFailed, failedMsg, inviterinfo } = state.login.inviteInfo;
  const { loading, token } = state.login.loginInfo;
  return {
    loading,
    loadFailed,
    failedMsg,
    inviterinfo,
    token
  };
}
export default connect(mapStateToProps)(Login);

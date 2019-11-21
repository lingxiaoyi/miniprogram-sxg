import Taro, { Component } from '@tarojs/taro';
import { View, Button, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './phone.scss';
import imgIcon from '../../../asset/login/icon.png';
import { getGlobalData, registerByPhoneNumber, saveMyInvitecode } from '../../../utils/wx';
import TitleBar from '../../../components/titleBar/titleBar';
import { loginInfoActions } from '../../../redux/modules/login/index';
import { userInfoActions } from '../../../redux/modules/mine/index';
import Log from '../../../utils/log';

class Login extends Component {
  config = {
    navigationBarTitleText: '授权手机号'
  };
  constructor() {
    super(...arguments);
  }
  componentWillMount() {
    const curPages = Taro.getCurrentPages();
    if (curPages[curPages.length - 2].route === 'pages/login/login') {
      //从登陆页面过来
      if (curPages.length >= 3) {
        this.from = curPages[curPages.length - 3].route;
      } else {
        this.from = 'pages/home/home';
      }
    } else {
      if (curPages.length >= 2) {
        this.from = curPages[curPages.length - 2].route;
      } else {
        this.from = 'pages/home/home';
      }
    }
  }
  componentDidMount() {
    Log.click({ buttonfid: 'x_10143' });
  }
  async onGetPhoneNumber(info) {
    let invitecode = getGlobalData('othersInvitecode');
    let { stat, data, msg } = await registerByPhoneNumber(info, invitecode);
    if (stat === 0) {
      let {dispatch} = this.props;
      await dispatch(loginInfoActions.saveLoginInfo(data));
      await dispatch(userInfoActions.loadMineAsync());
      saveMyInvitecode();
      this.handleBackClick();
    } else if (stat === 1) {
      //手机号被占用
      console.error('手机号被占用');
      //this.handleBackClick();
    } else {
      Taro.showToast({
        title: msg,
        icon: 'none'
      });
      console.error('出错了!!!');
    }
  }
  handleBackClick() {
    Taro.navigateBack();
    /* if (this.from.indexOf('mine') >= 0 || this.from.indexOf('home') >= 0) {
      Taro.switchTab({ url: `/${this.from}` });
    } else {
      jumpUrl(`/${this.from}`);
    } */
    Log.click({ buttonfid: 'x_10144' });
  }
  skipNextPage() {
    Taro.switchTab({ url: '/pages/home/home' });
    Log.click({ buttonfid: 'x_10145' });
  }
  render() {
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='授权手机号' />
        <View className='sec1'>
          <Image className='img-icon' src={imgIcon} />
          <Text className='text'>购物省钱利器</Text>
        </View>
        <View className='sec2'>
          <Button className='btn-confirm' openType='getPhoneNumber' onGetPhoneNumber={this.onGetPhoneNumber}>
            授权手机号
          </Button>
          {/* <View className='btn-skip' onClick={this.skipNextPage}>
            跳过
          </View> */}
        </View>
        <Text className='bottom-tips'>完成注册，享受购物省钱返利</Text>
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loading, loadFailed, failedMsg, inviterinfo } = state.login.inviteInfo;
  return {
    loading,
    loadFailed,
    failedMsg,
    inviterinfo
  };
}
export default connect(mapStateToProps)(Login);

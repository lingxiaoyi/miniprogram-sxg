import Taro, { Component } from '@tarojs/taro';
import { View, Text, Input, Button, Image } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, registerByPhoneNumber, saveMyInvitecode } from '../../../utils/wx';
import './invitecode.scss';
import { loginInfoActions, inviteInfoActions } from '../../../redux/modules/login/index';
import { userInfoActions } from '../../../redux/modules/mine/index';
import Log from '../../../utils/log';

class Login extends Component {
  config = {
    navigationBarTitleText: '邀请码'
  };
  constructor() {
    super(...arguments);
    this.state = {
      inputText: '',
      disabled: true
    };
  }
  componentWillReceiveProps(newProps) {
    if (newProps.inviterinfo.figureurl) {
      this.setState({
        disabled: false
      });
    } else {
      this.setState({
        disabled: true
      });
    }
  }
  componentDidMount() {
    Log.click({ buttonfid: 'x_10146' });
  }
  componentWillUnmount() {
    //清空邀请人的信息
    let { dispatch } = this.props;
    dispatch(inviteInfoActions.loadClearAsync());
  }
  componentDidShow() {}

  componentDidHide() {}

  handlerInput(e) {
    const { dispatch } = this.props;
    this.setState({
      inputText: e.detail.value
    });
    if (e.detail.value.length === 7) {
      dispatch(inviteInfoActions.loadInviterinfoAsync(e.detail.value));
    }
  }
  goNextStep() {
    //let params = this.$router.params;
    if (!this.state.inputText) {
      Taro.showToast({
        title: '请输入邀请码',
        icon: 'none'
      });
    } else {
      if (this.state.disabled) {
        Taro.showToast({
          title: '请输入正确的邀请码',
          icon: 'none'
        });
        return;
      }
    }
  }
  handleBackClick() {
    Taro.navigateBack();
    /* const pages = Taro.getCurrentPages();
    let length = pages.length;
    if (length <= 2) {
      //层级小于等于2说明从login页面过来
      Taro.switchTab({
        url: '/pages/home/home'
      });
    } else {
      //从其他页面过来 mine 详情页 首页等
      let tabs = ['pages/mine/mine', 'pages/home/home'];
      if (tabs.indexOf(pages[length - 3].route) >= 0) {
        //区分switchTab和普通页面
        Taro.switchTab({
          url: '/pages/mine/mine'
        });
      } else {
        jumpUrl(`/${pages[length - 3].route}`);
      }
    } */
  }
  async onGetPhoneNumber(info) {
    Log.click({ buttonfid: 'x_10147' });
    let { stat, data, msg } = await registerByPhoneNumber(info, this.props.inviterinfo.invitecode);
    if (stat === 0) {
      let {dispatch} = this.props;
      await dispatch(loginInfoActions.saveLoginInfo(data));
      await dispatch(userInfoActions.loadMineAsync());
      saveMyInvitecode();
      this.handleBackClick();
    } /*  else if(stat === 1) { //手机号被占用
      this.handleBackClick();
    }  */ else {
      Taro.showToast({
        title: msg,
        icon: 'none'
      });
      console.error('出错了!!!');
    }
  }
  render() {
    const { disabled } = this.state;
    const { inviterinfo } = this.props;
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='邀请码' />
        <Text className='h3'>请输入邀请码</Text>
        <Input className='input' type='text' confirmType='' placeholder='邀请码' focus onInput={this.handlerInput} />
        {inviterinfo.figureurl && (
          <View className='sec'>
            <Image className='img-head' src={inviterinfo.figureurl} />
            <View className='info'>
              <Text className='h6'>{inviterinfo.nickname}</Text>
              <Text className='p'>邀请您加入随心购</Text>
            </View>
          </View>
        )}
        {disabled ? (
          <Button className='disabled btn-next' type='primary' onClick={this.goNextStep}>
            下一步
          </Button>
        ) : (
          <Button className='btn-next' openType='getPhoneNumber' onGetPhoneNumber={this.onGetPhoneNumber}>
            下一步
          </Button>
        )}
        <View className='invite-prompt'>请输入您或者邀请人的邀请码</View>
        {/* <View className='invite-prompt'>2.如果没有邀请码,请联系身边已注册随心购的朋友索要或者网络搜索随心购邀请码</View> */}
        <Image
          className='invite-banner'
          src='https://h5.suixingou.com/miniprogram-assets/sxg/login/invite-banner2.png'
          mode='widthFix'
        />
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

import Taro from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import {
  setGlobalData,
  loginAndConnection,
  register,
  jumpUrl,
  getScene,
  getGlobalData
} from '../../utils/wx';
import { loginInfoActions } from '../../redux/modules/login/index';
import { userInfoActions } from '../../redux/modules/mine/index';

const LIFE_CYCLE_MAP = ['willMount', 'didMount', 'didShow'];

/**
 *
 * 登录鉴权
 *
 * @param {string} [lifecycle] 需要等待的鉴权完再执行的生命周期 willMount didMount didShow
 * @returns 包装后的Component
 *
 */
function withLogin(lifecycle = 'willMount') {
  // 异常规避提醒
  if (LIFE_CYCLE_MAP.indexOf(lifecycle) < 0) {
    console.warn(`传入的生命周期不存在, 鉴权判断异常 ===========> $_{lifecycle}`);
    return Component => Component;
  }

  return function withLoginComponent(Component) {
    // 这里还可以通过redux来获取本地用户信息，在用户一次登录之后，其他需要鉴权的页面可以用判断跳过流程
    @connect(({ login }) => ({
      loginInfo: login.loginInfo
    }))
    class WithLogin extends Component {
      constructor(props) {
        super(props);
      }

      async componentWillMount() {
        if (super.componentWillMount) {
          if (lifecycle === LIFE_CYCLE_MAP[0]) {
            console.log('componentWillMount');
            const res = await this.$_autoLogin();
            if (!res) return;
          }

          super.componentWillMount();
        }
      }

      async componentDidMount() {
        if (super.componentDidMount) {
          if (lifecycle === LIFE_CYCLE_MAP[1]) {
            try {
              /* await this.$_autoLogin(); //自动登陆
              await this.$_autoGetUserInfo(); //获取用户信息 */
              await getGlobalData('login'); //用promise控制,登陆逻辑放到app.js,互不影响
              await getGlobalData('userInfoPromise');
              //await this.saveOthersInvitecode(); //获取他人的邀请码 已放app.js didShow加载
            } catch (error) {
              console.error(error)
            }
          }

          super.componentDidMount();
        }
      }

      async componentDidShow() {
        if (super.componentDidShow) {
          if (lifecycle === LIFE_CYCLE_MAP[2]) {
            try {
              await getGlobalData('login'); //用promise控制,登陆逻辑放到app.js,互不影响
              await getGlobalData('userInfoPromise');
            } catch (error) {
              console.error(error)
            }
          }

          super.componentDidShow();
        }
      }
      $_autoLogin = async () => {
        // ...这里是登录逻辑
        let {dispatch, loginInfo} = this.props;
        if(loginInfo.accid) {
          return loginInfo;
        } //已登录就不用再执行登陆操作了
        let { openid, token, accid, wxOpenid } = await loginAndConnection();
        dispatch(loginInfoActions.saveLoginInfo({ openid, token, accid, wxOpenid }));
      };
      //获取个人信息
      async $_autoGetUserInfo(){
        let {dispatch, loginInfo} = this.props;
        if(loginInfo.accid) {
          dispatch(userInfoActions.loadMineAsync());
        }
      }
      async saveOthersInvitecode() {
        //保存我的邀请码信息
        let { invitecode, scene } = this.$router.params;
        if (!invitecode && scene) {
          let dsence = await getScene(scene);
          invitecode = dsence.invitecode;
        }
        if (invitecode) {
          Taro.setStorageSync('othersInvitecode', invitecode);
          setGlobalData('othersInvitecode', invitecode);
        } else {
          invitecode = Taro.getStorageSync('othersInvitecode');
          if (invitecode) {
            setGlobalData('othersInvitecode', invitecode);
          }
        }
      }
      async onAuthConfirmClick(info) {
        //注册步奏1,获取用户基本信息
        let { stat, data, msg } = await register(info); //获得openid但还没有注册走这一步
        if (stat === 0) {
          let {dispatch} = this.props;
          await dispatch(loginInfoActions.saveLoginInfo(data));
          await dispatch(userInfoActions.loadMineAsync());
          //授权登陆成功
          this.loginSuccessCallback(); //登陆太快或者其他原因导致需要register登陆执行这个步骤
        } else if (stat === 2) {
          //进入手机号注册的步骤
          if (!getGlobalData('othersInvitecode')) {
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
      }
    }
    return WithLogin;
  };
}

export default withLogin;

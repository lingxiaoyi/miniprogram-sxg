import Taro from '@tarojs/taro';
import '@tarojs/async-await';
import { isEmptyObject } from './util';
import { requestWithForm, request, getPublicParameters, getScene } from './api';
import { PAGE_LEVEL_LIMIT, URL, QID } from '../constants/index';

export const globalData = {
  author: 'zhijun'
};

export function setGlobalData(key, val) {
  globalData[key] = val;
  //console.log('globalData>>>>>>>>>>>>>>>>>>>', globalData);
  return true;
}

export function getGlobalData(key) {
  return globalData[key];
}

/**
 * 检查授权情况
 * @param {string} scope 授权scope字符串，如：userInfo、writePhotosAlbum等
 * @param {object} param1 弹窗标题和内容信息
 * @returns null：已授权；未授权：弹窗提示用户授权，返回授权结果信息。
 */
export async function checkSettingStatus(scope) {
  let setting = await Taro.getSetting();
  let authSetting = setting.authSetting;
  if (!isEmptyObject(authSetting)) {
    if (authSetting[scope] === false) {
      /* const res = await Taro.showModal({
        title: title,
        content: content,
        showCancel: true
      });
      if (res.confirm) {
        setting = await Taro.openSetting();
        authSetting = setting.authSetting;
        if (!isEmptyObject(authSetting)) {
          if (authSetting[scope] === true) {
            return getUserInfo();
          }
        }
      } else {
        return null;
      } */
      return null;
    } else {
      return getUserInfo();
    }
  } else {
    return null;
  }
}

/**
 * 检查授权情况如果未授权弹窗提示用户授权（只能通过回调方式，无法使用promise方式，否则不会打开设置界面）
 * @param {string} scope 授权scope字符串，如：userInfo、writePhotosAlbum等
 * @param {object} obj {title, content} 弹窗标题和内容信息
 * @param {function} st 回调方法，
 *  参数1：null：未进行过第一次授权；
 *        false：未成功授权，弹窗提示用户授权，返回授权结果信息；
 *        true：已成功授权。
 */
export function checkSettingStatusAndConfirm(scope, { title, content }, cb = () => {}) {
  Taro.getSetting({
    success: res => {
      // 返回值中只会出现小程序已经向用户请求过的权限
      let authSetting = res.authSetting;
      // 有授权记录
      if (!isEmptyObject(authSetting)) {
        // 有记录（说明之前授权过）
        if (authSetting.hasOwnProperty(`scope.${scope}`)) {
          // 未成功授权
          if (!authSetting[`scope.${scope}`]) {
            // 弹窗提示用户去设置界面授权（之前用户错过了第一次授权操作）
            Taro.showModal({
              title: title,
              content: content,
              showCancel: true,
              success: res1 => {
                // 用户同意授权，打开授权设置页面
                if (res1.confirm) {
                  Taro.openSetting({
                    success: res2 => {
                      cb(res2.authSetting[`scope.${scope}`]);
                      // authSetting = res2.authSetting;
                      // if (!isEmptyObject(authSetting)) {
                      //   cb(authSetting[`scope.${scope}`]);
                      // } else {
                      //   cb(null);
                      // }
                    }
                  });
                } else {
                  // 拒绝授权
                  cb(false);
                }
              }
            });
          } else {
            // 已经成功授权
            cb(true);
          }
        } else {
          // 如果authSetting['scope.xxxx']不存在，说明此操作没有进行过授权。可以直接调用接口进行授权操作。
          cb(null);
        }
      } else {
        // 无授权记录，可以直接调用接口进行授权操作。
        cb(null);
      }
    }
  });
}

// 获取用户信息
export async function getUserInfo() {
  let userInfo = getGlobalData('user_info');
  if (userInfo) {
    return userInfo;
  }
  try {
    const userData = await Taro.getUserInfo();
    return userData.userInfo;
  } catch (err) {
    console.log(err);
    console.log('getUserInfo error');
    return '';
  }
}

/**
 * 去登录
 * @param {string} url 需要跳转的页面
 * @param {object} data 参数对象
 */
export function goLogin(url = '/pages/login/login', data) {
  let arrpageShed = Taro.getCurrentPages();
  let strCurrentPage = '/' + arrpageShed[arrpageShed.length - 1].__route__;
  let _data = [];
  let _dataString = '';
  if (data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        _data.push(`${key}=${data[key]}`);
      }
    }
  }
  if (_data.length > 0) {
    _dataString = '?' + _data.join('&');
  }
  let returnpage = encodeURIComponent(strCurrentPage + _dataString);
  let urlString = `${url}?returnpage=${returnpage}`;
  // console.log(urlString)
  Taro.navigateTo({
    url: urlString
  });
}

/**
 * 获取当前系统信息
 * @returns
  {
    brand: '', //手机品牌
    model: '', //手机型号
    system: '', //操作系统版本
    pixelRatio: '', //设备像素比
    screenWidth: '', //屏幕宽度
    screenHeight: '', //屏幕高度
    windowWidth: '', //可使用窗口宽度
    windowHeight: '', //可使用窗口高度
    version: '', //微信版本号
    statusBarHeight: '', //状态栏的高度
    platform: '', //客户端平台
    language: '', //微信设置的语言
    fontSizeSetting: '', //用户字体大小设置。以“我-设置-通用-字体大小”中的设置为准，单位：px
    SDKVersion: '', //客户端基础库版本,
    isIpx: '' // iphone X系列手机
  }
 */
export function getSystemInfo() {
  const systemInfo = Taro.getSystemInfoSync() || {
    model: '',
    system: ''
  };
  // console.log(systemInfo);
  systemInfo.isIpx = systemInfo.model && systemInfo.model.indexOf('iPhone X') > -1 ? true : false;
  systemInfo.isAndroid = systemInfo.system && systemInfo.system.indexOf('Android') > -1 ? true : false;
  return systemInfo;
}

/**
 * 处理微信跳转超过10层
 * @param {string} url 路径
 * @param {object} options 参数，如：method：navigateTo/redirectTo
 */
export function jumpUrl(url, options = {}) {
  const pages = Taro.getCurrentPages();
  let method = options.method || 'navigateTo';
  if (url && typeof url === 'string') {
    if (method == 'navigateTo' && pages.length >= PAGE_LEVEL_LIMIT - 3) {
      method = 'redirectTo';
    }

    if (method == 'navigateToByForce') {
      method = 'navigateTo';
    }

    if (method == 'navigateTo' && pages.length == PAGE_LEVEL_LIMIT) {
      method = 'redirectTo';
    }

    Taro[method]({
      url
    });
  }
}

/**
 * 判断是否登陆过
 */
export async function isLogin() {
  try {
    await Taro.checkSession(); // 判断session_key是否失效
    return true;
  } catch (e) {
    console.warn('session_key 失效，自动重新登录', e);
    // session_key失效调用登录
    return false;
  }
}

/**
 * 登录并建立关联
 */
/* export async function loginAndConnection() {
  let openid = Taro.getStorageSync('sxg_openid');
  let token = Taro.getStorageSync('sxg_token');
  let accid = Taro.getStorageSync('sxg_accid');
  if (!(isLogin() && openid)) {
    const loginRes = await Taro.login();
    let res = await requestWithForm(URL.loginByOpenid, {
      code: loginRes.code,
      type: 2
    });
    res = await new Promise((resolve)=>{ // 将接口延时2秒返回 测试用
      setTimeout(() => {
        resolve(res)
      }, 10000);
    })
    const { data, stat } = res.data;
    if (parseInt(stat) == 0 || parseInt(stat) == 1) {
      // 缓存openid和token
      openid = data.openid;
      token = data.token;
      accid = data.accid;
      return { openid, token, accid, stat };
    } else if (parseInt(stat) == -5) {
      openid = data.openid;
      console.error('msg', res.data.msg, '重复登陆太快');
    }
  }
  return { openid, token, accid };
} */
/**
 * 登录并建立关联  每次打开小程序都登录
 */
export async function loginAndConnection() {
  let openid = '';
  let token = '';
  let accid = '';
  let wxOpenid = '';
  const loginRes = await Taro.login();
  let res = await requestWithForm(URL.loginByOpenid, {
    code: loginRes.code,
    type: 2
  });
  /* res = await new Promise((resolve)=>{ // 将接口延时2秒返回 测试用
      setTimeout(() => {
        resolve(res)
      }, 10000);
    }) */
  if (!res) {
    return { openid, token, accid, wxOpenid };
  }
  const { data, stat } = res.data;
  if (parseInt(stat) == 0 || parseInt(stat) == 1) {
    // 缓存openid和token
    openid = data.openid || '';
    token = data.token || '';
    accid = data.accid || '';
    wxOpenid = data.wxOpenid || '';
    return { openid, token, accid, wxOpenid, stat };
  } else if (parseInt(stat) == -5) {
    openid = data.openid;
    wxOpenid = data.wxOpenid;
    console.error('msg', res.data.msg, '重复登陆太快');
  }
  return { openid, token, wxOpenid, accid };
}

/**
 * 关联unionid
 * @param {object} info 授权信息
 * return false 失败
 */
export async function register(info) {
  try {
    if (info.detail.rawData) {
      const openid = getGlobalData('sxg_openid');
      setGlobalData('userInfo', info.target.userInfo);
      //注册流程
      let res = await requestWithForm(URL.decryptData, {
        encryptedData: info.detail.encryptedData,
        iv: info.detail.iv,
        openid: openid
      });
      return res.data;
    } else {
      Taro.showToast({
        title: '授权失败',
        icon: 'none'
      });
      return false;
    }
  } catch (error) {
    console.error(error);
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    });
    return false;
  }
}
/**
 * 通过手机号注册
 * @param {object} info 手机号授权信息
 * @param {string} invitecode 邀请码
 * return false 失败
 */
export async function registerByPhoneNumber(info, invitecode) {
  try {
    if (info.detail.encryptedData) {
      const openid = getGlobalData('sxg_openid');
      let userInfo = getGlobalData('userInfo');
      let systemInfo = getSystemInfo();
      let publicParameters = {
        encryptedData: info.detail.encryptedData,
        iv: info.detail.iv,
        openid,
        invitecode,
        figureurl: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        sex: userInfo.gender,
        os: systemInfo.system,
        device: systemInfo.model,
        appqid: getGlobalData(QID),
        appver: '',
        imei: systemInfo.platform === 'ios' ? 'idfv' : ''
      };
      let res = await requestWithForm(URL.registerother, publicParameters);
      return res.data;
    } else {
      Taro.showToast({
        title: '授权失败',
        icon: 'none'
      });
      return false;
    }
  } catch (error) {
    console.error(error);
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    });
    return false;
  }
}
//保存个人信息邀请码 会员等级
export async function saveMyInvitecode() {
  //保存我的邀请码信息
  let publicParameters = await getPublicParameters();
  let res = await request(URL.getuserbaseinfo, publicParameters, 'get');
  if (res.data.stat === 0) {
    Taro.setStorageSync('myInvitecode', res.data.invitecode);
    setGlobalData('myInvitecode', res.data.invitecode);
    Taro.setStorageSync('memberlevel', res.data.memberlevel);
    setGlobalData('memberlevel', res.data.memberlevel);
  }
}

export async function saveOthersInvitecode() {
  //保存我的邀请码信息
  let { invitecode, scene } = this.$router.params.query;
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

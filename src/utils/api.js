import Taro from '@tarojs/taro';
import { getSystemInfo, setGlobalData, getGlobalData } from './wx';
import { parse } from './util';
import { APPVER, URL } from '../constants/index';
import sign from './sign';
/**
 * 数据请求
 * @param {string} url
 * @param {object} data 数据对象
 * @param {string} method 请求方式
 * @param {string} token 请求方式
 */
async function request(url, data, method = 'post', token = '') {
  token = getGlobalData('sxg_token') || '';
  let res = {};
  try {
    Taro.showLoading({ title: '加载中' });
    res = await Taro.request({
      url,
      data,
      method,
      header: {
        'content-type': 'application/json',
        token: token
      }
    });
    /* res = await new Promise((resolve)=>{ // 将接口延时2秒返回 测试用
      setTimeout(() => {
        resolve(res)
      }, 2000);
    }) */
  } catch (error) {
    console.error(`调用接口${url}出错！`, error);
    //jumpUrl('/pages/nonetwork/nonetwork')
  } finally {
    Taro.hideLoading();
  }
  return res;
}

async function requestWithoutLoading(url, data, method = 'post', token = '') {
  token = getGlobalData('sxg_token') || '';
  let res = {};
  try {
    res = await Taro.request({
      url,
      data,
      method,
      header: {
        'content-type': 'application/json',
        token: token
      }
    });
    /* res = await new Promise((resolve)=>{ // 将接口延时2秒返回 测试用
      setTimeout(() => {
        resolve(res)
      }, 2000);
    }) */
  } catch (error) {
    console.error(`调用接口${url}出错！`, error);
  }
  return res;
}

async function requestWithForm(url, data) {
  let res = {};
  try {
    Taro.showLoading({ title: '加载中' });
    // Taro.showToast({ title: '加载中', icon: 'loading' });
    res = await Taro.request({
      url,
      method: 'POST',
      data,
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      dataType: 'json'
    });
  } catch (error) {
    console.error(`调用接口${url}出错！`, error);
    //jumpUrl('/pages/nonetwork/nonetwork')
    return false;
  } finally {
    Taro.hideLoading();
    // Taro.hideToast();
  }
  return res;
}

async function requestWithParameters(url, data) {
  return await requestWithForm(url, { ...(await getPublicParameters()), ...data });
}

async function requestWithFormMD5(url, data) {
  return await requestWithForm(
    url,
    sign({
      ts: ('' + new Date().getTime()).substring(0, 10) / 1,
      ...data
    })
  );
}

async function requestWithParametersToken(url, data) {
  return await request(
    url,
    {
      ...(await getPublicParameters()),
      ...data
    },
    'get'
  );
}

/**
 * 拼多多商品接口
 * @param {string} url
 * @param {object} data 数据对象
 */
async function requestPdd(url, data) {
  return await requestWithFormMD5(url, {
    pid: 54291221,
    ...data
  });
}

/**
 * 京东商品接口
 * @param {string} url
 * @param {object} data 数据对象
 */
async function requestJd(url, data) {
  return await requestWithFormMD5(url, {
    ...data
  });
}

async function getPublicParameters() {
  let publicParameters = getGlobalData('publicParameters');
  let openid = getGlobalData('sxg_openid') || '';
  let accid = getGlobalData('sxg_accid') || '';
  if (!publicParameters) {
    let systemInfo = getSystemInfo();
    let res = await Taro.getNetworkType();
    setGlobalData('publicParameters', {
      apptypeid: 'sxg_xcx',
      openid: openid,
      appqid: 'sxg_xcx',
      softname: 'sxg_xcx',
      softtype: 'sxg_xcx',
      ver: 'sxg_xcx',
      os: systemInfo.system,
      device: systemInfo.model,
      appver: APPVER,
      iswifi: res.networkType || '',
      position: '',
      accid: accid //todo需要改成获取的 accid
    });
  } else {
    setGlobalData('publicParameters', {
      ...publicParameters,
      openid: openid,
      accid: accid //todo需要改成获取的 accid
    });
  }
  return getGlobalData('publicParameters');
}

/**
 * 获取小程序码图片
 * @param {object} param0 参数对象，说明如下：
    page: 非必传 进入小程序的页面路径 不传进首页
    width: 非必传 二维码的宽度，单位 px。最小 280px，最大 1280px 默认430
    auto_color: 非必传 自动配置线条颜色 默认false
    is_hyaline: 非必传 默认false 背景是否透明
    r: 非必传 线条颜色 默认0 auto_color 为 false 时生效
    g: 非必传 线条颜色 默认0 auto_color 为 false 时生效
    b: 非必传 线条颜色 默认0 auto_color 为 false 时生效
    scene: 携带参数 参数格式前台自定义
 */
function getEwm({ page = 'pages/home/home', width, is_hyaline = false, scene = '' }) {
  return `${URL.ewm}?page=${page}&is_hyaline=${is_hyaline}&width=${width}&scene=${scene}`;
}

async function getScene(key) {
  const url = `${URL.ewmopt}?key=${key}`;
  let scene = await Taro.request({ url });
  // console.log('--------------------');
  // console.log(key, scene.data);
  // console.log('--------------------');
  scene = decodeURIComponent(scene.data);
  return parse(scene);
}

export {
  request,
  requestWithoutLoading,
  requestWithForm,
  requestWithFormMD5,
  requestPdd,
  requestJd,
  getPublicParameters,
  getEwm,
  getScene,
  requestWithParameters,
  requestWithParametersToken
};

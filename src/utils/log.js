import Taro from '@tarojs/taro';
import { getSystemInfo, getGlobalData } from './wx';
import { APPVER, URL, QID, DEFAULT_QID } from '../constants';

async function getPublicParameters() {
  let systemInfo = getGlobalData('system_info');
  if (!systemInfo) {
    systemInfo = getSystemInfo();
  }
  let res = await Taro.getNetworkType();
  let openid = '';
  try {
    openid = Taro.getStorageSync('sxg_openid');
  } catch (e) {
    openid = '';
  }
  let accid = '';
  try {
    accid = Taro.getStorageSync('sxg_accid');
  } catch (e) {
    accid = '';
  }
  let option = {
    ime: openid, //小程序传openid
    // qid: getGlobalData(QID) || 'sxgxcx',
    appqid: getGlobalData(QID) || DEFAULT_QID,
    softtype: 'sxgxcx',
    softname: 'sxgxcx',
    ver: 'sxgxcx',
    os: systemInfo.system,
    osver: systemInfo.version, //操作系统版本号
    appver: APPVER, //小程序版本号
    accid: accid, //App用户的注册id
    apptypeid: 'sxgxcx' //小程序传openid
  };
  let result = {
    active: {
      //落地页日志
      ...option,
      pagetype: '', //页面类型(商品详情页：goods、专题页：project、H5页面：h5)
      goodsid: '', //商品详情页：传商品ID、专题页：传专题页id、H5页面：传页面url
      firsttype: '', //商品一级类别（可不传）
      secondtype: '', //商品二级类别（可不传）
      firstsource: '', //来源
      secondsource: '', //来源子属性(推送时传推送id)
      thirdsource: '', //来源三级属性(推送时传推送平台)
      pgnum: 1, //当前商品属于第几页，如果非信息流则默认传1
      idx: '', //当前商品的idx属性
      searchwords: '', //（针对搜索）是通过哪个搜索词获取的商品
      ishot: '', //是否是热销商品（暂时不传）
      isrecommend: '', //是否是推荐商品（暂时不传）
      topsource: '', //顶级来源
      topsourceid: '', //顶级来源id
      goodssource: '' // 商品来源(淘宝：taobao、考拉：kaola、拼多多：pingduoduo、京东：jingdong)
    },
    click: {
      //打点日志
      ...option,
      dotposition: '', // 打点位置
      goodsid: '', // 商品ID
      buttonfid: '', // 打点ID
      buttonsid: '', // 打点子ID
      from: '', // 跳转来源地址
      to: '', // 跳转地址
      firstsource: '', // 来源
      secondsource: '', // 来源子属性(推送时传推送id)
      thirdsource: '', // 来源三级属性(推送时传推送平台)
      topsource: '', // 顶级来源
      topsourceid: '', // 顶级来源id
      goodssource: '' // 商品来源(淘宝：taobao、考拉：kaola、拼多多：pingduoduo、京东：jingdong)
    },
    online: {
      //启动日志
      ...option,
      device: systemInfo.model, //设备机型
      loginname: '', // App用户的登录名称
      mobile: '', // 登录用户的手机号
      position: '', // 地域信息
      iswifi: res.networkType || '',
      localtime: '', // 本地上传日志时间戳（精确到秒/s）
      wakeway: '', // 唤醒方式
      citypos: '', // gps定位的城市
      sublocal: '', // ps定位的区、县
      hispos: '', // 历史地域（具体获取几天的历史数据由云控决定）。格式：pro01(省),city01(市)|pro02,city02|pro03,city03
      openway: '', // 分享平台打开入口
      registid: '', // 极光传注册id；小米传注册id；华为传token
      appinfo: '', // 设备信息，以json格式上报，包含mac、ssid、bssid等信息
      opentype: '', // opentype分3种：小程序-拼多多商品详情页（传3）、小程序-京东商品详情页（传4）、小程序其他页面（传5）；
      opentypevalue: '', // opentype传3时，传商品id、opentype传4时，传商品id、opentype传5时，传完整页面路径
      diftime: '', // 离开前台的时间，精确到毫秒（取整）
      gexiangid: '', // 个像ID
      auxiliary: '', // 下载安装辅助功能状态（0：辅助功能关闭；1 辅助功能新开启；2 辅助功能已开启）
      cid: '' // 个推id
    },
    clipboard: {
      ...option,
      content: '' //剪切板内容
    },
    intoscreen: {
      //banner进屏日志：
      ...option,
      bannerid: '' //bannerid
    }
  };
  return result;
}

/**
 * 日志接口封装
 * @param {*} data 需要传的合并数据形式{pagetype: 1}
 * @param {*} type active click clipboard intoscreen
 */
async function request(type, data) {
  let logPublicParameter = await getPublicParameters();
  logPublicParameter = logPublicParameter[type];
  Taro.request({
    url: URL.log[type],
    data: {
      ...logPublicParameter,
      ...data
    },
    method: 'POST',
    header: {
      'content-type': 'application/json'
    }
  });
}

/**
 *  content-type application/x-www-form-urlencoded
 * @param {*} data 需要传的合并数据形式{pagetype: 1}
 * @param {*} type active click clipboard intoscreen
 */
async function requestWithForm(type, data) {
  let logPublicParameter = await getPublicParameters();
  logPublicParameter = logPublicParameter[type];
  Taro.request({
    url: URL.log[type],
    data: {
      ...logPublicParameter,
      ...data
    },
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    dataType: 'json'
  });
}

/**
 * 启动日志
 * @param {object} data 自定义日志参数
 */
function online(data) {
  let count = 10;
  const timer = setInterval(() => {
    if (Taro.getStorageSync('sxg_openid') || count === 1) {
      requestWithForm('online', data);
      clearInterval(timer);
    }
    count--;
  }, 100);
}

/**
 * 打点日志
 * @param {object} data 自定义日志参数
 */
function click(data) {
  requestWithForm('click', data);
}

/**
 * 落地页日志
 * @param {object} data 自定义日志参数
 */
function active(data) {
  let count = 10;
  const timer = setInterval(() => {
    if (Taro.getStorageSync('sxg_openid') || count === 1) {
      requestWithForm('active', data);
      clearInterval(timer);
    }
    count--;
  }, 100);
}

/**
 * 剪切板日志
 * @param {object} data 自定义日志参数
 */
function clipboard(data) {
  requestWithForm('clipboard', data);
}

/**
 * banner进屏日志
 * @param {object} data 自定义日志参数
 */
function intoscreen(data) {
  requestWithForm('intoscreen', data);
}

/*
使用方式：
import Log from '../../../utils/log';
Log.active({ });
Log.click({ });
Log.requestWithForm('active', { });
*/
export default {
  online,
  click,
  active,
  clipboard,
  intoscreen,
  request,
  requestWithForm
};

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!Object.values) {
  Object.values = function values(O) {
    return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
  };
}

function isEmptyObject(obj) {
  if (!obj) {
    return true;
  }
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

// 获取地址里的query param
function getQueryParam(url, param) {
  if (url.split('?').length === 2) {
    let params = url.split('?')[1].split('&');
    let obj = {};
    for (let i = 0; i < params.length; i++) {
      let key = params[i].split('=')[0];
      let val = params[i].split('=')[1];
      obj[key] = val;
    }
    return obj[param];
  }
}

//拼接url
function createUrl(url, params) {
  let newUrl = '';
  if (url && params) {
    for (let key in params) {
      if (params[key]) {
        let item = '&' + key + '=' + params[key];
        newUrl += item;
      }
    }
  }

  url = url.indexOf('?') > -1 ? url + newUrl : url + '?' + newUrl.substr(1);
  return url.replace(' ', '');
}

function parseDate(time) {
  if (time instanceof Date) {
    return time;
  }
  if (time) {
    time = typeof time === 'string' ? time.replace(/-/g, '/') : time;
    return new Date(time);
  }
  return new Date();
}

function getWeekDay(time) {
  const date = parseDate(time);
  return WEEK_DAYS[date.getDay()];
}

function getParseDay(time, weekDay, symbol) {
  symbol = symbol || '-';
  const date = parseDate(time);
  const month = date.getMonth() + 1;
  const parseMonth = month.toString().length < 2 ? `0${month}` : month;
  let lparseDate = date.getDate();
  lparseDate = lparseDate.toString().length < 2 ? `0${lparseDate}` : lparseDate;
  let parseDay = weekDay
    ? `${date.getFullYear()}${symbol}${parseMonth}${symbol}${lparseDate} ${WEEK_DAYS[date.getDay()]}`
    : `${date.getFullYear()}${symbol}${parseMonth}${symbol}${lparseDate}`;
  return parseDay;
}

function getParseTime(time) {
  const date = parseDate(time);
  const hours = date.getHours().toString().length > 1 ? date.getHours() : `0${date.getHours()}`;
  const minutes = date.getMinutes().toString().length > 1 ? date.getMinutes() : `0${date.getMinutes()}`;
  const seconds = date.getSeconds().toString().length > 1 ? date.getSeconds() : `0${date.getSeconds()}`;
  return `${hours}:${minutes}:${seconds}`;
}

function parseMoney(num) {
  num = num.toString().replace(/\$|,/g, '');
  if (Number.isNaN(num)) num = '0';

  // let sign = (num === (num = Math.abs(num)))

  num = Math.floor(num * 100 + 0.50000000001);
  let cents = num % 100;
  num = Math.floor(num / 100).toString();

  if (cents < 10) cents = '0' + cents;
  for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  return num + '.' + cents;
}

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  let last, deferTimer;
  return function() {
    let context = scope || this;

    let now = +new Date();
    let args = arguments;
    if (last && now < last + threshhold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

function jsonToQueryString(json) {
  return (
    '?' +
    Object.keys(json)
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
      })
      .join('&')
  );
}

function queryStringToJson(queryString) {
  if (queryString.indexOf('?') > -1) {
    queryString = queryString.split('?')[1];
  }
  const pairs = queryString.split('&');
  const result = {};
  pairs.forEach(pair => {
    pair = pair.split('=');
    result[pair[0]] = decodeURIComponent(pair[1] || '');
  });
  return result;
}

function uuid(len = 8, radix = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const value = [];
  let i = 0;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) value[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    /* eslint-disable-next-line */
    value[8] = value[13] = value[18] = value[23] = '-';
    value[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!value[i]) {
        r = 0 | (Math.random() * 16);
        value[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return value.join('');
}

/**
 * 获取随机数
 * @param  {number} min 随机数下限
 * @param  {number} max 随机数上限
 * @return {number}     大于等于min且小于max的数
 */
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function compareVersion(v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);

  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

function formatTime(ms) {
  let date = new Date(ms * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // const hour = date.getHours();
  // const minute = date.getMinutes();
  // const second = date.getSeconds();

  const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n;
  };

  return [year, month, day].map(formatNumber).join('.');
}
/**
 * 将日期格式化成指定格式的字符串
 * @param date 要格式化的日期，不传时默认当前时间，也可以是一个时间戳
 * @param fmt 目标字符串格式，支持的字符有：y,M,d,q,w,H,h,m,S，默认：yyyy-MM-dd HH:mm:ss
 * @returns 返回格式化后的日期字符串
 */
function formatDate(date, fmt) {
  date = date == undefined ? new Date() : date;
  date = typeof date == 'number' ? new Date(date) : date;
  fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
  var obj = {
    y: date.getFullYear(), // 年份，注意必须用getFullYear
    M: date.getMonth() + 1, // 月份，注意是从0-11
    d: date.getDate(), // 日期
    q: Math.floor((date.getMonth() + 3) / 3), // 季度
    w: date.getDay(), // 星期，注意是0-6
    H: date.getHours(), // 24小时制
    h: date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, // 12小时制
    m: date.getMinutes(), // 分钟
    s: date.getSeconds(), // 秒
    S: date.getMilliseconds() // 毫秒
  };
  var week = ['天', '一', '二', '三', '四', '五', '六'];
  for (var i in obj) {
    fmt = fmt.replace(new RegExp(i + '+', 'g'), function(m) {
      var val = obj[i] + '';
      if (i == 'w') return (m.length > 2 ? '星期' : '周') + week[val];
      for (var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val;
      return m.length == 1 ? val : val.substring(val.length - m.length);
    });
  }
  return fmt;
}

function priceConversion(price) {
  return price > 10000 ? (price - (price % 100)) / 10000 + '万' : price;
}

/**
   * 特定字符串转换成object对象
   * @param {string} str 目标字符串
   * @example
      a=Hello&b=lizhigao&c=0&d=123&e=null
      =>
      {
        a: 'Hello',
        b: 'lizhigao',
        c: 0,
        d: 123,
        e: null
      }
   */
function parse(str, splitstr = '&') {
  if (str === undefined || str === '') {
    return {};
  }
  let obj = {};
  let arr = str.split(splitstr);
  arr.map(value => {
    obj[value.split('=')[0]] = value.split('=')[1] || '';
  });
  return obj;
}

/**
   * 将obj对象转换成“&”符号连接的字符串
   * @param {object} obj json对象（暂时只支持基本类型不支持嵌套对象和数组）
   * @example
   *  {
        a: 'Hello',
        b: 'lizhigao',
        c: 0,
        d: 123,
        e: null
      }
      =>
      a=Hello&b=lizhigao&c=0&d=123&e=null
   *
   */
function stringify(obj, splitstr = '&') {
  return obj
    ? Object.keys(obj)
        .map(key => {
          const value = obj[key];
          if (value === undefined) {
            return '';
          }
          return encodeURI(key) + '=' + encodeURI(value);
        })
        .filter(x => x.length > 0)
        .join(splitstr)
    : '';
}

/**
 * @desc 解决浮动运算问题，避免小数点后产生多位数和计算精度损失。
 * 问题示例：2.3 + 2.4 = 4.699999999999999，1.0 - 0.9 = 0.09999999999999998
 */
/**
 * 把错误的数据转正
 * strip(0.09999999999999998)=0.1
 */
function strip(num, precision) {
  if (precision === void 0) {
    precision = 12;
  }
  return +parseFloat(num.toPrecision(precision));
}
/**
 * Return digits length of a number
 * @param {*number} num Input number
 */
function digitLength(num) {
  // Get digit length of e
  var eSplit = num.toString().split(/[eE]/);
  var len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0);
  return len > 0 ? len : 0;
}
/**
 * 把小数转成整数，支持科学计数法。如果是小数则放大成整数
 * @param {*number} num 输入数
 */
function float2Fixed(num) {
  if (num.toString().indexOf('e') === -1) {
    return Number(num.toString().replace('.', ''));
  }
  var dLen = digitLength(num);
  return dLen > 0 ? strip(num * Math.pow(10, dLen)) : num;
}
/**
 * 检测数字是否越界，如果越界给出提示
 * @param {*number} num 输入数
 */
function checkBoundary(num) {
  if (_boundaryCheckingState) {
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      console.warn(num + ' is beyond boundary when transfer to integer, the results may not be accurate');
    }
  }
}
/**
 * 精确乘法
 */
function times(num1, num2) {
  var others = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    others[_i - 2] = arguments[_i];
  }
  if (others.length > 0) {
    return times.apply(void 0, [times(num1, num2), others[0]].concat(others.slice(1)));
  }
  var num1Changed = float2Fixed(num1);
  var num2Changed = float2Fixed(num2);
  var baseNum = digitLength(num1) + digitLength(num2);
  var leftValue = num1Changed * num2Changed;
  checkBoundary(leftValue);
  return leftValue / Math.pow(10, baseNum);
}
/**
 * 精确加法
 */
function plus(num1, num2) {
  var others = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    others[_i - 2] = arguments[_i];
  }
  if (others.length > 0) {
    return plus.apply(void 0, [plus(num1, num2), others[0]].concat(others.slice(1)));
  }
  var baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
  return (times(num1, baseNum) + times(num2, baseNum)) / baseNum;
}
/**
 * 精确减法
 */
function minus(num1, num2) {
  var others = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    others[_i - 2] = arguments[_i];
  }
  if (others.length > 0) {
    return minus.apply(void 0, [minus(num1, num2), others[0]].concat(others.slice(1)));
  }
  var baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)));
  return (times(num1, baseNum) - times(num2, baseNum)) / baseNum;
}
/**
 * 精确除法
 */
function divide(num1, num2) {
  var others = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    others[_i - 2] = arguments[_i];
  }
  if (others.length > 0) {
    return divide.apply(void 0, [divide(num1, num2), others[0]].concat(others.slice(1)));
  }
  var num1Changed = float2Fixed(num1);
  var num2Changed = float2Fixed(num2);
  checkBoundary(num1Changed);
  checkBoundary(num2Changed);
  return times(num1Changed / num2Changed, Math.pow(10, digitLength(num2) - digitLength(num1)));
}
/**
 * 四舍五入
 */
function round(num, ratio) {
  var base = Math.pow(10, ratio);
  return divide(Math.round(times(num, base)), base);
}
var _boundaryCheckingState = true;
/**
 * 是否进行边界检查，默认开启
 * @param flag 标记开关，true 为开启，false 为关闭，默认为 true
 */
function enableBoundaryChecking(flag) {
  if (flag === void 0) {
    flag = true;
  }
  _boundaryCheckingState = flag;
}
/**
 * 千分位格式化 将数字每三位加,
 * @param {*} num  数字
 */
function toThousands(num) {
  var num = (num || 0).toString(), result = '';
  while (num.length > 3) {
      result = ',' + num.slice(-3) + result;
      num = num.slice(0, num.length - 3);
  }
  if (num) { result = num + result; }
  return result;
}
export {
  getQueryParam,
  getParseDay,
  isEmptyObject,
  parseMoney,
  getWeekDay,
  getParseTime,
  throttle,
  createUrl,
  jsonToQueryString,
  queryStringToJson,
  uuid,
  getRandom,
  compareVersion,
  formatTime,
  formatDate,
  priceConversion,
  parse,
  stringify,
  strip,
  plus,
  minus,
  times,
  divide,
  round,
  digitLength,
  float2Fixed,
  enableBoundaryChecking,
  toThousands
};

export default {
  getQueryParam,
  getParseDay,
  isEmptyObject,
  parseMoney,
  getWeekDay,
  getParseTime,
  throttle,
  createUrl,
  jsonToQueryString,
  queryStringToJson,
  uuid,
  getRandom,
  compareVersion,
  formatTime,
  formatDate,
  priceConversion,
  parse,
  stringify,
  strip,
  plus,
  minus,
  times,
  divide,
  round,
  digitLength,
  float2Fixed,
  enableBoundaryChecking,
  toThousands
};

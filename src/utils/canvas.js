import Taro from '@tarojs/taro';
// import { getGlobalData } from '../utils/wx';
import { getEwm } from './api';

// import posterPath from '../asset/share/poster_3x.jpg';

/* eslint-disable */
const defaultAvatarUrl = 'https://h5.suixingou.com/miniprogram-assets/sxg/mine/default-avatar.png';
const defaultPoster = 'https://h5.suixingou.com/miniprogram-assets/sxg/share/poster_invite.jpg';
/* eslint-enable */

/**
 * 将指定字符串按照一行显示指定字数切割成一个数组，并计算出行数（默认一行9个字）
 */
function optionStr(str, lineNum = 10) {
  let i = 0;
  let line = 1;
  let optstr = '';
  let list = [];
  for (let item of str) {
    if (item === '\n') {
      list.push(optstr);
      list.push('a');
      i = 0;
      optstr = '';
      line += 1;
    } else if (i === lineNum) {
      list.push(optstr);
      i = 1;
      optstr = item;
      line += 1;
    } else {
      optstr += item;
      i += 1;
    }
  }
  list.push(optstr);
  return {
    line: line,
    list: list
  };
}

/**
 * px转rpx
 */
function rpx(px) {
  // const { windowWidth } = getGlobalData('system_info');
  // return (px * windowWidth) / 750; // 750设计稿宽度
  return px;
}

export async function generateDetailsPoster({
  ctx = {}, // canvas上下文对象
  name = '商品名称标题', // 商品名称标题
  newPrice = 0, // 券后价
  oldPrice = 0, // 原价
  coupon = 0, // 优惠券金额
  // commission = 0, // 佣金
  pagePath = 'pages/details/pdd/pdd',
  poster = defaultPoster, // 'https://h5.suixingou.com/miniprogram-assets/sxg//share/poster_invite.jpg', // 海报
  avatarUrl = defaultAvatarUrl, // 默认头像
  nickName = '您的好友', // 昵称
  scene
}) {
  // ctx.rect(0, 0, rpx(480), rpx(866));
  // ctx.setFillStyle('yellow');
  // ctx.fill();
  // ctx.draw();

  // 背景图
  const { path: bgPath } = await Taro.getImageInfo({
    src: 'https://h5.suixingou.com/miniprogram-assets/sxg/share/bg_lg.png'
  });
  ctx.drawImage(bgPath, 0, 0, 720, 1299, 0, 0, rpx(480), rpx(866));

  // 推荐文案
  ctx.font = `normal normal ${rpx(26)}px PingFang-SC`;
  ctx.setFontSize(rpx(26));
  ctx.setFillStyle('#999999');
  if (nickName.length > 4) {
    nickName = nickName.substr(0, 4) + '...';
  }
  ctx.fillText(`${nickName}推荐给你一个好物！`, rpx(110), rpx(170));

  // 价格
  let priceLeft = rpx(30);
  let priceTop = rpx(700);
  ctx.font = `normal bold ${rpx(30)}px PingFang-SC`;
  let metrics = ctx.measureText('￥');
  ctx.setFontSize(rpx(30));
  ctx.setFillStyle('#fb5858');
  ctx.fillText('￥', priceLeft, priceTop);
  // 优惠价
  priceLeft += metrics.width;
  // console.log(priceLeft);
  ctx.font = `normal bold ${rpx(60)}px PingFang-SC`;
  metrics = ctx.measureText(String(newPrice));
  ctx.setFontSize(rpx(60));
  ctx.setFillStyle('#fb5858');
  ctx.fillText(String(newPrice), priceLeft, priceTop);
  // 原价
  priceLeft += metrics.width;
  ctx.font = `normal normal ${rpx(30)}px PingFang-SC`;
  metrics = ctx.measureText(`￥${oldPrice}`);
  ctx.setFontSize(rpx(30));
  ctx.setFillStyle('#999999');
  ctx.fillText(`￥${oldPrice}`, priceLeft + rpx(16), priceTop);
  // 删除线
  ctx.setStrokeStyle('#999999');
  ctx.setLineWidth(2);
  ctx.moveTo(priceLeft + rpx(16), priceTop - rpx(12));
  ctx.lineTo(priceLeft + rpx(16) + metrics.width + 4, priceTop - rpx(12));
  ctx.stroke();

  // 标题
  let { line, list } = optionStr(name);
  let txtHeight = rpx(36);
  if (line > 2) {
    list[1] = list[1].substring(0, list[1].length - 2) + '...';
  }
  // console.log('list>>>>', list);
  ctx.font = `normal bold ${rpx(28)}px PingFang-SC`;
  ctx.setFontSize(rpx(28));
  ctx.setFillStyle('#333333');
  // 只显示2行
  for (let i = 0; i < 2; i++) {
    ctx.fillText(list[i], rpx(30), rpx(710) + txtHeight);
    txtHeight *= 2;
  }

  // 优惠券
  ctx.font = `normal normal ${rpx(22)}px PingFang-SC`;
  ctx.setFontSize(rpx(22));
  ctx.setFillStyle('#fb5858');
  ctx.fillText(`券￥${coupon}`, rpx(30) + rpx(16), rpx(834));

  // 佣金
  // ctx.font = `normal normal ${rpx(20)}px PingFang-SC`;
  // ctx.setFontSize(rpx(20));
  // ctx.setFillStyle('#653022');
  // ctx.fillText(`赚￥${commission}`, rpx(162) + rpx(16), rpx(834));
  ctx.fillStyle = '#FFF';
  let startX = rpx(162);
  let startY = rpx(810);
  ctx.fillRect(startX, startY, rpx(140), rpx(35));
  // 头像
  let avatarSize = 132; // 头像实际尺寸（微信头像尺寸）
  avatarUrl = replaceHttp(avatarUrl);
  // 非配置域名，使用默认头像
  if (!isContain(avatarUrl)) {
    avatarUrl = defaultAvatarUrl;
  }
  const { path: avatarPath, width } = await Taro.getImageInfo({ src: avatarUrl });
  avatarSize = width;
  ctx.save();
  ctx.beginPath();
  let x = 62;
  let y = 160;
  let r = 36;
  ctx.arc(rpx(x), rpx(y), rpx(r), 0, 2 * Math.PI, true);
  ctx.clip();
  ctx.drawImage(avatarPath, 0, 0, avatarSize, avatarSize, rpx(26), rpx(y - r), rpx(72), rpx(72));
  ctx.restore();

  // 海报
  const { path: gdsPosterPath } = await Taro.getImageInfo({ src: replaceHttp(poster) });
  ctx.drawImage(gdsPosterPath, 0, 0, 800, 800, rpx(28), rpx(210), rpx(424), rpx(424));

  // 小程序码
  const ewmSrc = getEwm({
    is_hyaline: true,
    width: 280,
    page: pagePath, // 'pages/details/pdd/pdd',
    scene
  });
  const { path: ewmPath } = await Taro.getImageInfo({
    src: ewmSrc
  });
  ctx.drawImage(ewmPath, 0, 0, 280, 280, rpx(338), rpx(678), rpx(120), rpx(120));

  return new Promise(resolve => {
    ctx.draw(true, resolve);
  });
}

export async function generateInvitePoster({
  ctx = {},
  avatarUrl = defaultAvatarUrl, // 默认头像
  nickName = '您的好友', // 昵称
  scene
}) {
  const canvasWidth = 720;
  const canvasHeight = 1300;

  ctx.setFillStyle('white');
  ctx.fillRect(0, 0, rpx(canvasWidth), rpx(canvasHeight));

  // 海报
  const { path: posterPath } = await Taro.getImageInfo({
    src: 'https://h5.suixingou.com/miniprogram-assets/sxg/share/poster_3x.jpg'
  });
  ctx.drawImage(posterPath, 0, 0, 720, 1300, 0, 0, rpx(canvasWidth), rpx(canvasHeight));

  // 昵称
  ctx.font = `normal normal ${rpx(27)}px PingFang-SC`;
  ctx.setFontSize(rpx(27));
  ctx.setFillStyle('#ffffff');
  const nickNameWidth = ctx.measureText(nickName).width;
  // console.log(nickNameWidth);
  ctx.fillText(`${nickName}`, rpx(canvasWidth / 2 - nickNameWidth / 2), rpx(200));

  // 头像
  let avatarSize = 132; // 头像实际尺寸（微信头像尺寸）
  const avatarWidth = 126; // 头像展示尺寸
  const r = avatarWidth / 2; // 半径
  const x = canvasWidth / 2; // 圆心x坐标
  const y = 45 + r; // 圆心y坐标
  avatarUrl = replaceHttp(avatarUrl);
  // 非配置域名，使用默认头像
  if (!isContain(avatarUrl)) {
    avatarUrl = defaultAvatarUrl;
  }
  const { path: avatarPath, width } = await Taro.getImageInfo({ src: avatarUrl });
  avatarSize = width;
  ctx.save();
  ctx.beginPath();
  ctx.arc(rpx(x), rpx(y), rpx(r), 0, 2 * Math.PI, true);
  ctx.clip();
  ctx.drawImage(
    avatarPath,
    0,
    0,
    avatarSize,
    avatarSize,
    rpx(canvasWidth / 2 - r),
    rpx(y - r),
    rpx(avatarWidth),
    rpx(avatarWidth)
  );
  ctx.restore();

  // 广告语
  // const { path: adlPath } = await Taro.getImageInfo({
  //   src: 'https://h5.suixingou.com/miniprogram-assets/sxg/share/adl.png'
  // });
  // ctx.drawImage(adlPath, 0, 0, 290, 103, rpx(16), rpx(741), rpx(290), rpx(103));
  // 小程序码
  const ewmWidth = 280;
  const { path: ewmPath } = await Taro.getImageInfo({
    src: getEwm({
      is_hyaline: true,
      width: ewmWidth,
      page: 'pages/login/login',
      scene
    })
  });
  ctx.drawImage(ewmPath, 0, 0, ewmWidth, ewmWidth, rpx(52), rpx(1116), rpx(150), rpx(150));

  return new Promise(resolve => {
    ctx.draw(true, resolve);
  });
}

function replaceHttp(url) {
  return url.replace('http:', 'https:');
}

function isContain(avatarUrl) {
  return ['https://wx.qlogo.cn', 'https://thirdwx.qlogo.cn', 'https://figure.suixingou.com'].some(
    u => avatarUrl.indexOf(u) !== -1
  );
}

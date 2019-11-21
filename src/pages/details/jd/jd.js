import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Swiper, SwiperItem, Image, Navigator, Button, Canvas } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, checkSettingStatusAndConfirm } from '../../../utils/wx';
import Log from '../../../utils/log';
import { generateDetailsPoster } from '../../../utils/canvas';
import { getScene } from '../../../utils/api';
import { jdActions, promotionUrlActions } from '../../../redux/modules/details';
import { QID, DEFAULT_QID } from '../../../constants';

import './jd.scss';
import withLogin from '../../../components/wrappedComponent/withLogin.js';

@withLogin('didShow')
class Jd extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDetails: true,
      canvasImg: '',
      showCopyModal: false,
      showShareModal: false,
      shareAccid: ''
    };
    this.timer = [];
  }

  async componentDidShow() {
    const { id, scene, accid: shareAccid, pgnum, idx, searchwords } = this.$router.params;
    const { dispatch } = this.props;
    const { accid } = this.props.loginInfo;
    let sAccid = shareAccid; // 分享人accid
    let goodsId = id; // 商品ID
    // 如果是通过扫描二维码方式进来的情况
    if (!goodsId && scene) {
      let dsence = await getScene(scene);
      goodsId = dsence.id;
      sAccid = dsence.accid || '';
    }
    this.goodsId = goodsId; // 保存商品ID，方便后续调用。
    this.shareAccid = sAccid; // 保存shareAccid，方便后面使用
    this.setState({ shareAccid: sAccid });
    // 获取商品详细信息
    await dispatch(jdActions.loadAsync(goodsId, accid));
    if (sAccid) {
      // 分享进入
      this.loadPromotionUrl(sAccid, 'share'); // 获取转链
    } else {
      // 自购进入且已登录情况
      if (accid) {
        this.loadPromotionUrl(accid, 'Own'); // 获取转链
      }
    }

    // 猜你喜欢
    // dispatch(recommendActions.loadRecommendAsync());

    // 落地页日志上报
    Log.active({
      pagetype: 'goods',
      goodsid: goodsId,
      pgnum: pgnum || 1,
      idx: idx || '',
      searchwords: searchwords || '',
      goodssource: 'jingdong'
    });
  }
  loginSuccessCallback() {
    this.componentDidShow(); //登陆注册之后重新执行一次这个逻辑
    console.log('登陆成功'); //下一步任务
  }
  /**
   * 当登录回来时，需要更新佣金等信息。
   * @param {object}} nextProps 下一次接收的props
   */
  /* componentWillReceiveProps(nextProps) {
    // 获取推广url路径
    const {
      loginInfo: { accid: thisAccid },
      goodsInfo: { materialUrl: thisMaterialUrl },
      dispatch
    } = this.props;
    const {
      loginInfo: { accid },
      goodsInfo: { materialUrl }
    } = nextProps;
    if (accid && thisAccid !== accid) {
      this.timer.push(
        // setTimeout解决componentWillReceiveProps进入死循环问题
        setTimeout(() => {
          dispatch(jdActions.loadAsync(this.goodsId, accid)).then(() => {
            if (thisMaterialUrl && thisMaterialUrl !== materialUrl && !this.shareAccid) {
              this.loadPromotionUrl(accid, 'Own'); // 获取自购转链
            }
          });
        }, 1)
      );
    }
  } */

  /**
   * 获取转链
   * @param {string} accid 用户或分享人accid
   * @param {string} opt Own or share
   */
  async loadPromotionUrl(accid, opt) {
    let customParameters = '';
    if (process.env.NODE_ENV === 'development') {
      customParameters = `${accid}_${opt}_test_${getGlobalData(QID) || DEFAULT_QID}`;
    } else {
      customParameters = `${accid}_${opt}_${getGlobalData(QID) || DEFAULT_QID}`;
    }
    const { goodsInfo, dispatch } = this.props;
    const { materialUrl, couponUrl } = goodsInfo;
    await dispatch(promotionUrlActions.loadJdAsync(this.goodsId, customParameters, materialUrl, couponUrl));
  }

  componentWillUnmount() {
    this.props.dispatch(jdActions.clear());
    this.props.dispatch(promotionUrlActions.clear());
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }

  // 分享商品
  async handleShare() {
    const { userInfo } = this.props;
    const { invitecode } = userInfo.data;
    Log.click({ buttonfid: 'x_10133', goodsid: this.goodsId, goodssource: 'jingdong' });
    // 分享进入（不登录也可以分享）
    if (this.shareAccid || invitecode) {
      this.showSharePoster();
    }
  }

  showSharePoster() {
    this.setState({
      showShareModal: true
    });
    Taro.showToast({
      title: '正在生成图片...',
      icon: 'loading'
    });
    // this.generateCanvas();
    const { figureurl, nickname } = this.props.userInfo.data;
    const { goodsGalleryUrls, goodsInfo } = this.props;
    const poster = goodsGalleryUrls[0];
    const canvasId = 'canvas_show';
    const {
      name, // 商品名称标题
      newPrice, // 券后价
      oldPrice, // 原价
      coupon, // 优惠券金额
      commission // 佣金
    } = goodsInfo;
    generateDetailsPoster({
      ctx: Taro.createCanvasContext(canvasId, this.$scope), // canvas上下文对象
      name, // 商品名称标题
      newPrice, // 券后价
      oldPrice, // 原价
      coupon, // 优惠券金额
      commission, // 佣金
      poster, // 海报
      pagePath: 'pages/details/jd/jd',
      avatarUrl: figureurl, // 默认头像
      nickName: nickname, // 昵称
      scene: encodeURIComponent(`id=${this.goodsId}&accid=${this.shareAccid || this.props.loginInfo.accid}`)
    })
      .then(() => {
        return Taro.canvasToTempFilePath(
          {
            canvasId,
            fileType: 'jpg',
            quality: 0.8,
            destWidth: 720,
            destHeight: 1299
          },
          this.$scope
        );
      })
      .then(({ tempFilePath }) => {
        this.setState({
          canvasImg: tempFilePath
        });
        Taro.hideToast();
      });
  }

  savePic() {
    Log.click({ buttonfid: 'x_10136', goodsid: this.goodsId, goodssource: 'jingdong' });
    if (!this.state.canvasImg) {
      return;
    }
    checkSettingStatusAndConfirm(
      'writePhotosAlbum',
      {
        title: '是否要打开设置页',
        content: '获取相册授权，请到小程序设置中打开授权'
      },
      status => {
        if (status || status === null) {
          Taro.saveImageToPhotosAlbum({
            filePath: this.state.canvasImg
          })
            .then(() => {
              Taro.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              });
            })
            .catch(() => {
              Taro.showToast({
                title: '保存失败',
                icon: 'none',
                duration: 2000
              });
            });
        } else {
          Taro.showToast({
            title: '授权失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
    );
  }

  preview(e) {
    e.stopPropagation();
    Log.click({ buttonfid: 'x_10137', goodsid: this.goodsId, goodssource: 'jingdong' });
    Taro.previewImage({
      current: this.state.canvasImg, // 当前显示图片的http链接
      urls: [this.state.canvasImg] // 需要预览的图片http链接列表
    });
  }

  previewSwiper(url, e) {
    e.stopPropagation();
    const { goodsGalleryUrls } = this.props;
    Taro.previewImage({
      current: url, // 当前显示图片的http链接
      urls: goodsGalleryUrls // 需要预览的图片http链接列表
    });
  }

  onShareAppMessage() {
    const { goodsGalleryUrls, goodsInfo } = this.props;
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    return {
      title: goodsInfo.name,
      path: `/pages/details/jd/jd?id=${this.goodsId}&accid=${this.shareAccid ||
        this.props.loginInfo.accid ||
        ''}&invitecode=${myInvitecode || othersInvitecode}`,
      imageUrl: goodsGalleryUrls[0]
    };
  }

  /**
   * 复制文案
   */
  async handleCopyTxt() {
    Log.click({ buttonfid: 'x_10138', goodsid: this.goodsId, goodssource: 'jingdong' });
    if (!this.shareAccid) {
      // 自购进入（非分享进入）
      await this.loadPromotionUrl(this.props.loginInfo.accid, 'share'); // 获取转链
    }
    this.setState({ showCopyModal: true, showShareModal: false });
  }

  copy() {
    const {
      name, // 商品名称标题
      coupon, // 优惠券
      newPrice, // 券后价
      oldPrice // 原价
    } = this.props.goodsInfo || {};
    const { shareShortUrl } = this.props.promotionUrl.data || {};
    const data = `【限时抢购】${name}
    ${coupon ? '【原价】' + oldPrice : ''}
    ${coupon ? '【券后价】' : '【价格】'}${newPrice}
    【下单地址】${shareShortUrl}`;
    Taro.setClipboardData({
      data
    }).then(() => {
      Taro.getClipboardData().then(res => {
        console.log('复制成功：', res);
      });
    });
    Log.click({ buttonfid: 'x_10139', goodsid: this.goodsId, goodssource: 'jingdong' });
  }

  render() {
    const { showDetails, showShareModal, canvasImg, showCopyModal, shareAccid } = this.state;
    const { goodsGalleryUrls, goodsInfo } = this.props;
    const { pagePath, sharePagePath, shareShortUrl } = this.props.promotionUrl.data;
    const { accid } = this.props.loginInfo;
    // console.log('====================')
    // // console.log(this.$router.params)
    // console.log(!shareAccid)
    // console.log('====================')
    const {
      name, // 商品名称标题
      // thumbnail, // 缩略图
      // image, // 主图
      startTime, // 期限开始时间
      endTime, // 期限结束时间
      // desc, // 商品描述
      soldQuantity, // 已售数量
      newPrice, // 券后价
      oldPrice, // 原价
      coupon, // 优惠券金额
      commission // 佣金
    } = goodsInfo || {};
    // 轮播banner
    const bannerSwiper = goodsGalleryUrls.map(u => {
      return (
        <SwiperItem className='swiper-item' key={u} onClick={this.previewSwiper.bind(this, u)}>
          <Image className='pic' src={u} />
        </SwiperItem>
      );
    });

    const hideCommissionDom = shareAccid && shareAccid !== accid;

    return (
      <View className='detail' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        {/* titlebar */}
        <TitleBar title='商品详情' />
        {/* 商品介绍 */}
        <View className='goods-intro'>
          <Swiper
            className='swiper'
            indicatorColor='rgba(255, 255, 255, 0.5)' // 指示点颜色
            indicatorActiveColor='#ffffff' // 当前选中的指示点颜色
            // onChange={this.handleBannerChange.bind(this)}
            circular // 是否采用衔接滑动
            indicatorDots // 是否显示面板指示点
            // autoplay // 是否自动切换
          >
            {bannerSwiper}
          </Swiper>
          <View className='intro'>
            <Text className='title'>
              <Text className='union jd' />
              {name}
            </Text>
            <View className='info'>
              <View className='price'>
                <Text className='new'>
                  {coupon ? '券后' : '价格'}￥<Text className='num'>{newPrice}</Text>
                </Text>
                {coupon && <Text className='old'>原价￥{oldPrice}</Text>}
              </View>
              <Text className='sold'>已售{soldQuantity}件</Text>
            </View>
            {coupon && (
              <View className='coupon'>
                <View className='coupon-info'>
                  <Text className='amount'>{coupon}元优惠券</Text>
                  <Text className='term'>
                    使用期限:{startTime}-{endTime}
                  </Text>
                </View>
                {shareAccid || accid ? (
                  <Navigator
                    className='btn-receive-wrap'
                    hoverClass='none'
                    target='miniProgram'
                    appId='wx13e41a437b8a1d2e'
                    path={shareAccid ? sharePagePath : pagePath}
                  >
                    <View className='btn-receive'>立即领取</View>
                  </Navigator>
                ) : (
                  <View className='btn-receive-wrap'>
                    <View className='btn-receive'>立即领取</View>
                    <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />
                  </View>
                )}
              </View>
            )}
            {/* <Text className='goods-desc'>{desc}</Text> */}
          </View>
          {!hideCommissionDom && <Text className='down'>赚{commission}元</Text>}
        </View>
        {/* 商品详情描述 */}
        <View className='goods-details-wrap'>
          <View
            className={showDetails ? 'expand-details show' : 'expand-details'}
            onClick={() => {
              this.setState({ showDetails: !this.state.showDetails });
            }}
          >
            {showDetails ? '收起' : '查看'}宝贝详情
          </View>
          {showDetails && (
            <View className='goods-details'>
              {goodsGalleryUrls &&
                goodsGalleryUrls.map(u => (
                  <Image
                    key={u}
                    className='img'
                    mode='widthFix'
                    lazyLoad
                    src={u}
                    onClick={this.previewSwiper.bind(this, u)}
                  />
                ))}
            </View>
          )}
        </View>
        {/* 猜你喜欢(推荐) */}
        {/* <View className='recommend'>
          <View className='title'>猜你喜欢</View>
          <View className='list'>
            <GoodsList goodsList={goodsList} itemStyle='item' />
          </View>
        </View> */}
        {/* 底部操作区 */}
        <View className='footer'>
          <View className='left'>
            <View
              className='home'
              onClick={() => {
                Log.click({ buttonfid: 'x_10129' });
                Taro.switchTab({ url: '/pages/home/home' });
              }}
            >
              <Text className='icon' />
              <Text className='txt'>首页</Text>
            </View>
            <View className='service'>
              <Text className='icon' />
              <Text className='txt'>客服</Text>
              <Button
                className='btn'
                openType='contact'
                onClick={() => {
                  Log.click({ buttonfid: 'x_10130' });
                }}
              />
            </View>
          </View>
          <View className='right'>
            <View
              className='buy-for-me-wrap'
              onClick={() => {
                Log.click({
                  buttonfid: hideCommissionDom ? 'x_10131' : 'x_10132',
                  goodsid: this.goodsId,
                  goodssource: 'jingdong'
                });
              }}
            >
              {shareAccid || accid ? (
                <Navigator
                  className='buy-for-me-nav'
                  hoverClass='none'
                  target='miniProgram'
                  appId='wx13e41a437b8a1d2e'
                  path={shareAccid ? sharePagePath : pagePath}
                >
                  <View className='buy-for-me'>
                    <Text className='up'>{hideCommissionDom ? '领券购买' : '立即购买'}</Text>
                  </View>
                </Navigator>
              ) : (
                <View className='buy-for-me-nav'>
                  <View className='buy-for-me'>
                    <Text className='up'>{hideCommissionDom ? '领券购买' : '立即购买'}</Text>
                  </View>
                  <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />
                </View>
              )}
            </View>
            <View className='share' onClick={this.handleShare}>
              <Text className='up'>分享商品</Text>
              {!(shareAccid || accid) && (
                <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />
              )}
            </View>
          </View>
        </View>
        {showShareModal && (
          <View className='share-modal'>
            <View
              className='canvas-wrap'
              onClick={() => {
                this.setState({ showShareModal: false });
              }}
            >
              <Canvas
                canvasId='canvas_show'
                className='canvas-show'
                bindError={() => {
                  console.error('canvas_show error!!!');
                }}
              />
              {canvasImg && <Image className='canvas-img' src={canvasImg} onClick={this.preview.bind(this)} />}
            </View>
            <View className='btns-wrap'>
              <View className='item share'>
                <View className='icon wechat' />
                <View className='txt'>分享好友</View>
                <Button
                  openType='share'
                  className='btn'
                  onClick={() => {
                    Log.click({ buttonfid: 'x_10134', goodsid: this.goodsId, goodssource: 'jingdong' });
                  }}
                />
              </View>
              <View className='item save' onClick={this.savePic}>
                <View className='icon download' />
                <View className='txt'>保存图片</View>
              </View>
              <View className='item copy' onClick={this.handleCopyTxt}>
                <View className='icon link' />
                <View className='txt'>复制文案</View>
              </View>
            </View>
            {/* <Canvas
              canvasId='canvas_share'
              style={`width:${Taro.pxTransform(960)}; height:${Taro.pxTransform(1732)}; display:none;`}
            /> */}
          </View>
        )}
        {showCopyModal && (
          <View className='copy-modal-wrap'>
            <View className='copy-modal'>
              <View className='title'>复制文案分享</View>
              <View className='content'>
                <Text className='item goods-title'>【限时抢购】{name}</Text>
                {coupon && <Text className='item goods-oldprice'>【原价】{oldPrice}</Text>}
                <Text className='item goods-newprice'>
                  【{coupon ? '券后价' : '价格'}】<Text className='price'>{newPrice}</Text>
                </Text>
                <Text className='item goods-url'>
                  【下单地址】<Text className='link'>{shareShortUrl}</Text>
                </Text>
                {/* <Text className='item goods-line'>-----------------</Text> */}
                {/* <Text className='item goods-reason'>【必买理由】</Text> */}
                {/* <Text className='item goods-desc'>{desc}</Text> */}
              </View>
              <View className='btn-copy' onClick={this.copy.bind(this)}>
                一键复制
              </View>
              <View
                className='close'
                onClick={() => {
                  this.setState({ showCopyModal: false });
                }}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { promotionUrl } = state.details;
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  const { goodsGalleryUrls, goodsInfo } = state.details.jd.data;
  return {
    userInfo,
    loginInfo,
    goodsGalleryUrls,
    goodsInfo,
    promotionUrl
  };
}

export default connect(mapStateToProps)(Jd);

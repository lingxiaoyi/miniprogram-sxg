import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Swiper, SwiperItem, Image, Button } from '@tarojs/components';
import classnames from 'classnames';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl, setGlobalData } from '../../../utils/wx';
import Log from '../../../utils/log';
import { getScene } from '../../../utils/api';
import { detailsActions, orderconfirmActions } from '../../../redux/modules/zy/index';
import ZyToast from '../component/toast/index';
import '../component/toast/toast.scss';
import './details.scss';
import withLogin from '../../../components/wrappedComponent/withLogin.js';

@withLogin('didShow')
class Zy extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDetails: true,
      shareAccid: '',
      showGoodsTypeModal: false, //物品规格选择弹窗
      purchaseNum: 1, //购买数量
      activeAttr: [], //当前选中的商品属性 大小 颜色等
      hasAllActiveAttr: false,
      activeSkuInfos: null, //当前选中商品规格对应的数据
      toastIsOpened: false,
      toastText: '提示'
    };
    this.timer = [];
    this.qid = '';
  }

  async componentDidShow() {
    const { id, scene, accid: shareAccid, pgnum, idx, searchwords } = this.$router.params;

    const { dispatch, userInfo } = this.props;
    let sAccid = shareAccid; // 分享人accid
    let goodsId = id; // 商品ID
    // 如果是通过扫描二维码方式进来的情况
    if (!goodsId && scene) {
      let dsence = await getScene(scene);
      /* let dsence = {
        goodsid: '987654321',
        shareid: '100017128',
        qid: 'sxgapp'
      } */
      goodsId = dsence.goodsid;
      sAccid = dsence.shareid || '';
      this.qid = dsence.qid;
    }
    if (goodsId) {
      this.goodsId = goodsId; // 保存商品ID，方便后续调用。
      setGlobalData('goodsId', goodsId);
    }
    if (!goodsId) {
      this.goodsId = getGlobalData('goodsId');
    }
    if (sAccid) {
      this.shareAccid = sAccid; // 保存shareAccid，方便后面使用
      this.setState({ shareAccid: sAccid });
    }
    // 获取商品详细信息
    await dispatch(detailsActions.loadAsync(this.goodsId, this.qid, userInfo.data.memberlevel));
    //填充activeAttr的长度
    if(!this.state.activeAttr.length){
      this.setState({
        activeAttr: new Array(this.props.data.attr.length).fill('')
      });
    }
    // 日志上报
    Log.active({
      pagetype: 'goods',
      goodsid: goodsId,
      pgnum: pgnum || 1,
      idx: idx || '',
      searchwords: searchwords || '',
      goodssource: 'zy'
    });
  }
  loginSuccessCallback() {
    this.componentDidShow(); //登陆注册之后重新执行一次这个逻辑
    console.log('登陆成功'); //下一步任务
  }

  componentWillUnmount() {
    this.props.dispatch(detailsActions.clear());
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }
  previewSwiper(url, urls, e) {
    e.stopPropagation();
    Taro.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    });
  }
  onShareAppMessage() {
    const { data } = this.props;
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    let routes = Taro.getCurrentPages();
    let curRoute = routes[routes.length - 1].route;
    return {
      title: data.title,
      path: `${curRoute}?id=${data.id}&accid=${this.shareAccid ||
        this.props.loginInfo.accid ||
        ''}&invitecode=${myInvitecode || othersInvitecode}`,
      imageUrl: data.carouselImgs[0]
    };
  }
  handlerShowGoodsModal(e) {
    e.stopPropagation();
    Log.click({ buttonfid: 'x_10153' });
    this.setState({
      showGoodsTypeModal: true
    });
  }
  handlerHideGoodsModal(e) {
    e.stopPropagation();
    this.setState({
      showGoodsTypeModal: false
    });
  }
  onConfirmChoose(e) {
    Log.click({ buttonfid: 'x_10154' });
    let { hasAllActiveAttr, purchaseNum, activeAttr, activeSkuInfos } = this.state;
    const { id, title, attr } = this.props.data;
    const { accid } = this.props.loginInfo;
    let data = {
      purchaseNum,
      //activeAttr,
      numIid: id,
      itemTitle: title,
      //img: carouselImgs[0],
      activeSkuInfos,
      shareAccid: this.shareAccid || '',
      attr
    };
    if (hasAllActiveAttr) {
      e.stopPropagation();
      if (data.activeSkuInfos.stock === 0) {
        this.setState({
          toastIsOpened: true,
          toastText: `此商品库存不足`
        });
        return true;
      }
      if (accid) {
        this.props.dispatch(orderconfirmActions.loadSync(data));
        jumpUrl('/pages/zy/order/orderconfirm/orderconfirm');
      } else {
        jumpUrl('/pages/login/login');
      }
      this.setState({
        showGoodsTypeModal: false
      });
    } else {
      activeAttr.some((item, i) => {
        if (!item) {
          this.setState({
            toastIsOpened: true,
            toastText: `请选择商品${attr[i].name}`
          });
          return true;
        }
      });
    }
  }
  selectGoodsAttr(item, index, disabled) {
    if (disabled) return;
    let activeAttr = this.state.activeAttr;
    let { skuInfos } = this.props.data;
    let activeSkuInfosIndex = '';
    /* if (!activeAttr.length) {
      activeAttr = new Array(length).fill('');
    } */
    if (activeAttr[index] !== item) {
      activeAttr[index] = item;
    } else {
      //取消当前值
      activeAttr[index] = '';
    }
    let hasAllActiveAttr = activeAttr.every(attr => {
      return attr;
    });
    if (hasAllActiveAttr) {
      skuInfos.some((skuInfosItem, skuInfosIndex) => {
        if (
          skuInfosItem.attributesValues.sort().toString() ==
          this.deepcloneArr(activeAttr)
            .sort()
            .toString()
        ) {
          activeSkuInfosIndex = skuInfosIndex;
          return true;
        }
      });
    }
    this.setState({
      activeAttr,
      hasAllActiveAttr,
      activeSkuInfos: activeSkuInfosIndex === '' ? null : skuInfos[activeSkuInfosIndex]
    });
  }
  deepcloneArr(arr) {
    return JSON.parse(JSON.stringify(arr));
  }
  handlerBuyGoods() {
    let { purchaseNum, activeSkuInfos } = this.state;
    const { accid } = this.props.loginInfo;
    const { id, title, attr } = this.props.data;
    Log.click({ buttonfid: 'x_10150' });
    let data = {
      purchaseNum,
      //activeAttr,
      numIid: id,
      itemTitle: title,
      //img: carouselImgs[0],
      activeSkuInfos,
      shareAccid: this.shareAccid || '',
      attr
    };
    if (accid) {
      if (activeSkuInfos === null) {
        this.setState({
          showGoodsTypeModal: true
        });
      } else {
        if (activeSkuInfos.stock === 0) {
          this.setState({
            toastIsOpened: true,
            toastText: `此商品库存不足`
          });
          return true;
        }
        this.props.dispatch(orderconfirmActions.loadSync(data));
        jumpUrl('/pages/zy/order/orderconfirm/orderconfirm');
      }
    }
  }
  render() {
    const {
      showDetails,
      showGoodsTypeModal,
      shareAccid,
      activeAttr,
      hasAllActiveAttr,
      activeSkuInfos,
      toastIsOpened,
      toastText
    } = this.state;
    const {
      //id,
      title,
      //itemType, //商品详情类型 0:文字 1:图片
      //itemDescription, //商品详情描述 itemType=0 有用
      descriptionImgs, //商品详情图片列表 itemType=1 有用
      carouselImgs, //商品轮播图
      totalSale, //累计销量
      reservePrice, //原价
      finalPrice, //现价
      commission, //预估佣金
      totalStock, //总库存
      attr = [], //属性
      skuInfos
    } = this.props.data;
    const { accid } = this.props.loginInfo;
    // 轮播banner
    const bannerSwiper = carouselImgs.map(u => {
      return (
        <SwiperItem className='swiper-item' key={u} onClick={this.previewSwiper.bind(this, u, carouselImgs)}>
          <Image className='pic' src={u} />
        </SwiperItem>
      );
    });
    //商品规格 未选和已选的状态
    const skuInfoJSX = (
      <View className='ul'>
        <View className='li'>{hasAllActiveAttr ? '已选' : '选择'}</View>
        {hasAllActiveAttr &&
          activeAttr.map((attrItem, attrI) => {
            return (
              <View className='li' key={attrI}>
                {attrItem}
              </View>
            );
          })}
        {!hasAllActiveAttr &&
          attr.map((attrItem, attrI) => {
            return (
              <View className='li' key={attrI}>
                {attrItem.name}
              </View>
            );
          })}
      </View>
    );
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
            <View className='info'>
              <View className='row1'>
                <View className='price'>
                  <Text className='num'>
                    <Text className='span'>￥</Text>
                    {finalPrice}
                  </Text>
                  {/* <Text className='tag'>佣金:{commission}</Text> */}
                </View>
                <Text className='sold'>已售{totalSale}件</Text>
              </View>
              <View className='old'>￥{reservePrice}</View>
            </View>
            <Text className='title'>
              <Text className='tag-jx'>精选</Text>
              {title}
            </Text>
            {/* <Text className='goods-desc'>{desc}</Text> */}
          </View>
          <View className='tag-zy' />
          {!hideCommissionDom && <Text className='down'>赚{commission}元</Text>}
        </View>
        {/* 商品规格选择 */}
        <View className='goods-spec' onClick={this.handlerShowGoodsModal}>
          <View className='info'>
            <Text className='title'>规格</Text>
            {skuInfoJSX}
          </View>
          <View className='i-more' />
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
              {descriptionImgs &&
                descriptionImgs.map(u => (
                  <Image
                    key={u}
                    className='img'
                    mode='widthFix'
                    lazyLoad
                    src={u}
                    onClick={this.previewSwiper.bind(this, u, descriptionImgs)}
                  />
                ))}
            </View>
          )}
        </View>
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
                  goodssource: 'pingduoduo'
                });
              }}
            >
              <View className='buy-for-me-nav' onClick={this.handlerBuyGoods}>
                <View className='buy-for-me'>
                  <Text className='up'>立即购买</Text>
                </View>
                {!accid && (
                  <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />
                )}
              </View>
            </View>
            {shareAccid || accid ? (
              <Button
                openType='share'
                className='share'
                onClick={() => {
                  Log.click({ buttonfid: 'x_10151' });
                }}
              >
                <Text className='up'>分享商品</Text>
              </Button>
            ) : (
              <View className='share'>
                <Text className='up'>分享商品</Text>
                {!(shareAccid || accid) && (
                  <Button openType='getUserInfo' className='btn' onGetUserInfo={this.onAuthConfirmClick} />
                )}
              </View>
            )}
          </View>
        </View>
        {showGoodsTypeModal && (
          <View className='goods-type-modal' onClick={this.handlerHideGoodsModal}>
            <View className='modal' onClick={this.handlerShowGoodsModal}>
              <View className='header'>
                <Image className='img' src={activeSkuInfos.skuImageUrl || carouselImgs[0]} />
                <View className='info'>
                  <Text className='price'>
                    <Text className='span'>¥</Text>
                    {activeSkuInfos.finalPrice || finalPrice}
                  </Text>
                  <Text className='text1'>库存{activeSkuInfos.stock || totalStock}件</Text>
                  {skuInfoJSX}
                </View>
              </View>
              <View className='body'>
                {attr.map((attrItem, attrI) => {
                  return (
                    <View className='sec1' key={attrI}>
                      <View className='title'>{attrItem.name}</View>
                      <View className='ul'>
                        {attrItem.values.map((item, i) => {
                          let arr = this.deepcloneArr(activeAttr);
                          let res;
                          let isSelectedAttr = arr.some(ele => {
                            return ele;
                          }); //是否选择过元素
                          arr[attrI] = item;
                          let isAllActiveAttr = arr.every(ele => {
                            return ele;
                          }); //选择过的和当前位置的比对
                          if (isAllActiveAttr) {
                            res = skuInfos.some(skuInfosItem => {
                              if (skuInfosItem.attributesValues.sort().toString() == arr.sort().toString()) {
                                return true;
                              }
                            });
                          } else {
                            //值不满的话可以点击
                            res = true;
                          }
                          //console.log(arr, isSelectedAttr , !res);
                          let disabled = isSelectedAttr && !res;
                          let className = classnames(
                            'li',
                            { active: activeAttr.indexOf(item) >= 0 },
                            { disabled: disabled }
                          );
                          return (
                            <View
                              className={className}
                              key={i}
                              onClick={this.selectGoodsAttr.bind(this, item, attrI, disabled)}
                            >
                              {/* <View className='img' style={`background:url(${item.url}) center no-repeat;`} /> */}
                              <Text className='text'>{item}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
                <View className='sec2'>
                  <View className='title'>购买数量</View>
                  <View className='ul'>
                    <View
                      className='li subtract'
                      onClick={() => {
                        let num = this.state.purchaseNum - 1;
                        if (num > 0) {
                          this.setState({
                            purchaseNum: num
                          });
                        }
                      }}
                    />
                    <View className='li'>{this.state.purchaseNum}</View>
                    <View
                      className='li add'
                      onClick={() => {
                        let num = this.state.purchaseNum + 1;
                        this.setState({
                          purchaseNum: num
                        });
                      }}
                    />
                  </View>
                </View>
              </View>
              <View className='modal-footer'>
                <View className='btn' onClick={this.onConfirmChoose}>
                  确定
                </View>
              </View>
              <View className='close' onClick={this.handlerHideGoodsModal} />
            </View>
          </View>
        )}
        <ZyToast isOpened={toastIsOpened} text={toastText} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { data } = state.zy.details;
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  return {
    userInfo,
    loginInfo,
    data: data || {}
  };
}

export default connect(mapStateToProps)(Zy);

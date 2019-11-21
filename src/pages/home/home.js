import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image, Navigator, Swiper, SwiperItem, Button } from '@tarojs/components';
import GoodsList from '../../components/goods/goodsList';
import Loading from '../../components/loading/loading';
import NoMore from '../../components/noMore/noMore';
import TabBar from '../../components/tabBar/tabBar';
import TitleBar from '../../components/titleBar/titleBar';
// import BannerSwiper from '../../components/swiper/swiper';
// import Dialog from '../../components/dialog/index';
import { getGlobalData, setGlobalData, jumpUrl } from '../../utils/wx';
import Log from '../../utils/log';
import { formatDate } from '../../utils/util';
// import { userInfoActions } from '../../redux/modules/mine/index';
import {
  goodsActions,
  rpUrlActions,
  haoquanGoodslActions,
  searchActions,
  bannersActions
} from '../../redux/modules/home';
import { QID, DEFAULT_QID } from '../../constants';
// import { userInfoActions } from '../../redux/modules/mine/index';

import './home.scss';
import iconsearch from '../../asset/search.png';
import iconbk from '../../asset/home/icon_bk.png';
import iconby from '../../asset/home/icon_by.png';
import iconhb from '../../asset/home/icon_hb.png';
import iconqc from '../../asset/home/icon_qc.png';
import iconjcjp from '../../asset/home/jcjp.png';
import iconjdcs from '../../asset/home/jdcs.png';
import iconpzhh from '../../asset/home/pzhh.png';
import videolink from '../../asset/home/video_link.png';
import withLogin from '../../components/wrappedComponent/withLogin.js';

@withLogin('didMount')
class Home extends Component {
  config = {
    navigationBarTitleText: '首页',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true
  };

  constructor(props) {
    super(props);
    // 用于频道滚动定位
    this.pdTop = 0;
    this.referrenceTop = 0;
    this.stBarHeight = getGlobalData('statusbar_height') / 2;
    this.isIpx = getGlobalData('system_info').isIpx;
    this.timer = [];
    this.state = {
      showTitleBarSearch: false,
      showSearchModal: false,
      showSearchGoodsModal: false,
      clipboardData: '',
      hasLogin: true,
      showRedpackModal: false,
      showGuideDialog: false
    };
    this.loadOnce = false;
  }

  async componentDidMount() {
    // const { dispatch, loginInfo } = this.props;
    // const { accid } = loginInfo;
    // const { firstorderstatus } = userInfo.data;
    const { dispatch, loginInfo } = this.props;
    //const { accid, openid } = await getGlobalData('login');
    const { accid, openid } = loginInfo;
    dispatch(bannersActions.loadBannerAsync(accid, openid));
    dispatch(haoquanGoodslActions.loadHaoquanGoodsAsync(accid));
    dispatch(goodsActions.loadGoodsAsync(accid));
    this.loadRpUrl();
    this.setStepsTop();
    if (accid) {
      //await dispatch(userInfoActions.loadMineAsync());
      this.setState({
        hasLogin: true
      });
      let { firstorderstatus } = this.props.userInfo.data;
      if (firstorderstatus === 1) {
        this.showGuideDialog();
      } else if (firstorderstatus === 0) {
        if (!this.state.showRedpackModal) {
          this.showGuideDialog(); //不显示红包弹窗才能去执行教程弹窗逻辑
        }
      }
    } else {
      this.setState({
        hasLogin: false
      });
    }
    this.whetherShowRedpackModal();
  }
  loginSuccessCallback() { //二次登陆执行的逻辑
    this.componentDidMount()
  }
  /**
   *判断当天是否展示过红包弹窗
   * @memberof Home
   */
  whetherShowRedpackModal() {
    let formatDay = formatDate(new Date(), 'yyyy-MM-dd');
    let showRedpackModal = Taro.getStorageSync('showRedpackModal');
    if (!showRedpackModal || showRedpackModal.indexOf(formatDay) === -1) {
      Taro.setStorageSync('showRedpackModal', formatDay);
      this.setState({
        showRedpackModal: true
      });
    } else {
      this.setState({
        showRedpackModal: false
      });
    }
  }
  /**
   *判断是否展示教程弹窗
   * @memberof Home
   */
  showGuideDialog() {
    if (this.loadOnce) return;
    let showRedpackModal = Taro.getStorageSync('showGuideDialog');
    if (!showRedpackModal) {
      Taro.setStorageSync('showGuideDialog', 1);
      this.setState({
        showGuideDialog: true
      });
      Log.click({ buttonfid: 'x_10148' });
    } else {
      this.setState({
        showGuideDialog: false
      });
    }
    this.loadOnce = true;
  }
  // componentWillReceiveProps(nextProps) {
  //   const {
  //     loginInfo: { accid: thisAccid },
  //     dispatch
  //   } = this.props;
  //   const {
  //     loginInfo: { accid }
  //   } = nextProps;
  //   if (accid && thisAccid !== accid) {
  //     this.timer.push(
  //       setTimeout(() => {
  //         dispatch(goodsActions.loadGoodsAsync(accid));
  //         this.loadRpUrl();
  //         dispatch(userInfoActions.loadMineAsync());
  //         this.setState({
  //           hasLogin: true
  //         });
  //       }, 1)
  //     );
  //   }
  //   let { firstorderstatus } = this.props.userInfo.data;
  //   if (firstorderstatus === 1) {
  //     this.showGuideDialog();
  //   } else if (firstorderstatus === 0) {
  //     if (!this.state.showRedpackModal) {
  //       this.showGuideDialog(); //不显示红包弹窗才能去执行教程弹窗逻辑
  //     }
  //   }
  // }

  componentWillUnmount() {
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }

  componentDidShow() {
    this.getClipboardData();
  }

  componentDidHide() {
    this.setState({
      showSearchGoodsModal: false,
      showSearchModal: false
    });
  }

  setStepsTop() {
    const query = Taro.createSelectorQuery();
    query
      .select('.search-wrap')
      .boundingClientRect(rect => {
        this.referrenceTop = rect.top;
      })
      .exec();
  }

  loadRpUrl() {
    const {
      loginInfo: { accid },
      dispatch,
      rpUrl
    } = this.props;
    if (accid && !rpUrl.data.pagePath) {
      let custom_parameters = '';
      if (process.env.NODE_ENV === 'development') {
        custom_parameters = accid ? `${accid}_Own_test_${getGlobalData(QID) || DEFAULT_QID}` : '';
      } else {
        custom_parameters = accid ? `${accid}_Own_${getGlobalData(QID) || DEFAULT_QID}` : '';
      }
      dispatch(rpUrlActions.loadRpUrlAsync(custom_parameters));
    }
  }

  onShareAppMessage({ from }) {
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    let ic = myInvitecode || othersInvitecode;
    const { nickname } = this.props.userInfo.data;
    const name = nickname || '您的好友';
    // console.log('*****************');
    // console.log(this.props.userInfo);
    // console.log('*****************');
    if (from === 'menu') {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: ic ? `pages/login/login?invitecode=${ic}` : 'pages/home/home',
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxg//share/poster_invite.jpg'
      };
    } else {
      return {
        title: `${name}邀请您共享拼多多和京东购物省钱返利`,
        path: `pages/login/login?invitecode=${ic || ''}`,
        imageUrl: 'https://h5.suixingou.com/miniprogram-assets/sxg//share/poster_invite.jpg'
      };
    }
  }

  onPullDownRefresh() {
    const {
      dispatch,
      loginInfo: { accid, openid }
    } = this.props;
    const loadGoodsAsync = dispatch(goodsActions.loadGoodsAsync(accid));
    const loadHaoquanGoodsAsync = dispatch(haoquanGoodslActions.loadHaoquanGoodsAsync(accid));
    const loadBannerAsync = dispatch(bannersActions.loadBannerAsync(accid, openid));
    Promise.all([loadGoodsAsync, loadHaoquanGoodsAsync, loadBannerAsync])
      .then(() => {
        Taro.stopPullDownRefresh();
        // 清除banner进屏日志记录标志
        this.clearBannerId();
      })
      .catch(() => {
        Taro.stopPullDownRefresh();
      });
  }

  onReachBottom() {
    const { selectedOpt, goodsByOpt } = this.props.goods;
    const { accid } = this.props.loginInfo;
    const { loading, loadingByScroll, noMore } = goodsByOpt[selectedOpt];
    // 限制10页
    if (loading || loadingByScroll || noMore) {
      return;
    }
    this.props.dispatch(goodsActions.loadGoodsByScrollAsync(accid));
  }

  handleTabClick(tabName) {
    this.props.dispatch(goodsActions.changeOpt(tabName));
    this.props.dispatch(goodsActions.loadGoodsAsync(this.props.loginInfo.accid));
    Log.click({ buttonfid: 'x_10111' });
  }

  handleSearchClick() {
    Log.click({ buttonfid: 'x_10104' });
    jumpUrl('/pages/home/search/search?focus=true');
  }

  onPageScroll({ scrollTop }) {
    // console.log('======================');
    // console.log(scrollTop, this.referrenceTop, this.stBarHeight);
    // console.log('======================');
    if (scrollTop >= this.referrenceTop - this.stBarHeight) {
      this.setState({
        showTitleBarSearch: true
      });
    } else {
      this.setState({
        showTitleBarSearch: false
      });
    }
  }
  // 获取剪贴板内容并执行判断逻辑。
  getClipboardData() {
    const clipboardData = getGlobalData('clipboard_data');
    Taro.getClipboardData().then(({ data }) => {
      // console.log('======================');
      // console.log(data);
      // console.log('======================');
      if (!data || data.length < 12 || clipboardData === data) {
        return;
      }
      setGlobalData('clipboard_data', data);
      this.setState({
        clipboardData: data
      });
      if (data.indexOf('yangkeduo.com') !== -1 || data.indexOf('toutiaonanren.com') !== -1) {
        // PDD
        this.loadSearchData('pdd', data);
      } else if (data.indexOf('jd.com') !== -1) {
        // JD
        this.loadSearchData('jd', data);
      } else {
        this.setState({
          showSearchModal: true,
          showSearchGoodsModal: false
        });
      }
      Log.click({ buttonfid: 'x_10100' });
    });
  }

  async loadSearchData(union, kw) {
    const { dispatch } = this.props;
    dispatch(searchActions.changeOpt(union));
    await dispatch(searchActions.loadAsync(kw, this.props.loginInfo.accid));
    const { selectedOpt: searchSelectedOpt, goodsByOpt: searchGoodsByOpt } = this.props.search;
    const searchGoods = searchGoodsByOpt[searchSelectedOpt] ? searchGoodsByOpt[searchSelectedOpt].data[0] : '';
    if (searchGoods) {
      this.setState({
        showSearchModal: false,
        showSearchGoodsModal: true
      });
    } else {
      this.setState({
        showSearchModal: true,
        showSearchGoodsModal: false
      });
    }
  }

  // 跳转搜索
  jumpSearch(union) {
    Log.click({ buttonfid: 'x_10101' });
    this.props.dispatch(searchActions.changeOpt(union));
    jumpUrl(`/pages/home/search/search?kw=${this.state.clipboardData}`);
  }

  handleBannerChange = e => {
    // console.log(e);
    const bannerid = e.detail.currentItemId;
    let bis = this.getBannerIds();
    if (!bis.includes(bannerid)) {
      this.cacheBannerId(bannerid);
      Log.intoscreen({
        bannerid
      });
    }
  };

  getBannerIds = () => {
    return getGlobalData('banner_intoscreen') || [];
  };

  cacheBannerId = bid => {
    bid = String(bid);
    let bis = this.getBannerIds();
    if (!bis.includes(bid)) {
      bis.push(bid);
      setGlobalData('banner_intoscreen', bis);
    }
    return bis;
  };

  clearBannerId = () => {
    setGlobalData('banner_intoscreen', '');
  };

  handleBannerClick = data => {
    Log.click({ buttonfid: 'x_10108', buttonsid: data.id });
    if (data.url.indexOf('pages/mine/mine') !== -1 || data.url.indexOf('pages/home/home') !== -1) {
      Taro.switchTab(data.url);
    } else {
      jumpUrl(data.url);
    }
  };

  handleBannersData = banners => {
    return (
      banners.length > 0 &&
      banners.map(d => {
        const { title, openType, openUrl, subjectId, productId, platform } = d;
        let url = '';
        // 打开方式：1.专题列表 2,商品详情,3.指定页面(如活动页)
        if (openType === 1) {
          url = `/pages/home/hotGoods/hotGoods?title=${title}&id=${subjectId}&type=mix`;
        } else if (openType === 2) {
          let urlPath = '';
          switch (platform) {
            case 1:
              urlPath = '/pages/details/pdd/pdd';
              break;
            case 2:
              urlPath = '/pages/details/jd/jd';
              break;
            case 3:
              urlPath = '/pages/zy/details/details';
              break;
            default:
              urlPath = '/pages/details/pdd/pdd';
          }
          url = `${urlPath}?id=${productId}`;
        } else if (openType === 3) {
          url = openUrl.substr(0, 1) !== '/' ? '/' + openUrl : openUrl;
        }
        return {
          ...d,
          url
        };
      })
    );
  };

  render() {
    const {
      showTitleBarSearch,
      showSearchModal,
      showSearchGoodsModal,
      clipboardData,
      hasLogin,
      showRedpackModal,
      showGuideDialog
    } = this.state;
    const {
      banners,
      goods,
      rpUrl,
      haoquanGoods,
      search,
      userInfo
      // loginInfo: { accid }
    } = this.props;
    const { firstorderstatus } = userInfo.data;
    const { selectedOpt, goodsByOpt } = goods;
    const { data: goodsList, loading, loadingByScroll, noMore } = goodsByOpt[selectedOpt] || {};
    const { selectedOpt: searchSelectedOpt, goodsByOpt: searchGoodsByOpt } = search;
    const searchGoods = searchGoodsByOpt[searchSelectedOpt] ? searchGoodsByOpt[searchSelectedOpt].data[0] : {};

    // taro中不允许map里面使用条件语句if，提前将数据处理再做map处理。
    const bannersData = this.handleBannersData(banners) || [];
    const bannerSwiperItem = bannersData.map((d, i) => {
      const { id, bannerImg } = d;
      if (i === 0 && !this.getBannerIds().includes(String(id))) {
        Log.intoscreen({
          bannerid: id
        });
        this.cacheBannerId(id);
      }
      return (
        <SwiperItem
          key={id}
          className='swiper-item-banner'
          itemId={id}
          onClick={() => {
            this.handleBannerClick(d);
          }}
        >
          <Image className='pic' src={bannerImg} />
        </SwiperItem>
      );
    });
    // console.log('bannerSwiperItem>>>>>', bannerSwiperItem);

    return (
      <View className='home'>
        {/* 搜索 */}
        <TitleBar homePage bgstyle={showTitleBarSearch ? 'black' : 'transparent'} fontstyle='light'>
          {showTitleBarSearch && (
            <View className='tb-search' onClick={this.handleSearchClick}>
              <Image className='icon' src={iconsearch} />
              <Text className='txt'>搜索商品</Text>
            </View>
          )}
        </TitleBar>
        {/* 搜索 */}
        <View
          className='top'
          style={`
          padding-top: ${this.isIpx ? Taro.pxTransform(48 + 136) : 136};
          background-image: url('https://h5.suixingou.com/miniprogram-assets/sxg/home/${
            this.isIpx ? 'bg_ipx' : 'bg'
          }.png');
          height: ${Taro.pxTransform(this.isIpx ? 555 : 483)};
          `}
        >
          <View className='title'>
            <Image
              className='img'
              mode='widthFix'
              src='https://h5.suixingou.com/miniprogram-assets/sxg/home/title.png'
            />
          </View>
          <View className='search-wrap'>
            <View className='search' onClick={this.handleSearchClick}>
              <Image className='icon' src={iconsearch} />
              <Text className='txt'>输入商品名或粘贴商品标题</Text>
            </View>
            <View className='btn'>搜券</View>
          </View>
          {/* 视频教程 */}
          <View className='three-steps'>
            <View className='title'>
              <View className='left'>三步省钱</View>
              <View
                className='video-link'
                onClick={() => {
                  jumpUrl('/pages/home/courses/novice');
                }}
              >
                <Image className='img' mode='widthFix' src={videolink} />
              </View>
            </View>
            <View className='steps'>
              <View className='step step1'>打开拼多多/京东</View>
              <View className='next'>→</View>
              <View className='step step2'>复制商品标题</View>
              <View className='next'>→</View>
              <View className='step step3'>打开随心购物</View>
            </View>
          </View>
        </View>

        {/* 4个热门菜单 */}
        <View className='icon-list'>
          <View
            className='item'
            onClick={() => {
              Log.click({ buttonfid: 'x_10105', buttonsid: 'type1001' });
              jumpUrl('/pages/home/hotGoods/hotGoods?title=今日爆款&id=1&type=pdd');
            }}
          >
            <Image className='icon' src={iconbk} />
            <Text className='txt'>今日爆款</Text>
          </View>
          <View
            className='item'
            onClick={() => {
              Log.click({ buttonfid: 'x_10105', buttonsid: 'type1002' });
              jumpUrl('/pages/home/mailingFree/mailingFree?id=0&type=pdd');
            }}
          >
            <Image className='icon' src={iconby} />
            <Text className='txt'>9.9包邮</Text>
          </View>
          <View
            className='item-wrap'
            onClick={() => {
              Log.click({ buttonfid: 'x_10105', buttonsid: 'type1003' });
            }}
          >
            {rpUrl.data.pagePath ? (
              <Navigator
                className='item'
                hoverClass='none'
                target='miniProgram'
                appId='wx32540bd863b27570'
                path={rpUrl.data.pagePath}
              >
                <Image className='icon' src={iconhb} />
                <Text className='txt'>天天红包</Text>
              </Navigator>
            ) : (
              <View className='item btn-wrap'>
                <Image className='icon' src={iconhb} />
                <Text className='txt'>天天红包</Text>
                <Button className='btn' openType='getUserInfo' onGetUserInfo={this.onAuthConfirmClick} />
              </View>
            )}
          </View>
          <View
            className='item'
            onClick={() => {
              Log.click({ buttonfid: 'x_10105', buttonsid: 'type1004' });
              jumpUrl('/pages/home/hotGoods/hotGoods?title=品牌清仓&id=2');
            }}
          >
            <Image className='icon' src={iconqc} />
            <Text className='txt'>品牌清仓</Text>
          </View>
        </View>
        {/* 活动banner */}
        <View className='banner-wrap' style={{ height: bannersData.length === 0 ? 0 : Taro.pxTransform(140) }}>
          <Swiper className='swiper-banner' autoplay circular interval='3000' onChange={this.handleBannerChange}>
            {bannerSwiperItem}
          </Swiper>
          {/* <BannerSwiper
            accid={accid}
            data={this.props.banners}
            onChange={this.handleBannerChange}
            onClick={this.handleBannerClick}
          /> */}
        </View>
        {(firstorderstatus === 0 || !hasLogin) && showRedpackModal && (
          <View
            className='redpack-modal-wrap'
            onClick={() => {
              Log.click({ buttonfid: 'x_10110', buttonsid: '1001' });
              this.setState({
                showRedpackModal: false
              });
            }}
          >
            <View className='redpack-modal'>
              <View
                className='redpack'
                onClick={() => {
                  Log.click({ buttonfid: 'x_10109', buttonsid: '1001' });
                  jumpUrl('/pages/freegoods/freegoods');
                }}
              >
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxg/freegoods/redpack.png'
                />
              </View>
            </View>
          </View>
        )}
        {/* 京东栏目 */}
        <View className='cards-jd-wrap'>
          <View className='cards-jd'>
            {/* 好券商品 */}
            <View
              className='left'
              onClick={() => {
                Log.click({ buttonfid: 'x_10105', buttonsid: 'type1005' });
                jumpUrl('/pages/home/hotGoods/hotGoods?title=好券商品&id=1&type=jd');
              }}
            >
              <View className='desc'>
                <Text className='title'>好券商品</Text>
                <Text className='intro'>每日上新 件件必抢</Text>
              </View>
              <View className='list'>
                {haoquanGoods.data.map(gds => (
                  <View className='item' key={gds.id}>
                    <Image className='img' mode='widthFix' src={gds.thumbnail} />
                    <Text className='new-price'>￥{gds.newPrice}</Text>
                    <Text className='old-price'>￥{gds.oldPrice}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className='line' />
            <View className='right'>
              <View
                className='jcjp'
                onClick={() => {
                  Log.click({ buttonfid: 'x_10105', buttonsid: 'type1006' });
                  jumpUrl('/pages/home/hotGoods/hotGoods?title=京仓京配&id=15&type=jd');
                }}
              >
                <View className='desc'>
                  <Text className='title'>京仓京配</Text>
                  <Text className='intro'>好货不用等</Text>
                </View>
                <Image className='img' mode='widthFix' src={iconjcjp} />
              </View>
              <View className='line' />
              <View className='pzhh-jdcs'>
                <View
                  className='pzhh'
                  onClick={() => {
                    Log.click({ buttonfid: 'x_10105', buttonsid: 'type1007' });
                    jumpUrl('/pages/home/brandGoods/brandGoods');
                  }}
                >
                  <Text className='title'>品牌好货</Text>
                  <Text className='intro'>好货超高性价比</Text>
                  <View className='img-wrap'>
                    <Image className='img' mode='widthFix' src={iconpzhh} />
                  </View>
                </View>
                <View className='line' />
                <View
                  className='jdcs'
                  onClick={() => {
                    Log.click({ buttonfid: 'x_10105', buttonsid: 'type1008' });
                    jumpUrl('/pages/home/hotGoods/hotGoods?title=京东超市&id=6&type=jd');
                  }}
                >
                  <Text className='title'>京东超市</Text>
                  <Text className='intro'>超市好货特价抢</Text>
                  <View className='img-wrap'>
                    <Image className='img' mode='widthFix' src={iconjdcs} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* 拼多多 + 京东tab */}
        <View className='tabs-union'>
          <View
            className={selectedOpt === 'pdd' ? 'tab-pdd active' : 'tab-pdd'}
            onClick={this.handleTabClick.bind(this, 'pdd')}
          >
            <Text className='title'>拼多多</Text>
            <Text className='intro'>超值低价</Text>
          </View>
          <View className='line' />
          <View
            className={selectedOpt === 'jd' ? 'tab-jd active' : 'tab-jd'}
            onClick={this.handleTabClick.bind(this, 'jd')}
          >
            <Text className='title'>京东</Text>
            <Text className='intro'>正品大牌</Text>
          </View>
        </View>
        {/* 商品列表 */}
        <View className='goods-list'>
          {loading && goodsList.length === 0 && <Loading />}
          {goodsList.length > 0 && (
            <GoodsList
              goodsList={goodsList}
              union={selectedOpt}
              onClick={gds => {
                if (selectedOpt === 'pdd') {
                  jumpUrl(`/pages/details/pdd/pdd?id=${gds.id}`);
                } else {
                  jumpUrl(`/pages/details/jd/jd?id=${gds.id}`);
                }
              }}
            />
          )}
          {!loading && loadingByScroll && !noMore && <Loading />}
          {!loading && !loadingByScroll && noMore && <NoMore />}
        </View>
        {showSearchModal && (
          <View className='search-modal-wrap'>
            <View className='search-modal'>
              <View className='search-modal-header'>
                <Image
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxg/home/search_top.png'
                />
              </View>
              <View className='search-modal-content'>
                <View className='search-modal-content-title'>{clipboardData}</View>
                <View className='search-modal-content-split-line' />
                <View className='search-modal-content-union'>
                  <View className='item search-modal-content-union-pdd' onClick={this.jumpSearch.bind(this, 'pdd')}>
                    <View className='img' />
                    <View className='txt'>拼多多</View>
                  </View>
                  <View className='item search-modal-content-union-jd' onClick={this.jumpSearch.bind(this, 'jd')}>
                    <View className='img' />
                    <View className='txt'>京东</View>
                  </View>
                </View>
              </View>
              <View
                className='search-modal-close'
                onClick={() => {
                  Log.click({ buttonfid: 'x_10102' });
                  this.setState({
                    showSearchModal: false
                  });
                }}
              />
            </View>
          </View>
        )}
        {showSearchGoodsModal && (
          <View className='search-goods-modal-wrap'>
            <View className='search-goods-modal'>
              <View className='search-goods-modal-banner'>
                <Image className='img' src={searchGoods.thumbnail} mode='widthFix' />
              </View>
              <View className='search-goods-modal-info'>
                <View className='search-goods-modal-info-title'>
                  {searchGoods.name}
                  <View className={`union ${searchSelectedOpt}`} />
                </View>
                <View className='search-goods-modal-info-price'>
                  <View className='new'>
                    <Text className='label'>券后价：￥</Text>
                    <Text className='price'>{searchGoods.newPrice}</Text>
                  </View>
                  <Text className='old'>原价￥{searchGoods.oldPrice}</Text>
                </View>
                <View className='search-goods-modal-info-commission'>
                  <View className='commission'>
                    <View className='label'>下单后</View>
                    <View className='earn'>赚{searchGoods.commission}</View>
                  </View>
                  <View className='coupon'>券￥{searchGoods.coupon}</View>
                </View>
              </View>
              <View className='search-goods-modal-btns'>
                <View
                  className='btn search'
                  onClick={() => {
                    jumpUrl(`/pages/home/search/search?kw=${searchGoods.name}`);
                  }}
                >
                  更多搜索
                </View>
                <View
                  className='btn details'
                  onClick={() => {
                    if (searchSelectedOpt === 'pdd') {
                      jumpUrl(`/pages/details/pdd/pdd?id=${searchGoods.id}`);
                    } else {
                      jumpUrl(`/pages/details/jd/jd?id=${searchGoods.id}`);
                    }
                  }}
                >
                  立即领券
                </View>
              </View>
              {/* 关闭 */}
              <View
                className='search-goods-modal-close'
                onClick={() => {
                  this.setState({
                    showSearchGoodsModal: false
                  });
                }}
              />
            </View>
          </View>
        )}
        {/* <Dialog showOyuangouDialog={(firstorderstatus === 0 || !hasLogin) && showRedpackModal}>
          <Image style='margin-top:-30px;width:587rpx;' className='dialog-guide' mode='widthFix' src='https://h5.suixingou.com/miniprogram-assets/sxg/home/dialog-guide.png'></Image>
        </Dialog> */}
        {showGuideDialog && (
          <View
            className='redpack-modal-wrap black'
            onClick={() => {
              Log.click({ buttonfid: 'x_10149' });
              this.setState({
                showGuideDialog: false
              });
            }}
          >
            <View className='modal'>
              <View className='redpack'>
                <Image
                  style='margin-top:-30rpx;margin-left:-40rpx;width:587rpx;'
                  className='img'
                  mode='widthFix'
                  src='https://h5.suixingou.com/miniprogram-assets/sxg/home/dialog-guide.png'
                />
              </View>
            </View>
          </View>
        )}
        <TabBar index={0} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { banners, goods, rpUrl, haoquanGoods, search } = state.home;
  const { userInfo } = state.mine;
  const { loginInfo } = state.login;
  return {
    banners: banners.data,
    goods,
    haoquanGoods,
    userInfo,
    loginInfo,
    rpUrl,
    search
  };
}

export default connect(mapStateToProps)(Home);

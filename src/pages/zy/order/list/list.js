import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image } from '@tarojs/components';
import { orderListActions } from '../../../../redux/modules/zy/index';
import TitleBar from '../../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../../utils/wx';
import { throttle, formatDate } from '../../../../utils/util';
import Nomore from '../../../../components/baseNoMore';
import Nodata from '../../../../components/baseNoData';
import Loading from '../../../../components/loading/loading';
import ZyGoodsList from '../../component/goods/goodsList';
import ZyGoodsListiItem from '../../component/goods/item';
import '../../component/goods/goodsList.scss';
import './list.scss';
import ZyModal from '../../component/modal/index';
import '../../component/modal/index.scss';
import { Orderbtns } from '../../component/orderbtns/orderbtns';
import Log from '../../../../utils/log';

class Order extends Component {
  config = {
    navigationBarTitleText: '我的订单',
    enablePullDownRefresh: true
  };
  constructor() {
    super(...arguments);
    this.state = {
      currentTab: 0, //当前栏目
      isFixed: false,
      isModifiedAdress: false,
      showModal: false,
      content: '',
      onConfirmFuc: null //子组件的执行函数
    };
    this.top = 0;
    this.distance = '';
    this.timer = [];
  }
  async componentWillMount() {
    this.initthrottle = throttle(obj => {
      //节流函数 防止执行太快
      if (obj.scrollTop >= 0) {
        this.setState({
          isFixed: true
        });
      } else {
        this.setState({
          isFixed: false
        });
      }
    }, 160);
  }
  async componentDidMount() {
    const query = Taro.createSelectorQuery();
    let { dispatch, loginInfo } = this.props;
    if (loginInfo.accid) {
      //有accid再去请求订单
      await dispatch(orderListActions.loadOrderListAsync(this.state.currentTab));
    }
    query
      .select('.ul-tab-h')
      .boundingClientRect(rect => {
        this.top = rect.top; //获取元素定位高度
      })
      .exec();
      // 日志展现
      Log.click({ buttonfid: 'x_10167' });
  }
  async componentDidShow() {
    let { dispatch, loginInfo } = this.props;
    if (loginInfo.accid) {
      //有accid再去请求订单
      await dispatch(orderListActions.loadOrderListAsync(this.state.currentTab));
    }
    if (this.state.isModifiedAdress) {
      Taro.showToast({
        title: '地址修改成功',
        icon: 'none',
        duration: 2000
      });
      this.setState({
        isModifiedAdress: false
      });
    }
  }
  async componentDidHide() {
    let { dispatch } = this.props;
    dispatch(orderListActions.clear());
  }
  /**
   * 当登录回来时，需要更新佣金等信息。
   * @param {object}} nextProps 下一次接收的props
   */
  componentWillReceiveProps(nextProps) {
    // 获取推广url路径
    const {
      loginInfo: { accid: thisAccid },
      dispatch
    } = this.props;
    const {
      loginInfo: { accid }
    } = nextProps;
    if (accid && thisAccid !== accid) {
      this.timer.push(
        // setTimeout解决componentWillReceiveProps进入死循环问题
        setTimeout(() => {
          dispatch(orderListActions.loadOrderListAsync(this.state.currentTab));
        }, 1)
      );
    }
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(orderListActions.clear());
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }
  async onPullDownRefresh() {
    let { dispatch } = this.props;
    dispatch(orderListActions.clear());
    await dispatch(orderListActions.loadOrderListAsync(this.state.currentTab));
    Taro.stopPullDownRefresh();
  }
  onPageScroll(obj) {
    this.initthrottle(obj);
  }
  async onReachBottom() {
    let { dispatch } = this.props;
    await dispatch(orderListActions.loadOrderListAsync(this.state.currentTab));
    let { failedMsg, loadFailed } = this.props;
    if (loadFailed) {
      Taro.showToast({
        title: failedMsg,
        icon: 'none'
      });
    }
  }
  async handlerTabsHClick(i) {
    this.setState({
      currentTab: i
    });
    let { orderlist, dispatch } = this.props;
    let length = orderlist[i].data.length;
    if (length === 0) {
      await dispatch(orderListActions.loadOrderListAsync(i));
    }
  }
  copyTradeId(id) {
    Taro.setClipboardData({ data: id })
      .then(() => {
        Taro.showToast({
          title: '复制成功',
          icon: 'success'
        });
      })
      .catch(() => {
        Taro.showToast({
          title: '复制失败',
          icon: 'fail'
        });
      });
  }
  hideModal(e) {
    e.stopPropagation();
    this.setState({
      showModal: false
    });
  }
  onConfirmFuc() {
    this.setState({
      showModal: false
    });
    this.state.onConfirmFuc();
  }
  render() {
    let { currentTab, isFixed, showModal, content } = this.state;
    let { orderlist, loading } = this.props;
    let tabsH = ['全部', '待付款', '待发货', '待收货', '已完成'];
    let ulHtml = null;
    // let length = orderlist[currentTab].data.length;
    let data = orderlist[currentTab].data;
    if (data.length > 0) {
      ulHtml = (
        <View className='ul'>
          <ZyGoodsList>
            {data.map(item => {
              return (
                <ZyGoodsListiItem
                  data={item}
                  key={item.tradeId}
                  isOrder
                  onClick={() => {
                    jumpUrl(`/pages/zy/order/details/details?tradeId=${item.tradeId}`);
                  }}
                >
                  <View className='at-list__item-footer-btns'>
                    <Orderbtns tkStatus={item.tkStatus} data={item} />
                  </View>
                </ZyGoodsListiItem>
              );
            })}
          </ZyGoodsList>
          {orderlist[currentTab].loadFinish && <Nomore title='没有更多了哦~' />}
          {loading && <Loading />}
        </View>
      );
    } else {
      ulHtml = orderlist[currentTab].requestSuc && data.length === 0 && (
        <Nodata title='暂无订单记录' imgurl='https://h5.suixingou.com/miniprogram-assets/sxg/mine/nodata.png.png' />
      );
    }
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='我的订单' />
        <View className='ul-tab-h-wrapper'>
          <View className={isFixed ? 'ul-tab-h fixed' : 'ul-tab-h'} style={isFixed ? `top:${this.top}px` : ''}>
            {tabsH.map((item, i) => {
              let className = currentTab === i ? 'li active' : 'li';
              return (
                <View className={className} key={i} onClick={this.handlerTabsHClick.bind(this, i)}>
                  {item}
                </View>
              );
            })}
          </View>
        </View>
        <View className='ul-wrapper'>{ulHtml}</View>
        <ZyModal
          isOpened={showModal}
          title='提示'
          content={content}
          cancelText='取消'
          confirmText='确定'
          onClose={this.hideModal.bind(this)}
          onCancel={this.hideModal.bind(this)}
          onConfirm={this.onConfirmFuc.bind(this)}
        />
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state.mine.order);
  const { loading, loadFailed, failedMsg, data } = state.zy.orderList;
  const { loginInfo } = state.login;
  return {
    loginInfo,
    loading,
    loadFailed,
    failedMsg,
    orderlist: data
  };
}

export default connect(mapStateToProps)(Order);

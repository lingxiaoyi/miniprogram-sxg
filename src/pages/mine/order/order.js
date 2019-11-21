import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import classNames from 'classnames';
import { View, Text, Image } from '@tarojs/components';
import './order.scss';
import { orderInfoActions } from '../../../redux/modules/mine/index';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';
import { throttle, formatDate } from '../../../utils/util';
import Nomore from '../../../components/baseNoMore';
import Nodata from '../../../components/baseNoData';
import Loading from '../../../components/loading/loading';
import defaultImg from '../../../asset/default/160x160@3x.png';

class Order extends Component {
  config = {
    navigationBarTitleText: '我的订单',
    enablePullDownRefresh: true
  };
  constructor() {
    super(...arguments);
    this.state = {
      currentTab: 0, //当前栏目
      currentFilterData: [], //当前过滤索引
      showDialog: false,
      aniShowDialog: true,
      showPromt: true,
      isFixed: false,
      showOrderType: false,
      currentOrderSourceType: '全部订单',
      orderTypeHeight: 0 //全部订单弹窗元素的高度 动态计算
    };
    this.orderSourceType = ''; //订单类型//0 淘宝、2 拼多多
    this.top = 0;
    this.distance = '';
    this.old = [];
  }
  async componentWillMount() {
    let { dispatch } = this.props;
    //判断上方提示框,关闭之后不显示
    let orderShowPromt = Taro.getStorageSync('orderShowPromt');
    if (orderShowPromt) {
      this.setState({
        showPromt: false
      });
    } else {
      this.setState({
        showPromt: true
      });
    }
    await dispatch(orderInfoActions.loadOrderListAsync(0, this.state.currentFilterData, this.orderSourceType));
    this.initthrottle = throttle(obj => {
      //节流函数 防止执行太快
      if (obj.scrollTop >= this.distance) {
        this.setState({
          isFixed: true,
          showOrderType: false
        });
      } else {
        this.setState({
          isFixed: false
        });
      }
    }, 160);
  }
  componentDidMount() {
    const query = Taro.createSelectorQuery();
    this.windowHeight = Taro.getSystemInfoSync().windowHeight;
    query
      .select(`${this.state.showPromt ? '.prompt' : '.menu'}`)
      .boundingClientRect(rect => {
        this.top = rect.top; //获取元素的高度
      })
      .exec();
    query
      .select('.ul-tab-h')
      .boundingClientRect(rect => {
        this.distance = rect.top - this.top; //获取元素的高度
      })
      .exec();
      query
      .select('.menu')
      .boundingClientRect(rect => {
        this.orderTypeHeight = this.windowHeight - rect.bottom; //获取全部订单背景遮罩的高度
        this.setState({
          orderTypeHeight: this.windowHeight - rect.bottom
        })
      })
      .exec();
  }

  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(orderInfoActions.loadClearAsync());
  }
  async onPullDownRefresh() {
    let { dispatch } = this.props;
    dispatch(orderInfoActions.loadClearAsync());
    await dispatch(
      orderInfoActions.loadOrderListAsync(this.state.currentTab, this.state.currentFilterData, this.orderSourceType)
    );
    Taro.stopPullDownRefresh();
  }
  onPageScroll(obj) {
    this.initthrottle(obj);
  }
  async onReachBottom() {
    let { dispatch } = this.props;
    await dispatch(
      orderInfoActions.loadOrderListAsync(this.state.currentTab, this.state.currentFilterData, this.orderSourceType)
    );
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
      await dispatch(orderInfoActions.loadOrderListAsync(i, this.state.currentFilterData, this.orderSourceType));
    }
  }
  handlerHidePrompt() {
    this.setState({
      showPromt: false
    },()=>{
      const query = Taro.createSelectorQuery();
      query
        .select('.menu')
        .boundingClientRect(rect => {
          this.top = rect.top; //获取元素的高度
        })
        .exec();
        query
        .select('.ul-tab-h')
        .boundingClientRect(rect => {
          this.distance = rect.top - this.top; //获取元素的高度
        })
        .exec();
        query
        .select('.menu')
        .boundingClientRect(rect => {
          this.orderTypeHeight = this.windowHeight - rect.bottom; //获取全部订单背景遮罩的高度
          this.setState({
            orderTypeHeight: this.windowHeight - rect.bottom
          })
        })
        .exec();
      Taro.setStorageSync('orderShowPromt', 1);
    });

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
  //显示订单栏
  handlerShowOrderType() {
    this.setState({
      showOrderType: !this.state.showOrderType
    });
  }
  //切换订单类型
  async handlerSourceTypeClick({ type, title }) {
    if (this.orderSourceType !== type) {
      this.orderSourceType = type;
      let { dispatch } = this.props;
      let { currentFilterData, currentTab } = this.state;
      dispatch(orderInfoActions.loadClearAsync());
      await dispatch(orderInfoActions.loadOrderListAsync(currentTab, currentFilterData, this.orderSourceType));
      this.setState({
        currentOrderSourceType: title
      });
    }
    this.setState({
      showOrderType: !this.state.showOrderType
    });
  }
  //切换筛选条件
  async handerFilterData(e) {
    e.stopPropagation();
    let { currentFilterData, currentTab } = this.state;
    if (!this.equals(currentFilterData, this.old)) {
      //新旧筛选条件不同时执行
      let { dispatch } = this.props;
      dispatch(orderInfoActions.loadClearAsync());
      await dispatch(orderInfoActions.loadOrderListAsync(currentTab, currentFilterData, this.orderSourceType));
    }
    this.old = JSON.parse(JSON.stringify(currentFilterData));
    this.setState({
      aniShowDialog: false
    });
  }
  equals(arr1, arr2) {
    return arr1.sort().join() === arr2.sort().join();
  }
  render() {
    let { currentTab, currentFilterData, aniShowDialog, isFixed, showOrderType, currentOrderSourceType } = this.state;
    let { orderlist, loading } = this.props;
    let tabsH = ['全部', '已付款', '已结算', '已失效'];
    let filterData = [
      {
        title: '只看自购',
        text: '筛选自己产生的订单'
      },
      {
        title: '只看分享',
        text: '筛选分享被购买产生的订单'
      },
      {
        title: '只看直接粉丝',
        text: '筛选直接粉丝购买产生的订单'
      },
      {
        title: '只看间接粉丝',
        text: '筛选间接粉丝购买产生的订单'
      }
    ];
    let ulHtml = null;
    let length = orderlist[currentTab].data.length;
    let data = orderlist[currentTab].data;
    let tkStatus = {
      3: '已结算',
      12: '已付款',
      13: '已失效',
      14: '订单成功'
    };
    let orderSourceType = [
      {
        type: '', //将type传给接口
        title: '全部订单'
      },
      {
        type: 0,
        title: '淘宝订单'
      },
      {
        type: 2,
        title: '拼多多订单'
      },
      {
        type: 3,
        title: '京东订单'
      },
      {
        type: 4,
        title: '随心购订单'
      }
    ];
    if (length > 0) {
      ulHtml = (
        <View className='ul'>
          {data.map((item) => {
            let apOrderTypeOption = ['自购', '分享', '直粉', '间粉'];
            return (
              <View className={item.tkStatus === 13 ? 'li active' : 'li'} key={item.tradeId}>
                <View className='sec1 clearfix'>
                  <View className='left'>
                    <Image className='img' src={item.img || defaultImg} lazyLoad />
                    {item.tkStatus === 13 && <View className='icon' />}
                  </View>
                  <View className='info'>
                    <View className='row1'>
                      <Text className='tag'>{apOrderTypeOption[item.apOrderType - 1]}</Text>
                      <View className='text'>{item.itemTitle}</View>
                    </View>
                    <View className='p'>创建日:{formatDate(item.createTime, 'yyyy年MM月dd日 HH:mm')}</View>
                    <View className='p'>结算日:{formatDate(item.earningTime, 'yyyy年MM月dd日 HH:mm')}</View>
                    <View className='p'>订单号：{item.tradeId}</View>
                  </View>
                  {item.tkStatus !== 13 && <View className='status'>{tkStatus[item.tkStatus]}</View>}
                  <Text className='btn-copy' onClick={this.copyTradeId.bind(this, item.tradeId)}>
                    复制
                  </Text>
                </View>
                <View className='sec2 clearfix'>
                  {item.orderDescImg && <Image className='first' src={item.orderDescImg} />}
                  {item.tkStatus !== 13 && <Text className='tag'>预计佣金:￥{item.commission}</Text>}
                  <Text className='text'>
                    消费金额:¥<Text className='num'>{item.payPrice}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
          {orderlist[currentTab].loadFinish && <Nomore title='没有更多了哦~' />}
          {loading && <Loading />}
        </View>
      );
    } else {
      ulHtml = orderlist[currentTab].requestSuc && length === 0 && (
        <Nodata title='暂无订单记录' imgurl='https://h5.suixingou.com/miniprogram-assets/sxg/mine/nodata.png.png' />
      );
    }
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='我的订单' />
        {this.state.showPromt && (
          <View className='prompt'>
            <Text className='text'>每月25号即可提现上月确认收货(上月结算)的订单佣金</Text>
            <Text className='icon' onClick={this.handlerHidePrompt} />
          </View>
        )}
        <View className='menu'>
          <View className='left' onClick={this.handlerShowOrderType}>
            <Text className='text'>{currentOrderSourceType}</Text>
            <Text className={showOrderType ? 'icon active' : 'icon'} />
          </View>
          {showOrderType && (
            <View className='order-type' catchtouchmove style={`height:${this.state.orderTypeHeight}px;`}>
              {orderSourceType.map((item, i) => {
                return (
                  <View className='type' key={i} onClick={this.handlerSourceTypeClick.bind(this, item)}>
                    {item.title}
                  </View>
                );
              })}
            </View>
          )}
          <View
            className='right'
            onClick={() => {
              this.setState({
                aniShowDialog: true,
                showDialog: true
              });
            }}
          >
            筛选
            <Text className='icon' />
          </View>
        </View>
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
        {this.state.showDialog && (
          <View
            className='dialog-wrapper'
            onClick={() => {
              this.setState({
                aniShowDialog: false,
                currentFilterData: this.old
              });
            }}
          >
            <View
              className={aniShowDialog ? 'dialog slideInRight' : 'dialog slideOutRight'}
              onAnimationEnd={() => {
                if (!aniShowDialog) {
                  this.setState({
                    showDialog: false
                  });
                }
              }}
              onClick={e => {
                e.stopPropagation();
                this.setState({
                  aniShowDialog: true
                });
              }}
            >
              <View className='head'>过滤条件</View>
              <View className='con'>
                <View className='ul'>
                  {filterData.map((item, i) => {
                    const optionCls = classNames('at-checkbox__option', {
                      radio: true,
                      active: currentFilterData.includes(i)
                    });
                    return (
                      <View
                        className='li clearfix'
                        key={i}
                        onClick={() => {
                          let arr = JSON.parse(JSON.stringify(currentFilterData));
                          console.log(arr);
                          this.old = JSON.parse(JSON.stringify(currentFilterData)); //用来保存老的currentFilterData数据
                          if (arr.includes(i)) {
                            arr.splice(arr.findIndex(id => id === i), 1);
                            this.setState({
                              currentFilterData: arr
                            });
                          } else {
                            arr.push(i);
                            this.setState({
                              currentFilterData: arr
                            });
                          }
                        }}
                      >
                        <View className='icon' />
                        <View className='info'>
                          <View className='h6'>{item.title}</View>
                          <View className='h3'>{item.text}</View>
                        </View>
                        <View className={optionCls} />
                      </View>
                    );
                  })}
                </View>
              </View>
              <View className='btns'>
                <View
                  className='btn'
                  onClick={() => {
                    this.setState({
                      currentFilterData: []
                    });
                  }}
                >
                  重置
                </View>
                <View className='btn' onClick={this.handerFilterData}>
                  确定
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state.mine.order);
  const { loading, loadFailed, failedMsg, data } = state.mine.order;
  const { orderlist } = data;
  return {
    loading,
    loadFailed,
    failedMsg,
    orderlist
  };
}

export default connect(mapStateToProps)(Order);

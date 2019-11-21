import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text } from '@tarojs/components';
import DownloadApp from '../component/messagebox/downloadApp';
import './earnings.scss';
import { jumpUrl, getGlobalData } from '../../../utils/wx';
import TitleBar from '../../../components/titleBar/titleBar';
import { earningsInfoActions } from '../../../redux/modules/mine/index';

class Earnings extends Component {
  config = {
    navigationBarTitleText: '我的收益'
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDialog: false,
      dialog: {
        title: '',
        text: ''
      },
      showDownLoadApp: false
    };
  }

  async componentWillMount() {
    let { dispatch } = this.props;
    await dispatch(earningsInfoActions.loadEarningsAsync());
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(earningsInfoActions.loadClearAsync());
  }
  componentDidShow() {}

  componentDidHide() {}
  gotoPage(url) {
    jumpUrl(url);
  }
  showDialog(num) {
    num = num - 1;
    let dialogOption = {
      0: {
        title: '上月结算收入',
        text: '上个月内确认收货的订单收益，每月25号结算后，将转入余额'
      },
      1: {
        title: '本月结算收入',
        text: '本月已确认收货的订单收入总和'
      },
      2: {
        title: '上月预估收入',
        text: '上月内创建的所有订单预估收益'
      },
      3: {
        title: '本月预估收入',
        text: '本月内创建的所有订单预估收益'
      },
      4: {
        title: '今日付款笔数',
        text: '今日所有付款订单数量,包含有效订单和失效订单'
      },
      5: {
        title: '今日预估收益',
        text: '今天创建的有效订单预估收益'
      },
      6: {
        title: '昨日付款笔数',
        text: '昨日所有付款订单数量,包含有效订单和失效订单'
      },
      7: {
        title: '昨日预估收益',
        text: '昨日创建的有效订单预估收益'
      }
    };
    this.setState({
      dialog: {
        title: dialogOption[num].title,
        text: dialogOption[num].text
      },
      showDialog: !this.state.showDialog
    });
  }
  render() {
    let urls = {
      fans: '/pages/mine/fans/fans',
      earnings: '/pages/mine/earnings/earnings', //我的收益
      withdrawal: '/pages/mine/withdrawal/withdrawal', //提现纪录
      commission: '/pages/mine/commission/commission', //结算佣金记录
      order: '/pages/mine/order/order'
    };

    const {
      balance = 0,
      //incomeSettleTotal = 0, // 累计结算收益（订单状态3）
      incomeSettleLastmon = 0, //上月结算收益（订单状态3）
      incomeEstimateLastmon = 0, //上月预估收益（订单状态3、12）
      incomeEstimateThismon = 0, //本月预估收益（订单状态3、12）
      incomeEstimateYesterday = 0, //昨日预估收益（订单状态3、12）
      incomeEstimateToday = 0, //今日预估收益（订单状态3、12）
      orderCntYesterday = 0, //昨日付款笔数（订单状态3、12）
      orderCntToday = 0, //今日付款笔数（订单状态3、12）
      //incomeSettleThismon = 0, //本月结算收益
      //orderCntThismon = 0, //本月付款笔数（订单状态3、12）
      //incomeWithdrawTotal = 0, //累计已提现收益
      //incomeNosettleCurrent = 0, //当前未结算收益（订单状态12）
      incomeSettleThismonNew = 0 // (新版)本月结算收益（订单状态3）
    } = this.props;
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='我的收益' />
        <View className='sec1'>
          <View className='h3'>账户余额(元)</View>
          <View className='num'>{balance}</View>
          <View
            className='btn-withdrawal'
            onClick={() => {
              this.setState({
                showDownLoadApp: true
              });
            }}
          >
            立即提现
          </View>
        </View>
        <View className='sec2'>
          <View className='ul'>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>上月结算收入(元)</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 1)} />
              </View>
              <View className='h3'>{incomeSettleLastmon}</View>
            </View>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>本月结算收入(元)</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 2)} />
              </View>
              <View className='h3'>{incomeSettleThismonNew}</View>
            </View>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>上月预估收入(元)</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 3)} />
              </View>
              <View className='h3'>{incomeEstimateLastmon}</View>
            </View>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>本月预估收入(元)</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 4)} />
              </View>
              <View className='h3'>{incomeEstimateThismon}</View>
            </View>
          </View>
        </View>
        <View className='sec3'>
          <View className='title'>今日日报</View>
          <View className='ul'>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>付款笔数</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 5)} />
              </View>
              <View className='h3'>{orderCntToday}</View>
            </View>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>实时预估佣金(元)</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 6)} />
              </View>
              <View className='h3'>{incomeEstimateToday}</View>
            </View>
          </View>
        </View>
        <View className='sec3'>
          <View className='title'>昨日日报</View>
          <View className='ul'>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>付款笔数</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 7)} />
              </View>
              <View className='h3'>{orderCntYesterday}</View>
            </View>
            <View className='li'>
              <View className='h4'>
                <Text className='text'>实时预估佣金(元)</Text>
                <Text className='i-ques' onClick={this.showDialog.bind(this, 8)} />
              </View>
              <View className='h3'>{incomeEstimateYesterday}</View>
            </View>
          </View>
        </View>
        <View className='sec5' onClick={this.gotoPage.bind(this, urls.commission)}>
          <Text className='text'>结算佣金明细</Text>
          <Text className='icon' />
        </View>
        <View className='sec5' onClick={this.gotoPage.bind(this, urls.withdrawal)}>
          <Text className='text'>提现记录</Text>
          <Text className='icon' />
        </View>
        {this.state.showDialog && (
          <View className='dialog-wrapper'>
            <View className='dialog'>
              <View className='head'>{this.state.dialog.title}</View>
              <View className='con'>
                <View className='row1'>
                  <View className='li'>{this.state.dialog.text}</View>
                </View>
                <View
                  className='btn-confirm'
                  onClick={() => {
                    this.setState({
                      showDialog: !this.state.showDialog
                    });
                  }}
                >
                  我知道了
                </View>
              </View>
            </View>
          </View>
        )}
        {this.state.showDownLoadApp && (
          <DownloadApp
            onCloseCallback={() => {
              this.setState({
                showDownLoadApp: false
              });
            }}
          />
        )}
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  const { loading, loadFailed, failedMsg, data } = state.mine.earnings;
  return {
    loading,
    loadFailed,
    failedMsg,
    ...data
  };
}
export default connect(mapStateToProps)(Earnings);

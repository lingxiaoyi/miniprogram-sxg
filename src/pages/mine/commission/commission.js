import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';
import { formatDate } from '../../../utils/util';
import './commission.scss';
import { commissionActions } from '../../../redux/modules/mine/index';
import Nomore from '../../../components/baseNoMore';
import Nodata from '../../../components/baseNoData';

class DefaultComponent extends Component {
  config = {
    navigationBarTitleText: '佣金记录'
  };
  constructor() {
    super(...arguments);
    this.state = {};
  }
  componentWillMount() {
    let { dispatch } = this.props;
    dispatch(commissionActions.loadCommissionAsync());
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(commissionActions.loadClearAsync());
  }

  async onReachBottom() {
    let { dispatch } = this.props;
    await dispatch(commissionActions.loadCommissionAsync());
    let { failedMsg, loadFailed } = this.props;
    if (loadFailed) {
      Taro.showToast({
        title: failedMsg,
        icon: 'none'
      });
    }
  }

  render() {
    let { data, loadFinish, requestSuc } = this.props;
    let html = null;
    if (data.length > 0) {
      html = (
        <View className='ul'>
          {data.map((monthData) => {
            return (
              <View className='li-wrapper' key={monthData.id}>
                <View className='title'>
                  <Text className='text'>{monthData.month}</Text>
                  <Text className='num'>¥{monthData.commissionAccount}</Text>
                </View>
                {monthData.list.map((item) => {
                  return (
                    <View className='li' key={item.id}>
                      <View className='h3'>
                        <Text className='text'>{item.itemTitle}</Text>
                      </View>
                      <View className='h4'>
                        <Text className='text'>创建时间:{formatDate(item.createTime, 'yyyy.MM.dd')}</Text>
                        <Text className='text'>结算时间:{formatDate(item.earningTime, 'yyyy.MM.dd')}</Text>
                        <Text className='text'>
                          佣金:<Text className='red'>{item.commission}元</Text>
                        </Text>
                        <Text className='text'>订单金额:{item.payPrice}元</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
          {loadFinish && <Nomore title='没有更多了哦~' />}
        </View>
      );
    } else {
      html = requestSuc && data.length === 0 && <Nodata title='暂无佣金记录' imgurl='https://h5.suixingou.com/miniprogram-assets/sxg/mine/nodata-earnings.png'  />;
    }
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='结算佣金' />
        {html}
      </View>
    );
  }
}
function mapStateToProps(state) {
  //console.log('state>>', state);
  return {
    ...state.mine.commission
  };
}
export default connect(mapStateToProps)(DefaultComponent);

import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View } from '@tarojs/components';

import Loading from '../../../components/loading/loading';
import NoMore from '../../../components/noMore/noMore';
import GoodsList from '../../../components/goods/goodsList';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { mailingFreeActions } from '../../../redux/modules/home';

import './mailingFree.scss';

class MailingFree extends Component {
  config = {
    navigationBarTitleText: '9.9包邮',
    navigationBarTextStyle: 'white'
  };

  constructor() {
    super(...arguments);
    this.state = {
      // title: ''
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { type = 'pdd' } = this.$router.params;
    dispatch(mailingFreeActions.changeOpt(type));
    dispatch(mailingFreeActions.loadMailingFreeGoodsAsync(getGlobalData('sxg_accid')));
  }

  componentWillUnmount() {
    // 页面卸载时，清空数据
    // this.props.dispatch(mailingFreeActions.clearHotGoods());
  }

  onReachBottom() {
    const { dispatch, noMore } = this.props;
    if (!noMore) {
      dispatch(mailingFreeActions.loadMailingFreeGoodsByScrollAsync(getGlobalData('sxg_accid')));
    }
  }

  handleTabsClick(tabName) {
    this.props.dispatch(mailingFreeActions.changeOpt(tabName));
    this.props.dispatch(mailingFreeActions.loadMailingFreeGoodsAsync(getGlobalData('sxg_accid')));
  }

  render() {
    const { selectedOpt, goods } = this.props;
    const { data: goodsList, loading, loadingByScroll, noMore } = goods;
    return (
      <View
        className='hot-goods'
        style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
      >
        {/* titlebar */}
        <TitleBar title='9.9包邮' bgstyle='black' fontstyle='light' />
        <View className='tabs'>
          <View
            className={`tabs-item tabs-pdd ${selectedOpt === 'pdd' && 'active'}`}
            onClick={this.handleTabsClick.bind(this, 'pdd')}
          >
            拼多多
          </View>
          <View
            className={`tabs-item tabs-jd ${selectedOpt === 'jd' && 'active'}`}
            onClick={this.handleTabsClick.bind(this, 'jd')}
          >
            京东
          </View>
        </View>
        {/* 商品列表 */}
        <View className='goods-list'>
          {loading && goodsList.length === 0 && <View className='loading'>加载中...</View>}
          {!loading && goodsList.length > 0 && (
            <GoodsList
              goodsList={goodsList}
              itemStyle='item'
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
          {/* {!loading && (
            <View className='bottom'>{loadingByScroll ? '加载中...' : noMore ? '~没有更多数据了~' : ''}</View>
          )} */}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { mailingFree } = state.home;
  const { selectedOpt, goodsByOpt } = mailingFree;
  return {
    selectedOpt,
    // goodsByOpt,
    goods: goodsByOpt[selectedOpt] || {}
  };
}

export default connect(mapStateToProps)(MailingFree);

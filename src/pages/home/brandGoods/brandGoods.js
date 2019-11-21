import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View } from '@tarojs/components';

import Loading from '../../../components/loading/loading';
import NoMore from '../../../components/noMore/noMore';
import GoodsList from '../../../components/goods/goodsList';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { brandGoodsActions } from '../../../redux/modules/home';

import './brandGoods.scss';

class BrandGoods extends Component {
  config = {
    navigationBarTitleText: '品牌好货',
    navigationBarTextStyle: 'white'
  };

  constructor() {
    super(...arguments);
    this.state = {
      tabs: [
        {
          id: 11,
          name: '潮流范儿'
        },
        {
          id: 12,
          name: '精致生活'
        },
        {
          id: 13,
          name: '数码先锋'
        },
        {
          id: 14,
          name: '品质家电'
        }
      ]
    };
  }

  componentDidMount() {
    const { dispatch, selectedOpt } = this.props;
    // const { type = 11 } = this.$router.params;
    dispatch(brandGoodsActions.changeOpt(selectedOpt));
    dispatch(brandGoodsActions.loadAsync(getGlobalData('sxg_accid')));
  }

  componentWillUnmount() {}

  onReachBottom() {
    const { dispatch, noMore } = this.props;
    if (!noMore) {
      dispatch(brandGoodsActions.loadByScrollAsync(getGlobalData('sxg_accid')));
    }
  }

  handleTabsClick(id) {
    this.props.dispatch(brandGoodsActions.changeOpt(id));
    this.props.dispatch(brandGoodsActions.loadAsync(getGlobalData('sxg_accid')));
  }

  render() {
    const { tabs } = this.state;
    const { selectedOpt, goods } = this.props;
    const { data: goodsList, loading, loadingByScroll, noMore } = goods;

    const tabsItem = tabs.map(tb => {
      const { id, name } = tb;
      return (
        <View
          key={id}
          className={`tabs-item tabs-pdd ${selectedOpt === id && 'active'}`}
          onClick={this.handleTabsClick.bind(this, id)}
        >
          {name}
        </View>
      );
    });

    return (
      <View
        className='brand-goods'
        style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
      >
        {/* titlebar */}
        <TitleBar title='品牌好货' bgstyle='black' fontstyle='light' />
        <View className='tabs'>{tabsItem}</View>
        {/* 商品列表 */}
        <View className='goods-list'>
          {loading && goodsList.length === 0 && <View className='loading'>加载中...</View>}
          {!loading && goodsList.length > 0 && (
            <GoodsList
              goodsList={goodsList}
              itemStyle='item'
              union='jd'
              onClick={gds => {
                jumpUrl(`/pages/details/jd/jd?id=${gds.id}`);
              }}
            />
          )}
          {!loading && loadingByScroll && !noMore && <Loading />}
          {!loading && !loadingByScroll && noMore && <NoMore />}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { brandGoods } = state.home;
  const { selectedOpt, goodsByOpt } = brandGoods;
  return {
    selectedOpt,
    // goodsByOpt,
    goods: goodsByOpt[selectedOpt] || {}
  };
}

export default connect(mapStateToProps)(BrandGoods);

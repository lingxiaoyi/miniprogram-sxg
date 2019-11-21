import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View } from '@tarojs/components';
import GoodsList from '../../../components/goods/goodsList';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { hotGoodsActions } from '../../../redux/modules/home';
import withLogin from '../../../components/wrappedComponent/withLogin';

import './hotGoods.scss';

@withLogin('didMount')
class HotGoods extends Component {
  config = {
    navigationBarTitleText: ''
  };

  constructor() {
    super(...arguments);
    this.state = {
      title: ''
    };
  }

  componentDidMount() {
    const {
      dispatch,
      loginInfo: { accid }
    } = this.props;
    const { title = '商品列表', id, type = 'pdd' } = this.$router.params;
    this.id = id;
    this.type = type;
    Taro.setNavigationBarTitle({
      title
    });
    this.setState({
      title
    });
    // console.log('===================');
    // console.log(type);
    // console.log('===================');
    dispatch(hotGoodsActions.loadAsync(id, accid, type));
  }

  componentWillUnmount() {
    // 页面卸载时，清空数据
    this.props.dispatch(hotGoodsActions.clear());
  }

  onReachBottom() {
    const {
      dispatch,
      loginInfo: { accid },
      noMore
    } = this.props;
    if (!noMore && this.type !== 'mix') {
      dispatch(hotGoodsActions.loadByScrollAsync(this.id, accid, this.type));
    }
  }

  handleGoodsClick(gds, type) {
    let tp = 'pdd';
    if (this.type === 'mix') {
      tp = type;
    } else {
      tp = this.type;
    }

    if (tp === 'pdd') {
      jumpUrl(`/pages/details/pdd/pdd?id=${gds.id}`);
    } else {
      jumpUrl(`/pages/details/jd/jd?id=${gds.id}`);
    }
  }

  render() {
    const { title } = this.state;
    const { goodsList, loading, loadingByScroll, noMore } = this.props;
    return (
      <View
        className='hot-goods'
        style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
      >
        {/* titlebar */}
        <TitleBar title={title} />
        {/* 商品列表 */}
        <View className='goods-list'>
          {loading && goodsList.length === 0 && <View className='loading'>加载中...</View>}
          {!loading && goodsList.length > 0 && (
            <GoodsList
              goodsList={goodsList}
              itemStyle='item'
              union={this.type}
              onClick={(goods, type) => {
                this.handleGoodsClick(goods, type);
              }}
            />
          )}
          {!loading && (
            <View className='bottom'>{loadingByScroll ? '加载中...' : noMore ? '~没有更多数据了~' : ''}</View>
          )}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { hotGoods } = state.home;
  const { loading, loadingByScroll, noMore, data: goodsList } = hotGoods;
  const { loginInfo } = state.login;
  return {
    goodsList,
    loading,
    loadingByScroll,
    noMore,
    loginInfo
  };
}

export default connect(mapStateToProps)(HotGoods);

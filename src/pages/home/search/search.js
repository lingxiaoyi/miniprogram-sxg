import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Input } from '@tarojs/components';
import GoodsList from '../../../components/goods/goodsList';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { searchActions } from '../../../redux/modules/home';
import Loading from '../../../components/loading/loading';
import NoMore from '../../../components/noMore/noMore';

import './search.scss';

class Search extends Component {
  config = {
    navigationBarTitleText: '搜索',
    navigationBarTextStyle: 'white'
  };
  constructor() {
    super(...arguments);
    this.state = {
      isFocus: false,
      value: '',
      // filterTop: 0,
      placeholder: '搜索商品'
    };
  }
  componentWillMount() {
    this.focus = this.$router.params.focus;
  }
  componentDidMount() {
    const { kw } = this.$router.params;
    const { dispatch } = this.props;
    if (kw) {
      dispatch(searchActions.loadAsync(kw, getGlobalData('sxg_accid')));
      this.setState({
        value: kw
      });
    }

    // Taro.createSelectorQuery()
    //   .select('#search_list')
    //   .boundingClientRect(rect => {
    //     this.setState({
    //       filterTop: rect.top + rect.height
    //     });
    //   })
    //   .exec();
  }
  componentWillUnmount() {
    this.props.dispatch(searchActions.clear());
  }
  componentDidUpdate() {}

  handleChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  handleFocus() {
    this.setState({
      isFocus: true
    });
  }

  handleConfirm() {
    this.props.dispatch(searchActions.loadAsync(this.state.value, getGlobalData('sxg_accid')));
  }

  handleBlur() {
    this.setState({
      isFocus: false
    });
  }

  handleClear() {
    this.setState({
      value: '',
      isFocus: true
    });
  }

  onReachBottom() {
    if (this.props.noMore) {
      return;
    }
    this.props.dispatch(searchActions.loadByScrollAsync(this.state.value, getGlobalData('sxg_accid')));
  }

  handleTabsClick(opt) {
    this.props.dispatch(searchActions.changeOpt(opt));
    if (!this.state.value) return;
    this.props.dispatch(searchActions.loadAsync(this.state.value, getGlobalData('sxg_accid')));
  }

  loadDataBySort(sortType) {
    const { dispatch } = this.props;
    dispatch(searchActions.changeSortType(sortType));
    dispatch(searchActions.loadAsync(this.state.value, getGlobalData('sxg_accid')));
  }

  render() {
    const { isFocus, value, placeholder } = this.state;
    const { selectedOpt, sortType, goods } = this.props;
    const { data: searchList, loading, loadingByScroll, noMore } = goods;
    const placeholderWrapStyle = {};
    const actionStyle = {};
    const clearIconStyle = { display: 'flex' };
    if (isFocus || (!isFocus && value)) {
      // placeholderWrapStyle.width = `${placeholder.length * 28}px`; // 28为字体大小
      placeholderWrapStyle.width = `${Taro.pxTransform(200)}`; // 200px为placeholder的宽度
      actionStyle.opacity = 1;
      actionStyle.marginRight = '0';
    } else if (!isFocus && !value) {
      placeholderWrapStyle.width = '100%';
      actionStyle.opacity = 0;
      actionStyle.marginRight = `-${Taro.pxTransform(104)}`;
    }
    if (!value.length) {
      clearIconStyle.display = 'none';
      placeholderWrapStyle.visibility = 'visible';
    } else {
      placeholderWrapStyle.visibility = 'hidden';
    }
    return (
      <View
        className='search-container'
        style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}
      >
        {/* titlebar */}
        <TitleBar title='商品搜索' bgstyle='black' fontstyle='light' />
        {/* 搜索框 */}
        <View id='searchbar' className='searchbar'>
          <View className='searchbar-content'>
            <View className='searchbar-placeholder-wrap' style={placeholderWrapStyle}>
              <Text className='searchbar-icon-search' />
              <Text className='searchbar-placeholder'>{placeholder}</Text>
            </View>
            <Input
              className='searchbar-input'
              type='text'
              confirmType='search'
              value={value}
              focus={!!this.focus}
              maxLength='50'
              onInput={this.handleChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              onConfirm={this.handleConfirm}
            />
            <View className='searchbar-clear' onTouchStart={this.handleClear} style={clearIconStyle} />
          </View>
          <View className='searchbar-action' onClick={this.handleConfirm} style={actionStyle}>
            搜索
          </View>
          {/* tabs */}
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
          {/* 过滤条件 */}
          {searchList.length > 0 && (
            <View className='filter-condition'>
              <View
                className={`item comprehensive ${sortType === 0 ? 'active' : ''}`}
                onClick={() => {
                  if (sortType !== 0) {
                    this.loadDataBySort(0);
                  }
                }}
              >
                <Text className='txt'>综合</Text>
              </View>
              <View
                className={`item sales-volume ${sortType === 6 ? 'active' : ''}`}
                onClick={() => {
                  if (sortType !== 6) {
                    this.loadDataBySort(6);
                  }
                }}
              >
                <Text className='txt'>销量</Text>
                <Text className='icon' />
              </View>
              <View
                className={`item price ${sortType === 3 && 'active asc'} ${sortType === 4 && 'active desc'}`}
                onClick={() => {
                  this.loadDataBySort(sortType === 3 ? 4 : 3);
                }}
              >
                <Text className='txt'>价格</Text>
                <Text className='icon' />
              </View>
              <View
                className={`item commission-rate ${sortType === 1 && 'active asc'} ${sortType === 2 && 'active desc'}`}
                onClick={() => {
                  this.loadDataBySort(sortType === 2 ? 1 : 2);
                }}
              >
                <Text className='txt'>佣金比例</Text>
                <Text className='icon' />
              </View>
            </View>
          )}
        </View>

        <View id='search_list' className='search-list'>
          {loading && searchList.length === 0 && <Loading txt='努力搜索中...' />}
          {!loading && searchList.length === 0 && <Loading txt='~抱歉/(ㄒoㄒ)/未找到你想要的宝贝~' />}
          {/* 筛选条件：0-综合排序;1-按佣金比率升序;2-按佣金比例降序;3-按价格升序;4-按价格降序;5-按销量升序;6-按销量降序; */}
          {searchList.length > 0 && (
            <View className='search-list-wrap'>
              {/* 商品列表 */}
              <GoodsList
                goodsList={searchList}
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
              {!loading && loadingByScroll && !noMore && <Loading />}
              {!loading && !loadingByScroll && noMore && <NoMore />}
            </View>
          )}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { search } = state.home;
  const { selectedOpt, goodsByOpt, sortType } = search;
  return {
    selectedOpt,
    sortType,
    // goodsByOpt,
    goods: goodsByOpt[selectedOpt] || {}
  };
}

export default connect(mapStateToProps)(Search);

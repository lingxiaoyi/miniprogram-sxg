import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Image } from '@tarojs/components';
import './fans.scss';
import { fansInfoActions } from '../../../redux/modules/mine/index';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData } from '../../../utils/wx';
import { throttle, formatDate } from '../../../utils/util';
import Nomore from '../../../components/baseNoMore';
import Nodata from '../../../components/baseNoData';

class Fans extends Component {
  config = {
    navigationBarTitleText: '我的粉丝',
    onReachBottomDistance: 50
  };
  constructor() {
    super(...arguments);
    this.state = {
      showDialog: false,
      isFixed: false,
      current: 0, //当前栏目
      showDialogIndex: 0, //当前显示弹窗
      aniShowDialog: true //弹窗动画
    };
    this.height = '';
    this.top = 0;
  }
  async componentWillMount() {
    let { dispatch } = this.props;
    //await dispatch(fansInfoActions.loadFansNumAsync());
    await dispatch(fansInfoActions.loadFansListAsync(0));
    await dispatch(fansInfoActions.loadFansListAsync(1));
    this.initthrottle = throttle(obj => {
      //节流函数 防止执行太快
      if (obj.scrollTop >= this.height) {
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
  componentDidMount() {
    const query = Taro.createSelectorQuery();
    query
      .select('.sec1')
      .boundingClientRect(rect => {
        this.top = rect.top;
        this.height = rect.height; //获取元素的高度
      })
      .exec();
  }
  componentWillUnmount() {
    let { dispatch } = this.props;
    dispatch(fansInfoActions.loadClearAsync());
  }
  componentDidShow() {}
  componentDidHide() {}
  handlerLiClick(index) {
    this.setState({
      current: index
    });
  }
  async onReachBottom() {
    let { dispatch } = this.props;
    await dispatch(fansInfoActions.loadFansListAsync(this.state.current));
    let { failedMsg, loadFailed } = this.props;
    if (loadFailed) {
      Taro.showToast({
        title: failedMsg,
        icon: 'none'
      });
    }
  }
  onPageScroll(obj) {
    this.initthrottle(obj);
  }
  async showDialog(index, item) {
    let { dispatch, inviteelist } = this.props;
    let { current } = this.state;
    let showDialogData = inviteelist[current].data[index].incomeEstimateLastmon;
    if (typeof showDialogData === 'undefined') {
      await dispatch(fansInfoActions.loadFansInfoAsync(this.state.current, index, item.accid));
    }
    this.setState({
      showDialog: true,
      showDialogIndex: index,
      aniShowDialog: true
    });
  }
  render() {
    let { inviteecnttotal, inviteelist, requestSuc, inviteeCnt } = this.props;
    let { current, showDialogIndex, isFixed, showDialog, aniShowDialog } = this.state;
    let inviteeiIndirect = inviteecnttotal-inviteeCnt;
    let tabsHd = ['直属粉丝', '间接粉丝'];
    let fansInfo = inviteelist[current].data[showDialogIndex] || {};
    let {
      figureurl = '',
      nickname = '',
      incomeEstimateLastmon = 0, //上月预估收益
      incomeEstimateWithdrawTotal = 0, //累计预估收益
      createtime = ''
    } = fansInfo;
    let defaultFigureurl = 'https://h5.suixingou.com/miniprogram-assets/sxg/mine/default-avatar.png';
    figureurl = figureurl || defaultFigureurl; //没有图片就用默认的

    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='我的粉丝' />
        <View className='sec1'>
          <View className='h3'>我的粉丝</View>
          <View className='num'>{inviteecnttotal}</View>
        </View>
        <View className='sec2'>
          {inviteelist[1].data.length && ( //没有间接粉丝就隐藏tabs
            <View className='tabs-hd-wrapper'>
              <View className={isFixed ? 'tabs-hd fixed' : 'tabs-hd'} style={isFixed ? `top:${this.top}px` : ''}>
                {tabsHd.map((item, index) => {
                  return (
                    <View
                      className={current === index ? 'li active' : 'li'}
                      onClick={this.handlerLiClick.bind(this, index)}
                      key={index}
                    >
                      {item}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          <View className='tabs-bd'>
            <View className='ul'>
              {inviteelist[current].data.map((item, index) => {
                return (
                  <View className='li' key={item.accid} onClick={this.showDialog.bind(this, index, item)}>
                    <View className='head-img'>
                      <Image className='img' src={item.figureurl || defaultFigureurl} />
                    </View>
                    <View className='info'>
                      <View className='h3'>{item.nickname}</View>
                      <View className='text'>{item.mobile.substr(0, 3) + '****' + item.mobile.substr(7)}</View>
                    </View>
                    <View className='i-more' />
                  </View>
                );
              })}
            </View>
            {inviteelist[0].data.length !== 0 && inviteelist[current].loadFinish && <Nomore title='没有更多了哦~' />}
            {inviteelist[0].data.length > 0 && (
              <View className='bar-bottom'>
                {tabsHd[current]}
                {current === 0 ? inviteeCnt : inviteeiIndirect}人
              </View>
            )}
          </View>
        </View>
        {inviteelist[0].data.length === 0 && requestSuc && (
          <Nodata title='暂无粉丝记录' imgurl='https://h5.suixingou.com/miniprogram-assets/sxg/mine/nodata-fans.png' />
        )}
        {showDialog && (
          <View className='dialog-wrapper'>
            <View className='dialog'>
              <View className={aniShowDialog ? 'zoomIn dialog-ani' : 'dialog-ani'}>
                <View className='head'>
                  <View className='head-img'>
                    <Image className='img' src={figureurl} />
                  </View>
                  <View className='name'>{nickname}</View>
                  <View
                    className='close'
                    onClick={() => {
                      this.setState({
                        showDialog: false,
                        aniShowDialog: false
                      });
                    }}
                  />
                </View>
                <View className='con'>
                  <View className='row1'>
                    <View className='li'>
                      <View className='h6'>上月预估收益(元)</View>
                      <View className='h3'>{incomeEstimateLastmon}</View>
                    </View>
                    <View className='li'>
                      <View className='h6'>累计预估收益(元)</View>
                      <View className='h3'>{incomeEstimateWithdrawTotal}</View>
                    </View>
                  </View>
                  <View className='row2'>注册时间 {formatDate(createtime, 'yyyy.MM.dd HH:mm:ss')}</View>
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
  //console.log('state>>', state.mine.fans.data);
  const { loading, loadFailed, failedMsg, data, requestSuc } = state.mine.fans;
  const { inviteecnttotal, inviteeCnt } = state.mine.userInfo.data;
  const { inviteelist } = data;
  return {
    requestSuc,
    loading,
    loadFailed,
    failedMsg,
    inviteecnttotal,
    inviteelist,
    inviteeCnt
  };
}
export default connect(mapStateToProps)(Fans);

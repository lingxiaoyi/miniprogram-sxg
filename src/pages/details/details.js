import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image } from '@tarojs/components';
import { getGlobalData } from '../../utils/wx';
import { detailsTbActions } from '../../redux/modules/details';
import { getScene } from '../../utils/api';
import Log from '../../utils/log';
import TitleBar from '../../components/titleBar/titleBar';

import './details.scss';

class Tb extends Component {
  config = {
    navigationBarTitleText: '商品详情'
  };
  constructor() {
    super(...arguments);
    this.state = {
      noSignedtkl: ''
    };
    this.shareAccid = '';
  }
  async componentWillMount() {
    let { tkl, scene, accid } = this.$router.params;
    const { dispatch } = this.props;
    this.shareAccid = accid || '';
    if (!tkl && scene) {
      let dsence = await getScene(scene);
      // console.log('=================');
      // console.log(scene);
      // console.log(dsence);
      // console.log('=================');
      tkl = dsence.tkl;
      this.shareAccid = dsence.accid || '';
      Log.active({ ...dsence, pagetype: 'goods', goodssource: 'taobao' });
      Log.requestWithForm(
        'taskReport_wx',
        { ...dsence, accid: this.shareAccid, taskId: 4, reportId: getGlobalData('sxg_openid') }
      );
    }
    this.setState({
      noSignedtkl: tkl
    });
    dispatch(detailsTbActions.loadDetailsGoodsAsync(`${tkl}`, this.shareAccid, getGlobalData('sxg_openid')));
  }
  componentDidMount() {}

  componentWillUnmount() {
    this.props.dispatch(detailsTbActions.clearDetailsGoods());
  }

  onShareAppMessage() {
    const { goodsImg, goodsTitle } = this.props.data;
    const myInvitecode = getGlobalData('myInvitecode');
    const othersInvitecode = getGlobalData('othersInvitecode');
    let { noSignedtkl } = this.state;
    return {
      title: goodsTitle,
      path: `/pages/details/tb/tb?tkl=${noSignedtkl}&accid=${getGlobalData('sxg_accid') || ''}&invitecode=${myInvitecode || othersInvitecode}`,
      imageUrl: goodsImg
    };
  }

  copy() {
    let { tkl } = this.props.data;
    Taro.setClipboardData({
      data: `${tkl}`
    }).then(() => {
      Taro.getClipboardData(); /* .then(res => {
        console.log('复制成功：', res);
      }); */
    });
  }

  render() {
    let { /* goodsId,  */ goodsImg, originalPrice, rebatePrice, goodsTitle } = this.props.data;
    let { noSignedtkl } = this.state;
    return (
      <View className='detail' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='商品详情' />
        <View className='img-box'>
          <Image className='img' src={goodsImg} />
        </View>
        <View className='shop-info'>
          <View className='title'>{goodsTitle}</View>
          <View className='row1'>
            <Text className='tag'>券后价</Text>
            <Text className='price'>¥{rebatePrice}</Text>
            <Text className='price2'>¥{originalPrice}</Text>
          </View>
          <View className='row2' onClick={this.copy}>
            <Text className='p'>￥{noSignedtkl}￥</Text>
            <View className='btn-copy' />
          </View>
          <View className='txt-prompt' />
        </View>
      </View>
    );
  }
}
function mapStateToProps(state) {
  const { detailsTb } = state.details;
  return {
    data: detailsTb.data
  };
}

export default connect(mapStateToProps)(Tb);

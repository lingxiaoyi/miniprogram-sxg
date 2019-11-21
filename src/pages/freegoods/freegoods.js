import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { getGlobalData, jumpUrl } from '../../utils/wx';
import { toThousands } from '../../utils/util';
import './freegoods.scss';
import TitleBar from '../../components/titleBar/titleBar';
import { actions } from '../../redux/modules/freegoods';
import { userInfoActions } from '../../redux/modules/mine/index';
import { goodsActions } from '../../redux/modules/home';
import Log from '../../utils/log';

function randomNum(m, n) {
  //生成一个介于m~n之间的有2位小数的数值
  return (Math.random() * (n - m) + m).toFixed(2);
}
function randomNumInt(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
const loopData = [
  '189****9617',
  '逐風',
  '152****9881',
  '172****9929',
  '路一直都',
  '别恨钱_它',
  '山高云阔',
  '人傍凄凉立',
  '154****2631',
  '156****3136',
  '159****4217',
  '獨有種的',
  '154****6343',
  '187****4684',
  '一样生，百',
  '枕下悲绪',
  '难以启齿',
  '月色随风',
  '诠释 ゛',
  '173****7561',
  '159****5844',
  '心不变',
  '152****9381',
  '星空#',
  '痴妹与他',
  '白雪姬',
  '159****2675',
  'smile是礼',
  '171****2926',
  '十年饮冰',
  '赖床分子',
  '我爱的人已',
  '152****7314',
  '187****9767',
  '最近分手季',
  '丑女人',
  '154****5998',
  '159****9755',
  '159****5319',
  '159****7565',
  '189****4147',
  '桃花染',
  '174****1378',
  '野味小生',
  '圊萅梩の小',
  '159****3976',
  '159****4278',
  '知足是福',
  '森屿暖树',
  '適迣仩騙ふ',
  '151****5736',
  '安人多梦',
  '风急风也清',
  'Lonely te',
  '152****8421',
  '战皆罪',
  '鬼爷i',
  '152****2923',
  '卮留',
  '终只能放手',
  '半屿森',
  '173****5362',
  '抖ιυò',
  '155****1768',
  '十年萤火照',
  '爱难随人意',
  '世态苍凉',
  '173****2331',
  '157****1243',
  '187****8781',
  '躲不过心动',
  '①生只爱',
  '157****1943',
  '188****7174',
  '鉯夢為玍',
  '满树樱花',
  '154****9359',
  '苍穹 ￠',
  '洁癖美男',
  '养眼ｍ　',
  '139****2425',
  '177****9973',
  '第四晚心情',
  '157****8489',
  'ミ像莪當',
  '低血压的长',
  '153****3919',
  '铅笔画再美',
  '151****1785',
  '招嫌ˇ',
  '幸福丶只',
  '172****5886',
  '157****9697',
  '凡人多烦',
  '154****8141',
  '誰能久伴不',
  '154****6294',
  '含泪，等你',
  '五行缺钱',
  '步子迈大容',
  'ぃ 流年┈',
  '131****5799',
  '157****6615',
  '青尢',
  '记得笑',
  '听门外雪花',
  '181****3624',
  '浴红衣',
  '举杯邀酒敬',
  '159****8992',
  '我姓空山',
  '洪荒少女',
  '184****4139',
  '173****6711',
  '157****4449',
  '小糯米。',
  '139****6898',
  '184****3343',
  '请假期爷爷',
  '154****7858',
  '孤单酒者',
  '178****2857',
  '158****3553',
  '心事涙中流',
  '借风拥你',
  '153****9846',
  '175****9761',
  '爱的承诺',
  '184****2959',
  '风月客',
  '西岸风',
  '155****2758',
  '156****2219',
  '棭棭夣茽見',
  '154****4527',
  '187****6278',
  '痴守过去',
  '猥琐老男人',
  '153****6933',
  '凤囚凰',
  '159****9722',
  '一袍清酒付',
  '久思年i',
  '139****8276',
  '我是叼男M',
  '中意你',
  '听你唠叨',
  '188****7586',
  '走死在岁月',
  '154****6791',
  '独自流浪',
  '末路433里',
  '153****6718',
  '157****5276',
  '萌一闪',
  '风格不统一',
  '159****7151',
  '183****3864',
  '152****7438',
  '苦瓜爱人。',
  '不过如此▁',
  '156****5694',
  '154****7679',
  '172****4446',
  '90后ㄉ谢幕',
  '152****2475',
  '毕业就代表',
  '156****7845',
  '159****3739',
  '君勿笑',
  '158****8832',
  '曾经很美',
  '182****2889',
  '157****1657',
  '想念你的',
  '159****3854',
  '往事埋风中',
  '158****7348',
  '眉梢゛那',
  '爱里全是难',
  '187****4284',
  'ζ試著去',
  '182****6289',
  'キ侽じ摌',
  '154****5992',
  '174****3339',
  '188****7461',
  '半城殇心已',
  '157****6355',
  '188****4797',
  'Amour旧爱',
  '186****7882',
  '173****5168',
  '找寻你的方',
  '故事还长',
  'ヾ幸福的',
  '156****6715',
  '鱼忧',
  '余生终未归',
  '无缘的缘'
];
const loopDataNew = [];
loopData.forEach((item, index) => {
  let option1 = ['购买了', '分享了'];
  let option2 = ['省了', '赚了'];
  let option3 = ['拼多多商品', '京东商品'];
  let randomNum1 = randomNumInt(0, 1); //随机选择option1 option2 这2个有关联
  let randomNum2 = randomNumInt(0, 1); //
  let randomNum3 = randomNum(3.5, 6); //多少元
  loopDataNew.push({
    id: index,
    text1: `${item}${option1[randomNum1]} ${option3[randomNum2]} `,
    text2: ` ${option2[randomNum1]}${randomNum3}元`
  });
});
class Freegoods extends Component {
  config = {
    navigationBarTitleText: '0元购商品',
    navigationBarTextStyle: 'white'
  };

  constructor() {
    super(...arguments);
    this.state = {
      showDialog: false,
      showGoodsDialog: false,
      bignum: 1450992,
      h: '02',
      m: '00',
      s: '00'
    };
    this.index = 0;
    this.timer = [];
    this.countDown = 2 * 60 * 60;
  }

  async componentDidMount() {
    let resLogin = await getGlobalData('login');
    if (resLogin.accid) {
      await this.props.dispatch(userInfoActions.loadMineAsync());
      if (this.props.userInfo.data.firstorderstatus === 1) {
        //参加过活动的老用户直接跳首页
        Taro.switchTab({ url: '/pages/home/home' });
      }
    }
    let { dispatch, accid, openid } = this.props;
    dispatch(actions.loadAsync(accid, openid)); //传入accid和openid
    dispatch(goodsActions.loadGoodsAsync(accid)); //加载好券商品
    Log.active({ pagetype: 'project', goodsid: '1001' });
    let nowDate = new Date();
    let timeStr = nowDate.getTime() - new Date(nowDate.toLocaleDateString()).getTime();
    this.setState({
      //初始化bignum
      bignum: 1450992 + parseInt(timeStr / 2000) * 75
    });
    this.timer.push(setInterval(() => this.addBignum(), 2000));
    this.timer.push(setInterval(() => this.getRemainTime(this.countDown--), 1000));
    Log.click({ buttonfid: 'x_10181' });

    this.generateData();
    this.timerID = setInterval(() => this.generateData(), 4000);
  }
  componentWillUnmount() {
    // clearInterval(this.timerID);
    this.timer.forEach(t => {
      clearInterval(t);
    });
  }
  addBignum() {
    this.setState(prevState => ({
      bignum: prevState.bignum + randomNumInt(50, 99)
    }));
  }
  componentDidHide() {}
  generateData() {
    if (this.index >= 100) {
      this.index = 0;
    } else {
      this.setState({
        curentLoopData: [loopDataNew[this.index]]
      });
      this.index += 1;
    }
  }
  handleShowDialog() {
    Log.click({ buttonfid: 'x_10184' });
    this.setState({
      showDialog: !this.state.showDialog
    });
  }
  toggleGoodsDialog(value) {
    Log.click({ buttonfid: value });
    this.setState({
      showGoodsDialog: !this.state.showGoodsDialog
    });
  }
  goToPage(id, index, value) {
    Log.click({ buttonfid: value });
    jumpUrl(`/pages/details/pdd/pdd?id=${id}&pgnum=1&idx=${index + 1}`);
  }
  getRemainTime = endTime => {
    let seconds = Math.floor(endTime % 60);
    let minutes = Math.floor((endTime / 60) % 60);
    let hours = Math.floor((endTime / (60 * 60)) % 24);
    this.setState({
      h: hours,
      m: minutes,
      s: seconds
    });
  };

  render() {
    const { showDialog, bignum, showGoodsDialog, h, m, s } = this.state;
    let { data, goods } = this.props;
    return (
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar
          title='0元商品免费拿'
          bgCol='#000217'
          fontstyle='light'
          onBack={this.toggleGoodsDialog.bind(this, 'x_10185')}
        />
        <View className='bar-line' />
        <View className='header-bg'>
          <View className='bignum'>{toThousands(bignum)}</View>
        </View>
        <View className='bottom-bar'>
          <View className='swiper-wrapper'>
            <View className='swiper-wrapper-ul rowup' >
              {this.state.curentLoopData.map(item => {
                return (
                  <View className='li' key={item.id}>
                    {item.text1}
                    <Text style='color: #ffd531;margin-left:8px;'>{item.text2}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <View
            className='icon-home'
            onClick={() => {
              Log.click({ buttonfid: 'x_10183' });
              Taro.switchTab({ url: '/pages/home/home' });
            }}
          />
        </View>

        <View className='goods-ul'>
          {data.map((item, index) => {
            return (
              <View
                className='li'
                key={item.goods_id}
                onClick={this.goToPage.bind(this, item.goods_id, index, 'x_10182')}
              >
                <View className='img-wrap'>
                  <Image className='img' src={item.goods_thumbnail_url} lazyLoad />
                  <View className='img-tag' />
                </View>
                <View className='info'>
                  <View className='row1'>
                    <Text className='title'>{item.goods_name}</Text>
                  </View>
                  <View className='row2'>
                    <Text className='tag'>隐藏券￥{item.coupon_discount / 100}</Text>
                    <Text className='text'>已有{item.sold_quantity}人领取</Text>
                  </View>
                  <View className='row3'>
                    <View className='price'>
                      <Text className='text1'>￥</Text>
                      <Text className='text2'>0</Text>
                      <Text className='text3'>￥{item.min_group_price / 100}</Text>
                    </View>
                    <View className='btn'>
                      马上抢 <View className='icon' />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View className='btn-rule' onClick={this.handleShowDialog} />
        {showDialog && (
          <View className='dialog-wrapper' onClick={this.handleShowDialog}>
            <View className='dialog'>
              {/* <View className='footer'>
                <View className='btn-confirm' onClick={this.handleShowDialog}>
                  确定
                </View>
              </View> */}
            </View>
          </View>
        )}
        {showGoodsDialog && (
          <View className='dialog-wrapper'>
            <View className='dialog dialog-goods'>
              <View className='header'>
                <View className='title'>恭喜你再获得限时好券</View>
                <View className='row2'>
                  <View className='text left'>福利即将结束</View>
                  <View className='ul'>
                    <Text className='text'>{h}</Text>时<Text className='text'>{m}</Text>分
                    <Text className='text'>{s}</Text>秒{/* <Text className='text'>10</Text> */}
                  </View>
                </View>
              </View>
              <View className='body'>
                <ScrollView scrollY className=''>
                  <View className='goods-ul goods-ul-dialog'>
                    {goods.goodsByOpt.pdd.data.map((item, index) => {
                      return (
                        <View
                          className='li'
                          key={item.id}
                          onClick={this.goToPage.bind(this, item.id, index, 'x_10188')}
                        >
                          <View className='img-wrap'>
                            <Image className='img' src={item.thumbnail} lazyLoad />
                            {/* <View className='img-tag' /> */}
                          </View>
                          <View className='info'>
                            <View className='row1'>
                              <Text className='title'>{item.name}</Text>
                            </View>
                            <View className='row2'>
                              <Text className='tag'>隐藏券￥{item.coupon}</Text>
                              <Text className='text'>已售{item.soldQuantity}</Text>
                            </View>
                            <View className='row3'>
                              <View className='price'>
                                <Text className='text1'>￥</Text>
                                <Text className='text2'>{item.newPrice}</Text>
                                <Text className='text3'>￥{item.oldPrice}</Text>
                              </View>
                              <View className='btn'>
                                马上抢 <View className='icon' />
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
              <View className='footer'>
                <View
                  className='btn'
                  onClick={() => {
                    Log.click({ buttonfid: 'x_10186' });
                    Taro.switchTab({ url: '/pages/home/home' });
                  }}
                >
                  放弃机会
                </View>
                <View className='btn' onClick={this.toggleGoodsDialog.bind(this, 'x_10187')}>
                  我要￥<Text className='text'>0</Text>拿
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
  //console.log('state>>', state);
  const { loading, data } = state.freegoods;
  const { accid, openid } = state.login.loginInfo;
  const { userInfo } = state.mine;
  const { goods } = state.home;
  return {
    loading,
    data,
    accid,
    openid,
    userInfo,
    goods
  };
}
export default connect(mapStateToProps)(Freegoods);

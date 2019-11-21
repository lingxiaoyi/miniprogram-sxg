import { connect } from '@tarojs/redux';
import Taro, { Component } from '@tarojs/taro';
import { View, Image,Text } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import './expressinfo.scss';
import { getGlobalData } from '../../../utils/wx';
import { expressInfoActions } from '../../../redux/modules/zy';
import { formatDate } from '../../../utils/util';
import Log from '../../../utils/log';

class Express extends Component {
  constructor () {

    super(...arguments);
    this.timer=[]
  }
  async componentDidMount() {
    // 上报日志
    Log.click({ buttonfid: 'x_10179' });
    // 请求物流信息
    let { logisticsId } = this.$router.params;
    let {loginInfo, dispatch} = this.props;
    await dispatch(expressInfoActions.loadExpressInfoAsync(loginInfo.accid, logisticsId));
  }

  /**
   * 当登录回来时，需要更新佣金等信息。
   * @param {object}} nextProps 下一次接收的props
   */
  componentWillReceiveProps(nextProps) {
    const {
      loginInfo: { accid: thisAccid },
      dispatch
    } = this.props;
    const {
      loginInfo: { accid }
    } = nextProps;
    let { logisticsId } = this.$router.params;
    if (typeof accid !== 'undefined' && thisAccid !== accid) {
      this.timer.push(
        // 解决componentWillReceiveProps进入死循环问题
        setTimeout(() => {
          dispatch(expressInfoActions.loadExpressInfoAsync(accid, logisticsId));
        }, 1)
      );
    }
  }
  componentWillUnmount() {
    this.props.dispatch(expressInfoActions.clearExpressInfo());
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }
  makePhone(phone){
      Taro.makePhoneCall({
        phoneNumber: phone
      })
  }
  componentDidShow() {}

  componentDidHide() {}
  dateFtt(fmt,date)   { //author: meizz   
    var o = {   
      "M+" : date.getMonth()+1,                 //月份   
      "d+" : date.getDate(),                    //日   
      "h+" : date.getHours(),                   //小时   
      "m+" : date.getMinutes(),                 //分   
      "s+" : date.getSeconds(),                 //秒   
      "q+" : Math.floor((date.getMonth()+3)/3), //季度   
      "S"  : date.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
      fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
      if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
  } 
  render() {
    let { expressInfo} = this.props;    
    if(expressInfo.stat === 0){
      expressInfo = expressInfo.data;
    } else {
      expressInfo = {status:"0"};
    }
    const { comcn, comicon, nu, data} = expressInfo;
    // 逻辑 当请求中或者出错 不展示信息   请求成功 但单号为空  暂无快递信息
    return (      
      <View className='main' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='订单跟踪' bgstyle='gray' />
        <View className='space'></View>
        { expressInfo.status==='0' ? '':!nu?(<View className='nodata'>暂无快递信息~</View>):
        (
        <View className='express clearfix'>
          <Image className='left' src={comicon}></Image>
          <View className='right'>
            <Text className='name'>{comcn}</Text>
            <Text className='number'>快递单号:{nu}</Text>
          </View>
        </View>)}
        { expressInfo.status==='200' && data.length!==0 ?
        (<View className='path clearfix'>
          {data.map((item,index) => {
            let times = item.ftime.replace(/-/g,'/');
            console.log(times);
            const date = formatDate(new Date(times),'MM-dd');
            const time = formatDate(new Date(times),'hh:mm');
            let {status,phone,context,statuszs,wlicon} = item; 
            if(status==='在途'&& data[index-1]&&data[index-1].status==='在途'){
              status = '运输中';
            }
            let arr =[];
            if(phone){
              arr = context.split(phone);
            }
            return (
              <View className='pathItem clearfix' key={index}>
                <View className='left'>
                  <Text className='date'>{date}</Text>
                  <Text className='time'>{time}</Text>
                </View>
                <View className={`dot ${status==='运输中'?'status':''}`} >
                  {status!=='运输中'?<Image src={wlicon} className='icon'></Image>:''}
                </View>
                <View className='line'></View>
                <View className='right' style={`color: ${index === 0?'#333333':'#999999'}`}>
                {status === '运输中'?'':<Text className='status'>{statuszs}</Text>}
                {!phone || context.indexOf(phone)===-1?<View className='des'>{context}</View>:<View className='des'>
                  {arr.map((v,i)=>{
                    return i === arr.length-1?
                       (<Text key={i}>{v}</Text>):                    
                       (<View style='display:inline' key={i}><Text>{v}</Text><Text style='color:#3f9ffe;' onClick={this.makePhone.bind(this,phone)}>{phone}</Text></View>)                    
                  })}                        
                </View>}
                </View>
              </View>
            );
          })
          }          
        </View>):''}
      </View>
    )
  }
}
function mapStateToProps(state) {
  const {data:expressInfo } = state.zy.expressInfo;
  const {loginInfo} = state.login;
  return {
    expressInfo,
    loginInfo
  };
}
export default connect(mapStateToProps)(Express);

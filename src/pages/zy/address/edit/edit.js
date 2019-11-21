import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, Input, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import TitleBar from '../../../../components/titleBar/titleBar';
// import ZyToast from '../../component/toast';
import '../../component/toast/toast.scss';
import { citiesActions, addressAddActions, addressUpdateActions, addressDetailActions } from '../../../../redux/modules/zy/index';
import { getGlobalData } from '../../../../utils/wx';
import Log from '../../../../utils/log';

import './edit.scss';

class AddressEdit extends Component {

  config = {
    navigationBarTitleText: '新建地址'
  };

  constructor() {
    super(...arguments);
    this.state = {
      showAreaSelector: false,
      cities: new Array(4),
      current: 0,
      name: '',
      mobile: '',
      checkedName: new Array(1),
      checkedCode: new Array(4),
      cusaddress: '',
      isdefault: false
    };
    this.addressId = this.$router.params.id
    this.fromOrderConfirm = this.$router.params.from === 'order';
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const buttonfid = this.addressId ? 'x_10165' : 'x_10162';
    Log.click({ buttonfid});
    // 获取一级城市列表
    await dispatch(citiesActions.loadAsync(-1, 0));

    if (this.addressId) {
      this.exitAddress();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { citiesData, citiesFloor } = nextProps;
    let { cities } = this.state;
    citiesData && cities.splice(citiesFloor, 1, citiesData);
    this.setState({
      cities: cities
    });
  }

  componentWillUnmount() {
    this.props.dispatch(citiesActions.clear());
    this.props.dispatch(addressAddActions.clear());
    this.props.dispatch(addressUpdateActions.clear());
    this.props.dispatch(addressDetailActions.clear());
  }

  async exitAddress() {
    const { dispatch } = this.props;
    await dispatch(addressDetailActions.loadAsync(this.addressId));
    const { addressDetail } = this.props;
    const {
      name,
      mobile,
      cusaddress,
      isdefault,
      firstaddrname,
      firstaddrcode,
      secondaddrname,
      secondaddrcode,
      thirdaddrname,
      thirdaddrcode,
      fourthaddrname,
      fourthaddrcode
    } = addressDetail;
    const checkedName = [
      firstaddrname,
      secondaddrname,
      thirdaddrname,
      fourthaddrname
    ];
    const checkedCode = [
      firstaddrcode,
      secondaddrcode,
      thirdaddrcode,
      fourthaddrcode
    ];
    this.setState({
      name,
      mobile,
      cusaddress,
      isdefault,
      checkedName,
      checkedCode,
      current: 3
    }, () => {
      for (let i = 0; i < checkedCode.length; i++) {
        if (i === 3) { // 最后一项不需要请求
          break;
        }
        const code = checkedCode[i];
        dispatch(citiesActions.loadAsync(code, i + 1));
      }
    });
  }

  chooseArea(item, listIndex) {
    let { checkedName, checkedCode } = this.state;
    if (checkedName[listIndex] === item.name) {
      if (listIndex === 3) { // 最后一项
        this.toggleArea();
        return;
      }
      this.toNextSwiper(listIndex);
      return;
    } else {
      checkedName = checkedName.slice(0, listIndex + 1);
    }
    checkedName.splice(listIndex, 1, item.name);
    checkedCode.splice(listIndex, 1, item.code);
    this.setState({
      checkedName,
      checkedCode
    }, () => {
      if (listIndex === 3) { // 最后一项
        this.toggleArea();
        return;
      }
      const { dispatch } = this.props;
      dispatch(citiesActions.loadAsync(item.code, listIndex + 1));
      this.toNextSwiper(listIndex);
      this.addEmptyTab();
    });
  }

  toNextSwiper(index) {
    // 跳转下一个swiper
    this.setState({
      current: index + 1
    });
  }

  slideData(arr, index) {
    return arr.slice(0, index + 1)
  }

  addEmptyTab() {
    let arr = this.state.checkedName;
    arr.push('')
    this.setState({
      checkedName: arr
    });
  }

  toggleArea() {
    this.setState(prevState => ({
      showAreaSelector: !prevState.showAreaSelector
    }));
  }

  cancleAreaChoose() {
    if (this.state.checkedName.length > 3) {
      this.toggleArea();
    } else {
      this.setState({
        checkedName: new Array(1),
      }, () => {
        this.toggleArea();
      });
    }
  }

  handleTabClick(index) {
    this.setState({
      current: index
    })
  }

  setDefault() {
    this.setState(prevState => ({
      isdefault: !prevState.isdefault
    }));
  }

  onInput(key, e) {
    this.setState({
      [key]: e.detail.value
    });
  }

  async saveData(status) {
    if (!status) {
      return;
    }
    if (!this.testMobile(this.state.mobile)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 2000
      })
    } else {
      const { dispatch } = this.props;
      const params = this.getParams(this.addressId);
      this.addressId
        ? await dispatch(addressUpdateActions.loadAsync(params))
        : await dispatch(addressAddActions.loadAsync(params))

      const { addressAdd } = this.props;
      const buttonfid = this.addressId ? 'x_10166' : 'x_10163';
      Log.click({ buttonfid});
      // 返回上级
      var pages = Taro.getCurrentPages(); // 获取页面栈
      var prevPage = pages[pages.length - 2]; // 上一个页面
      if (this.fromOrderConfirm) {
        prevPage.$component.setState({
          addressId: addressAdd.id
        }, () => {
          Taro.navigateBack()
        })
      } else {
        Taro.navigateBack()
      }
    }
  }

  getParams(id) {
    const {
      name,
      mobile,
      checkedCode,
      checkedName,
      cusaddress,
      isdefault
    } = this.state;
    return {
      id,
      name,
      mobile,
      firstaddrcode: checkedCode[0],
      firstaddrname: checkedName[0],
      secondaddrcode: checkedCode[1],
      secondaddrname: checkedName[1],
      thirdaddrcode: checkedCode[2],
      thirdaddrname: checkedName[2],
      fourthaddrcode: checkedCode[3],
      fourthaddrname: checkedName[3],
      cusaddress,
      isdefault: isdefault ? 1 : 0
    }
  }

  testMobile(mobile) {
    if (!mobile) return;
    return /^1[3456789]\d{9}$/.test(mobile);
  }

  render() {
    const { cities, checkedCode, showAreaSelector, current, name, mobile, checkedName, cusaddress, isdefault } = this.state;
    const tab = checkedName.map((item, index) => {
      return item
        ? <View className='tab' key={index} onClick={this.handleTabClick.bind(this, index)}>{item}</View>
        : <View className='tab default' key={index} onClick={this.handleTabClick.bind(this, index)}>请选择</View>
    })
    const areaItem = cities.map((list, listIndex) => {
      return (
        <SwiperItem key='index' className='area-list'>
          <ScrollView
            scrollY
          >
            {list && list.map(item => {
              return (
                <View className={`area-item ${parseInt(checkedCode[listIndex]) === parseInt(item.code) && 'active'}`} key={item.code} onClick={this.chooseArea.bind(this, item, listIndex)}>
                  {item.name}
                  <View className='logo'></View>
                </View>
              )
            })}
          </ScrollView>
        </SwiperItem>
      )
    })
    const saveActive = name && mobile && cusaddress && checkedName.length > 3;
    return (
      <View className='edit' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title={this.addressId ? '修改地址' : '新建地址'} bgstyle='gray' />
        <View className='content'>
          <View className='input-wrap'>
            <Text className='desc'>收件人</Text>
            <Input className='input' style={showAreaSelector ? 'position:relative;top:999999px;' : ''} placeholder='请填写收货人姓名' maxLength='10' value={name} onInput={this.onInput.bind(this, 'name')} />
          </View>
          <View className='input-wrap'>
            <Text className='desc'>手机号</Text>
            <Input className='input' style={showAreaSelector ? 'position:relative;top:999999px;' : ''} type='number' placeholder='请填写收货人手机号' value={mobile} onInput={this.onInput.bind(this, 'mobile')} />
          </View>
          <View className='input-wrap'>
            <Text className='desc'>地区</Text>
            <Input className='input area' style={showAreaSelector ? 'position:relative;top:999999px;' : ''} placeholder='请选择所在地区' value={checkedName.join('')} disabled onClick={this.toggleArea} />
          </View>
          <View className='input-wrap'>
            <Text className='desc'>详细地址</Text>
            <Input className='input' style={showAreaSelector ? 'position:relative;top:999999px;' : ''} placeholder='街道、楼牌号等' maxLength='50' value={cusaddress} onInput={this.onInput.bind(this, 'cusaddress')} />
          </View>
        </View>
        <View className='default-wrap'>
          <Text>设为默认地址</Text>
          <View className='icon-wrap'>
            <View className={`icon ${isdefault ? 'active' : ''}`} onClick={this.setDefault}><View className='point'></View></View>
          </View>
        </View>
        <View className={`save ${saveActive ? 'active' : ''}`} onClick={this.saveData.bind(this, saveActive)}>{this.fromOrderConfirm ? '保存并使用' : '保存'}</View>
        <View className={`selector-wrap ${showAreaSelector ? 'active' : 'leave'}`}>
          <View className='bg' onClick={this.cancleAreaChoose}></View>
          <View className='selecotrs'>
            <View className='title-wrap'>
              <Text>配送至</Text>
              <View className='placeholder'></View>
              <View className='close' onClick={this.cancleAreaChoose}></View>
            </View>
            <ScrollView className='tabs' scrollX>
              {tab}
            </ScrollView>
            <Swiper current={current} duration='300' className='area-container'>
              {areaItem}
            </Swiper>
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { loginInfo } = state.login;
  const { cities, addressAdd, addressDetail } = state.zy;
  const { citiesData, citiesFloor } = cities.data;
  return {
    loginInfo,
    citiesData,
    citiesFloor,
    addressAdd: addressAdd.data,
    addressDetail: addressDetail.data
  }
}

export default connect(mapStateToProps)(AddressEdit);

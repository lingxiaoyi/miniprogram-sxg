import Taro, { Component } from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text } from '@tarojs/components';
import TitleBar from '../../../components/titleBar/titleBar';
import { getGlobalData, jumpUrl } from '../../../utils/wx';
import { addressListActions, addressDelActions, addressUpdateActions, addressUpdateOrderActions } from '../../../redux/modules/zy';
import ZyModal from '../component/modal';
import '../component/modal/index.scss';
import Log from '../../../utils/log';

import './address.scss';

const editUrl = `/pages/zy/address/edit/edit`;
class Address extends Component {
  config = {
    navigationBarTitleText: '地址管理'
  };
  constructor() {
    super(...arguments);
    this.state = {
      delDialog: false,
      updateDialog: false,
      defaultAddressId: '',
      chooseAddress: {},
      deleteId: 0,
      listData: []
    };
    this.timer = [];
  }

  componentDidMount() {
    Log.click({ buttonfid: 'x_10159'});
  }

  async componentDidShow() {
    const { dispatch } = this.props;
    await dispatch(addressListActions.loadAsync());
    const { addressList } = this.props;
    this.setState({
      listData: addressList
    });
    for (let i = 0; i < addressList.length; i++) {
      let item = addressList[i];
      if (item.isdefault) {
        this.setState({
          defaultAddressId: item.id
        });
        break;
      } else {
        this.setState({
          defaultAddressId: ''
        });
      }
    }
  }

  componentWillUnmount() {
    this.props.dispatch(addressListActions.clear());
    this.timer.forEach(t => {
      clearTimeout(t);
    });
  }

  setDefault(item, index, e) {
    e.stopPropagation();
    const { defaultAddressId } = this.state;
    if (defaultAddressId === item.id) {
      return;
    }
    item.isdefault = 1;
    const { dispatch } = this.props;
    dispatch(addressUpdateActions.loadAsync(item));
    this.setState({
      defaultAddressId: item.id
    })
  }

  toggleDelDialog() {
    this.setState(prevState => ({
      delDialog: !prevState.delDialog
    }));
  }

  delAddress() {
    let { deleteId, deleteIndex, listData } = this.state;
    const { dispatch } = this.props;
    dispatch(addressDelActions.loadAsync({
      id: deleteId
    }));
    listData.splice(deleteIndex, 1);
    this.setState({
      listData
    });
    this.toggleDelDialog();
  }

  addNewAddress () {
    Log.click({ buttonfid: 'x_10161'});
    jumpUrl(editUrl);
  }

  editAddress(id, e) {
    e.stopPropagation();
    Log.click({ buttonfid: 'x_10160'});
    const url = editUrl + '?id=' + id;
    jumpUrl(url);
  }

  handleDelClick(id, index, e) {
    e.stopPropagation();
    this.setState({
      deleteId: id,
      deleteIndex: index
    }, () => {
      this.toggleDelDialog();
    });
  }

  handleListClick(item, e) {
    e.stopPropagation();
    const from = this.$router.params.from;
    switch (from) {
      case 'orderconfirm': // 订单确认
        var pages = Taro.getCurrentPages(); // 获取页面栈
        var prevPage = pages[pages.length - 2]; // 上一个页面
        prevPage.$component.setState({
          addressId: item.id
        }, () => {
          Taro.navigateBack()
        })
        break;
      case 'orderlist': // 订单列表
        this.setState({
          updateDialog: true,
          chooseAddress: item
        });
        break;
      default:
        break;
    }
  }

  toggleUpdateDialog() {
    this.setState(prevState => ({
      updateDialog: !prevState.updateDialog
    }));
  }

  async updateOrderAddress() {
    const { dispatch } = this.props;
    const { chooseAddress } = this.state;
    await dispatch(addressUpdateOrderActions.loadAsync({
      tradeId: this.$router.params.tradeId,
      receiveName: chooseAddress.name,
      id: chooseAddress.id,
      receiveMobile: chooseAddress.mobile
    }));
    const { addressUpdateOrder } = this.props;
    if (parseInt(addressUpdateOrder.stat) === 0) {
      var pages = Taro.getCurrentPages(); // 获取页面栈
      var prevPage = pages[pages.length - 2]; // 上一个页面
      prevPage.$component.setState({
        isModifiedAdress: true
      }, () => {
        Taro.navigateBack()
      })
    } else {
      Taro.showToast({
        title: addressUpdateOrder.msg,
        icon: 'none',
        duration: 2000
      })
    }
  }

  render() {
    const { delDialog, updateDialog, listData, defaultAddressId } = this.state;
    const addressItem = listData.map((item, index) => {
      const { name, mobile, address, id } = item;
      return (
        <View className='item' key={id} onClick={this.handleListClick.bind(this, item)}>
          <View className='info'>
            <Text>{name}</Text>
            <Text className='phone'>{mobile}</Text>
          </View>
          <View className='detail'>{address}</View>
          <View className='btns'>
            <View className={`set-default ${(defaultAddressId === item.id) ? 'selector' : ''}`} onClick={this.setDefault.bind(this, item, index)}><View className='logo'></View>设为默认</View>
            <View className='edit-wrap'>
              <View className='edit btn' onClick={this.editAddress.bind(this, id)}><View className='logo'></View>编辑</View>
              <View className='del btn' onClick={this.handleDelClick.bind(this, id, index)}><View className='logo'></View>删除</View>
            </View>
          </View>
        </View>
      )
    });
    return (
      <View className='address' style={`padding-top: ${getGlobalData('system_info').isIpx ? Taro.pxTransform(48) : 0};`}>
        <TitleBar title='地址管理' bgstyle='gray' />
        <View className='list'>
          {addressItem}
        </View>
        <View className='add-item'>
          <View className='btn' onClick={this.addNewAddress}>添加新地址</View>
        </View>
        <ZyModal
          isOpened={delDialog}
          title='提示'
          content='确定要删除此收货地址吗?'
          cancelText='取消'
          confirmText='确定'
          onClose={this.toggleDelDialog}
          onCancel={this.toggleDelDialog}
          onConfirm={this.delAddress}
        />
        <ZyModal
          isOpened={updateDialog}
          title='提示'
          content='确定修改收货地址?'
          cancelText='取消'
          confirmText='确定'
          onClose={this.toggleUpdateDialog}
          onCancel={this.toggleUpdateDialog}
          onConfirm={this.updateOrderAddress}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { loginInfo } = state.login;
  const { addressList, addressUpdateOrder } = state.zy;
  return {
    loginInfo,
    addressList: addressList.data.data,
    addressUpdateOrder: addressUpdateOrder.data
  }
}

export default connect(mapStateToProps)(Address);

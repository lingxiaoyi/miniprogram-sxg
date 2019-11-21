import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _isFunction from 'lodash/isFunction';
import AtComponent from '../common/component';
import { orderStatus } from '../../constants/index';
import defaultImg from '../../../../asset/default/160x160@3x.png';
import { formatDate } from '../../../../utils/util';

export default class AtListItem extends AtComponent {
  handleClick = (...args) => {
    if (_isFunction(this.props.onClick) && !this.props.disabled) {
      this.props.onClick(...args);
    }
  };
  constructor() {
    super(...arguments);
    this.state = {
      countdown: 0 //倒计时只有代付款才会有 单位毫秒
    };
    this.timer = [];
  }
  componentDidMount() {
    const {
      data: {
        createTime,
        servertime, //服务器当前时间
        failuretime
      }
    } = this.props;
    //console.log(this.props);
    this.setState({
      countdown: (failuretime / 1) * 1000 - (servertime - createTime)
    });
    this.timer.push(
      // setTimeout解决componentWillReceiveProps进入死循环问题
      setInterval(() => {
        let countdown = this.state.countdown - 1000;
        this.setState({
          countdown: countdown >= 0 ? countdown : 0
        });
      }, 1000)
    );
  }
  componentWillUnmount() {
    this.timer.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
  }
  render() {
    const rootClass = classNames('at-list__item', this.props.className);
    let { countdown } = this.state;
    let { data, isOrder } = this.props;
    let { img, itemTitle, commission, itemNum, payPrice, tkStatus, attributes } = data;
    return (
      <View className={rootClass} onClick={this.handleClick}>
        <View className='at-list__item-container'>
          <View className='at-list__item-tit'>
            <View className='at-list__item-tit-t'>随心精选</View>
            {isOrder && (
              <View className='at-list__item-tit-status'>
                {tkStatus === 1
                  ? orderStatus[tkStatus].text2 + formatDate(countdown, 'mm:ss')
                  : orderStatus[tkStatus].text1}
              </View>
            )}
          </View>
          <View className='at-list__item-info'>
            <Image className='at-list__item-info-img' src={img || defaultImg} />
            <View className='at-list__item-info-middle'>
              <View className='at-list__item-info-middle-row1'>
                <Text className='at-list__item-info-right-tit'>{itemTitle}</Text>
              </View>
              <View className='at-list__item-info-middle-row2'>
                {attributes.map(item => {
                  return (
                    <Text key={item.attributesValue}>
                      {item.attributesName}:{item.attributesValue}
                    </Text>
                  );
                })}
              </View>
              <View className='at-list__item-info-middle-commission'>佣金:{commission}</View>
            </View>
            <View className='at-list__item-info-right'>
              <Text className='at-list__item-info-right-price'>¥ {payPrice}</Text>
              <Text className='at-list__item-info-right-num'>x{itemNum}</Text>
              <Text className='at-list__item-info-right-reason'>
                <Text className='at-list__item-info-right-reason-p'>{orderStatus[tkStatus].text4}</Text>
              </Text>
            </View>
          </View>
          {this.props.children}
        </View>
      </View>
    );
  }
}

AtListItem.defaultProps = {
  data: {
    itemTitle: '',
    attributes: [],
    commission: '',
    itemNum: '',
    payPrice: '',
    tradeId: '',
    tkStatus: '',
    isOrder: false
  },
  onClick: () => {}
};

AtListItem.propTypes = {
  isOrder: PropTypes.bool
};

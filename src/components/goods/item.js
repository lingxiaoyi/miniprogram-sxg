import Taro, { Component } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import PropTypes from 'prop-types';

import './item.scss';

class Item extends Component {
  static defaultProps = {};

  render() {
    const { thumbnail, name, coupon, soldQuantity, newPrice, oldPrice, commission, onClick, union } = this.props;
    return (
      <View className='goods-item' onClick={onClick}>
        <View className='img-wrap'>
          <Image className='img' src={thumbnail} lazyLoad />
        </View>
        <View className='txt-wrap'>
          <Text className='title'>
            <Text className={`union ${union}`} />
            {name}
          </Text>
          <View className='info'>
            {coupon ? <Text className='coupon'>券￥{coupon}</Text> : <Text />}
            <Text className='sold'>已售{soldQuantity}</Text>
          </View>
          <View className='money'>
            <View className='price'>
              <Text className='new'>￥{newPrice}</Text>
              {coupon && <Text className='old'>￥{oldPrice}</Text>}
            </View>
            <Text className='commission'>赚:￥{commission}</Text>
          </View>
        </View>
      </View>
    );
  }
}

Item.propTypes = {
  thumbnail: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  coupon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  soldQuantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  newPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  oldPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  commission: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  union: PropTypes.oneOf(['jd', 'pdd'])
};

export default Item;

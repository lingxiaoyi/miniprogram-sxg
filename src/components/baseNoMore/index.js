import Taro, { Component } from '@tarojs/taro';
import { View} from '@tarojs/components';
import './index.scss';

class Nomore extends Component {
  constructor () {
    super(...arguments)
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
  render() {
    let {title = '没有更多了哦~'} = this.props;
    return (
      <View className='nomore'>{title}</View>
    )
  }
}

export default Nomore

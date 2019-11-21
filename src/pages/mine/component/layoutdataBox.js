import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import {jumpUrl} from '../../../utils/wx';
import './layoutdataBox.scss';
import Log from '../../../utils/log';

class LayoutdataBox extends Component {
  constructor () {
    super(...arguments)
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
  gotoPage(url){
    Log.click({buttonfid:this.props.boxInfo.buttonfid})
    jumpUrl(url)
  }
  render() {
    let {title, content, jumpToUrl} = this.props.boxInfo;
    return (
    <View className='showdata-box' onClick={this.gotoPage.bind(this, jumpToUrl)}>
      <View className='row1'>
        <View className='left'>
          <Text className='text'>{title}</Text>
        </View>
        <View className='right'>
          <Text className='text'>查看更多</Text>
          <View className='i-more'></View>
        </View>
      </View>
      <View className='row2'>
        {
          content.map((item, i)=>{
            return (
              <View className='item' key={i}>
                <Text className='h3'>{item.num}</Text>
                <Text className='text'>{item.text}</Text>
              </View>
            )
          })
        }
      </View>
    </View>
    )
  }
}
LayoutdataBox.defaultProps = {
  boxInfo:{
    title: '',
    content: []
  }
}
export default LayoutdataBox

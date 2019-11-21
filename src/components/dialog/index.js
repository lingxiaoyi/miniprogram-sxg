import Taro, { Component } from '@tarojs/taro';
import { View, Block } from '@tarojs/components';
import './index.scss';
import Log from '../../utils/log';

class Dialog extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      showDialog: false
    };
  }
  componentDidMount() {
    this.showDialog();
  }
  showDialog() {
    let { showOyuangouDialog } = this.props;
    if(showOyuangouDialog) return;
    let showRedpackModal = Taro.getStorageSync('showGuideDialog');
    if (!showRedpackModal) {
      Taro.setStorageSync('showGuideDialog', 1);
      this.setState({
        showDialog: true
      });
      Log.click({ buttonfid: 'x_10148'});
    } else {
      this.setState({
        showDialog: false
      });
    }
  }
  render() {
    let { showDialog } = this.state;
    return (
      <Block>
        {showDialog && (
          <View
            className='dialog'
            onClick={() => {
              this.setState({
                showDialog: false
              });
              Log.click({ buttonfid: 'x_10149'});
            }}
          >
            <View className='header'>{this.props.renderHeader}</View>
            <View className='body'>{this.props.children}</View>
            <View className='footer'>{this.props.renderFooter}</View>
          </View>
        )}
      </Block>
    );
  }
}

export default Dialog;

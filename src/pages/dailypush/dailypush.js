// import Taro, { Component } from '@tarojs/taro';
// import { View, Text } from '@tarojs/components';
// import GoodsList from '../../components/goods/goodsList';
// import { getGlobalData } from '../../utils/wx';

// import './dailypush.scss';

// class DailyPush extends Component {
//   config = {
//     navigationBarTitleText: '每日必推'
//   };

//   constructor() {
//     super(...arguments);
//     this.state = {
//       currentTab: 1,
//       goodsList: [
//         {
//           id: 5823033672, // 商品ID：goods_id
//           name: '安踏童鞋儿童运动鞋 男童鞋子中大童休闲鞋31738804', // 商品标题：goods_name
//           thumbnail: 'https://t00img.yangkeduo.com/goods/images/2019-02-15/5b98a833ad79d613631b8cd04a906e1e.jpeg', // 商品缩略图：goods_thumbnail_url
//           soldQuantity: 9, // 已售数量: sold_quantity
//           newPrice: 193, // 券后价：min_group_price - coupon_discount)/100
//           oldPrice: 393, // 原价：min_group_price/100
//           coupon: 2000, // 优惠券金额：coupon_discount/100
//           commission: 10 // 佣金
//         },
//         {
//           id: 5904326598, // 商品ID：goods_id
//           name: '安踏小黄人童装儿童卫衣正品春季男童上衣小童针织衫35734410', // 商品标题：goods_name
//           thumbnail: 'https://t00img.yangkeduo.com/goods/images/2019-02-21/5660bdbb9ef9b00438899e2be5efe9f0.jpeg', // 商品缩略图：goods_thumbnail_url
//           soldQuantity: 9, // 已售数量: sold_quantity
//           newPrice: 193, // 券后价：min_group_price - coupon_discount)/100
//           oldPrice: 393, // 原价：min_group_price/100
//           coupon: 200, // 优惠券金额：coupon_discount/100
//           commission: 10 // 佣金
//         },
//         {
//           id: 1496179812, // 商品ID：goods_id
//           name: '5双装春季棉质儿童袜子薄款男童女童大童中筒袜0-12岁宝宝学生', // 商品标题：goods_name
//           thumbnail: 'https://t00img.yangkeduo.com/goods/images/2018-09-12/4364021148537e0c92acd6a951d096ab.jpeg', // 商品缩略图：goods_thumbnail_url
//           soldQuantity: 9, // 已售数量: sold_quantity
//           newPrice: 193, // 券后价：min_group_price - coupon_discount)/100
//           oldPrice: 393, // 原价：min_group_price/100
//           coupon: 200, // 优惠券金额：coupon_discount/100
//           commission: 10 // 佣金
//         },
//         {
//           id: 2502360640, // 商品ID：goods_id
//           name: '儿童春秋装套装2019新款女童时尚运动金丝绒加绒加厚秋冬装两件套', // 商品标题：goods_name
//           thumbnail: 'https://t00img.yangkeduo.com/goods/images/2019-02-18/3eab455786a831e5b7fb3aae07cd9ceb.jpeg', // 商品缩略图：goods_thumbnail_url
//           soldQuantity: 9, // 已售数量: sold_quantity
//           newPrice: 193, // 券后价：min_group_price - coupon_discount)/100
//           oldPrice: 393, // 原价：min_group_price/100
//           coupon: 200, // 优惠券金额：coupon_discount/100
//           commission: 10 // 佣金
//         },
//         {
//           id: 5917103426, // 商品ID：goods_id
//           name: '儿童拖鞋夏季卡通男童凉拖鞋可爱女童浴室拖大中小童宝宝防滑拖鞋', // 商品标题：goods_name
//           thumbnail: 'https://t00img.yangkeduo.com/goods/images/2019-02-22/322b0ca63ea2313072a7b8358496e107.jpeg', // 商品缩略图：goods_thumbnail_url
//           soldQuantity: 9, // 已售数量: sold_quantity
//           newPrice: 193, // 券后价：min_group_price - coupon_discount)/100
//           oldPrice: 393, // 原价：min_group_price/100
//           coupon: 200, // 优惠券金额：coupon_discount/100
//           commission: 10 // 佣金
//         }
//       ]
//     };
//   }

//   componentWillReceiveProps(nextProps) {
//     console.log(this.props, nextProps);
//   }

//   componentDidMount() {}

//   componentDidShow() {
//     this.setState({
//       currentTab: getGlobalData('dailypush_current_tab')
//     });
//   }

//   componentDidHide() {}

//   handleTabClick(id) {
//     this.setState({
//       currentTab: id
//     });
//   }

//   render() {
//     const { currentTab, goodsList } = this.state;
//     const tabs = [
//       {
//         id: 1,
//         name: '爆款排行'
//       },
//       {
//         id: 2,
//         name: '1.9包邮'
//       },
//       {
//         id: 3,
//         name: '品牌好货'
//       }
//     ];
//     const tabsView = tabs.map(tab => (
//       <Text
//         key={tab.id}
//         className={currentTab === tab.id ? 'tab active' : 'tab'}
//         onClick={this.handleTabClick.bind(this, tab.id)}
//       >
//         {tab.name}
//       </Text>
//     ));
//     return (
//       <View className='dailypush'>
//         <View className='tabs-wrap'>
//           <View className='tabs'>{tabsView}</View>
//         </View>
//         <View className='goods-list'>
//           <GoodsList goodsList={goodsList} itemStyle='item' />
//         </View>
//       </View>
//     );
//   }
// }

// export default DailyPush;

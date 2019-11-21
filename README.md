# MINIPROGRAM-SXG

随心购微信小程序，基于[Taro](https://github.com/NervJS/taro)(多端统一开发框架)开发。

## 如何运行

```bash
# 安装依赖
npm install
# 或使用 yarn
yarn

# 开发
npm run dev:weapp # 微信小程序
npm run dev:h5 # h5

# 发布（上线）打包
npm run build:weapp # 微信小程序
npm run build:h5  # h5
```

目前只支持微信小程序，H5 后续如有需求再做适配。

## 项目维护

| 角色     | 人员                               |
| -------- | ---------------------------------- |
| 前端开发 | 李志高、王志军                     |
| 后端开发 | 钟敏、吴会然、雷紫辉、王渊、王志敏 |
| 产品经理 | 王东、陈伟伟                       |
| 交互设计 | 熊立武                             |

### 需求文档说明

- [需求文档-王东](https://tower.im/teams/131340/todos/23279/)
- [商品数据接口文档-钟敏](https://note.youdao.com/ynoteshare1/index.html?id=3f3dee3a7847194d2e27266285b7b421&type=note#/)
- [小程序码接口文档-吴会然](http://172.18.254.24:3000/projects/maiycrr/wiki)
- [日志接口文档-王志敏](https://tower.im/teams/131340/todos/23426/)
- [淘宝详情页日志-王东](https://docs.qq.com/doc/DT3hUT2Rwcm5WRklk)
- [个人中心接口文档-王渊、王志敏](https://docs.qq.com/doc/DT0pieW9JREhyYm1V?opendocxfrom=admin)

## 业务介绍

随心购小程序 - 拼多多、京东购物领券拿佣金，省钱赚钱神器！

### 页面信息

| 页面目录                           | 页面描述                                         | 路径参数描述                                                      |
| ---------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| pages/home/home                    | 首页                                             | 无                                                                |
| pages/home/search/search           | 搜索页面                                         | kw： 搜索关键词                                                   |
| pages/home/hotGoods/hotGoods       | 今日爆款、品牌清仓、好券商品、京仓京配、京东超市 | title：标题；id：商品类别 ID；type：商品联盟标识（pdd 和 jd）     |
| pages/home/mailingFree/mailingFree | 9.9 包邮                                         | id：商品类别 ID；type：商品联盟标识（pdd 和 jd）                  |
| pages/home/brandGoods/brandGoods   | 品牌好货                                         | 无                                                                |
| pages/home/themeList/themeList     | 主题（点击 banner 进入）                         | title：标题；id：主题 ID；banner：banner 图 url                   |
| pages/details/details              | 淘宝详情                                         | tkl：淘宝口令； scene：场景值（小程序码参数）； accid：用户 accid |
| pages/details/pdd/pdd              | 拼多多详情                                       | id：商品 ID；accid：用户 accid                                    |
| pages/details/jd/jd                | 京东详情                                         | id：商品 ID                                                       |
| pages/dailypush/dailypush          | 每日必推（未上线）                               | 无                                                                |
| pages/mine/mine                    | 我的页面                                         | 无                                                                |
| pages/mine/fans/fans               | 粉丝                                             | 无                                                                |
| pages/mine/earnings/earnings       | 收益                                             | 无                                                                |
| pages/mine/withdrawal/withdrawal   | 提现记录                                         | 无                                                                |
| pages/mine/commission/commission   | 佣金明细                                         | 无                                                                |
| pages/mine/order/order             | 订单                                             | 无                                                                |
| pages/login/login                  | 登陆                                             | 无                                                                |
| pages/login/invitecode/invitecode  | 邀请码                                           | invitecode：邀请码                                                |
| pages/login/phone/phone            | 手机号                                           | 无                                                                |
| pages/nonetwork/nonetwork          | 无网络                                           | 无                                                                |

## 项目结构说明

- `/src`：源代码目录
- `/dist`：微信小程序代码目录

```bash
.
├── dist # 上线打包目录
└── src # 源码目录
```

## 其他事项

> Todo...

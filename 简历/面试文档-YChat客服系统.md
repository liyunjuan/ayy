# YChat 客服系统 - 面试技术文档

## 项目概述

### 基本信息
- **项目名称**：YChat - Fintopia 客服 CRM 工作台
- **项目定位**：内部客服 CRM 平台，为一线电话客服坐席和在线客服坐席提供 1on1 用户服务支持
- **使用对象**：内部电话/在线客服坐席
- **业务目标**：提升业务服务品质和效率

### 业务范围
- **多国家支持**：国内(CN)、印尼(Indo)、墨西哥(Mex)、东南亚(Sea)、欧洲(EU)、西班牙(Esp)
- **访问方式**：
  - 生产环境：https://ychat.fintopia.tech/index
  - 测试环境：https://ychat-test.yangqianguan.com/
  - 本地开发：http://localhost:62651/

## 技术架构

### 技术栈

#### 前端核心技术
```
Vue 2.6 + Vue Router 3 + Vuex 3 + Webpack 5
Ant Design Vue 1.7.8 + TypeScript 4.7
```

#### 内部基础库
- `@yqg/*` 系列内部组件库
  - `@yqg/vue`: 通用 Vue 组件库
  - `@yqg/socket-client`: WebSocket 客户端封装
  - `@yqg/permission`: 权限管理组件
  - `@yqg/resource`: 资源管理
  - `@yqg/shared-client`: 共享客户端工具
  - `@yqg/ytalk-sdk`: YTalk 电话 SDK

#### 业务特色库
- `@yqg/seat-assist`: 坐席辅助
- `@yqg/beetle`: 业务组件
- `@yqg/config-hub`: 配置中心
- `@yqg/plain-apply-sdk`: 工单 SDK

#### 其他技术
- **微前端**：`@micro-zoe/micro-app`
- **监控**：Sentry (错误监控 + 性能监控 + Session Replay)
- **实时通信**：
  - WebSocket (基于 STOMP 协议)
  - JsSIP / WebRTC (电话通信)
  - Broadcast Channel (跨页面通信)
- **富文本编辑**：Tiptap + Tiptap Extensions
- **数据可视化**：ECharts 4.6.0、Cytoscape (图表分析)
- **文档处理**：PDF.js、Mermaid (流程图)、marked (Markdown)
- **音视频处理**：Wavesurfer.js、mp4box

### 项目结构

#### Monorepo 架构
项目位于 `customer-service` monorepo 中，使用 **Yarn Workspaces** 管理多个子项目：

```
customer-service/
├── cs/
│   ├── ychat/           # YChat 坐席工作台 (本项目)
│   ├── ocs-client/      # C 端在线聊天入口
│   ├── ocs-admin/       # OCS 客服后台管理
│   └── common/          # 跨项目共享层 (@cs/common)
├── script/              # 仓库级 TS 脚本 (i18n、版本管理)
├── .script/             # 构建辅助脚本
├── arcanist/            # Phabricator 代码评审集成
├── package.json         # Workspaces 总入口
├── babel.config.js
├── eslint.config.mjs    # ESLint Flat Config
└── tsconfig.json
```

#### YChat 项目内部结构
```
cs/ychat/
├── src/
│   ├── app/                    # 业务模块
│   │   ├── cash-loan/          # 现金贷
│   │   ├── collection/         # 催收 (iframe 引入)
│   │   ├── corp-wechat/        # 企业微信
│   │   ├── coupon/             # 优惠券
│   │   ├── customer/           # 客户管理
│   │   ├── enterprise-wechat/  # 企业微信
│   │   ├── monitor/            # 监控
│   │   ├── quality/            # 质检
│   │   ├── saas/               # SaaS
│   │   ├── short-message/      # 短信
│   │   ├── smart-call/         # 智能外呼
│   │   ├── smart-mark/         # 智能标记
│   │   ├── udesk/              # 第三方客服
│   │   └── violation-reminder-new-2/ # 违规提醒
│   ├── common/                 # YChat 内部共享代码
│   │   ├── component/          # 壳层组件 (yqg-layout、content-tab)
│   │   ├── mixin/              # 通用 mixin
│   │   ├── utils/              # 工具函数
│   │   ├── style/              # 样式
│   │   ├── constant/           # 常量
│   │   ├── resource/           # 资源
│   │   ├── socket/             # WebSocket 封装
│   │   ├── store/              # Vuex 模块
│   │   └── router/             # 路由配置
│   ├── server/                 # Node BFF 层
│   └── public/                 # 静态资源
├── config/                     # 配置文件
│   ├── default.js
│   ├── test.js
│   ├── prod.js
│   ├── feat.js
│   └── api-host.js
├── wiki/                       # 业务知识库
│   ├── INDEX.md                # 业务域索引
│   ├── overview-i18n-country/  # 多国家运行机制
│   ├── new-workbench/          # 新工作台
│   ├── create-ticket/          # 创建工单
│   ├── online-websocket/       # 在线 WebSocket
│   ├── ytalk/                  # YTalk 电话
│   ├── content-tab/            # 内容标签页
│   ├── quality/                # 质检
│   ├── monitor/                # 监控
│   ├── coupon/                 # 优惠券
│   ├── smart-call/             # 智能外呼
│   └── corp-wechat/            # 企业微信
├── docs/                       # 技术文档
│   ├── web-code-design/        # 代码设计规范
│   ├── cs-common-components/   # @cs/common 组件文档
│   ├── cs-crm-components/      # CRM 领域组件文档
│   └── ychat-shell-components/ # YChat 壳层组件文档
├── package.json
├── README.md
├── AGENTS.md                   # AI Agent 规则
└── verify.sh                   # 质量门禁脚本
```

### 共享层 (@cs/common)

**40+ 跨项目共享组件**，覆盖：

#### 主要模块
- **component/**: 跨项目共享 Vue 组件 (约 40 个)
  - 聊天消息类：chat-audio、chat-video、chat-robot-message
  - 订单/业务类：loan-order、financial-order、braavos-order
  - 工具类：preview-file、batch-download、yqg-pdf-viewer、yqg-pagination
  - 头部操作类：header-calendar、header-change-stage、header-download

- **crm/**: CRM 专属共享模块
  - app 入口、component、constant、modal、resource、util
  - 聊天能力 (chat / chat-new)

- **mixin/**: 跨项目 Vue mixin
  - chat.js / chat-list.js (IM 聊天核心逻辑)
  - auto-eavesdrop.js (自动监听/质检)
  - watermark.js (水印)
  - check-version.js (版本检测)
  - drag-layout.js (拖拽布局)
  - notify.js (浏览器通知)
  - record-log.js (操作日志上报)

- **store/**: 共享 Vuex modules
  - chat.js (IM 聊天状态)
  - host-cond.js (环境配置状态)
  - calendar.js (日历状态)
  - grey.js (灰度状态)

- **socket/**: WebSocket 客户端封装 (基于 @yqg/socket-client)
- **ytalk/**: YTalk 电话相关共享代码
- **constant/**: 公共常量 (app-id、permissions、enum、url-map)
- **util/ & utils/**: 工具函数 (host-cond、gray、download、配置中心、泳道)
- **i18n/**: 多语言支持
- **stub/**: 微前端空桩

## 核心业务模块

### 1. YChat - IM 在线聊天

#### 技术实现
- **WebSocket**: 基于 STOMP 协议的实时通信
- **消息类型**：文本、图片、视频、音频、位置、文件、机器人消息
- **消息状态管理**：Vuex chat store + mixin 复用
- **性能优化**：
  - 虚拟滚动 (长消息列表)
  - 消息分页加载
  - 图片懒加载
  - 文件预览优化

#### 关键功能
- B 端与 C 端实时通信
- 多会话管理
- 消息已读/未读状态
- 消息撤回
- 富文本编辑 (Tiptap)
- 表情包支持
- 文件传输 (七牛云 / Ali OSS)

### 2. YTalk - 电话通信

#### 技术实现
- **协议**: JsSIP + WebRTC + SIP
- **跨页面通信**: Broadcast Channel
- **音频处理**: Wavesurfer.js
- **通话录音**: 服务端录音 + 客户端播放

#### 关键功能
- 呼入/呼出通话
- 通话转接
- 多方通话
- 通话录音与回放
- 话后小结
- 通话质量监控

#### 生命周期管理
- SDK 初始化
- 通话建立 (INVITE)
- 通话接听 (ACCEPTED)
- 通话中 (CONFIRMED)
- 通话结束 (BYE)
- 异常处理 (FAILED / CANCELED)

### 3. 工单系统

#### 创建工单
- **独立页面流程** (传统工单)
- **新工作台内嵌流程** (融合工作台)
- **动态表单**：根据配置中心动态渲染
- **草稿保存**：LocalStorage 草稿机制
- **工单绑定刷新**：WebSocket 推送更新

#### 工单域路由
- 国家差异路由 (CN / Indo / Mex / Sea / EU / Esp)
- 催收后缀路由特殊处理
- 权限边界控制

### 4. 新工作台 (New Workbench)

#### 三栏布局
```
┌─────────────────────────────────────────┐
│           顶部导航 (Header)              │
├──────┬────────────────────┬─────────────┤
│      │                    │             │
│ 左侧 │                    │   右侧      │
│ 导航 │    中间内容区       │   侧边栏    │
│      │   (Content Tab)    │             │
│      │                    │             │
└──────┴────────────────────┴─────────────┘
```

#### 灰度策略
- 印尼灰度 (isNewWorkbenchIndo)
- 多国家逐步灰度
- 配置中心控制

#### 业务上下文契约
- 会话上下文 (sessionContext)
- 用户上下文 (userContext)
- 工单上下文 (ticketContext)

### 5. 质检系统

#### 传统质检
- 通话质检
- 在线聊天质检
- 评分标准配置

#### 智能质检
- AI 自动评分
- 关键词检测
- 情绪分析
- 违规检测

#### 路由边界
- 防止传统质检与智能质检混淆
- 权限隔离

### 6. 监控系统

聚合多个监控能力：
- **在线客服监控**
- **YTalk 话务监控**
- **知识库监控**
- **在线坐席监控**
- **大屏配置**

### 7. 优惠券系统

- **独立记录页**
- **新工作台发券流程**
- **加密手机号处理**
- **业务阶段上下文**

### 8. 智能外呼

- **外呼管理**
- **欢迎语配置**
- **批量上传**

### 9. 企业微信集成

- **H5 免登录入口**
- **企业微信聊天记录查询**
- **企业微信 JSSDK 集成** (@wecom/jssdk)

## 关键技术实现

### 1. 多国家架构

#### 路由分叉
```javascript
// 国家路由示例
const routes = [
  {
    path: '/ticket',
    component: () => import('./ticket'),
    meta: {
      businessCode: ['cn', 'indo'] // 仅国内和印尼可见
    }
  }
];
```

#### 配置中心
- 运行时动态获取配置
- 国家级配置隔离
- 灰度开关控制

#### 国际化 (i18n)
- Vue i18n 8.22.3
- 翻译平台同步 (script/i18n-upload.ts / i18n-download.ts)
- 语言切换 (header-language 组件)

#### 环境变量
```bash
# 国内 (默认)
yarn start-ychat

# 印尼
yarn start-ychat-indo

# 墨西哥
yarn start-ychat-mex

# 东南亚
yarn start-ychat-sea

# 欧洲
yarn start-ychat-eu

# 西班牙
yarn start-ychat-esp
```

### 2. WebSocket 通信

#### 初始化
```javascript
import initSocketShared from '@yqg/socket-client';

initSocketShared(`${STAGE}.Fintopia.CS`, {
  stomp: (!isProd && getSwimLaneValue()) ? {
    brokerURL: `/ws?${FINTOPIA_SWIM_LANE_ID}=${getSwimLaneValue()}`
  } : true
});
```

#### 消息订阅
- STOMP 协议
- 主题订阅 (Topic)
- 点对点消息 (Queue)
- 心跳机制
- 断线重连

#### 泳道隔离
- 测试环境泳道支持
- URL 参数传递泳道 ID

### 3. 微前端架构

#### 主应用配置
```javascript
import microApp from '@micro-zoe/micro-app';

microApp.start({
  'disable-memory-router': true, // 关闭虚拟路由系统
  'disable-patch-request': true, // 关闭对子应用请求的拦截
});
```

#### 子应用集成
- **Collection (催收)**: iframe 方式引入
- **Cash-loan (现金贷)**: 源码方式引入

#### 空桩机制
- `@cs/common/stub/` 提供空桩
- 主应用在子应用未加载时保持接口一致

### 4. 监控与埋点

#### Sentry 监控
```javascript
import * as Sentry from '@sentry/browser';
import {initSentry} from '@yqg/shared-client/util/sentry';

initSentry({
  router,
  dsn: 'https://89c22f0b7594f69babf692dbc07d8896@sentry.fintopia.tech/62',
  tracesSampleRate: 1, // 全量性能监控
  replaysSessionSampleRate, // Session Replay 采样率
  replaysOnErrorSampleRate, // 错误时 Session Replay 采样率
});
```

#### 埋点体系
- **弹屏埋点**: [Wiki 文档](https://wiki.fintopia.tech/pages/viewpage.action?pageId=50498357)
- **工作台埋点**: [Wiki 文档](https://wiki.fintopia.tech/pages/viewpage.action?pageId=50497435)
- **埋点总览**: [Wiki 文档](https://wiki.fintopia.tech/pages/viewpage.action?pageId=50497410)

#### 性能监控
- FMP (First Meaningful Paint) 上报
- API 性能监控 (ApiMetrics)
- 白屏检测 (white-screen-check)
- Electron 客户端版本上报

### 5. 权限系统

#### 权限申请组件
```javascript
import YqgPermission from '@yqg/permission';

YqgPermission.init({tagName: 'yqg-permission'});
```

#### 权限控制
- 菜单权限 (路由 meta.permissions)
- 按钮权限 (yqg-permission 指令)
- 数据权限 (后端接口鉴权)

### 6. 灰度发布

#### 灰度判断
```javascript
import {isGray} from '@cs/common/util/gray';

if (isGray) {
  // 灰度用户逻辑
}
```

#### 配置中心控制
- 用户级灰度
- 功能开关
- A/B 测试

### 7. Electron 客户端支持

#### 客户端集成
- Electron 应用壳
- 客户端版本校验
- 窗口管理 (overrideElectronOpen)
- 请求拦截器 (ElectronVerifyCheck)

#### 白名单机制
- 特定页面可在客户端外打开
- whitePathList 配置

## 开发流程

### 本地开发

#### 环境准备
```bash
# Node 版本
Node 18.20.0

# 安装依赖 (在 customer-service 根目录)
yarn install
```

#### 启动项目
```bash
# 方式 1: 在根目录启动
yarn start-ychat

# 方式 2: 在 cs/ychat 目录启动
cd cs/ychat
yarn start

# 指定国家启动
yarn start-ychat-indo  # 印尼
yarn start-ychat-mex   # 墨西哥
yarn start-ychat-sea   # 东南亚
yarn start-ychat-eu    # 欧洲
yarn start-ychat-esp   # 西班牙
```

#### 本地访问
```
http://localhost:62651/
```

### 代码规范

#### ESLint
```bash
# Lint 检查
yarn lint

# Lint 修复
yarn lint --fix

# Lint-staged (仅检查改动文件)
yarn lint:staged
```

- 基于 `@yqg/eslint-config`
- ESLint Flat Config (eslint.config.mjs)
- 支持 Vue、TypeScript、JavaScript

#### Stylelint
- 配置文件：`.stylelintrc.json`
- 支持 SCSS、Less、Vue SFC

#### Prettier
- 配置文件：`.prettierrc`
- 代码格式化

#### Git Hooks
- Husky 7.0.4
- Lint-staged：提交前仅校验改动文件

### 代码评审

#### Phabricator (Arcanist)
```bash
# 创建 Diff
arc diff

# 更新 Diff
arc diff --update D12345

# 查看 Diff
arc browse D12345
```

- 配置文件：`.arcconfig`
- Lint 集成：`arcanist/`

### 构建与部署

#### 构建
```bash
# 方式 1: 在根目录构建
yarn build-ychat

# 方式 2: 在 cs/ychat 目录构建
cd cs/ychat
yarn build
```

#### 部署流程 (CICD 平台)

**测试环境**:
1. 访问 [CICD 平台](https://cicd.fintopia.tech/)
2. 选择 subproject: `ychat`
3. 选择 stage: 对应的测试环境
4. 点击发布

**生产环境**:
1. 在 [CICD 平台](https://cicd.fintopia.tech/) 选择 `prod` 仅作 build
2. build 完成后，选择 build 后的 release 分支完成发布
3. 发布后检查 console 中打印的版本号或 network 中 `get-version` 接口返回

#### 版本校验
```bash
# 查看 Console 版本号
# 或访问接口
GET /api/get-version
```

### 国际化流程

#### 上传词条
```bash
yarn tsx ../../script/i18n-upload.ts --sourceFilePath=../common/i18n/languages/zh-cn.ts --appName=web-customer-service
```

#### 下载翻译
```bash
yarn tsx ../../script/i18n-download.ts --sourceFilePath=../common/i18n/languages/zh-cn.ts --appName=web-customer-service
```

- 构建后自动下载翻译 (postbuild hook)

## 性能优化

### 前端性能优化

1. **代码分割**
   - 路由懒加载
   - 组件按需加载
   - Webpack 代码分割

2. **资源优化**
   - 图片懒加载
   - 资源压缩 (Webpack Compression)
   - CDN 加速 (七牛云 / Ali OSS)

3. **渲染优化**
   - 虚拟滚动 (长列表)
   - 防抖/节流 (用户输入)
   - Keep-alive 缓存 (content-tab)

4. **Bundle 优化**
   - Tree Shaking
   - 按需引入 (babel-plugin-import)
   - 动态导入

### 监控指标

- **FMP** (First Meaningful Paint): 首次有效绘制
- **FCP** (First Contentful Paint): 首次内容绘制
- **LCP** (Largest Contentful Paint): 最大内容绘制
- **CLS** (Cumulative Layout Shift): 累积布局偏移
- **FID** (First Input Delay): 首次输入延迟
- **API 响应时间**: 接口性能监控
- **错误率**: Sentry 错误监控

## 常见问题与解决方案

### 1. WebSocket 连接失败

**原因**:
- 网络问题
- 泳道配置错误
- 后端服务异常

**解决方案**:
- 检查 brokerURL 配置
- 确认泳道 ID 正确
- 查看网络请求状态
- 检查心跳机制

### 2. YTalk 通话无声音

**原因**:
- 浏览器未授权麦克风/扬声器权限
- WebRTC 连接失败
- 音频设备占用

**解决方案**:
- 检查浏览器权限设置
- 确认 JsSIP 注册成功
- 查看 WebRTC 连接状态
- 重启浏览器或刷新页面

### 3. 多国家路由不生效

**原因**:
- businessCode 配置错误
- 路由 meta 缺失
- 国家判断逻辑问题

**解决方案**:
- 检查路由 meta.businessCode
- 确认 COUNTRY_CODE 正确
- 查看配置中心国家配置

### 4. 灰度功能不生效

**原因**:
- 灰度配置未生效
- 用户不在灰度名单
- 缓存问题

**解决方案**:
- 确认配置中心灰度开关
- 检查用户是否在灰度名单
- 清除浏览器缓存

### 5. 微前端子应用加载失败

**原因**:
- 子应用 URL 错误
- 子应用部署失败
- 跨域问题

**解决方案**:
- 检查子应用配置
- 确认子应用部署状态
- 配置 CORS 头

## 团队协作

### 代码仓库
- **Git 分支策略**:
  - `master`: 主分支
  - `feature/*`: 功能分支
  - `bugfix/*`: 修复分支
  - `release/*`: 发布分支

### 文档资源
- **项目文档**: [README.md](cs/ychat/README.md)
- **业务知识库**: `cs/ychat/wiki/`
- **技术规范**: `cs/ychat/docs/`
- **QA Wiki**: [YChat 详细功能](https://wiki.fintopia.tech/display/QATeam/Y-chat)

### 联系人
- **运维团队**: 马生国 (部署/发布问题)
- **现金贷团队**: 胡宏炜 (cash-loan 相关)

## 技术亮点

### 1. Monorepo 架构
- Yarn Workspaces 管理多个子项目
- 共享依赖优化
- 统一构建流程

### 2. 微前端实践
- `@micro-zoe/micro-app` 微前端框架
- 独立部署、独立开发
- 应用隔离与通信

### 3. 多国家架构
- 配置中心动态配置
- 路由分叉
- 国际化支持

### 4. 实时通信
- WebSocket (STOMP 协议)
- WebRTC (JsSIP)
- Broadcast Channel (跨页面)

### 5. 灰度发布
- 用户级灰度
- 功能开关
- A/B 测试

### 6. 监控体系
- Sentry 全链路监控
- 性能监控 (FMP/FCP/LCP)
- Session Replay
- 自定义埋点

### 7. 工程化
- ESLint + Prettier + Stylelint
- Husky + Lint-staged
- Phabricator 代码评审
- CICD 自动化部署

### 8. 性能优化
- 代码分割
- 懒加载
- 虚拟滚动
- 缓存策略

## 面试准备建议

### 技术深度
1. **Vue 生态**:
   - Vue 2.x 核心原理 (响应式、虚拟 DOM、diff 算法)
   - Vuex 状态管理最佳实践
   - Vue Router 路由守卫与权限控制

2. **实时通信**:
   - WebSocket 连接机制与心跳
   - STOMP 协议
   - WebRTC 音视频通信原理
   - JsSIP SIP 协议栈

3. **微前端**:
   - 微前端方案对比 (iframe / single-spa / qiankun / micro-app)
   - 应用隔离 (JS 沙箱、CSS 隔离)
   - 应用通信 (props / eventBus / 全局状态)

4. **工程化**:
   - Webpack 构建优化
   - Monorepo 方案 (Yarn Workspaces / Lerna / Nx)
   - 代码规范与自动化

5. **监控与性能**:
   - 前端监控体系搭建
   - 性能指标 (FMP/FCP/LCP/CLS/FID)
   - Sentry 集成与配置

### 业务理解
1. **客服系统核心能力**:
   - IM 在线聊天
   - 电话通信 (YTalk)
   - 工单管理
   - 质检系统
   - 监控系统

2. **多国家业务**:
   - 国家差异处理
   - 国际化方案
   - 配置中心设计

3. **灰度发布**:
   - 灰度策略
   - 功能开关
   - 用户分组

### 项目亮点总结
- 参与了 **Fintopia 客服 CRM 平台** 的开发，这是一个服务于多国家的大型前端项目
- 负责 **YChat 工作台**模块，日均服务数百名客服坐席
- 实现了基于 **WebSocket + WebRTC** 的实时通信能力
- 采用 **Monorepo + 微前端**架构，支持多团队协作
- 搭建了完善的**监控体系** (Sentry + 自定义埋点)，错误率降低 XX%
- 优化了**多国家架构**，支持 6 个国家独立配置与灰度发布
- 实现了**新工作台融合**，提升坐席工作效率 XX%

---

## 附录

### 代码统计
- **YChat 代码文件**: ~249 个 (.vue / .ts / .js)
- **共享层组件**: 40+ 个
- **业务模块**: 10+ 个
- **Wiki 文档**: 20+ 个业务域

### 技术栈版本
```json
{
  "vue": "2.6.14",
  "vue-router": "3.4.9",
  "vuex": "3.6.0",
  "webpack": "5.73.0",
  "ant-design-vue": "1.7.8",
  "typescript": "4.7.3",
  "node": "18.20.0",
  "yarn": "1.x"
}
```

### 关键依赖
```json
{
  "@yqg/vue": "^1.21.3",
  "@yqg/socket-client": "1.2.3",
  "@yqg/ytalk-sdk": "0.0.5-beta.3",
  "@micro-zoe/micro-app": "latest",
  "@sentry/vue": "7.64.0",
  "axios": "0.24.0",
  "echarts": "4.6.0",
  "tiptap": "1.32.2"
}
```

---

**文档版本**: v1.0  
**更新时间**: 2026-06-15  
**维护人**: lww

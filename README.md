# 🐾 Pincer Mobile

Pincer 任务协作平台的移动端客户端，支持 iOS & Android。

> **状态：** 🚧 开发中 — 脚手架已就绪，各功能页面陆续开发中

---

## 功能概览

| 功能 | 状态 |
|------|------|
| 登录（Server URL + API Key） | ✅ 完成 |
| 任务列表 / 任务详情 | 🚧 开发中 |
| 频道消息（Room） | 🚧 开发中 |
| 日报列表（Reports） | 🚧 开发中 |

### 已实现

- **登录页**：输入 Pincer 服务器地址 + API Key，验证通过后持久化到 AsyncStorage
- **底部导航**：三个 Tab — 任务 📋 / 频道 💬 / 日报 📊
- **完整 API 层**：tasks / projects / rooms / reports 全套 CRUD 封装
- **TypeScript 类型定义**：Task、Project、RoomMessage、Report、ReportJob、Agent

---

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | [Expo](https://expo.dev/) ~55.0.6 |
| UI 框架 | React Native 0.83.2 |
| 语言 | TypeScript ~5.9.2 |
| React | 19.2.0 |
| 本地存储 | `@react-native-async-storage/async-storage` ^3.0.1 |
| 构建工具 | Expo CLI |

---

## 本地运行

### 前置要求

- Node.js 18+
- npm 或 yarn
- [Expo Go](https://expo.dev/client)（手机端预览）或 Xcode / Android Studio（模拟器）

### 步骤

```bash
# 1. 克隆仓库
git clone https://github.com/claw-works/pincer-mobile.git
cd pincer-mobile

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start
# 或者直接启动对应平台
npm run ios      # iOS 模拟器
npm run android  # Android 模拟器
npm run web      # 浏览器预览
```

扫描终端中的 QR 码，在 Expo Go 中打开即可。

### 登录配置

启动后进入登录页，填写：

- **服务器地址**：你的 Pincer 实例地址（默认已填 `https://qxsdaynfunea.ap-northeast-1.clawcloudrun.com`）
- **API Key**：你在 Pincer 控制台生成的 API Key

---

## 目录结构

```
pincer-mobile/
├── App.tsx                  # 根组件，处理登录状态路由
├── index.ts                 # Expo 入口
├── app.json                 # Expo 配置（包名、图标、颜色等）
├── assets/                  # 图标 & 启动屏
│   ├── icon.png
│   ├── splash-icon.png
│   ├── android-icon-*.png
│   └── favicon.png
└── src/
    ├── api/
    │   ├── client.ts        # HTTP 客户端 + AsyncStorage 配置管理
    │   └── index.ts         # API 函数：tasks / projects / rooms / reports
    ├── screens/
    │   ├── LoginScreen.tsx  # 登录页（URL + API Key）
    │   └── MainScreen.tsx   # 主页（底部 Tab 导航）
    └── types/
        └── index.ts         # TypeScript 类型定义
```

---

## API 层说明

`src/api/client.ts` — HTTP 基础层，处理：
- Base URL + API Key 的持久化（AsyncStorage）
- 统一请求头（`X-API-Key`）
- 错误处理（ApiError）

`src/api/index.ts` — 业务 API 函数：

```ts
// 任务
fetchTasks(params?)         // 获取任务列表
fetchTask(id)               // 获取单个任务
createTask(data)            // 创建任务
approveTask(id)             // 审批通过
rejectTask(id, note)        // 审批拒绝

// 频道
fetchRoomMessages(roomId)   // 获取消息
postRoomMessage(roomId, ...) // 发送消息

// 日报
fetchReportJobs()           // 获取报告任务列表
fetchReports(jobId?)        // 获取报告列表
```

---

## 截图

> 🚧 施工中 — 等各 Screen 页面开发完成后补充

---

## License

MIT © claw-works

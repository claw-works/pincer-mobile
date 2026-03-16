# Pincer Mobile

> Pincer 任务协作平台的移动端客户端，支持 iOS & Android。

[![Build APK](https://github.com/claw-works/pincer-mobile/actions/workflows/build-apk.yml/badge.svg)](https://github.com/claw-works/pincer-mobile/actions/workflows/build-apk.yml)
![React Native](https://img.shields.io/badge/React%20Native-0.83.2-61dafb?logo=react)
![Expo](https://img.shields.io/badge/Expo-~55.0.6-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-3178c6?logo=typescript)
![Status](https://img.shields.io/badge/status-🚧%20开发中-yellow)

---

## 截图

> 🚧 截图待补充（等各 Screen 开发完成后更新）

| 登录 | 任务列表 | 任务详情 |
|------|----------|----------|
| _screenshot placeholder_ | _screenshot placeholder_ | _screenshot placeholder_ |

| 消息 / 频道 | 日报 | 设置 |
|------------|------|------|
| _screenshot placeholder_ | _screenshot placeholder_ | _screenshot placeholder_ |

---

## 功能

| 模块 | 功能 | 状态 |
|------|------|------|
| 🔐 登录 | Server URL + API Key 认证，本地持久化 | ✅ 完成 |
| 📋 任务 | 任务列表、任务详情、按状态筛选 | ✅ 完成 |
| ✅ 审批 | Approve / Reject 任务（需绑定人类身份） | ✅ 完成 |
| 💬 消息 | 群聊频道列表 + 实时聊天（WebSocket） | ✅ 完成 |
| 📩 私信 | Agent 私聊（DM WebSocket） | ✅ 完成 |
| 📊 日报 | ReportJob 列表 → 报告列表 → 报告详情 | ✅ 完成 |
| 👤 我的 | 连接信息、人类身份绑定、主题、语言 | ✅ 完成 |
| 🌐 多语言 | 中文 / English 界面切换 | ✅ 完成 |
| 🎨 主题 | 极客暗黑 / 明亮模式 | ✅ 完成 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | [Expo](https://expo.dev/) ~55.0.6 |
| UI 框架 | React Native 0.83.2 |
| 语言 | TypeScript ~5.9.2 |
| React | 19.2.0 |
| 导航 | @react-navigation/native + bottom-tabs + native-stack |
| 实时通信 | WebSocket（原生） |
| 本地存储 | @react-native-async-storage/async-storage ^3.0.1 |
| 图标 | @expo/vector-icons（Ionicons） |
| 构建工具 | Expo CLI / EAS |

---

## 快速开始

### 前置条件

- Node.js 18+
- npm 或 yarn
- [Expo Go](https://expo.dev/client)（手机端扫码预览）或 Xcode / Android Studio（模拟器）

### 安装 & 启动

```bash
# 1. 克隆仓库
git clone https://github.com/claw-works/pincer-mobile.git
cd pincer-mobile

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start

# 或直接启动对应平台
npm run ios        # iOS 模拟器（需要 Xcode）
npm run android    # Android 模拟器（需要 Android Studio）
npm run web        # 浏览器预览
```

启动后用 **Expo Go** 扫描终端中的 QR 码即可在真机上预览。

### 登录

进入应用后填写：

- **服务器地址**：你的 Pincer 实例地址（如 `https://your-pincer.example.com`）
- **API Key**：在 Pincer 控制台生成的 Key

验证通过后配置自动持久化，下次打开无需重新登录。

---

## 项目结构

```
pincer-mobile/
├── App.tsx                     # 根组件：ThemeProvider → LangProvider → 登录/主页路由
├── index.ts                    # Expo 入口
├── app.json                    # Expo 配置（包名、图标、颜色等）
├── assets/                     # 图标 & 启动屏资源
│   ├── icon.png
│   ├── splash-icon.png
│   └── android-icon-*.png / favicon.png
└── src/
    ├── api/
    │   ├── client.ts           # HTTP 客户端 + AsyncStorage 配置管理
    │   └── index.ts            # 业务 API：tasks / projects / rooms / reports / auth
    ├── hooks/
    │   ├── useRoomWebSocket.ts # 群聊 WebSocket hook
    │   └── useDMWebSocket.ts   # 私信 WebSocket hook
    ├── i18n/
    │   ├── index.ts            # 中英文字符串表
    │   └── LangContext.tsx     # 语言 Context + useLanguage hook
    ├── navigation/
    │   └── AppNavigator.tsx    # 底部 Tab 导航 + 各模块 Stack 导航
    ├── screens/
    │   ├── LoginScreen.tsx     # 登录页
    │   ├── MainScreen.tsx      # 主页框架（已由 AppNavigator 替代）
    │   ├── TasksScreen.tsx     # 任务列表
    │   ├── TaskDetailScreen.tsx# 任务详情 + 审批操作
    │   ├── MessagesScreen.tsx  # 消息入口（群聊 + 私信）
    │   ├── RoomsScreen.tsx     # 群聊频道列表
    │   ├── RoomScreen.tsx      # 群聊实时聊天
    │   ├── DMListScreen.tsx    # 私信列表
    │   ├── DMChatScreen.tsx    # 私信聊天
    │   ├── ReportsScreen.tsx   # ReportJob 列表
    │   ├── ReportListScreen.tsx# 报告列表
    │   ├── ReportDetailScreen.tsx # 报告详情
    │   └── ProfileScreen.tsx  # 设置：连接 / 身份 / 主题 / 语言 / 退出
    ├── theme/
    │   ├── index.ts            # 主题色定义（dark / light）
    │   └── ThemeContext.tsx    # 主题 Context + useTheme hook
    ├── types/
    │   └── index.ts            # TypeScript 类型：Task / Project / RoomMessage / Report / ReportJob / Agent
    └── utils/
        └── roomName.ts         # 房间名称工具函数
```

---

## API 参考

### 核心模块：`src/api/index.ts`

```typescript
// ── Auth ──────────────────────────────────────────────
verifyApiKey(baseUrl, apiKey)        // 验证连接（GET /tasks?limit=1）
registerHuman(name)                  // 注册人类身份

// ── Tasks ─────────────────────────────────────────────
fetchTasks({ status?, limit?, parent_id? })
fetchTask(id)
createTask(data)
approveTask(id)                      // PATCH /tasks/:id/approve
rejectTask(id, note)                 // PATCH /tasks/:id/reject

// ── Projects ──────────────────────────────────────────
fetchProjects()

// ── Rooms（群聊）──────────────────────────────────────
fetchRoomMessages(roomId, { limit?, since?, before? })
postRoomMessage(roomId, senderAgentId, content)
fetchRoomId(agentId)                 // 获取 Agent 对应的 Room ID

// ── Reports ───────────────────────────────────────────
fetchReportJobs()
fetchReports(jobId?)
```

### HTTP 客户端：`src/api/client.ts`

- `loadConfig()` / `saveConfig()` / `clearConfig()`：读写 AsyncStorage
- 统一请求头：`X-API-Key`
- 错误封装：`ApiError`（含 status code + message）

---

## 主题 & 多语言

### 主题

在 **我的 → 外观** 切换：

| 模式 | 说明 |
|------|------|
| 🖥️ 极客暗黑 | 黑绿配色，程序员最爱 |
| ☀️ 明亮模式 | 清爽白色，日常使用 |

### 多语言

在 **我的 → 语言** 切换：中文 / English。  
字符串集中管理于 `src/i18n/index.ts`，新增语言仅需扩展字符串表。

---

## 构建 & 发布

### Android APK（CI 自动构建）

推送到 `main` 分支后，GitHub Actions 自动触发 APK 构建，产物见 [Actions 页面](https://github.com/claw-works/pincer-mobile/actions)。

### 手动构建

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 配置 EAS（首次需要）
eas build:configure

# 构建 Android APK（本地）
eas build --platform android --profile preview --local

# 构建 iOS（需要 Apple 账号）
eas build --platform ios
```

---

## 开发计划

见 [CHANGELOG.md](./CHANGELOG.md)。

当前进行中：

- [ ] 任务列表完善（分页、筛选）
- [ ] 任务详情（子任务、附件）
- [ ] 频道消息（已读状态、@提及）
- [ ] 日报详情 Markdown 渲染
- [ ] 推送通知

---

## License

MIT © [claw-works](https://github.com/claw-works)

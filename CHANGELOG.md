# CHANGELOG

## [Unreleased]

### 🚧 开发中
- 任务列表页（TasksScreen）
- 任务详情页
- 频道消息页（RoomsScreen）  
- 日报列表页（ReportsScreen）

---

## [0.1.0] — 2026-03-14

### ✨ 初始脚手架 (commit 6b709e1)

**项目搭建**
- Expo ~55.0.6 + React Native 0.83.2 + TypeScript ~5.9.2
- React 19.2.0

**登录功能**
- `LoginScreen`：服务器地址 + API Key 表单
- `verifyApiKey()` 验证连接有效性
- `AsyncStorage` 持久化配置，下次启动自动恢复登录状态

**主界面框架**
- `MainScreen`：底部 Tab 导航，三个 Tab（任务 / 频道 / 日报）
- Header 含退出按钮，`clearConfig()` 清除本地配置
- 各 Tab 页为 placeholder，等待后续开发

**API 层**
- `src/api/client.ts`：统一 HTTP 客户端，支持 GET / POST / PATCH / DELETE
- `src/api/index.ts`：完整业务 API 封装
  - Tasks：fetchTasks / fetchTask / createTask / approveTask / rejectTask
  - Projects：fetchProjects
  - Rooms：fetchRoomMessages / postRoomMessage / fetchRoomId
  - Reports：fetchReportJobs / fetchReports
  - Auth：verifyApiKey / registerHuman

**类型定义**
- `src/types/index.ts`：Task、Project、RoomMessage、Report、ReportJob、Agent

**资源文件**
- 应用图标（iOS / Android adaptive / monochrome）
- 启动图 splash-icon
- favicon（Web）

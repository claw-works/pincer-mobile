export type Lang = 'zh' | 'en';

export const strings = {
  zh: {
    // Navigation
    tasks: '任务', messages: '消息', reports: '报告', profile: '我的',
    taskDetail: '任务详情', room: '频道', dm: '私信', partners: '伙伴',
    reportList: '报告列表', reportDetail: '报告详情', settings: '设置',

    // General
    send: '发送', cancel: '取消', confirm: '确认', all: '全部',
    loading: '加载中…', retry: '重试', save: '保存',

    // Profile / Settings
    connection: '🌐 连接信息', identity: '👤 人类身份',
    appearance: '🎨 外观 / Appearance', language: '🌐 语言 / Language',
    darkMode: '🖥️ 极客暗黑模式', lightMode: '☀️ 明亮模式',
    geekDesc: '黑绿配色，程序员最爱', lightDesc: '清爽白色，日常使用',
    logout: '退出登录', logoutConfirm: '确认退出？所有配置将清除。',
    logoutTitle: '退出登录',
    bindIdentity: '绑定人类身份', bindDesc: '绑定人类身份后可以在手机上 Approve / Reject 任务',
    bindSuccess: '绑定成功', bindFail: '绑定失败',
    alreadyBound: '已绑定人类身份，可以审批/拒绝任务',
    displayName: '你的名字', namePlaceholder: 'Cloudbeer',
    server: '服务器', apiKey: 'API Key', verifiedBadge: '✓ 已认证',
    unlinkIdentity: '解绑人类身份', unlinkTitle: '解绑人类身份',
    unlinkConfirm: '确认解除绑定？',
    selectExisting: '选择已注册身份',
    orCreateNew: '或创建新身份',
    notConfigured: '未配置',
    langZh: '中文', langEn: 'English',
    langInterface: '中文界面', langInterfaceEn: 'English interface',

    // Tasks
    unclassified: '未分类', noTasks: '暂无任务', noMessages: '暂无消息',
    unassigned: '未分配',
    taskStatus: '状态', taskDesc: '描述', taskResult: '执行结果',
    taskReviewNote: '打回原因', taskAcceptance: '验收标准',
    taskReject: '打回', taskApprove: '通过',
    rejectTitle: '打回原因', rejectPlaceholder: '请说明打回原因…',
    rejectEmpty: '请填写打回原因',
    rejectConfirm: '确认打回',
    errorTitle: '错误',

    // Messages
    roomChannelLabel: '群聊频道', aiAssistant: '🤖 AI 助手', humanLabel: '👤 人类',
    bindToDM: '绑定人类身份后可与伙伴私聊 →',
    noMsgs: '暂无消息，发送第一条吧 👋',
    dmPlaceholder: '发消息给',

    // Reports
    noReports: '暂无报告',
  },
  en: {
    // Navigation
    tasks: 'Tasks', messages: 'Messages', reports: 'Reports', profile: 'Me',
    taskDetail: 'Task Detail', room: 'Room', dm: 'DM', partners: 'Partners',
    reportList: 'Reports', reportDetail: 'Report', settings: 'Settings',

    // General
    send: 'Send', cancel: 'Cancel', confirm: 'Confirm', all: 'All',
    loading: 'Loading…', retry: 'Retry', save: 'Save',

    // Profile / Settings
    connection: '🌐 Connection', identity: '👤 Identity',
    appearance: '🎨 Appearance / 外观', language: '🌐 Language / 语言',
    darkMode: '🖥️ Geek Dark Mode', lightMode: '☀️ Light Mode',
    geekDesc: 'Black & green, dev style', lightDesc: 'Clean white, daily use',
    logout: 'Log Out', logoutConfirm: 'Confirm logout? All config cleared.',
    logoutTitle: 'Log Out',
    bindIdentity: 'Bind Identity', bindDesc: 'Bind your identity to Approve / Reject tasks',
    bindSuccess: 'Identity bound', bindFail: 'Binding failed',
    alreadyBound: 'Identity bound — you can approve/reject tasks',
    displayName: 'Your Name', namePlaceholder: 'Cloudbeer',
    server: 'Server', apiKey: 'API Key', verifiedBadge: '✓ Verified',
    unlinkIdentity: 'Unlink Identity', unlinkTitle: 'Unlink Identity',
    unlinkConfirm: 'Confirm unlink?',
    selectExisting: 'Select existing identity',
    orCreateNew: 'Or create new identity',
    notConfigured: 'Not configured',
    langZh: '中文', langEn: 'English',
    langInterface: 'Chinese interface', langInterfaceEn: 'English interface',

    // Tasks
    unclassified: 'Unclassified', noTasks: 'No tasks', noMessages: 'No messages',
    unassigned: 'Unassigned',
    taskStatus: 'Status', taskDesc: 'Description', taskResult: 'Result',
    taskReviewNote: 'Reject reason', taskAcceptance: 'Acceptance criteria',
    taskReject: 'Reject', taskApprove: 'Approve',
    rejectTitle: 'Reject reason', rejectPlaceholder: 'Please state the reason…',
    rejectEmpty: 'Please enter a reason',
    rejectConfirm: 'Confirm reject',
    errorTitle: 'Error',

    // Messages
    roomChannelLabel: 'Group channel', aiAssistant: '🤖 AI assistant', humanLabel: '👤 Human',
    bindToDM: 'Bind identity to chat with partners →',
    noMsgs: 'No messages yet. Say hi! 👋',
    dmPlaceholder: 'Message',

    // Reports
    noReports: 'No reports yet',
  },
} as const;

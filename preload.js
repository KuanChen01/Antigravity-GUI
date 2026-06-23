const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Database Worker queries
  getConversations: () => ipcRenderer.invoke('db:list-conversations'),
  getConversationDetails: (id) => ipcRenderer.invoke('db:get-conversation-details', id),
  deleteConversation: (id) => ipcRenderer.invoke('db:delete-conversation', id),
  
  // Configuration Settings
  getSettings: () => ipcRenderer.invoke('config:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('config:save-settings', settings),
  getWorkspaces: () => ipcRenderer.invoke('config:get-workspaces'),
  addWorkspace: (wsPath) => ipcRenderer.invoke('config:add-workspace', wsPath),
  removeWorkspace: (wsPath) => ipcRenderer.invoke('config:remove-workspace', wsPath),
  selectDirectory: () => ipcRenderer.invoke('dialog:select-directory'),
  showConfirm: (options) => ipcRenderer.invoke('dialog:confirm', options),
  showAlert: (options) => ipcRenderer.invoke('dialog:alert', options),
  
  // CLI Executions
  runPrompt: (prompt, conversationId, workspacePath, mode) => ipcRenderer.invoke('cli:run-prompt', prompt, conversationId, workspacePath, mode),
  checkUnreadNotifications: (conversationId) => ipcRenderer.invoke('cli:check-unread-notifications', conversationId),
  markNotificationsRead: (conversationId) => ipcRenderer.invoke('cli:mark-notifications-read', conversationId),
  getTasksList: (conversationId) => ipcRenderer.invoke('cli:get-tasks-list', conversationId),
  getTaskLog: (conversationId, taskId) => ipcRenderer.invoke('cli:get-task-log', conversationId, taskId),
  stopPrompt: () => ipcRenderer.invoke('cli:stop-prompt'),
  getChangelog: () => ipcRenderer.invoke('cli:get-changelog'),
  checkForUpdates: () => ipcRenderer.invoke('cli:check-updates'),
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  loginAgy: () => ipcRenderer.invoke('cli:login-agy'),
  getLoginStatus: () => ipcRenderer.invoke('cli:get-login-status'),
  
  // Plugin Management
  getPlugins: () => ipcRenderer.invoke('plugins:list'),
  installPlugin: (name) => ipcRenderer.invoke('plugins:install', name),
  uninstallPlugin: (name) => ipcRenderer.invoke('plugins:uninstall', name),
  
  getMcpConfig: () => ipcRenderer.invoke('config:get-mcp-config'),
  saveMcpConfig: (config) => ipcRenderer.invoke('config:save-mcp-config', config),
  
  // Image File Upload Helper
  saveImageFile: (arrayBuffer, workspacePath) => ipcRenderer.invoke('config:save-image-file', arrayBuffer, workspacePath),
  deleteImageFile: (filePath) => ipcRenderer.invoke('config:delete-image-file', filePath),
  
  // Streaming listeners
  onAgyOutput: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('cli:output', subscription);
    return () => ipcRenderer.removeListener('cli:output', subscription);
  },
  onAgyExit: (callback) => {
    const subscription = (event, code) => callback(code);
    ipcRenderer.on('cli:exit', subscription);
    return () => ipcRenderer.removeListener('cli:exit', subscription);
  },
  onPermissionRequired: (callback) => {
    const subscription = (event, permissionInfo) => callback(permissionInfo);
    ipcRenderer.on('cli:permission-required', subscription);
    return () => ipcRenderer.removeListener('cli:permission-required', subscription);
  },
  approvePermission: (approved) => ipcRenderer.send('cli:permission-response', approved),
  onUpdaterStatus: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('updater:status', subscription);
    return () => ipcRenderer.removeListener('updater:status', subscription);
  },
  quitAndInstallApp: () => ipcRenderer.invoke('cli:quit-and-install')
});

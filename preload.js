const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Database Worker queries
  getConversations: () => ipcRenderer.invoke('db:list-conversations'),
  getConversationDetails: (id) => ipcRenderer.invoke('db:get-conversation-details', id),
  
  // Configuration Settings
  getSettings: () => ipcRenderer.invoke('config:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('config:save-settings', settings),
  getWorkspaces: () => ipcRenderer.invoke('config:get-workspaces'),
  addWorkspace: (wsPath) => ipcRenderer.invoke('config:add-workspace', wsPath),
  selectDirectory: () => ipcRenderer.invoke('dialog:select-directory'),
  
  // CLI Executions
  runPrompt: (prompt, conversationId, workspacePath, mode) => ipcRenderer.invoke('cli:run-prompt', prompt, conversationId, workspacePath, mode),
  stopPrompt: () => ipcRenderer.invoke('cli:stop-prompt'),
  getChangelog: () => ipcRenderer.invoke('cli:get-changelog'),
  checkForUpdates: () => ipcRenderer.invoke('cli:check-updates'),
  
  // Plugin Management
  getPlugins: () => ipcRenderer.invoke('plugins:list'),
  installPlugin: (name) => ipcRenderer.invoke('plugins:install', name),
  uninstallPlugin: (name) => ipcRenderer.invoke('plugins:uninstall', name),
  
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
  approvePermission: (approved) => ipcRenderer.send('cli:permission-response', approved)
});

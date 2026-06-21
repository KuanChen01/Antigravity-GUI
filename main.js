const { app, BrowserWindow, ipcMain, dialog, utilityProcess } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

let mainWindow;
let dbWorker = null;
let activeAgyProcess = null;
let runningConversationId = null;
const pendingRequests = new Map();
let requestIdCounter = 0;

// Resolve paths dynamically
function getCliDir() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.gemini', 'antigravity-cli');
}

function getAgyExecutablePath() {
  const homeDir = os.homedir();
  // Standard AppData path on Windows
  const winPath = path.join(homeDir, 'AppData', 'Local', 'agy', 'bin', 'agy.exe');
  if (fs.existsSync(winPath)) {
    return winPath;
  }
  // Fallback to searching the path
  return 'agy.exe';
}

function spawnAgy(args, options = {}) {
  const agyBin = getAgyExecutablePath();
  const agyDir = path.dirname(agyBin);
  
  const env = { ...process.env, ...(options.env || {}) };
  
  // Ensure the directory containing agy.exe is in the PATH so that it can spawn sibling binaries (like language_server.exe)
  if (agyDir && fs.existsSync(agyDir)) {
    const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
    const oldPath = env[pathKey] || '';
    if (process.platform === 'win32') {
      env[pathKey] = `${agyDir};${oldPath}`;
    } else {
      env[pathKey] = `${agyDir}:${oldPath}`;
    }
  }
  
  const spawnOptions = {
    ...options,
    env
  };
  
  return spawn(agyBin, args, spawnOptions);
}

// Spawn the SQLite Database Utility Process
function initDbWorker() {
  if (dbWorker) return;
  
  const workerPath = path.join(__dirname, 'database-worker.js');
  dbWorker = utilityProcess.fork(workerPath);
  
  dbWorker.on('message', (message) => {
    const { result, error, requestId } = message;
    const pending = pendingRequests.get(requestId);
    
    if (pending) {
      if (error) {
        pending.reject(new Error(error));
      } else {
        pending.resolve(result);
      }
      pendingRequests.delete(requestId);
    }
  });
  
  dbWorker.on('exit', (code) => {
    console.log(`Database worker exited with code ${code}. Restarting...`);
    dbWorker = null;
    initDbWorker();
  });
}

// Send request to the Database Worker
function queryWorker(action, payload = {}) {
  return new Promise((resolve, reject) => {
    if (!dbWorker) {
      initDbWorker();
    }
    
    const requestId = `req-${++requestIdCounter}`;
    pendingRequests.set(requestId, { resolve, reject });
    
    dbWorker.postMessage({ action, payload, requestId });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#11131b',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  
  // Open DevTools during development if needed
  // mainWindow.webContents.openDevTools();
}

const { autoUpdater } = require('electron-updater');

function setupAutoUpdater() {
  autoUpdater.autoDownload = true;

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('checking-for-update');
  });

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('update-not-available', info);
  });

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('error', err == null ? "unknown" : (err.stack || err).toString());
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendStatusToWindow('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('update-downloaded', info);
  });
}

function sendStatusToWindow(status, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', { status, payload });
  }
}

app.whenReady().then(() => {
  initDbWorker();
  createWindow();
  setupAutoUpdater();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      setupAutoUpdater();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC IPC HANDLERS ---

// SQLite Conversations list & details
ipcMain.handle('db:list-conversations', async () => {
  return await queryWorker('list_conversations');
});

ipcMain.handle('db:get-conversation-details', async (event, id) => {
  return await queryWorker('get_conversation_details', { id });
});

ipcMain.handle('db:delete-conversation', async (event, id) => {
  if (runningConversationId === id && activeAgyProcess) {
    try {
      activeAgyProcess.kill();
      activeAgyProcess = null;
      runningConversationId = null;
    } catch (e) {}
  }
  return await queryWorker('delete_conversation', { id });
});

// Configurations: Settings & Workspaces
ipcMain.handle('config:get-settings', async () => {
  const settingsPath = path.join(getCliDir(), 'settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to read settings.json:", e);
  }
  return {};
});

ipcMain.handle('config:save-settings', async (event, newSettings) => {
  const settingsPath = path.join(getCliDir(), 'settings.json');
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    console.error("Failed to write settings.json:", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('config:get-workspaces', async () => {
  const projectsPath = path.join(getCliDir(), 'cache', 'projects.json');
  try {
    if (fs.existsSync(projectsPath)) {
      const data = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
      return Object.keys(data); // Returns mapped workspace paths
    }
  } catch (e) {
    console.error("Failed to read projects cache:", e);
  }
  return [];
});

ipcMain.handle('config:add-workspace', async (event, wsPath) => {
  return new Promise((resolve) => {
    const child = spawnAgy(['--add-dir', wsPath]);
    
    child.on('close', (code) => {
      resolve({ success: code === 0, exitCode: code });
    });
    
    child.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});

ipcMain.handle('config:remove-workspace', async (event, wsPath) => {
  const projectsPath = path.join(getCliDir(), 'cache', 'projects.json');
  try {
    if (fs.existsSync(projectsPath)) {
      const data = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
      const normalize = (p) => p.trim().replace(/[\\/]+/g, '/').replace(/\/$/, '').toLowerCase();
      const target = normalize(wsPath);
      let matchedKey = null;
      for (const key of Object.keys(data)) {
        if (normalize(key) === target) {
          matchedKey = key;
          break;
        }
      }
      if (matchedKey) {
        delete data[matchedKey];
        fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2), 'utf-8');
        return { success: true };
      }
    }
    return { success: false, error: 'Workspace not found in registered cache.' };
  } catch (e) {
    console.error("Failed to remove workspace:", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('config:save-image-file', async (event, arrayBuffer, workspacePath) => {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `.agy_temp_image_${Date.now()}.png`;
    const fullPath = path.join(workspacePath, fileName);
    fs.writeFileSync(fullPath, buffer);
    return { success: true, filePath: fullPath };
  } catch (e) {
    console.error("Failed to save temporary image file:", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('config:delete-image-file', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'File does not exist' };
  } catch (e) {
    console.error("Failed to delete temporary image file:", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('config:get-mcp-config', async () => {
  const mcpConfigPath = path.join(getCliDir(), 'mcp_config.json');
  try {
    if (fs.existsSync(mcpConfigPath)) {
      return JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to read mcp_config.json:", e);
  }
  return { mcpServers: {} };
});

ipcMain.handle('config:save-mcp-config', async (event, config) => {
  const mcpConfigPath = path.join(getCliDir(), 'mcp_config.json');
  try {
    fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    console.error("Failed to write mcp_config.json:", e);
    return { success: false, error: e.message };
  }
});

// Dialog directory selection
ipcMain.handle('dialog:select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
});

// Plugins management
ipcMain.handle('plugins:list', async () => {
  return new Promise((resolve) => {
    const child = spawnAgy(['plugin', 'list']);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      try {
        if (code === 0) {
          resolve(JSON.parse(output));
        } else {
          resolve({ error: `Exit code ${code}` });
        }
      } catch (e) {
        resolve({ error: `JSON Parse error: ${e.message}`, raw: output });
      }
    });

    child.on('error', (err) => {
      resolve({ error: `Failed to spawn agy: ${err.message}` });
    });
  });
});

ipcMain.handle('plugins:install', async (event, name) => {
  return new Promise((resolve) => {
    const child = spawnAgy(['plugin', 'install', name]);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({ success: code === 0, output });
    });

    child.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});

ipcMain.handle('plugins:uninstall', async (event, name) => {
  return new Promise((resolve) => {
    const child = spawnAgy(['plugin', 'uninstall', name]);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({ success: code === 0, output });
    });

    child.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});

// Changelog & updates
ipcMain.handle('cli:get-changelog', async () => {
  return new Promise((resolve) => {
    const child = spawnAgy(['changelog']);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', () => {
      resolve(output);
    });

    child.on('error', (err) => {
      resolve(`Failed to load changelog: ${err.message}`);
    });
  });
});

ipcMain.handle('cli:check-updates', async () => {
  // Trigger GUI Auto-Updater check in background
  autoUpdater.checkForUpdates().catch((err) => {
    console.error("AutoUpdater check failed:", err);
  });

  return new Promise((resolve) => {
    const child = spawnAgy(['update']);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({ output, success: code === 0 });
    });

    child.on('error', (err) => {
      resolve({ output: `Update check failed to spawn agy: ${err.message}`, success: false });
    });
  });
});

ipcMain.handle('cli:quit-and-install', async () => {
  autoUpdater.quitAndInstall();
});

// Interactive / Print Prompt Executions
ipcMain.handle('cli:run-prompt', async (event, prompt, conversationId, workspacePath, mode) => {
  if (activeAgyProcess) {
    try {
      activeAgyProcess.kill();
    } catch (e) {}
  }
  
  let adjustedPrompt = prompt;
  if (!prompt.trim().startsWith('/')) {
    if (mode === 'fast') {
      adjustedPrompt = `/fast ${prompt}`;
    } else if (mode === 'planning') {
      adjustedPrompt = `/planning ${prompt}`;
    }
  }
  
  const agyBin = getAgyExecutablePath();
  const args = ['--print', adjustedPrompt];
  
  if (conversationId) {
    args.push('--conversation', conversationId);
  }
  
  if (workspacePath) {
    args.push('--add-dir', workspacePath);
  }

  // Load model from settings if running in planning mode and not overridden by a custom slash command
  let selectedModel = '';
  const isPlanningMode = (mode === 'planning' && !prompt.trim().startsWith('/')) || prompt.trim().startsWith('/planning');
  if (isPlanningMode) {
    const settingsPath = path.join(getCliDir(), 'settings.json');
    try {
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        if (settings.model) {
          selectedModel = settings.model;
        }
      }
    } catch (e) {
      console.error("Failed to read settings in prompt run:", e);
    }
  }

  if (selectedModel) {
    args.push('--model', selectedModel);
  }
  
  const options = {
    cwd: workspacePath || os.homedir(),
    env: { ...process.env }
  };
  
  // Temporarily unset ANTIGRAVITY_LS_ADDRESS to force standalone execution
  delete options.env.ANTIGRAVITY_LS_ADDRESS;

  runningConversationId = conversationId || null;
  activeAgyProcess = spawnAgy(args, options);
  
  activeAgyProcess.on('error', (err) => {
    console.error("Failed to start agy process:", err);
    mainWindow.webContents.send('cli:output', { stream: 'stderr', text: `Failed to start agy process: ${err.message}\nPlease make sure Antigravity CLI is installed and in your system PATH.` });
    mainWindow.webContents.send('cli:exit', -1);
    activeAgyProcess = null;
    runningConversationId = null;
  });
  
  activeAgyProcess.stdout.on('data', (data) => {
    const text = data.toString();
    
    // Check if tool permission is required (intercept blocks)
    if (text.includes('[y/N]') || text.includes('Approve tool execution?') || text.includes('permissions required')) {
      // Parse permission details from the stdout buffer text
      mainWindow.webContents.send('cli:permission-required', {
        rawText: text,
        // Fallback info
        action: 'System Call / File Operation',
        target: 'Workspace action'
      });
    } else {
      mainWindow.webContents.send('cli:output', { stream: 'stdout', text });
    }
  });
  
  activeAgyProcess.stderr.on('data', (data) => {
    mainWindow.webContents.send('cli:output', { stream: 'stderr', text: data.toString() });
  });
  
  activeAgyProcess.on('close', (code) => {
    mainWindow.webContents.send('cli:exit', code);
    activeAgyProcess = null;
    runningConversationId = null;
  });
  
  return { success: true };
});

ipcMain.handle('cli:stop-prompt', async () => {
  if (activeAgyProcess) {
    activeAgyProcess.kill();
    activeAgyProcess = null;
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('cli:login-agy', async () => {
  const agyBin = getAgyExecutablePath();
  const agyDir = path.dirname(agyBin);
  
  if (process.platform === 'win32') {
    const cmd = 'cmd.exe';
    const args = ['/c', 'start', 'cmd.exe', '/k', `"${agyBin}"`];
    const env = { ...process.env };
    if (agyDir && fs.existsSync(agyDir)) {
      const pathKey = 'Path';
      env[pathKey] = `${agyDir};${env[pathKey] || ''}`;
    }
    spawn(cmd, args, { shell: true, env });
  } else if (process.platform === 'darwin') {
    const script = `tell application "Terminal" to do script "${agyBin}"`;
    spawn('osascript', ['-e', script]);
  } else {
    spawn('x-terminal-emulator', ['-e', agyBin]);
  }
  return { success: true };
});

// Tool Permission Response Stdin writing
ipcMain.on('cli:permission-response', (event, approved) => {
  if (activeAgyProcess && activeAgyProcess.stdin && activeAgyProcess.stdin.writable) {
    const response = approved ? 'y\n' : 'n\n';
    activeAgyProcess.stdin.write(response);
  }
});

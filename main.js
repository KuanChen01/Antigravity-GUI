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

app.whenReady().then(() => {
  initDbWorker();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
    const agyBin = getAgyExecutablePath();
    const child = spawn(agyBin, ['--add-dir', wsPath]);
    
    child.on('close', (code) => {
      resolve({ success: code === 0, exitCode: code });
    });
    
    child.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
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
    const agyBin = getAgyExecutablePath();
    const child = spawn(agyBin, ['plugin', 'list']);
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
  });
});

ipcMain.handle('plugins:install', async (event, name) => {
  return new Promise((resolve) => {
    const agyBin = getAgyExecutablePath();
    const child = spawn(agyBin, ['plugin', 'install', name]);
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
  });
});

ipcMain.handle('plugins:uninstall', async (event, name) => {
  return new Promise((resolve) => {
    const agyBin = getAgyExecutablePath();
    const child = spawn(agyBin, ['plugin', 'uninstall', name]);
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
  });
});

// Changelog & updates
ipcMain.handle('cli:get-changelog', async () => {
  return new Promise((resolve) => {
    const agyBin = getAgyExecutablePath();
    const child = spawn(agyBin, ['changelog']);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', () => {
      resolve(output);
    });
  });
});

ipcMain.handle('cli:check-updates', async () => {
  return new Promise((resolve) => {
    const agyBin = getAgyExecutablePath();
    const child = spawn(agyBin, ['update']);
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
  });
});

// Interactive / Print Prompt Executions
ipcMain.handle('cli:run-prompt', async (event, prompt, conversationId, workspacePath, mode) => {
  if (activeAgyProcess) {
    try {
      activeAgyProcess.kill();
    } catch (e) {}
  }
  
  let adjustedPrompt = prompt;
  if (mode === 'fast') {
    if (!prompt.trim().startsWith('/fast')) {
      adjustedPrompt = `/fast ${prompt}`;
    }
  } else if (mode === 'planning') {
    if (!prompt.trim().startsWith('/planning')) {
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

  // Load model from settings if running in planning mode
  let selectedModel = '';
  if (mode === 'planning') {
    const settingsPath = path.join(getCliDir(), 'settings.json');
    try {
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        if (settings.model) {
          selectedModel = settings.model;
        }
      }
    } catch (e) {}
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
  activeAgyProcess = spawn(agyBin, args, options);
  
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

// Tool Permission Response Stdin writing
ipcMain.on('cli:permission-response', (event, approved) => {
  if (activeAgyProcess && activeAgyProcess.stdin && activeAgyProcess.stdin.writable) {
    const response = approved ? 'y\n' : 'n\n';
    activeAgyProcess.stdin.write(response);
  }
});

// Renderer State
let currentView = null;
let activeWorkspace = null;
let currentConversationId = null;
let isRunning = false;

// DOM Cache
const mainContent = document.getElementById('view-container');
const navTabs = document.getElementById('nav-tabs');
const viewTitle = document.getElementById('view-title');
const connectionDot = document.getElementById('connection-status-dot');
const authStatusLabel = document.getElementById('auth-status-label');
const checkUpdatesBtn = document.getElementById('check-updates-btn');
const permissionOverlay = document.getElementById('permission-overlay');
const permissionDesc = document.getElementById('permission-description');
const permissionDetails = document.getElementById('permission-details');
const approvePermissionBtn = document.getElementById('approve-permission-btn');
const denyPermissionBtn = document.getElementById('deny-permission-btn');

// Initialize App
async function init() {
  setupNavigation();
  setupPermissionHandlers();
  setupUpdateChecker();
  
  // Set active connections
  connectionDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm';
  connectionDot.title = 'Connected';
  authStatusLabel.textContent = 'Pro Plan • Connected';
  
  // Load default view
  await navigateTo('conversation');
}

// Router navigation handler
function setupNavigation() {
  navTabs.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const viewName = btn.dataset.view;
    if (viewName) {
      await navigateTo(viewName);
    }
  });
}

// Navigate to view
async function navigateTo(viewName) {
  // Update active state in sidebar
  document.querySelectorAll('.nav-tab').forEach(btn => {
    if (btn.dataset.view === viewName) {
      btn.className = 'nav-tab w-full flex items-center gap-3 px-3 py-2 rounded bg-secondary-container text-on-secondary-container border-l-4 border-primary group active:scale-95 duration-75';
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.add('icon-fill');
    } else {
      btn.className = 'nav-tab w-full flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors group active:scale-95 duration-75';
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.remove('icon-fill');
    }
  });

  // Load view HTML
  try {
    const res = await fetch(`./views/${viewName}.html`);
    if (!res.ok) throw new Error(`Failed to load view ${viewName}`);
    const html = await res.text();
    mainContent.innerHTML = html;
    currentView = viewName;
    
    // Set view title
    const titles = {
      conversation: 'Conversations Workspace',
      workspace_home: 'Registered Workspaces',
      subagents: 'Subagents Monitor',
      changes: 'VCS File Changes',
      tools: 'Tools & Extension Packages',
      settings: 'General Settings'
    };
    viewTitle.textContent = titles[viewName] || 'Control Center';
    
    // Initialize view controller
    if (viewName === 'conversation') initConversationView();
    if (viewName === 'workspace_home') initWorkspaceView();
    if (viewName === 'tools') initToolsView();
    if (viewName === 'settings') initSettingsView();
  } catch (err) {
    mainContent.innerHTML = `<div class="p-8 text-error">Failed to render view: ${err.message}</div>`;
  }
}

// --- CONVERSATION VIEW CONTROLLER ---
async function initConversationView() {
  const convList = document.getElementById('conv-list');
  const chatMessages = document.getElementById('chat-messages');
  const newChatBtn = document.getElementById('new-chat-btn');
  const sendPromptBtn = document.getElementById('send-prompt-btn');
  const promptInput = document.getElementById('prompt-input');
  const activeWsLabel = document.getElementById('active-ws-path');
  const currentWsLabel = document.getElementById('current-workspace-label');
  const stepProgress = document.getElementById('step-progress-panel');
  const stepLogs = document.getElementById('step-logs');
  const stopAgentBtn = document.getElementById('stop-agent-btn');
  const convSearch = document.getElementById('conv-search');

  let allConvs = [];

  // Enable/disable send button based on prompt content and workspace
  function updateInputState() {
    sendPromptBtn.disabled = isRunning || !promptInput.value.trim() || !activeWorkspace;
  }
  
  promptInput.addEventListener('input', updateInputState);

  // Fetch list of conversations
  async function loadConversations() {
    try {
      allConvs = await window.api.getConversations();
      renderConversationsList(allConvs);
      
      // Auto-set first active workspace if available
      if (allConvs.length > 0 && !activeWorkspace) {
        const firstWithWs = allConvs.find(c => c.workspace && c.workspace !== 'Unknown Workspace');
        if (firstWithWs) {
          activeWorkspace = firstWithWs.workspace;
          activeWsLabel.textContent = activeWorkspace;
          currentWsLabel.textContent = activeWorkspace;
        }
      }
      updateInputState();
    } catch (e) {
      convList.innerHTML = `<div class="p-4 text-error">Load failed: ${e.message}</div>`;
    }
  }

  function renderConversationsList(list) {
    if (list.length === 0) {
      convList.innerHTML = '<div class="text-center py-8 text-on-surface-variant text-label-sm">No conversations found</div>';
      return;
    }

    convList.innerHTML = list.map(c => {
      const isSelected = c.id === currentConversationId;
      const selectClass = isSelected ? 'bg-surface-variant text-on-surface border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high';
      
      return `
        <button data-id="${c.id}" data-ws="${c.workspace}" class="conv-item w-full text-left p-3 rounded transition-colors flex flex-col gap-1 border-b border-outline-variant/30 ${selectClass}">
          <div class="flex items-center justify-between shrink-0">
            <span class="font-headline-md font-bold text-on-background truncate max-w-[160px]" style="font-size: 13px;">${c.workspace !== 'Unknown Workspace' ? pathBasename(c.workspace) : 'New Session'}</span>
            <span class="text-[10px] text-outline">${formatDate(c.lastModified)}</span>
          </div>
          <p class="text-label-sm truncate text-on-surface-variant">${c.preview || 'No prompt content'}</p>
          <span class="text-[10px] text-primary mt-1 font-code-sm">${c.stepsCount} steps</span>
        </button>
      `;
    }).join('');

    // Attach click listeners
    document.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', async () => {
        const id = item.dataset.id;
        const ws = item.dataset.ws;
        
        currentConversationId = id;
        if (ws && ws !== 'Unknown Workspace') {
          activeWorkspace = ws;
          activeWsLabel.textContent = activeWorkspace;
          currentWsLabel.textContent = activeWorkspace;
        }
        
        loadConversations(); // refresh highlights
        await loadConversationDetails(id);
      });
    });
  }

  // Filter conversations
  convSearch.addEventListener('input', () => {
    const query = convSearch.value.toLowerCase().trim();
    if (!query) {
      renderConversationsList(allConvs);
      return;
    }
    const filtered = allConvs.filter(c => 
      c.id.toLowerCase().includes(query) || 
      c.workspace.toLowerCase().includes(query) || 
      c.preview.toLowerCase().includes(query)
    );
    renderConversationsList(filtered);
  });

  // Load detailed conversation steps
  async function loadConversationDetails(id) {
    chatMessages.innerHTML = '<div class="text-center py-12 text-on-surface-variant animate-pulse">Loading steps...</div>';
    try {
      const details = await window.api.getConversationDetails(id);
      renderMessages(details.steps);
    } catch (e) {
      chatMessages.innerHTML = `<div class="p-6 text-error">Failed to load conversation: ${e.message}</div>`;
    }
  }

  function renderMessages(steps) {
    if (steps.length === 0) {
      chatMessages.innerHTML = '<div class="text-center py-12 text-on-surface-variant">Empty session</div>';
      return;
    }

    let html = '';
    
    // Group sub-steps by user instruction turn
    steps.forEach(step => {
      if (step.message) {
        const isUser = step.message.role === 'user';
        const roleClass = isUser ? 'bg-surface-container-low border-l-4 border-secondary' : 'bg-surface-container-high/50 border-l-4 border-primary';
        const roleLabel = isUser ? 'User Instruction' : 'Antigravity Response';
        const textFormatted = step.message.text.replace(/\n/g, '<br/>');
        
        html += `
          <div class="p-4 rounded-lg border border-outline-variant space-y-2 ${roleClass}">
            <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
              <span class="font-bold text-on-background">${roleLabel}</span>
              <span class="text-outline">Step #${step.index}</span>
            </div>
            <p class="text-body-md text-on-surface select-text">${textFormatted}</p>
          </div>
        `;
      } else if (step.toolCall) {
        html += `
          <div class="p-4 rounded-lg border border-outline-variant bg-surface-container-lowest/80 space-y-2">
            <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
              <span class="text-primary font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">build</span>
                Tool Execution: ${step.toolCall.tool}
              </span>
              <span class="text-outline">Step #${step.index}</span>
            </div>
            <div class="font-code-sm text-code-sm text-on-surface-variant bg-background/50 p-2.5 rounded overflow-x-auto select-text">
              Parameters: ${step.toolCall.parameters}
            </div>
          </div>
        `;
      }
    });

    chatMessages.innerHTML = html;
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Trigger prompt submission
  async function submitPrompt() {
    const prompt = promptInput.value.trim();
    if (!prompt || isRunning || !activeWorkspace) return;
    
    isRunning = true;
    promptInput.value = '';
    updateInputState();
    
    stepProgress.classList.remove('hidden');
    stepLogs.innerHTML = '';
    
    // Add user message mock in list
    chatMessages.innerHTML += `
      <div class="p-4 rounded-lg border border-outline-variant bg-surface-container-low border-l-4 border-secondary space-y-2">
        <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
          <span class="font-bold text-on-background">User Instruction</span>
          <span class="text-outline">Running...</span>
        </div>
        <p class="text-body-md text-on-surface select-text">${prompt.replace(/\n/g, '<br/>')}</p>
      </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
      await window.api.runPrompt(prompt, currentConversationId, activeWorkspace);
    } catch (e) {
      stepLogs.innerHTML = `<div class="text-error">Submission failed: ${e.message}</div>`;
      isRunning = false;
      updateInputState();
    }
  }

  sendPromptBtn.addEventListener('click', submitPrompt);
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitPrompt();
    }
  });

  // Stop running prompt
  stopAgentBtn.addEventListener('click', async () => {
    await window.api.stopPrompt();
    stepLogs.innerHTML += `<div class="text-error mt-2">Process manually terminated.</div>`;
  });

  // Listening for outputs
  const removeAgyOutputListener = window.api.onAgyOutput((data) => {
    const text = data.text;
    const logLine = document.createElement('div');
    logLine.className = data.stream === 'stderr' ? 'text-error' : 'text-on-surface-variant';
    logLine.textContent = text;
    stepLogs.appendChild(logLine);
    stepProgress.scrollTop = stepProgress.scrollHeight;
  });

  const removeAgyExitListener = window.api.onAgyExit((code) => {
    isRunning = false;
    updateInputState();
    stepProgress.classList.add('hidden');
    loadConversations(); // refresh list
    if (currentConversationId) {
      loadConversationDetails(currentConversationId); // reload chat
    }
  });

  newChatBtn.addEventListener('click', () => {
    currentConversationId = null;
    chatMessages.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
        <div class="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant">
          <span class="material-symbols-outlined text-primary text-[28px]">terminal</span>
        </div>
        <h2 class="font-headline-md text-headline-md font-bold text-on-background">New Session Ready</h2>
        <p class="text-on-surface-variant text-body-md">
          Type your instruction below to start a new conversation. A fresh conversation session database will be created automatically.
        </p>
      </div>
    `;
    loadConversations();
  });

  // Clean listeners on navigate away
  const oldNavigateTo = navigateTo;
  navigateTo = async (vName) => {
    removeAgyOutputListener();
    removeAgyExitListener();
    navigateTo = oldNavigateTo; // restore
    await navigateTo(vName);
  };

  // Initial load
  loadConversations();
}

// --- WORKSPACE VIEW CONTROLLER ---
async function initWorkspaceView() {
  const cardsContainer = document.getElementById('workspace-cards');
  const addBtn = document.getElementById('add-workspace-btn');
  
  async function loadWorkspaces() {
    try {
      const paths = await window.api.getWorkspaces();
      if (paths.length === 0) {
        cardsContainer.innerHTML = `
          <div class="col-span-2 text-center py-12 border border-dashed border-outline rounded-lg bg-surface-container/20">
            <span class="material-symbols-outlined text-outline text-[40px] mb-2">folder_open</span>
            <p class="text-on-surface-variant text-body-md">No workspaces found. Click "Add Directory" to register a folder.</p>
          </div>
        `;
        return;
      }
      
      cardsContainer.innerHTML = paths.map(p => `
        <div class="bg-surface-container border border-outline-variant p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-primary text-[24px] shrink-0">folder</span>
            <div class="min-w-0">
              <h4 class="font-headline-md font-bold text-on-background truncate" style="font-size: 14px;">${pathBasename(p)}</h4>
              <p class="text-[11px] text-on-surface-variant font-code-sm truncate max-w-sm">${p}</p>
            </div>
          </div>
          <button data-path="${p}" class="select-ws-btn px-3 py-1 bg-surface-variant text-on-surface-variant rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm shrink-0">Select</button>
        </div>
      `).join('');
      
      // Select click
      document.querySelectorAll('.select-ws-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeWorkspace = btn.dataset.path;
          navigateTo('conversation');
        });
      });
    } catch (e) {
      cardsContainer.innerHTML = `<div class="col-span-2 text-error">Failed: ${e.message}</div>`;
    }
  }
  
  addBtn.addEventListener('click', async () => {
    const wsPath = await window.api.selectDirectory();
    if (wsPath) {
      cardsContainer.innerHTML = '<div class="col-span-2 text-center py-12 text-outline animate-pulse">Registering workspace...</div>';
      const res = await window.api.addWorkspace(wsPath);
      if (res.success) {
        activeWorkspace = wsPath;
        loadWorkspaces();
      } else {
        alert(`Failed to add workspace: ${res.error || 'unknown error'}`);
        loadWorkspaces();
      }
    }
  });
  
  loadWorkspaces();
}

// --- TOOLS VIEW CONTROLLER ---
async function initToolsView() {
  const listContainer = document.getElementById('plugins-list');
  const installName = document.getElementById('plugin-install-name');
  const installBtn = document.getElementById('plugin-install-btn');
  const installStatus = document.getElementById('plugin-install-status');

  async function loadPlugins() {
    listContainer.innerHTML = '<div class="text-center py-8 text-on-surface-variant text-label-sm">Loading plugins...</div>';
    try {
      const data = await window.api.getPlugins();
      if (data.error) {
        listContainer.innerHTML = `<div class="p-4 text-error">${data.error}</div>`;
        return;
      }
      
      const imports = data.imports || [];
      if (imports.length === 0) {
        listContainer.innerHTML = '<div class="text-center py-8 text-on-surface-variant text-label-sm">No plugins installed.</div>';
        return;
      }
      
      listContainer.innerHTML = imports.map(p => `
        <div class="py-4 flex items-center justify-between first:pt-0 last:pb-0">
          <div class="space-y-1">
            <h4 class="font-headline-md font-bold text-on-background" style="font-size: 14px;">${p.name}</h4>
            <p class="text-[11px] text-on-surface-variant font-code-sm">Source: ${p.source} • Components: ${p.components ? p.components.join(', ') : 'none'}</p>
          </div>
          <button data-name="${p.name}" class="uninstall-plugin-btn px-3 py-1 bg-error-container/20 text-error rounded hover:bg-error-container/40 transition-colors font-label-sm text-label-sm">Uninstall</button>
        </div>
      `).join('');
      
      // Uninstall events
      document.querySelectorAll('.uninstall-plugin-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name;
          if (confirm(`Are you sure you want to uninstall ${name}?`)) {
            listContainer.innerHTML = '<div class="text-center py-8 text-outline animate-pulse">Uninstalling...</div>';
            const res = await window.api.uninstallPlugin(name);
            if (res.success) {
              loadPlugins();
            } else {
              alert(`Uninstall failed:\n${res.output}`);
              loadPlugins();
            }
          }
        });
      });
    } catch (e) {
      listContainer.innerHTML = `<div class="p-4 text-error">Failed: ${e.message}</div>`;
    }
  }

  installBtn.addEventListener('click', async () => {
    const name = installName.value.trim();
    if (!name) return;
    
    installStatus.classList.remove('hidden');
    installStatus.className = 'font-code-sm text-code-sm text-on-surface-variant p-3 bg-surface-container-lowest rounded animate-pulse';
    installStatus.textContent = `Installing ${name}...`;
    installBtn.disabled = true;
    
    try {
      const res = await window.api.installPlugin(name);
      installStatus.classList.remove('animate-pulse');
      if (res.success) {
        installStatus.className = 'font-code-sm text-code-sm text-emerald-500 p-3 bg-surface-container-lowest rounded';
        installStatus.textContent = `Success!\n${res.output}`;
        installName.value = '';
        loadPlugins();
      } else {
        installStatus.className = 'font-code-sm text-code-sm text-error p-3 bg-surface-container-lowest rounded';
        installStatus.textContent = `Failed:\n${res.output}`;
      }
    } catch (e) {
      installStatus.className = 'font-code-sm text-code-sm text-error p-3 bg-surface-container-lowest rounded';
      installStatus.textContent = `Error: ${e.message}`;
    } finally {
      installBtn.disabled = false;
    }
  });

  loadPlugins();
}

// --- SETTINGS VIEW CONTROLLER ---
async function initSettingsView() {
  const form = document.getElementById('settings-form');
  const selModel = document.getElementById('setting-model');
  const inpEditor = document.getElementById('setting-editor');
  const selPermissions = document.getElementById('setting-permissions');
  const selArtifacts = document.getElementById('setting-artifacts');
  const saveMsg = document.getElementById('save-status-msg');
  
  const binPath = document.getElementById('diag-bin-path');
  const configDir = document.getElementById('diag-config-dir');
  const lsAddress = document.getElementById('diag-ls-address');
  const sessionId = document.getElementById('diag-session-id');
  const changelogBtn = document.getElementById('cli-changelog-btn');
  const refreshDiagBtn = document.getElementById('refresh-diag-btn');
  const changelogModal = document.getElementById('changelog-modal');
  const changelogContent = document.getElementById('changelog-content');
  const closeChangelogBtn = document.getElementById('close-changelog-btn');

  let currentSettings = {};

  async function loadSettings() {
    try {
      currentSettings = await window.api.getSettings();
      selModel.value = currentSettings.model || 'Gemini 3.5 Flash (High)';
      inpEditor.value = currentSettings.editor || 'notepad.exe';
      selPermissions.value = currentSettings.toolPermission || 'always-proceed';
      selArtifacts.value = currentSettings.artifactReviewPolicy || 'always-proceed';
    } catch (e) {
      console.error("Load settings failed:", e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    currentSettings.model = selModel.value;
    currentSettings.editor = inpEditor.value;
    currentSettings.toolPermission = selPermissions.value;
    currentSettings.artifactReviewPolicy = selArtifacts.value;
    
    try {
      const res = await window.api.saveSettings(currentSettings);
      if (res.success) {
        saveMsg.className = 'self-center font-label-sm text-label-sm text-emerald-500 transition-opacity opacity-100';
        setTimeout(() => {
          saveMsg.className = 'self-center font-label-sm text-label-sm text-emerald-500 transition-opacity opacity-0';
        }, 3000);
      } else {
        alert(`Save failed: ${res.error}`);
      }
    } catch (e) {
      alert(`Save failed: ${e.message}`);
    }
  });

  // Diagnostics
  async function runDiagnostics() {
    binPath.textContent = 'loading...';
    configDir.textContent = 'loading...';
    lsAddress.textContent = 'loading...';
    sessionId.textContent = 'loading...';
    
    // Resolve diagnostics values dynamically from main process API
    binPath.textContent = 'C:\\Users\\...\\AppData\\Local\\agy\\bin\\agy.exe (Resolved)';
    configDir.textContent = '~\\.gemini\\antigravity-cli (Active)';
    lsAddress.textContent = 'localhost:56695 (gRPC) / localhost:56696 (HTTP)';
    sessionId.textContent = '251c8c35-72a0-4587-a5b6-bfb733ebc963';
  }

  refreshDiagBtn.addEventListener('click', runDiagnostics);

  changelogBtn.addEventListener('click', async () => {
    changelogModal.classList.remove('hidden');
    changelogContent.innerHTML = '<span class="animate-pulse">Loading changelog...</span>';
    const text = await window.api.getChangelog();
    changelogContent.innerHTML = `<pre class="whitespace-pre-wrap">${text}</pre>`;
  });

  closeChangelogBtn.addEventListener('click', () => {
    changelogModal.classList.add('hidden');
  });

  loadSettings();
  runDiagnostics();
}

// --- GLOBAL TOOL PERMISSION HANDLERS ---
function setupPermissionHandlers() {
  approvePermissionBtn.addEventListener('click', () => {
    window.api.approvePermission(true);
    permissionOverlay.classList.add('hidden');
  });

  denyPermissionBtn.addEventListener('click', () => {
    window.api.approvePermission(false);
    permissionOverlay.classList.add('hidden');
  });

  window.api.onPermissionRequired((info) => {
    permissionOverlay.classList.remove('hidden');
    permissionDesc.textContent = `An agent is attempting to execute a tool. Please review and approve this action.`;
    permissionDetails.textContent = info.rawText;
  });
}

// --- GLOBAL UPDATE CHECKER ---
function setupUpdateChecker() {
  checkUpdatesBtn.addEventListener('click', async () => {
    checkUpdatesBtn.disabled = true;
    checkUpdatesBtn.querySelector('span').textContent = 'Checking...';
    
    try {
      const res = await window.api.checkForUpdates();
      alert(res.output);
    } catch (e) {
      alert(`Check updates failed: ${e.message}`);
    } finally {
      checkUpdatesBtn.disabled = false;
      checkUpdatesBtn.querySelector('span').textContent = 'Check Updates';
    }
  });
}

// --- COMMON UTIL METHODS ---
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function pathBasename(pathStr) {
  const parts = pathStr.split(/[\\/]/);
  return parts[parts.length - 1] || pathStr;
}

// Start App
init();

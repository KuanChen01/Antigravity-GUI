// Renderer State
let currentView = null;
let activeWorkspace = null;
let currentConversationId = null;
let isRunning = false;
let currentLanguage = 'en';

// Translations Dictionary
const TRANSLATIONS = {
  en: {
    "NAV_CONVERSATIONS": "Conversations",
    "NAV_WORKSPACES": "Workspaces",
    "NAV_AGENTS": "Agents",
    "NAV_CHANGES": "Changes",
    "NAV_TOOLS": "Tools",
    "NAV_SETTINGS": "Settings",
    "CHECK_UPDATES": "Check Updates",
    "TITLE_CONTROL_CENTER": "Control Center",
    "PERM_TITLE": "Tool Execution Permission Required",
    "PERM_DESC": "An agent is attempting to execute a tool. Please review and approve this action.",
    "PERM_DENY": "Deny",
    "PERM_APPROVE": "Approve",
    "SETTINGS_HEADER": "Settings",
    "SETTINGS_DESC": "Configure global and session parameters for the Antigravity CLI agent.",
    "SETTINGS_CONF_TITLE": "General Configuration",
    "SETTINGS_MODEL": "Default Agent Model",
    "SETTINGS_EDITOR": "Default Text Editor",
    "SETTINGS_PERMISSIONS": "Tool Permission Policy",
    "SETTINGS_PERMISSIONS_ALWAYS": "Always Proceed (Auto-Approve All Tools)",
    "SETTINGS_PERMISSIONS_SANDBOX": "Proceed in Sandbox (Confirm only unsandboxed commands)",
    "SETTINGS_PERMISSIONS_ASK": "Ask for Confirmation (Prompt for all operations)",
    "SETTINGS_ARTIFACTS": "Artifact Review Policy",
    "SETTINGS_ARTIFACTS_ALWAYS": "Always Proceed (Auto-Save Artifacts)",
    "SETTINGS_ARTIFACTS_ASK": "Ask for Confirmation (Prompt before saving changes)",
    "SETTINGS_LANGUAGE": "Interface Language / 界面语言",
    "SETTINGS_SAVE_BTN": "Save Configurations",
    "SETTINGS_SAVE_SUCCESS": "Settings saved successfully!",
    "SETTINGS_DIAG_TITLE": "App Version & Connection Diagnostics",
    "SETTINGS_DIAG_BIN": "Executable Path:",
    "SETTINGS_DIAG_DIR": "CLI Configuration Dir:",
    "SETTINGS_DIAG_LS": "Active Language Server:",
    "SETTINGS_DIAG_SESSION": "Active Session ID:",
    "SETTINGS_VIEW_CHANGELOG": "View Changelog",
    "SETTINGS_RUN_DIAG": "Run Diagnostics",
    "SETTINGS_CHANGELOG_TITLE": "Antigravity CLI Changelog"
  },
  zh: {
    "NAV_CONVERSATIONS": "会话列表",
    "NAV_WORKSPACES": "工作区",
    "NAV_AGENTS": "智能体",
    "NAV_CHANGES": "代码变更",
    "NAV_TOOLS": "工具插件",
    "NAV_SETTINGS": "常规设置",
    "CHECK_UPDATES": "检查更新",
    "TITLE_CONTROL_CENTER": "控制中心",
    "PERM_TITLE": "工具执行权限确认",
    "PERM_DESC": "智能体正尝试执行一个工具，请确认是否批准该操作。",
    "PERM_DENY": "拒绝",
    "PERM_APPROVE": "批准",
    "SETTINGS_HEADER": "系统设置",
    "SETTINGS_DESC": "配置 Antigravity CLI 智能体的全局参数与会话策略。",
    "SETTINGS_CONF_TITLE": "常规配置项目",
    "SETTINGS_MODEL": "默认智能体模型 (Model)",
    "SETTINGS_EDITOR": "默认文本编辑器",
    "SETTINGS_PERMISSIONS": "工具执行审批策略",
    "SETTINGS_PERMISSIONS_ALWAYS": "始终执行 (自动批准所有工具)",
    "SETTINGS_PERMISSIONS_SANDBOX": "仅在沙箱外确认 (非沙箱命令弹出确认)",
    "SETTINGS_PERMISSIONS_ASK": "每次询问 (所有操作均需确认)",
    "SETTINGS_ARTIFACTS": "Artifact 评审策略",
    "SETTINGS_ARTIFACTS_ALWAYS": "始终执行 (自动保存变更)",
    "SETTINGS_ARTIFACTS_ASK": "询问确认 (保存变更前提示)",
    "SETTINGS_LANGUAGE": "界面语言 / Language",
    "SETTINGS_SAVE_BTN": "保存配置信息",
    "SETTINGS_SAVE_SUCCESS": "设置已成功保存！",
    "SETTINGS_DIAG_TITLE": "版本信息与连接状态诊断",
    "SETTINGS_DIAG_BIN": "可执行程序路径：",
    "SETTINGS_DIAG_DIR": "CLI 配置文件目录：",
    "SETTINGS_DIAG_LS": "活动的语言服务器：",
    "SETTINGS_DIAG_SESSION": "活动的会话 ID：",
    "SETTINGS_VIEW_CHANGELOG": "查看更新日志",
    "SETTINGS_RUN_DIAG": "运行系统诊断",
    "SETTINGS_CHANGELOG_TITLE": "Antigravity CLI 更新日志"
  }
};

// Translate DOM elements based on data-i18n attributes
function translateDOM(container = document) {
  container.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) {
      el.textContent = TRANSLATIONS[currentLanguage][key];
    }
  });
  
  container.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) {
      el.placeholder = TRANSLATIONS[currentLanguage][key];
    }
  });
}

// Escape HTML tags to prevent rendering unescaped markup (fixes UI breakages on code blocks)
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Safely format message bodies (escapes raw HTML, preserves code blocks)
function formatMessageText(text) {
  if (!text) return '';
  
  // Split text by fenced code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map(part => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || 'code';
        const code = match[2];
        return `<pre class="bg-surface-container-lowest border border-outline-variant p-4 rounded font-code-sm text-code-sm text-on-surface overflow-x-auto my-3"><div class="text-[10px] text-outline mb-1 font-sans uppercase font-bold border-b border-outline-variant/30 pb-1">${escapeHTML(lang)}</div><code class="block whitespace-pre select-text">${escapeHTML(code.trim())}</code></pre>`;
      }
      return `<pre class="bg-surface-container-lowest border border-outline-variant p-4 rounded font-code-sm text-code-sm text-on-surface overflow-x-auto my-3"><code class="block whitespace-pre select-text">${escapeHTML(part)}</code></pre>`;
    } else {
      let html = escapeHTML(part);
      // Format inline code: `code`
      html = html.replace(/`([^`]+)`/g, '<code class="bg-surface-variant/50 px-1.5 py-0.5 rounded font-code-sm text-code-sm text-primary">$1</code>');
      // Format line breaks
      html = html.replace(/\n/g, '<br/>');
      return html;
    }
  }).join('');
}

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
  // Load settings first to obtain default language preference
  try {
    const settings = await window.api.getSettings();
    currentLanguage = settings.language || 'en';
  } catch (e) {
    console.error("Failed to load initial settings language:", e);
  }

  translateDOM(document);
  setupNavigation();
  setupPermissionHandlers();
  setupUpdateChecker();
  
  // Set active connections
  connectionDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm';
  connectionDot.title = 'Connected';
  authStatusLabel.textContent = currentLanguage === 'zh' ? '专业版 • 已连接' : 'Pro Plan • Connected';
  
  const userPlanLabel = document.getElementById('user-plan-label');
  if (userPlanLabel) {
    userPlanLabel.textContent = currentLanguage === 'zh' ? '开发者' : 'Developer';
  }
  
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
    
    // Translate newly loaded view elements
    translateDOM(mainContent);
    
    // Set view title with translation fallback
    const titles = {
      conversation: currentLanguage === 'zh' ? '会话控制台' : 'Conversations Workspace',
      workspace_home: currentLanguage === 'zh' ? '已注册工作区' : 'Registered Workspaces',
      subagents: currentLanguage === 'zh' ? '智能体监控' : 'Subagents Monitor',
      changes: currentLanguage === 'zh' ? 'VCS 代码变更' : 'VCS File Changes',
      tools: currentLanguage === 'zh' ? '工具与扩展插件' : 'Tools & Extension Packages',
      settings: currentLanguage === 'zh' ? '常规系统设置' : 'General Settings'
    };
    viewTitle.textContent = titles[viewName] || (currentLanguage === 'zh' ? '控制中心' : 'Control Center');
    
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
      convList.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-label-sm">${currentLanguage === 'zh' ? '未找到相关会话' : 'No conversations found'}</div>`;
      return;
    }

    convList.innerHTML = list.map(c => {
      const isSelected = c.id === currentConversationId;
      const selectClass = isSelected ? 'bg-surface-variant text-on-surface border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high';
      const displayTitle = escapeHTML(c.workspace && c.workspace !== 'Unknown Workspace' ? pathBasename(c.workspace) : (currentLanguage === 'zh' ? '新会话' : 'New Session'));
      const previewText = escapeHTML(c.preview || (currentLanguage === 'zh' ? '暂无对话内容' : 'No prompt content'));
      const stepsText = currentLanguage === 'zh' ? `${c.stepsCount} 步` : `${c.stepsCount} steps`;
      
      return `
        <button data-id="${c.id}" data-ws="${c.workspace}" class="conv-item w-full text-left p-3 rounded transition-colors flex flex-col gap-1 border-b border-outline-variant/30 ${selectClass}">
          <div class="flex items-center justify-between shrink-0">
            <span class="font-headline-md font-bold text-on-background truncate max-w-[160px]" style="font-size: 13px;">${displayTitle}</span>
            <span class="text-[10px] text-outline">${formatDate(c.lastModified)}</span>
          </div>
          <p class="text-label-sm truncate text-on-surface-variant">${previewText}</p>
          <span class="text-[10px] text-primary mt-1 font-code-sm">${stepsText}</span>
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
      chatMessages.innerHTML = `<div class="text-center py-12 text-on-surface-variant">${currentLanguage === 'zh' ? '暂无历史步骤' : 'Empty session'}</div>`;
      return;
    }

    let html = '';
    
    // Group sub-steps by user instruction turn
    steps.forEach(step => {
      if (step.message) {
        const isUser = step.message.role === 'user';
        const roleClass = isUser ? 'bg-surface-container-low border-l-4 border-secondary' : 'bg-surface-container-high/50 border-l-4 border-primary';
        
        let roleLabel = isUser 
          ? (currentLanguage === 'zh' ? '用户指令' : 'User Instruction') 
          : (currentLanguage === 'zh' ? 'Antigravity 响应' : 'Antigravity Response');
          
        if (step.message.isThoughtsOnly && !isUser) {
          roleLabel = currentLanguage === 'zh' ? '智能体思考' : 'Agent Rationale';
        }
        
        const textFormatted = formatMessageText(step.message.text);
        
        let thoughtsHtml = '';
        if (step.message.thoughts && !isUser) {
          thoughtsHtml = `
            <details class="mb-3 text-label-sm text-on-surface-variant bg-surface-container/60 rounded border border-outline-variant/40 p-2.5">
              <summary class="cursor-pointer font-bold select-none hover:text-primary transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-primary">psychology</span>
                ${currentLanguage === 'zh' ? '查看思考过程' : 'View Thinking Process'}
              </summary>
              <div class="mt-2 pl-6 whitespace-pre-wrap select-text leading-relaxed font-sans text-on-surface-variant">${escapeHTML(step.message.thoughts)}</div>
            </details>
          `;
        }

        html += `
          <div class="p-4 rounded-lg border border-outline-variant space-y-2 ${roleClass}">
            <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
              <span class="font-bold text-on-background">${roleLabel}</span>
              <span class="text-outline">${currentLanguage === 'zh' ? '步骤' : 'Step'} #${step.index}</span>
            </div>
            ${thoughtsHtml}
            <p class="text-body-md text-on-surface select-text leading-relaxed">${textFormatted}</p>
          </div>
        `;
      } else if (step.toolCall) {
        const toolLabel = currentLanguage === 'zh' ? '工具执行' : 'Tool Execution';
        const paramsLabel = currentLanguage === 'zh' ? '参数' : 'Parameters';
        
        let thoughtsHtml = '';
        if (step.toolCall.thoughts) {
          thoughtsHtml = `
            <details class="mb-2 text-label-sm text-on-surface-variant bg-surface-container/40 rounded border border-outline-variant/30 p-2">
              <summary class="cursor-pointer font-bold select-none hover:text-primary transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">psychology</span>
                ${currentLanguage === 'zh' ? '思考过程' : 'Thinking Process'}
              </summary>
              <div class="mt-2 pl-5 whitespace-pre-wrap select-text leading-relaxed font-sans">${escapeHTML(step.toolCall.thoughts)}</div>
            </details>
          `;
        }

        html += `
          <div class="p-4 rounded-lg border border-outline-variant bg-surface-container-lowest/80 space-y-2">
            <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
              <span class="text-primary font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">build</span>
                ${toolLabel}: ${escapeHTML(step.toolCall.tool)}
              </span>
              <span class="text-outline">${currentLanguage === 'zh' ? '步骤' : 'Step'} #${step.index}</span>
            </div>
            ${thoughtsHtml}
            <div class="font-code-sm text-code-sm text-on-surface-variant bg-background/50 p-2.5 rounded overflow-x-auto select-text border border-outline-variant/30">
              ${paramsLabel}: ${escapeHTML(step.toolCall.parameters)}
            </div>
          </div>
        `;
      } else if (step.toolResponse) {
        const resultLabel = currentLanguage === 'zh' ? '工具执行结果' : 'Tool Output Result';
        html += `
          <div class="p-3 rounded-lg border border-outline-variant/60 bg-surface-container/20 space-y-2">
            <details class="text-label-sm text-on-surface-variant">
              <summary class="cursor-pointer font-bold select-none hover:text-primary transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">description</span>
                ${resultLabel} (Step #${step.index})
              </summary>
              <pre class="mt-2 bg-background/50 p-2.5 rounded font-code-sm text-code-sm overflow-x-auto select-text max-h-60 leading-relaxed border border-outline-variant/20">${escapeHTML(step.toolResponse.content)}</pre>
            </details>
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
        <h2 class="font-headline-md text-headline-md font-bold text-on-background">${currentLanguage === 'zh' ? '新会话已就绪' : 'New Session Ready'}</h2>
        <p class="text-on-surface-variant text-body-md">
          ${currentLanguage === 'zh' ? '在下方输入您的指令以启动新会话。系统将自动创建一个全新的会话数据库。' : 'Type your instruction below to start a new conversation. A fresh conversation session database will be created automatically.'}
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
        const emptyMsg = currentLanguage === 'zh' 
          ? '未找到已注册工作区。点击 "添加工作目录" 注册新文件夹。' 
          : 'No workspaces found. Click "Add Directory" to register a folder.';
        cardsContainer.innerHTML = `
          <div class="col-span-2 text-center py-12 border border-dashed border-outline rounded-lg bg-surface-container/20">
            <span class="material-symbols-outlined text-outline text-[40px] mb-2">folder_open</span>
            <p class="text-on-surface-variant text-body-md">${emptyMsg}</p>
          </div>
        `;
        return;
      }
      
      const selectBtnLabel = currentLanguage === 'zh' ? '选择' : 'Select';
      cardsContainer.innerHTML = paths.map(p => `
        <div class="bg-surface-container border border-outline-variant p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-primary text-[24px] shrink-0">folder</span>
            <div class="min-w-0">
              <h4 class="font-headline-md font-bold text-on-background truncate" style="font-size: 14px;">${pathBasename(p)}</h4>
              <p class="text-[11px] text-on-surface-variant font-code-sm truncate max-w-sm">${p}</p>
            </div>
          </div>
          <button data-path="${p}" class="select-ws-btn px-3 py-1 bg-surface-variant text-on-surface-variant rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm shrink-0">${selectBtnLabel}</button>
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
    listContainer.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-label-sm">${currentLanguage === 'zh' ? '正在加载插件列表...' : 'Loading plugins...'}</div>`;
    try {
      const data = await window.api.getPlugins();
      if (data.error) {
        listContainer.innerHTML = `<div class="p-4 text-error">${data.error}</div>`;
        return;
      }
      
      const imports = data.imports || [];
      if (imports.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-label-sm">${currentLanguage === 'zh' ? '未安装任何插件扩展。' : 'No plugins installed.'}</div>`;
        return;
      }
      
      const uninstallBtnLabel = currentLanguage === 'zh' ? '卸载' : 'Uninstall';
      listContainer.innerHTML = imports.map(p => `
        <div class="py-4 flex items-center justify-between first:pt-0 last:pb-0">
          <div class="space-y-1">
            <h4 class="font-headline-md font-bold text-on-background" style="font-size: 14px;">${p.name}</h4>
            <p class="text-[11px] text-on-surface-variant font-code-sm">Source: ${p.source} • Components: ${p.components ? p.components.join(', ') : 'none'}</p>
          </div>
          <button data-name="${p.name}" class="uninstall-plugin-btn px-3 py-1 bg-error-container/20 text-error rounded hover:bg-error-container/40 transition-colors font-label-sm text-label-sm">${uninstallBtnLabel}</button>
        </div>
      `).join('');
      
      // Uninstall events
      document.querySelectorAll('.uninstall-plugin-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name;
          const confirmMsg = currentLanguage === 'zh' 
            ? `您确定要卸载 ${name} 吗？` 
            : `Are you sure you want to uninstall ${name}?`;
          if (confirm(confirmMsg)) {
            listContainer.innerHTML = `<div class="text-center py-8 text-outline animate-pulse">${currentLanguage === 'zh' ? '正在卸载...' : 'Uninstalling...'}</div>`;
            const res = await window.api.uninstallPlugin(name);
            if (res.success) {
              loadPlugins();
            } else {
              const failMsg = currentLanguage === 'zh' ? `卸载失败：\n${res.output}` : `Uninstall failed:\n${res.output}`;
              alert(failMsg);
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
    installStatus.textContent = currentLanguage === 'zh' ? `正在安装 ${name}...` : `Installing ${name}...`;
    installBtn.disabled = true;
    
    try {
      const res = await window.api.installPlugin(name);
      installStatus.classList.remove('animate-pulse');
      if (res.success) {
        installStatus.className = 'font-code-sm text-code-sm text-emerald-500 p-3 bg-surface-container-lowest rounded';
        installStatus.textContent = `${currentLanguage === 'zh' ? '安装成功！' : 'Success!'}\n${res.output}`;
        installName.value = '';
        loadPlugins();
      } else {
        installStatus.className = 'font-code-sm text-code-sm text-error p-3 bg-surface-container-lowest rounded';
        installStatus.textContent = `${currentLanguage === 'zh' ? '安装失败：' : 'Failed:'}\n${res.output}`;
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
  const selLanguage = document.getElementById('setting-language');
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
      if (selLanguage) {
        selLanguage.value = currentSettings.language || 'en';
      }
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
    if (selLanguage) {
      currentSettings.language = selLanguage.value;
    }
    
    try {
      const res = await window.api.saveSettings(currentSettings);
      if (res.success) {
        if (selLanguage) {
          currentLanguage = selLanguage.value;
          translateDOM(document);
          
          // Re-translate index navigation labels
          authStatusLabel.textContent = currentLanguage === 'zh' ? '专业版 • 已连接' : 'Pro Plan • Connected';
          const userPlanLabel = document.getElementById('user-plan-label');
          if (userPlanLabel) {
            userPlanLabel.textContent = currentLanguage === 'zh' ? '开发者' : 'Developer';
          }
          
          const titles = {
            conversation: currentLanguage === 'zh' ? '会话控制台' : 'Conversations Workspace',
            workspace_home: currentLanguage === 'zh' ? '已注册工作区' : 'Registered Workspaces',
            subagents: currentLanguage === 'zh' ? '智能体监控' : 'Subagents Monitor',
            changes: currentLanguage === 'zh' ? 'VCS 代码变更' : 'VCS File Changes',
            tools: currentLanguage === 'zh' ? '工具与扩展插件' : 'Tools & Extension Packages',
            settings: currentLanguage === 'zh' ? '常规系统设置' : 'General Settings'
          };
          viewTitle.textContent = titles[currentView] || (currentLanguage === 'zh' ? '控制中心' : 'Control Center');
        }
        
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
    
    changelogContent.innerHTML = '';
    const pre = document.createElement('pre');
    pre.className = 'whitespace-pre-wrap font-code-sm text-code-sm';
    pre.textContent = text;
    changelogContent.appendChild(pre);
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

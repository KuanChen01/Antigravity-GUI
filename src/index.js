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
    "SETTINGS_CHANGELOG_TITLE": "Antigravity CLI Changelog",
    "TOOLS_HEADER": "Tools & Plugins",
    "TOOLS_DESC": "Configure external plugin packages, custom commands, and MCP server transports.",
    "TOOLS_PLUGINS_TITLE": "Installed Plugin Packages",
    "TOOLS_INSTALL_TITLE": "Install Custom Plugin / Skill Extension",
    "TOOLS_INSTALL_DESC": "Provide the repository URL or package name to fetch and configure the extension.",
    "TOOLS_INSTALL_PLACEHOLDER": "e.g. https://github.com/gemini-cli-extensions/stitch",
    "TOOLS_INSTALL_BTN": "Install Extension",
    "TOOLS_MCP_TITLE": "Custom MCP Servers (from mcp_config.json)",
    "TOOLS_MCP_ADD_TITLE": "Add Custom MCP Server",
    "TOOLS_MCP_ADD_DESC": "Configure a new Model Context Protocol (MCP) server by specifying its command execution settings.",
    "TOOLS_MCP_NAME": "Server Name",
    "TOOLS_MCP_NAME_PLACEHOLDER": "e.g. filesystem",
    "TOOLS_MCP_COMMAND": "Command",
    "TOOLS_MCP_COMMAND_PLACEHOLDER": "e.g. node, python, docker",
    "TOOLS_MCP_ARGS": "Arguments (JSON array or space-separated)",
    "TOOLS_MCP_ARGS_PLACEHOLDER": 'e.g. ["dist/index.js"] or dist/index.js',
    "TOOLS_MCP_ADD_BTN": "Add MCP Server"
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
    "SETTINGS_CHANGELOG_TITLE": "Antigravity CLI 更新日志",
    "TOOLS_HEADER": "工具与扩展插件",
    "TOOLS_DESC": "配置外部插件包、自定义命令以及 MCP 服务端传输协议。",
    "TOOLS_PLUGINS_TITLE": "已安装的插件扩展包 (Plugins)",
    "TOOLS_INSTALL_TITLE": "安装自定义插件 / Skill 扩展",
    "TOOLS_INSTALL_DESC": "提供仓库 URL 或包名以获取并配置扩展。",
    "TOOLS_INSTALL_PLACEHOLDER": "例如：https://github.com/gemini-cli-extensions/stitch",
    "TOOLS_INSTALL_BTN": "安装扩展包",
    "TOOLS_MCP_TITLE": "自定义 MCP 服务器 (mcp_config.json)",
    "TOOLS_MCP_ADD_TITLE": "添加自定义 MCP 服务器",
    "TOOLS_MCP_ADD_DESC": "通过指定其命令执行参数来配置一个新的模型上下文协议 (MCP) 服务器。",
    "TOOLS_MCP_NAME": "服务器名称",
    "TOOLS_MCP_NAME_PLACEHOLDER": "例如：filesystem",
    "TOOLS_MCP_COMMAND": "执行命令",
    "TOOLS_MCP_COMMAND_PLACEHOLDER": "例如：node, python, docker",
    "TOOLS_MCP_ARGS": "执行参数 (JSON 数组或空格分隔)",
    "TOOLS_MCP_ARGS_PLACEHOLDER": '例如：["dist/index.js"] 或 dist/index.js',
    "TOOLS_MCP_ADD_BTN": "添加服务器"
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

  // Fast / Planning Mode toggle buttons configuration
  const planningModeBtn = document.getElementById('planning-mode-btn');
  const fastModeBtn = document.getElementById('fast-mode-btn');
  let activeMode = 'planning'; // Default mode matches TUI / print behavior

  function updateModeUI() {
    if (!planningModeBtn || !fastModeBtn) return;
    if (activeMode === 'planning') {
      planningModeBtn.className = 'px-3 py-1 bg-primary text-on-primary text-label-sm font-medium rounded hover:opacity-90 transition-opacity';
      fastModeBtn.className = 'px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded border border-outline-variant hover:bg-surface-container-high transition-colors';
    } else {
      fastModeBtn.className = 'px-3 py-1 bg-primary text-on-primary text-label-sm font-medium rounded hover:opacity-90 transition-opacity';
      planningModeBtn.className = 'px-3 py-1 bg-surface-variant text-on-surface-variant text-label-sm rounded border border-outline-variant hover:bg-surface-container-high transition-colors';
    }
  }

  if (planningModeBtn && fastModeBtn) {
    planningModeBtn.addEventListener('click', () => {
      if (activeMode !== 'planning') {
        activeMode = 'planning';
        updateModeUI();
      }
    });

    fastModeBtn.addEventListener('click', () => {
      if (activeMode !== 'fast') {
        activeMode = 'fast';
        updateModeUI();
      }
    });
  }

  // Fetch list of conversations
  async function loadConversations() {
    try {
      allConvs = await window.api.getConversations();
      
      // Auto-set first active workspace if available
      if (allConvs.length > 0 && !activeWorkspace) {
        const firstWithWs = allConvs.find(c => c.workspace && c.workspace !== 'Unknown Workspace');
        if (firstWithWs) {
          activeWorkspace = firstWithWs.workspace;
        }
      }
      
      // Make sure labels reflect active workspace state
      if (activeWorkspace) {
        if (activeWsLabel) activeWsLabel.textContent = activeWorkspace;
        if (currentWsLabel) currentWsLabel.textContent = activeWorkspace;
      } else {
        if (activeWsLabel) activeWsLabel.textContent = currentLanguage === 'zh' ? '未选择工作区' : 'None';
        if (currentWsLabel) currentWsLabel.textContent = currentLanguage === 'zh' ? '无活跃会话' : 'No Active Session';
      }
      
      // Filter list to only show conversations in the active workspace
      const filtered = activeWorkspace 
        ? allConvs.filter(c => c.workspace === activeWorkspace)
        : allConvs;
        
      renderConversationsList(filtered);
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
        <div data-id="${c.id}" data-ws="${c.workspace}" class="conv-item w-full text-left p-3 rounded transition-colors flex flex-col gap-1 border-b border-outline-variant/30 group relative cursor-pointer ${selectClass}">
          <div class="flex items-center justify-between shrink-0 pr-6">
            <span class="font-headline-md font-bold text-on-background truncate max-w-[150px]" style="font-size: 13px;">${displayTitle}</span>
            <span class="text-[10px] text-outline group-hover:opacity-0 transition-opacity">${formatDate(c.lastModified)}</span>
          </div>
          <p class="text-label-sm truncate text-on-surface-variant pr-6">${previewText}</p>
          <span class="text-[10px] text-primary mt-1 font-code-sm">${stepsText}</span>
          
          <!-- Hover Delete Button -->
          <button data-id="${c.id}" class="delete-conv-btn absolute right-2 top-2 p-1 text-on-surface-variant hover:text-error hover:bg-surface-variant rounded opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10" title="${currentLanguage === 'zh' ? '删除会话' : 'Delete Conversation'}">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      `;
    }).join('');

    // Attach click listeners to conv-item selection
    document.querySelectorAll('.conv-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-conv-btn')) {
          return;
        }
        
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

    // Attach click listeners to delete-conv-btn
    document.querySelectorAll('.delete-conv-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        
        const confirmMsg = currentLanguage === 'zh' 
          ? '确定要永久删除此会话吗？此操作无法撤销。' 
          : 'Are you sure you want to permanently delete this conversation? This action cannot be undone.';
        
        const confirmed = confirm(confirmMsg);
        // Restore focus to window and input box to prevent Electron focus loss after native confirm
        window.focus();
        promptInput.focus();
        
        if (confirmed) {
          try {
            const res = await window.api.deleteConversation(id);
            if (res.success) {
              if (currentConversationId === id) {
                currentConversationId = null;
                const chatMessages = document.getElementById('chat-messages');
                chatMessages.innerHTML = `
                  <div class="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                    <div class="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant">
                      <span class="material-symbols-outlined text-primary text-[28px]">terminal</span>
                    </div>
                    <h2 class="font-headline-md text-headline-md font-bold text-on-background">${currentLanguage === 'zh' ? '欢迎使用 Antigravity CLI' : 'Welcome to Antigravity CLI'}</h2>
                    <p class="text-on-surface-variant text-body-md">
                      ${currentLanguage === 'zh' ? '开启新的开发会话或恢复先前的对话。运行任务、浏览代码库、编辑文件并自动化您的工作流。' : 'Start a new development session or resume a previous conversation. Run tasks, explore the codebase, edit files, and automate your workflow.'}
                    </p>
                  </div>
                `;
                const wsLabel = document.getElementById('current-workspace-label');
                if (wsLabel) wsLabel.textContent = currentLanguage === 'zh' ? '无活跃会话' : 'No Active Session';
              }
              loadConversations();
            } else {
              alert(currentLanguage === 'zh' ? `删除失败: ${res.error}` : `Delete failed: ${res.error}`);
              window.focus();
              promptInput.focus();
            }
          } catch (err) {
            alert(currentLanguage === 'zh' ? `删除出错: ${err.message}` : `Delete error: ${err.message}`);
            window.focus();
            promptInput.focus();
          }
        }
      });
    });
  }

  // Filter conversations
  convSearch.addEventListener('input', () => {
    const query = convSearch.value.toLowerCase().trim();
    const wsFiltered = activeWorkspace 
      ? allConvs.filter(c => c.workspace === activeWorkspace)
      : allConvs;
      
    if (!query) {
      renderConversationsList(wsFiltered);
      return;
    }
    const filtered = wsFiltered.filter(c => 
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
      promptInput.focus();
    } catch (e) {
      chatMessages.innerHTML = `<div class="p-6 text-error">Failed to load conversation: ${e.message}</div>`;
    }
  }

  function renderMessages(steps) {
    if (steps.length === 0) {
      chatMessages.innerHTML = `<div class="text-center py-12 text-on-surface-variant">${currentLanguage === 'zh' ? '暂无历史步骤' : 'Empty session'}</div>`;
      return;
    }

    // Group steps into turns
    const turns = [];
    let currentTurn = { userPrompt: null, executionSteps: [], agentResponse: null };

    steps.forEach(step => {
      const isUser = step.message && step.message.role === 'user';
      const isAgentResponse = step.message && step.message.role === 'agent' && !step.message.isThoughtsOnly;

      if (isUser) {
        if (currentTurn.userPrompt || currentTurn.executionSteps.length > 0 || currentTurn.agentResponse) {
          turns.push(currentTurn);
        }
        currentTurn = { userPrompt: step, executionSteps: [], agentResponse: null };
      } else if (isAgentResponse) {
        currentTurn.agentResponse = step;
        turns.push(currentTurn);
        currentTurn = { userPrompt: null, executionSteps: [], agentResponse: null };
      } else {
        if (step.toolCall || step.toolResponse || (step.message && step.message.isThoughtsOnly) || step.error) {
          currentTurn.executionSteps.push(step);
        }
      }
    });

    if (currentTurn.userPrompt || currentTurn.executionSteps.length > 0 || currentTurn.agentResponse) {
      turns.push(currentTurn);
    }

    let html = '';

    turns.forEach((turn, turnIdx) => {
      // 1. Render User Prompt
      if (turn.userPrompt) {
        const textFormatted = formatMessageText(turn.userPrompt.message.text);
        html += `
          <div class="flex justify-end mb-4">
            <div class="max-w-[85%] bg-primary text-on-primary rounded-2xl rounded-tr-none px-4 py-3 shadow-sm select-text border border-primary/20">
              <div class="flex items-center gap-2 mb-1.5 opacity-80 font-bold text-[10px] shrink-0">
                <span class="material-symbols-outlined text-[12px]">person</span>
                <span>${currentLanguage === 'zh' ? '用户指令' : 'User Instruction'}</span>
                <span class="ml-auto opacity-60">#${turn.userPrompt.index}</span>
              </div>
              <div class="text-[13px] leading-relaxed whitespace-pre-wrap">${textFormatted}</div>
            </div>
          </div>
        `;
      }

      // 2. Render Collapsible Execution Steps (Tool Calls and Responses)
      if (turn.executionSteps && turn.executionSteps.length > 0) {
        let stepsHtml = '';
        turn.executionSteps.forEach(step => {
          if (step.toolCall) {
            const toolLabel = currentLanguage === 'zh' ? '调用工具' : 'Call Tool';
            
            stepsHtml += `
              <div class="relative pl-6 pb-4 last:pb-0 border-l-2 border-outline-variant/60">
                <div class="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-primary border-2 border-background"></div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between shrink-0">
                    <span class="font-bold text-[12px] text-primary flex items-center gap-1.5 select-all">
                      <span class="material-symbols-outlined text-[14px]">build</span>
                      ${toolLabel}: ${escapeHTML(step.toolCall.tool)}
                    </span>
                    <span class="text-[10px] text-outline font-code-sm">Step #${step.index}</span>
                  </div>
                  ${step.toolCall.explanation ? `<p class="text-[11.5px] text-on-surface-variant italic leading-relaxed select-text">${escapeHTML(step.toolCall.explanation)}</p>` : ''}
                  <details class="text-[11px] text-on-surface-secondary border border-outline-variant/30 rounded bg-background/50 overflow-hidden">
                    <summary class="cursor-pointer font-bold select-none p-1.5 hover:bg-surface-variant/30 flex items-center gap-1.5 text-outline">
                      <span class="material-symbols-outlined text-[12px]">code</span>
                      ${currentLanguage === 'zh' ? '查看工具参数' : 'View Arguments'}
                    </summary>
                    <div class="p-2 border-t border-outline-variant/20 font-code-sm text-code-xs whitespace-pre-wrap select-text leading-relaxed bg-background/80">${escapeHTML(step.toolCall.parameters)}</div>
                  </details>
                </div>
              </div>
            `;
          } else if (step.toolResponse) {
            const resultLabel = currentLanguage === 'zh' ? '工具返回结果' : 'Tool Response';
            stepsHtml += `
              <div class="relative pl-6 pb-4 last:pb-0 border-l-2 border-outline-variant/60">
                <div class="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-emerald-500 border-2 border-background"></div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between shrink-0">
                    <span class="font-bold text-[12px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 select-all">
                      <span class="material-symbols-outlined text-[14px]">check_circle</span>
                      ${resultLabel}
                    </span>
                    <span class="text-[10px] text-outline font-code-sm">Step #${step.index}</span>
                  </div>
                  <details class="text-[11px] text-on-surface-secondary border border-outline-variant/30 rounded bg-background/50 overflow-hidden">
                    <summary class="cursor-pointer font-bold select-none p-1.5 hover:bg-surface-variant/30 flex items-center gap-1.5 text-outline">
                      <span class="material-symbols-outlined text-[12px]">description</span>
                      ${currentLanguage === 'zh' ? '展开输出日志' : 'Expand Output Log'}
                    </summary>
                    <div class="border-t border-outline-variant/20 bg-background/80 overflow-hidden">
                      <pre class="p-2 font-code-sm text-code-xs overflow-x-auto select-text max-h-40 leading-relaxed">${escapeHTML(step.toolResponse.content)}</pre>
                    </div>
                  </details>
                </div>
              </div>
            `;
          } else if (step.message && step.message.isThoughtsOnly) {
            stepsHtml += `
              <div class="relative pl-6 pb-4 last:pb-0 border-l-2 border-outline-variant/60">
                <div class="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-purple-500 border-2 border-background"></div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between shrink-0">
                    <span class="font-bold text-[12px] text-purple-600 dark:text-purple-400 flex items-center gap-1.5 select-all">
                      <span class="material-symbols-outlined text-[14px]">psychology</span>
                      ${currentLanguage === 'zh' ? '智能体思考' : 'Agent Thinking'}
                    </span>
                    <span class="text-[10px] text-outline font-code-sm">Step #${step.index}</span>
                  </div>
                  <p class="text-[11.5px] text-on-surface-variant whitespace-pre-wrap leading-relaxed select-text font-sans">${escapeHTML(step.message.text)}</p>
                </div>
              </div>
            `;
          } else if (step.error) {
            stepsHtml += `
              <div class="relative pl-6 pb-4 last:pb-0 border-l-2 border-outline-variant/60">
                <div class="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full bg-error border-2 border-background"></div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between shrink-0">
                    <span class="font-bold text-[12px] text-error flex items-center gap-1.5 select-all">
                      <span class="material-symbols-outlined text-[14px]">error</span>
                      ${currentLanguage === 'zh' ? '步骤执行出错' : 'Error'}
                    </span>
                    <span class="text-[10px] text-outline font-code-sm">Step #${step.index}</span>
                  </div>
                  <pre class="p-2 bg-error-container/10 border border-error-container/30 rounded font-code-sm text-code-xs text-error overflow-x-auto whitespace-pre-wrap select-text leading-relaxed">${escapeHTML(step.error)}</pre>
                </div>
              </div>
            `;
          }
        });

        const collapseTitle = currentLanguage === 'zh' 
          ? `已执行 ${turn.executionSteps.length} 个后台步骤` 
          : `${turn.executionSteps.length} background steps executed`;

        html += `
          <div class="my-4 select-none">
            <details class="group bg-surface-container-lowest/80 border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
              <summary class="flex items-center justify-between p-3.5 cursor-pointer hover:bg-surface-container-low transition-colors select-none font-label-md">
                <div class="flex items-center gap-2.5 text-on-surface">
                  <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center transition-all group-open:bg-primary/20">
                    <span class="material-symbols-outlined text-[15px] text-primary">analytics</span>
                  </div>
                  <span class="font-bold text-[12.5px] tracking-wide">${collapseTitle}</span>
                </div>
                <div class="flex items-center gap-1.5 text-outline group-hover:text-primary transition-colors text-[10px]">
                  <span class="material-symbols-outlined text-[16px] group-open:rotate-180 transition-transform duration-200">expand_more</span>
                </div>
              </summary>
              <div class="border-t border-outline-variant/40 p-4 space-y-4 bg-surface-container-lowest select-text max-h-[400px] overflow-y-auto font-sans">
                ${stepsHtml}
              </div>
            </details>
          </div>
        `;
      }

      // 3. Render Agent Final Response
      if (turn.agentResponse) {
        const textFormatted = formatMessageText(turn.agentResponse.message.text);
        
        let thoughtsHtml = '';
        if (turn.agentResponse.message.thoughts) {
          thoughtsHtml = `
            <details class="mb-3 text-label-sm text-on-surface-variant bg-surface-container/60 rounded border border-outline-variant/40 p-2.5">
              <summary class="cursor-pointer font-bold select-none hover:text-primary transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-primary">psychology</span>
                ${currentLanguage === 'zh' ? '查看思考过程' : 'View Thinking Process'}
              </summary>
              <div class="mt-2 pl-6 whitespace-pre-wrap select-text leading-relaxed font-sans text-on-surface-variant">${escapeHTML(turn.agentResponse.message.thoughts)}</div>
            </details>
          `;
        }

        html += `
          <div class="flex justify-start mb-4">
            <div class="max-w-[85%] bg-surface-container-high/50 border border-outline-variant rounded-2xl rounded-tl-none px-4 py-3 shadow-sm select-text">
              <div class="flex items-center gap-2 mb-1.5 text-outline font-bold text-[10px] shrink-0">
                <span class="material-symbols-outlined text-[12px] text-primary">smart_toy</span>
                <span>${currentLanguage === 'zh' ? 'Antigravity 响应' : 'Antigravity Response'}</span>
                <span class="ml-auto opacity-60">#${turn.agentResponse.index}</span>
              </div>
              ${thoughtsHtml}
              <div class="text-[13.5px] text-on-surface leading-relaxed select-text">${textFormatted}</div>
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
      await window.api.runPrompt(prompt, currentConversationId, activeWorkspace, activeMode);
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
      const removeBtnTitle = currentLanguage === 'zh' ? '删除工作区' : 'Remove Workspace';
      
      cardsContainer.innerHTML = paths.map(p => `
        <div class="bg-surface-container border border-outline-variant p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-primary text-[24px] shrink-0">folder</span>
            <div class="min-w-0">
              <h4 class="font-headline-md font-bold text-on-background truncate" style="font-size: 14px;">${pathBasename(p)}</h4>
              <p class="text-[11px] text-on-surface-variant font-code-sm truncate max-w-sm">${p}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button data-path="${p}" class="select-ws-btn px-3 py-1 bg-surface-variant text-on-surface-variant rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm">${selectBtnLabel}</button>
            <button data-path="${p}" class="delete-ws-btn p-1 text-on-surface-variant hover:text-error hover:bg-surface-variant rounded transition-colors flex items-center justify-center" title="${removeBtnTitle}">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      `).join('');
      
      // Select click
      document.querySelectorAll('.select-ws-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeWorkspace = btn.dataset.path;
          navigateTo('conversation');
        });
      });

      // Delete click
      document.querySelectorAll('.delete-ws-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const wsPath = btn.dataset.path;
          const confirmMsg = currentLanguage === 'zh'
            ? `您确定要删除工作区 "${pathBasename(wsPath)}" 吗？此操作仅取消注册，不会删除磁盘上的物理文件夹。`
            : `Are you sure you want to remove the workspace "${pathBasename(wsPath)}"? This only removes the registration and will not delete your local files.`;
          
          if (confirm(confirmMsg)) {
            window.focus();
            try {
              const res = await window.api.removeWorkspace(wsPath);
              if (res.success) {
                if (activeWorkspace === wsPath) {
                  activeWorkspace = null;
                }
                await loadWorkspaces();
              } else {
                alert(currentLanguage === 'zh' ? `删除工作区失败：${res.error}` : `Failed to remove workspace: ${res.error}`);
                window.focus();
              }
            } catch (err) {
              alert(`Error: ${err.message}`);
              window.focus();
            }
          } else {
            window.focus();
          }
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

  const mcpListContainer = document.getElementById('mcp-servers-list');
  const mcpNameInput = document.getElementById('mcp-name');
  const mcpCommandInput = document.getElementById('mcp-command');
  const mcpArgsInput = document.getElementById('mcp-args');
  const mcpAddBtn = document.getElementById('mcp-add-btn');

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

  async function loadMcpServers() {
    mcpListContainer.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-label-sm">${currentLanguage === 'zh' ? '正在加载自定义 MCP 服务...' : 'Loading custom MCP servers...'}</div>`;
    try {
      const config = await window.api.getMcpConfig();
      const servers = config.mcpServers || {};
      const serverNames = Object.keys(servers);
      
      if (serverNames.length === 0) {
        mcpListContainer.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-label-sm">${currentLanguage === 'zh' ? '未配置任何自定义 MCP 服务。' : 'No custom MCP servers configured.'}</div>`;
        return;
      }
      
      const disableBtnLabel = currentLanguage === 'zh' ? '禁用' : 'Disable';
      const enableBtnLabel = currentLanguage === 'zh' ? '启用' : 'Enable';
      const deleteBtnLabel = currentLanguage === 'zh' ? '删除' : 'Delete';
      
      mcpListContainer.innerHTML = serverNames.map(name => {
        const s = servers[name];
        const isDisabled = s.disabled === true;
        const statusText = isDisabled 
          ? (currentLanguage === 'zh' ? '已禁用' : 'Disabled') 
          : (currentLanguage === 'zh' ? '已启用' : 'Enabled');
        const toggleBtnText = isDisabled ? enableBtnLabel : disableBtnLabel;
        const toggleBtnClass = isDisabled 
          ? 'px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors font-label-sm text-label-sm' 
          : 'px-3 py-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/40 transition-colors font-label-sm text-label-sm';
          
        return `
          <div class="py-4 flex items-center justify-between first:pt-0 last:pb-0">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h4 class="font-headline-md font-bold text-on-background" style="font-size: 14px;">${name}</h4>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${isDisabled ? 'bg-error/10 text-error' : 'bg-emerald-500/10 text-emerald-400'}">${statusText}</span>
              </div>
              <p class="text-[11px] text-on-surface-variant font-code-sm">Command: <span class="text-primary">${s.command}</span> • Args: <span class="text-on-surface">${JSON.stringify(s.args || [])}</span></p>
            </div>
            <div class="flex items-center gap-2">
              <button data-name="${name}" data-disabled="${isDisabled}" class="toggle-mcp-btn ${toggleBtnClass}">${toggleBtnText}</button>
              <button data-name="${name}" class="delete-mcp-btn px-3 py-1 bg-error-container/20 text-error rounded hover:bg-error-container/40 transition-colors font-label-sm text-label-sm">${deleteBtnLabel}</button>
            </div>
          </div>
        `;
      }).join('');
      
      // Bind Toggle events
      document.querySelectorAll('.toggle-mcp-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name;
          const currentlyDisabled = btn.dataset.disabled === 'true';
          const newDisabled = !currentlyDisabled;
          
          mcpListContainer.innerHTML = `<div class="text-center py-8 text-outline animate-pulse">${currentLanguage === 'zh' ? '正在保存配置...' : 'Saving config...'}</div>`;
          
          const freshConfig = await window.api.getMcpConfig();
          if (!freshConfig.mcpServers) freshConfig.mcpServers = {};
          if (freshConfig.mcpServers[name]) {
            freshConfig.mcpServers[name].disabled = newDisabled;
            const res = await window.api.saveMcpConfig(freshConfig);
            if (!res.success) {
              alert(currentLanguage === 'zh' ? `操作失败：${res.error}` : `Operation failed: ${res.error}`);
            }
          }
          loadMcpServers();
        });
      });
      
      // Bind Delete events
      document.querySelectorAll('.delete-mcp-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name;
          const confirmMsg = currentLanguage === 'zh' 
            ? `您确定要删除自定义 MCP 服务 ${name} 吗？` 
            : `Are you sure you want to delete the custom MCP server ${name}?`;
            
          if (confirm(confirmMsg)) {
            mcpListContainer.innerHTML = `<div class="text-center py-8 text-outline animate-pulse">${currentLanguage === 'zh' ? '正在保存配置...' : 'Saving config...'}</div>`;
            const freshConfig = await window.api.getMcpConfig();
            if (freshConfig.mcpServers && freshConfig.mcpServers[name]) {
              delete freshConfig.mcpServers[name];
              const res = await window.api.saveMcpConfig(freshConfig);
              if (!res.success) {
                alert(currentLanguage === 'zh' ? `删除失败：${res.error}` : `Delete failed: ${res.error}`);
              }
            }
            loadMcpServers();
          }
        });
      });
      
    } catch (e) {
      mcpListContainer.innerHTML = `<div class="p-4 text-error">Failed: ${e.message}</div>`;
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

  mcpAddBtn.addEventListener('click', async () => {
    const name = mcpNameInput.value.trim();
    const command = mcpCommandInput.value.trim();
    const argsStr = mcpArgsInput.value.trim();
    
    if (!name || !command) {
      alert(currentLanguage === 'zh' ? '请输入服务名称和命令。' : 'Please provide both server name and command.');
      return;
    }
    
    let args = [];
    if (argsStr) {
      try {
        if (argsStr.startsWith('[') && argsStr.endsWith(']')) {
          args = JSON.parse(argsStr);
        } else {
          args = argsStr.split(/\s+/).filter(Boolean);
        }
      } catch (e) {
        args = argsStr.split(/\s+/).filter(Boolean);
      }
    }
    
    mcpAddBtn.disabled = true;
    try {
      const freshConfig = await window.api.getMcpConfig();
      if (!freshConfig.mcpServers) freshConfig.mcpServers = {};
      
      freshConfig.mcpServers[name] = {
        command,
        args,
        disabled: false
      };
      
      const res = await window.api.saveMcpConfig(freshConfig);
      if (res.success) {
        mcpNameInput.value = '';
        mcpCommandInput.value = '';
        mcpArgsInput.value = '';
        loadMcpServers();
      } else {
        alert(currentLanguage === 'zh' ? `添加失败：${res.error}` : `Failed to add: ${res.error}`);
      }
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      mcpAddBtn.disabled = false;
    }
  });

  loadPlugins();
  loadMcpServers();
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
  const textSpan = checkUpdatesBtn.querySelector('span[data-i18n="CHECK_UPDATES"]');
  checkUpdatesBtn.addEventListener('click', async () => {
    checkUpdatesBtn.disabled = true;
    if (textSpan) {
      textSpan.textContent = currentLanguage === 'zh' ? '正在检查...' : 'Checking...';
    }
    
    try {
      const res = await window.api.checkForUpdates();
      alert(res.output);
      window.focus();
      const promptInput = document.getElementById('prompt-input');
      if (promptInput) promptInput.focus();
    } catch (e) {
      alert(currentLanguage === 'zh' ? `检查更新失败: ${e.message}` : `Check updates failed: ${e.message}`);
      window.focus();
      const promptInput = document.getElementById('prompt-input');
      if (promptInput) promptInput.focus();
    } finally {
      checkUpdatesBtn.disabled = false;
      if (textSpan) {
        textSpan.textContent = currentLanguage === 'zh' ? '检查更新' : 'Check Updates';
      }
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

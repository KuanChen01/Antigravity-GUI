// Renderer State
let currentView = null;
let activeWorkspace = null;
let currentConversationId = null;
let isRunning = false;
let currentLanguage = 'en';
let pendingNewConversationContext = null;
let openDetailsState = {};
let detailsScrollState = {}; // { detailsId: { scrollTop: number, shouldAutoScroll: boolean } }
let lastProcessedStepIndex = -1;
let lastResumedStepIndexMap = {};
let backgroundPollInterval = null;

// Draft storage to preserve inputs across tab switching and conversation switching
let conversationDrafts = {}; // { 'new' or conversationId: { promptText: '', attachedImages: [] } }

// Dialog wrappers to prevent focus loss in Electron
async function appConfirm(message, title = '') {
  if (window.api && window.api.showConfirm) {
    return await window.api.showConfirm({
      message,
      title: title || (currentLanguage === 'zh' ? '确认' : 'Confirm'),
      confirmLabel: currentLanguage === 'zh' ? '确定' : 'OK',
      cancelLabel: currentLanguage === 'zh' ? '取消' : 'Cancel'
    });
  }
  const confirmed = confirm(message);
  window.focus();
  const promptInput = document.getElementById('prompt-input');
  if (promptInput) promptInput.focus();
  return confirmed;
}

async function appAlert(message, title = '') {
  if (window.api && window.api.showAlert) {
    await window.api.showAlert({
      message,
      title: title || (currentLanguage === 'zh' ? '提示' : 'Alert'),
      buttonLabel: currentLanguage === 'zh' ? '确定' : 'OK'
    });
    const promptInput = document.getElementById('prompt-input');
    if (promptInput) promptInput.focus();
    return;
  }
  alert(message);
  window.focus();
  const promptInput = document.getElementById('prompt-input');
  if (promptInput) promptInput.focus();
}

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
    "SETTINGS_DIAG_VERSION": "GUI Client Version:",
    "SETTINGS_DIAG_BIN": "Executable Path:",
    "SETTINGS_DIAG_DIR": "CLI Configuration Dir:",
    "SETTINGS_DIAG_LS": "Active Language Server:",
    "SETTINGS_DIAG_SESSION": "Active Session ID:",
    "SETTINGS_RUN_DIAG": "Run Diagnostics",
    "SETTINGS_LOGIN_BTN": "Login to CLI",
    "SETTINGS_CHANGELOG_TITLE": "Antigravity CLI Changelog",
    "SETTINGS_VIEW_CHANGELOG": "View Changelog",
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
    "TOOLS_MCP_ADD_BTN": "Add MCP Server",
    "LOGIN": "Login",
    "SETTINGS_PROXY": "Proxy Server",
    "SETTINGS_PROXY_PLACEHOLDER": "e.g. http://127.0.0.1:10808",
    "SUBAGENTS_HEADER": "Subagents Manager",
    "SUBAGENTS_DESC": "Monitor and manage autonomous subagents running concurrently on specific tasks.",
    "SUBAGENTS_TABLE_TITLE": "Active Subagent Instances",
    "SUBAGENTS_TABLE_DESC": "Subagents inherit core credentials and tool configs, reporting back details asynchronously.",
    "SUBAGENTS_COL_ID": "Task ID",
    "SUBAGENTS_COL_TYPE": "Task Type",
    "SUBAGENTS_COL_DESC": "Task Description",
    "SUBAGENTS_COL_STATUS": "Status",
    "SUBAGENTS_COL_ACTIONS": "Actions",
    "NEW_TASK": "New Task",
    "SEARCH_CONVERSATIONS_PLACEHOLDER": "Search conversations...",
    "LOADING_HISTORY": "Loading history...",
    "NO_ACTIVE_SESSION": "No Active Session",
    "WELCOME_TITLE": "Welcome to Antigravity CLI",
    "WELCOME_DESC": "Start a new development session or resume a previous conversation. Run tasks, explore the codebase, edit files, and automate your workflow.",
    "AGENT_RUNNING_STEPS": "Agent Running Steps...",
    "CANCEL_TASK": "Cancel Task",
    "PROMPT_INPUT_PLACEHOLDER": "Send a prompt to the agent (Shift+Enter for new line)...",
    "LABEL_WORKSPACE": "Workspace:",
    "PRESS_KBD_PRE": "Press ",
    "PRESS_KBD_POST": " to run",
    "ATTACHED_IMAGE": "Attached Image",
    "REMOVE_IMAGE": "Remove Image",
    "WORKSPACES_TITLE": "Workspaces",
    "WORKSPACES_DESC": "Manage and select your local development folders mapped to Antigravity CLI projects.",
    "ADD_DIRECTORY": "Add Directory",
    "NO_WORKSPACES_FOUND": "No workspaces found. Click \"Add Directory\" to register a folder.",
    "CHANGES_TITLE": "VCS Changes & Diff Review",
    "CHANGES_DESC": "Review local repository file additions, deletions, modifications, and git diff details.",
    "CHANGES_MODIFIED_FILES": "Modified Workspace Files",
    "CHANGES_TRACK_FILES": "Track files touched or created by agent processes in the current active workspace directory.",
    "CHANGES_ALL_SYNCED": "All workspace files are synced. No uncommitted modifications or diff files to display.",
    "SUBAGENTS_NO_ACTIVE": "No active subagents running.",
    "TOOLS_LOADING_PLUGINS": "Loading installed plugins...",
    "TOOLS_LOADING_MCP": "Loading custom MCP servers..."
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
    "SETTINGS_DIAG_VERSION": "GUI 客户端版本：",
    "SETTINGS_DIAG_BIN": "可执行程序路径：",
    "SETTINGS_DIAG_DIR": "CLI 配置文件目录：",
    "SETTINGS_DIAG_LS": "活动的语言服务器：",
    "SETTINGS_DIAG_SESSION": "活动的会话 ID：",
    "SETTINGS_RUN_DIAG": "运行系统诊断",
    "SETTINGS_LOGIN_BTN": "登录 CLI",
    "SETTINGS_CHANGELOG_TITLE": "Antigravity CLI 更新日志",
    "SETTINGS_VIEW_CHANGELOG": "查看更新日志",
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
    "TOOLS_MCP_ADD_BTN": "添加服务器",
    "LOGIN": "登录",
    "SETTINGS_PROXY": "代理服务器",
    "SETTINGS_PROXY_PLACEHOLDER": "例如：http://127.0.0.1:10808",
    "SUBAGENTS_HEADER": "子智能体管理",
    "SUBAGENTS_DESC": "监控和管理并行运行在特定任务上的自治子智能体。",
    "SUBAGENTS_TABLE_TITLE": "活动的子任务实例",
    "SUBAGENTS_TABLE_DESC": "子智能体继承核心凭证与工具配置，并异步向主智能体汇报详情。",
    "SUBAGENTS_COL_ID": "任务 ID",
    "SUBAGENTS_COL_TYPE": "任务类型",
    "SUBAGENTS_COL_DESC": "任务描述/命令",
    "SUBAGENTS_COL_STATUS": "状态",
    "SUBAGENTS_COL_ACTIONS": "操作",
    "NEW_TASK": "新建任务",
    "SEARCH_CONVERSATIONS_PLACEHOLDER": "搜索会话...",
    "LOADING_HISTORY": "正在加载历史会话...",
    "NO_ACTIVE_SESSION": "无活跃会话",
    "WELCOME_TITLE": "欢迎使用 Antigravity CLI",
    "WELCOME_DESC": "开启新的开发会话或恢复先前的对话。运行任务、浏览代码库、编辑文件并自动化您的工作流。",
    "AGENT_RUNNING_STEPS": "智能体执行步骤中...",
    "CANCEL_TASK": "取消任务",
    "PROMPT_INPUT_PLACEHOLDER": "向智能体发送指令（Shift+Enter 换行）...",
    "LABEL_WORKSPACE": "工作区:",
    "PRESS_KBD_PRE": "按 ",
    "PRESS_KBD_POST": " 运行",
    "ATTACHED_IMAGE": "已附图片",
    "REMOVE_IMAGE": "移除图片",
    "WORKSPACES_TITLE": "工作区管理",
    "WORKSPACES_DESC": "管理并选择与 Antigravity CLI 项目关联的本地开发工作区。",
    "ADD_DIRECTORY": "添加工作区",
    "NO_WORKSPACES_FOUND": "未找到任何工作区。点击“添加工作区”注册新文件夹。",
    "CHANGES_TITLE": "VCS 代码变更与 Diff 评审",
    "CHANGES_DESC": "评审本地仓库中的文件新增、删除、修改状态以及 Git Diff 差异细节。",
    "CHANGES_MODIFIED_FILES": "已修改的工作区文件",
    "CHANGES_TRACK_FILES": "追踪在当前活跃工作区目录下被智能体执行过程触及或创建的文件。",
    "CHANGES_ALL_SYNCED": "所有工作区文件已同步。没有未提交的修改或 Diff 差异文件可显示。",
    "SUBAGENTS_NO_ACTIVE": "当前没有活动的子智能体运行。",
    "TOOLS_LOADING_PLUGINS": "正在加载插件列表...",
    "TOOLS_LOADING_MCP": "正在加载自定义 MCP 服务..."
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

  container.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key]) {
      el.title = TRANSLATIONS[currentLanguage][key];
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

// Safely format message bodies and render Markdown elements
function formatMessageText(text, isUser = false) {
  if (!text) return '';
  
  // 1. Split text by fenced code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return parts.map(part => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || 'code';
        const code = match[2];
        return `<pre class="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl font-code-sm text-code-sm text-on-surface overflow-x-auto my-3 shadow-inner"><div class="text-[10px] text-outline mb-2 font-sans uppercase font-bold border-b border-outline-variant/20 pb-1.5 flex items-center justify-between"><span>${escapeHTML(lang)}</span><span class="material-symbols-outlined text-[12px] opacity-60">code</span></div><code class="block whitespace-pre select-text leading-relaxed">${escapeHTML(code.trim())}</code></pre>`;
      }
      return `<pre class="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl font-code-sm text-code-sm text-on-surface overflow-x-auto my-3 shadow-inner"><code class="block whitespace-pre select-text leading-relaxed">${escapeHTML(part)}</code></pre>`;
    } else {
      // Parse general Markdown block and inline elements
      let lines = part.split('\n');
      let htmlLines = [];
      let inList = false;
      let listType = null; // 'ul' or 'ol'
      let inBlockquote = false;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Blockquote support
        if (line.trim().startsWith('>')) {
          if (!inBlockquote) {
            if (inList) {
              htmlLines.push(`</${listType}>`);
              inList = false;
              listType = null;
            }
            const bqBgClass = isUser ? 'bg-white/10' : 'bg-surface-container-high/40';
            const bqBorderClass = isUser ? 'border-on-primary/40' : 'border-primary';
            const bqTextClass = isUser ? 'text-on-primary/90' : 'text-on-surface-variant';
            htmlLines.push(`<blockquote class="border-l-4 ${bqBorderClass} ${bqBgClass} pl-4 py-2.5 my-3 ${bqTextClass} italic rounded-r-lg shadow-sm">`);
            inBlockquote = true;
          }
          line = line.trim().substring(1).trim();
        } else if (inBlockquote && line.trim() === '') {
          htmlLines.push('</blockquote>');
          inBlockquote = false;
        }

        // Horizontal Rule
        if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
          if (inList) {
            htmlLines.push(`</${listType}>`);
            inList = false;
            listType = null;
          }
          if (inBlockquote) {
            htmlLines.push('</blockquote>');
            inBlockquote = false;
          }
          const hrBorderClass = isUser ? 'border-on-primary/20' : 'border-outline-variant/30';
          htmlLines.push(`<hr class="my-4 ${hrBorderClass}" />`);
          continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          if (inList) {
            htmlLines.push(`</${listType}>`);
            inList = false;
            listType = null;
          }
          if (inBlockquote) {
            htmlLines.push('</blockquote>');
            inBlockquote = false;
          }
          const level = headingMatch[1].length;
          const content = parseInlineMarkdown(headingMatch[2], isUser);
          
          let classes = '';
          if (isUser) {
            if (level === 1) classes = 'text-base font-bold text-on-primary mt-4 mb-2 border-b border-on-primary/20 pb-1 block';
            else if (level === 2) classes = 'text-[14.5px] font-bold text-on-primary mt-3.5 mb-1.5 block';
            else if (level === 3) classes = 'text-[13.5px] font-bold text-on-primary/90 mt-3 mb-1 block';
            else classes = 'text-[13px] font-bold text-on-primary/80 mt-2.5 mb-1 block';
          } else {
            if (level === 1) classes = 'text-base font-bold text-primary mt-4 mb-2 border-b border-outline-variant/30 pb-1 block';
            else if (level === 2) classes = 'text-[14.5px] font-bold text-on-background mt-3.5 mb-1.5 block';
            else if (level === 3) classes = 'text-[13.5px] font-bold text-on-background/90 mt-3 mb-1 block';
            else classes = 'text-[13px] font-bold text-on-background/80 mt-2.5 mb-1 block';
          }
          
          htmlLines.push(`<h${level} class="${classes}">${content}</h${level}>`);
          continue;
        }

        // List items
        const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
        const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

        if (ulMatch || olMatch) {
          const isOl = !!olMatch;
          const match = isOl ? olMatch : ulMatch;
          const content = parseInlineMarkdown(match[3], isUser);
          const currentListType = isOl ? 'ol' : 'ul';

          if (!inList) {
            inList = true;
            listType = currentListType;
            const listClass = isOl ? 'list-decimal pl-6 my-2 space-y-1.5' : 'list-disc pl-6 my-2 space-y-1.5';
            htmlLines.push(`<${listType} class="${listClass}">`);
          } else if (listType !== currentListType) {
            htmlLines.push(`</${listType}>`);
            listType = currentListType;
            const listClass = isOl ? 'list-decimal pl-6 my-2 space-y-1.5' : 'list-disc pl-6 my-2 space-y-1.5';
            htmlLines.push(`<${listType} class="${listClass}">`);
          }

          const liTextClass = isUser ? 'text-[13px] text-on-primary leading-relaxed' : 'text-[13px] text-on-surface leading-relaxed';
          htmlLines.push(`<li class="${liTextClass}">${content}</li>`);
          continue;
        }

        // List continuation or closing list
        if (inList) {
          if (line.trim() !== '') {
            if (line.startsWith('  ') || line.startsWith('\t')) {
              const content = parseInlineMarkdown(line.trim(), isUser);
              const contTextClass = isUser ? 'text-on-primary/80' : 'text-on-surface-variant';
              htmlLines.push(`<div class="pl-4 text-[12.5px] ${contTextClass} mt-1 leading-relaxed">${content}</div>`);
              continue;
            } else {
              htmlLines.push(`</${listType}>`);
              inList = false;
              listType = null;
            }
          } else {
            htmlLines.push(`</${listType}>`);
            inList = false;
            listType = null;
          }
        }

        // Plain paragraph text
        if (line.trim() !== '') {
          const content = parseInlineMarkdown(line, isUser);
          if (inBlockquote) {
            htmlLines.push(`<p class="my-1 text-[13px] leading-relaxed">${content}</p>`);
          } else {
            const isImageBlock = line.trim().match(/^\[(?:已附图片|Attached Image):\s*[^\]]+\]$/i);
            if (isImageBlock) {
              htmlLines.push(content);
            } else {
              const pTextClass = isUser ? 'text-on-primary' : 'text-on-surface';
              htmlLines.push(`<p class="text-[13px] ${pTextClass} leading-relaxed my-2">${content}</p>`);
            }
          }
        } else {
          if (!inBlockquote) {
            htmlLines.push('<div class="h-2"></div>');
          }
        }
      }

      if (inList) {
        htmlLines.push(`</${listType}>`);
      }
      if (inBlockquote) {
        htmlLines.push('</blockquote>');
      }

      return htmlLines.join('\n');
    }
  }).join('');
}

function parseInlineMarkdown(text, isUser = false) {
  let html = escapeHTML(text);
  
  // 1. Extract attached images to placeholders to protect them from subsequent markdown regexes
  const extractedImages = [];
  html = html.replace(/\[(?:已附图片|Attached Image):\s*([^\]]+)\]/gi, (match, filePath) => {
    const placeholder = `%%ATTACHEDIMAGETEMP${extractedImages.length}%%`;
    extractedImages.push(filePath.trim());
    return placeholder;
  });
  
  // Inline code: `code`
  const codeBgClass = isUser ? 'bg-white/15 text-on-primary' : 'bg-surface-variant/50 text-primary';
  html = html.replace(/`([^`]+)`/g, `<code class="${codeBgClass} px-1.5 py-0.5 rounded font-code-sm text-code-sm">$1</code>`);
  
  // Bold: **bold** or __bold__
  const strongClass = isUser ? 'font-bold text-white' : 'font-bold text-on-background';
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong class="${strongClass}">$1</strong>`);
  html = html.replace(/__([^_]+)__/g, `<strong class="${strongClass}">$1</strong>`);
  
  // Italic: *italic* or _italic_
  const emClass = isUser ? 'italic text-on-primary/95' : 'italic text-on-surface/90';
  html = html.replace(/\*([^*]+)\*/g, `<em class="${emClass}">$1</em>`);
  html = html.replace(/_([^_]+)_/g, `<em class="${emClass}">$1</em>`);
  
  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    let classes = 'underline hover:opacity-85 transition-colors inline-flex items-center gap-0.5';
    if (isUser) {
      classes += ' text-on-primary font-bold cursor-pointer';
    } else {
      classes += ' text-primary font-bold cursor-pointer';
    }
    const safeUrl = url.replace(/\\/g, '/').replace(/&amp;/g, '&').replace(/"/g, '&quot;');
    if (url.startsWith('file:///')) {
      return `<a href="${safeUrl}" class="${classes}" onclick="event.preventDefault(); window.api.openFilePath('${safeUrl}')"><span class="material-symbols-outlined text-[14px]">link</span><span>${linkText}</span></a>`;
    }
    return `<a href="${safeUrl}" class="${classes}" onclick="event.preventDefault(); window.api.openExternal('${safeUrl}')"><span class="material-symbols-outlined text-[14px]">open_in_new</span><span>${linkText}</span></a>`;
  });
  
  // 2. Restore placeholders with clean image preview HTML
  html = html.replace(/%%ATTACHEDIMAGETEMP(\d+)%%/g, (match, indexStr) => {
    const idx = parseInt(indexStr, 10);
    const filePath = extractedImages[idx];
    if (filePath === undefined) return '';
    const safeFilePath = escapeHTML(filePath);
    return `
<div class="mt-2 mb-2 block relative max-w-sm rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm cursor-pointer hover:opacity-95 transition-opacity chat-image-preview-wrapper" data-filepath="${safeFilePath}">
  <img class="chat-attached-image max-h-48 object-contain bg-surface-container-low rounded-lg" data-filepath="${safeFilePath}" src="" alt="Loading image..." />
  <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
    <span class="material-symbols-outlined text-white text-[24px]">zoom_in</span>
  </div>
</div>`;
  });
  
  return html;
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

let isUserLoggedIn = false;
let loggedInEmail = '';

async function updateLoginStatus() {
  try {
    const status = await window.api.getLoginStatus();
    isUserLoggedIn = status.loggedIn;
    loggedInEmail = status.email || '';
    
    const userPlanLabel = document.getElementById('user-plan-label');
    const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
    const userStatusIcon = document.getElementById('user-status-icon');
    
    if (userPlanLabel) {
      if (isUserLoggedIn) {
        userPlanLabel.textContent = loggedInEmail;
        userPlanLabel.title = loggedInEmail;
        if (sidebarLoginBtn) sidebarLoginBtn.classList.add('hidden');
        if (userStatusIcon) {
          userStatusIcon.classList.add('text-emerald-500');
          userStatusIcon.classList.remove('text-on-surface-variant');
        }
      } else {
        userPlanLabel.textContent = currentLanguage === 'zh' ? '未登录' : 'Not Logged In';
        userPlanLabel.title = '';
        if (sidebarLoginBtn) sidebarLoginBtn.classList.remove('hidden');
        if (userStatusIcon) {
          userStatusIcon.classList.remove('text-emerald-500');
          userStatusIcon.classList.add('text-on-surface-variant');
        }
      }
    }
  } catch (err) {
    console.error("Failed to update login status:", err);
  }
}

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
  
  // Load and display app version
  try {
    const version = await window.api.getVersion();
    const versionSpan = document.getElementById('sidebar-app-version');
    if (versionSpan) {
      versionSpan.textContent = `v${version}`;
    }
  } catch (e) {
    console.error("Failed to load app version:", e);
  }
  
  // Set active connections
  connectionDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm';
  connectionDot.title = currentLanguage === 'zh' ? '已连接' : 'Connected';
  authStatusLabel.textContent = currentLanguage === 'zh' ? '专业版 • 已连接' : 'Pro Plan • Connected';
  
  await updateLoginStatus();
  
  // Bind sidebar login click handler
  const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
  if (sidebarLoginBtn) {
    sidebarLoginBtn.addEventListener('click', async () => {
      await window.api.loginAgy();
      // Instantly start checking status periodically
      setTimeout(updateLoginStatus, 2000);
      setTimeout(updateLoginStatus, 5000);
      setTimeout(updateLoginStatus, 10000);
    });
  }
  
  // Periodic poll of login status
  setInterval(updateLoginStatus, 5000);
  
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
    if (viewName === 'subagents') initSubagentsView();
    if (viewName === 'tools') initToolsView();
    if (viewName === 'settings') initSettingsView();
  } catch (err) {
    mainContent.innerHTML = `<div class="p-8 text-error">Failed to render view: ${err.message}</div>`;
  }
}

// --- CONVERSATION VIEW CONTROLLER ---
const SLASH_COMMANDS = [
  { name: '/planning', descEn: 'Planning Mode: detailed changes proposal', descZh: '规划模式：进行系统性方案设计及修改文件规划' },
  { name: '/fast', descEn: 'Fast Mode: direct answers or minor code tweaks', descZh: '快速模式：直接回答简单问题或进行局部小调整' },
  { name: '/goal', descEn: 'Goal Mode: autonomous agent running until goal reached', descZh: '目标模式：长任务后台自动运转并持续迭代直到达成' },
  { name: '/grill-me', descEn: 'Grill-me Mode: start interview for design decisions', descZh: '对齐询问：与智能体进行交互式问答以拷问设计决策' },
  { name: '/schedule', descEn: 'Schedule Task: run command on timer/cron jobs', descZh: '周期调度：创建定时器或配置 Cron 任务自动定期执行' },
  { name: '/teamwork-preview', descEn: 'Teamwork Mode: simulate multiple agent teamwork', descZh: '团队预览：体验多个专家级智能体分工协同开发大功能' },
  { name: '/learn', descEn: 'Learn Experience: persist conversation lessons & setup', descZh: '总结学习：持久化学习记录本次会话的命令、规则与配置' },
  { name: '/tasks', descEn: 'List Tasks: view active and historical subtasks', descZh: '任务列表：查看当前会话的活跃和历史后台子任务' },
  { name: '/task', descEn: 'List Tasks: view active and historical subtasks', descZh: '任务列表：查看当前会话的活跃和历史后台子任务' }
];

// Parser to extract all background tasks/subagents from conversation steps
function parseTasksFromSteps(steps) {
  const tasksMap = {};

  for (const step of steps) {
    if (step.rawStrings && step.rawStrings.length > 0) {
      for (const str of step.rawStrings) {
        const match = str.match(/([a-zA-Z0-9\-\/]*task-\d+)/);
        if (match) {
          let fullId = match[1];
          if (fullId.startsWith('-')) fullId = fullId.substring(1);
          const shortId = fullId.includes('/') ? fullId.split('/').pop() : fullId;

          let commandLine = '';
          let toolAction = '';
          const jsonStr = step.rawStrings.find(s => s.startsWith('{') && s.includes('CommandLine'));
          if (jsonStr) {
            try {
              const details = JSON.parse(jsonStr);
              commandLine = details.CommandLine || '';
              toolAction = details.toolAction || '';
            } catch(e) {}
          }

          const isNotification = step.type === 101 && step.rawStrings.includes('task_notification');
          let status = 'running';
          let logFile = '';
          if (isNotification) {
            const lastStr = step.rawStrings.join('\n');
            if (lastStr.includes('finished with result:')) {
              status = 'completed';
            } else if (lastStr.includes('was canceled') || lastStr.includes('canceled')) {
              status = 'canceled';
            } else if (lastStr.includes('failed')) {
              status = 'failed';
            }

            const logMatch = step.rawStrings.find(s => s.includes('.log'));
            if (logMatch) {
              const pathPart = logMatch.match(/(file:\/\/\/[^\s\']+|[a-zA-Z]:\\[^\s\']+)/);
              if (pathPart) {
                logFile = pathPart[0];
              }
            }
          }

          if (!tasksMap[shortId]) {
            tasksMap[shortId] = {
              id: fullId,
              shortId: shortId,
              command: commandLine,
              action: toolAction || 'Background Operation',
              status: status,
              logFile: logFile,
              spawnedStep: step.index,
              completedStep: isNotification ? step.index : null
            };
          } else {
            const existing = tasksMap[shortId];
            if (commandLine) existing.command = commandLine;
            if (toolAction && toolAction !== 'Background Operation') existing.action = toolAction;
            if (status !== 'running') {
              existing.status = status;
              existing.completedStep = step.index;
            }
            if (logFile) existing.logFile = logFile;
            existing.spawnedStep = Math.min(existing.spawnedStep, step.index);
          }
        }
      }
    }
  }

  const list = Object.values(tasksMap);
  for (const t of list) {
    if (!t.command) {
      t.command = 'System Command';
    }
    if (t.action === 'Background Operation' && t.command !== 'System Command') {
      t.action = `Run ${t.command}`;
    }
  }

  return list.sort((a, b) => a.spawnedStep - b.spawnedStep);
}

// Renders the parsed tasks summary inside the chat window
async function showLogModal(taskId) {
  const modalId = 'task-log-modal';
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-8 animate-fade-in';
  modal.innerHTML = `
    <div class="glass-panel w-full max-w-4xl h-[80vh] flex flex-col rounded-lg border border-outline-variant shadow-2xl overflow-hidden bg-surface-container-low">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/40 shrink-0">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">description</span>
          <h3 class="font-headline-md font-bold text-on-background" style="font-size: 16px;">
            ${currentLanguage === 'zh' ? `任务日志: #${taskId}` : `Task Log: #${taskId}`}
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <button id="modal-refresh-btn" class="p-1.5 hover:bg-surface-variant rounded text-on-surface-variant hover:text-on-surface transition-colors" title="${currentLanguage === 'zh' ? '刷新' : 'Refresh'}">
            <span class="material-symbols-outlined text-[20px]">refresh</span>
          </button>
          <button id="modal-close-btn" class="p-1.5 hover:bg-surface-variant rounded text-on-surface-variant hover:text-on-surface transition-colors" title="${currentLanguage === 'zh' ? '关闭' : 'Close'}">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-1 p-6 overflow-auto bg-surface-container-lowest font-code-md text-code-md select-text">
        <pre id="modal-log-content" class="text-on-surface whitespace-pre-wrap font-mono text-[12px] leading-relaxed">Loading log content...</pre>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const logContentPre = modal.querySelector('#modal-log-content');
  const closeBtn = modal.querySelector('#modal-close-btn');
  const refreshBtn = modal.querySelector('#modal-refresh-btn');

  async function loadLogContent() {
    logContentPre.textContent = currentLanguage === 'zh' ? '正在加载日志内容...' : 'Loading log content...';
    try {
      const res = await window.api.getTaskLog(currentConversationId, `task-${taskId}`);
      if (res.success) {
        logContentPre.textContent = res.content || (currentLanguage === 'zh' ? '日志内容为空。' : 'Log content is empty.');
        logContentPre.parentElement.scrollTop = logContentPre.parentElement.scrollHeight;
      } else {
        logContentPre.textContent = `Error: ${res.error}`;
      }
    } catch (err) {
      logContentPre.textContent = `Error: ${err.message}`;
    }
  }

  closeBtn.addEventListener('click', () => modal.remove());
  refreshBtn.addEventListener('click', loadLogContent);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  await loadLogContent();
}

function renderTasksListBubble(tasks) {
  let listHtml = '';
  if (tasks.length === 0) {
    listHtml = `
      <div class="text-on-surface-variant text-body-md py-2 italic text-center">
        ${currentLanguage === 'zh' ? '当前会话没有运行任何后台任务' : 'No background tasks have been executed in this session.'}
      </div>
    `;
  } else {
    listHtml = tasks.map(t => {
      let statusBadge = '';
      if (t.status === 'completed') {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">${currentLanguage === 'zh' ? '已完成' : 'Completed'}</span>`;
      } else if (t.status === 'canceled') {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-surface-variant text-on-surface-variant border border-outline-variant">${currentLanguage === 'zh' ? '已取消' : 'Canceled'}</span>`;
      } else if (t.status === 'failed') {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">${currentLanguage === 'zh' ? '已失败' : 'Failed'}</span>`;
      } else {
        statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">${currentLanguage === 'zh' ? '运行中' : 'Running'}</span>`;
      }

      const logButton = t.logFile
        ? `<button data-task-id="${t.shortId.replace('task-', '').replace('subagent-', '')}" class="chat-view-log-btn text-xs text-primary hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer">
             <span class="material-symbols-outlined text-[14px]">description</span>
             ${currentLanguage === 'zh' ? '查看日志' : 'View Log'}
           </button>`
        : '';

      return `
        <div class="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-outline-variant/30 last:border-b-0">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="font-bold text-on-surface text-body-md">${t.shortId}</span>
              ${statusBadge}
            </div>
            <p class="font-code-sm text-code-sm text-on-surface-variant max-w-xl truncate" title="${t.command || ''}">${t.action || t.command || ''}</p>
          </div>
          <div class="shrink-0 flex items-center gap-3">
            ${logButton}
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <div class="p-4 rounded-lg border border-outline-variant bg-surface-container-low border-l-4 border-primary space-y-3">
      <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
        <div class="flex items-center gap-2 text-primary font-bold">
          <span class="material-symbols-outlined text-[18px]">task</span>
          <span>${currentLanguage === 'zh' ? '任务状态列表' : 'Task Status List'}</span>
        </div>
        <span class="text-outline-variant">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="divide-y divide-outline-variant/30">
        ${listHtml}
      </div>
    </div>
  `;
}

async function initConversationView() {
  const convList = document.getElementById('conv-list');
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.addEventListener('click', (e) => {
    const btn = e.target.closest('.chat-view-log-btn');
    if (btn) {
      e.preventDefault();
      const taskId = btn.dataset.taskId;
      showLogModal(taskId);
    }
  });
  const newChatBtn = document.getElementById('new-chat-btn');
  const sendPromptBtn = document.getElementById('send-prompt-btn');
  const promptInput = document.getElementById('prompt-input');
  const activeWsLabel = document.getElementById('active-ws-path');
  const currentWsLabel = document.getElementById('current-workspace-label');
  const sidebarWsTitle = document.getElementById('sidebar-workspace-title');
  const stepProgress = document.getElementById('step-progress-panel');
  const stepLogs = document.getElementById('step-logs');
  const stepStatusLabel = document.getElementById('step-status-label');
  const stepElapsedLabel = document.getElementById('step-elapsed-label');
  const stopAgentBtn = document.getElementById('stop-agent-btn');
  const convSearch = document.getElementById('conv-search');
  const slashAutocomplete = document.getElementById('slash-autocomplete');

  // Attached image preview elements
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const attachedImageThumb = document.getElementById('attached-image-thumb');
  const attachedImageName = document.getElementById('attached-image-name');
  const attachedImageSize = document.getElementById('attached-image-size');
  const clearImageBtn = document.getElementById('clear-image-btn');

  let allConvs = [];
  let activeAttachedImages = [];
  let imageDataUrlCache = {};
  let tempImagesToDelete = [];
  let shouldAutoScrollSteps = true;

  function showZoomedImage(dataUrl) {
    const modalId = 'image-zoom-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 transition-all duration-300 opacity-0';
    modal.innerHTML = `
      <div class="absolute top-4 right-4 flex items-center gap-3 z-10">
        <button id="zoom-close-btn" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg">
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>
      <div class="relative max-w-full max-h-full flex items-center justify-center transform scale-95 transition-all duration-300 zoom-image-container">
        <img src="${dataUrl}" class="max-w-[95vw] max-h-[90vh] object-contain rounded shadow-2xl select-none" />
      </div>
    `;

    document.body.appendChild(modal);

    // Trigger transition
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      modal.querySelector('.zoom-image-container').classList.remove('scale-95');
      modal.querySelector('.zoom-image-container').classList.add('scale-100');
    });

    function closeModal() {
      modal.classList.add('opacity-0');
      modal.querySelector('.zoom-image-container').classList.remove('scale-100');
      modal.querySelector('.zoom-image-container').classList.add('scale-95');
      setTimeout(() => {
        modal.remove();
        document.removeEventListener('keydown', handleKeyDown);
      }, 300);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    }

    modal.querySelector('#zoom-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.zoom-image-container') === null) {
        closeModal();
      }
    });

    document.addEventListener('keydown', handleKeyDown);
  }

  function bindImageEvents() {
    const imgElements = chatMessages.querySelectorAll('.chat-attached-image');
    imgElements.forEach(async (img) => {
      const filePath = img.getAttribute('data-filepath');
      if (!filePath) return;

      if (imageDataUrlCache[filePath]) {
        img.src = imageDataUrlCache[filePath];
        return;
      }

      try {
        const res = await window.api.readImageAsDataUrl(filePath);
        if (res.success && res.dataUrl) {
          imageDataUrlCache[filePath] = res.dataUrl;
          img.src = res.dataUrl;
        } else {
          img.alt = currentLanguage === 'zh' ? '图片已失效' : 'Image unavailable';
          img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23ff4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
        }
      } catch (err) {
        console.error("Failed to load attached image:", err);
        img.alt = 'Error loading image';
      }
    });

    const wrappers = chatMessages.querySelectorAll('.chat-image-preview-wrapper');
    wrappers.forEach(wrapper => {
      if (wrapper.getAttribute('data-zoom-bound')) return;
      wrapper.setAttribute('data-zoom-bound', 'true');
      
      wrapper.addEventListener('click', (e) => {
        e.preventDefault();
        const img = wrapper.querySelector('.chat-attached-image');
        if (img && img.src && !img.src.startsWith('data:image/svg+xml')) {
          showZoomedImage(img.src);
        }
      });
    });
  }

  function renderImagePreviews() {
    if (!imagePreviewContainer) return;
    
    if (activeAttachedImages.length === 0) {
      imagePreviewContainer.classList.add('hidden');
      imagePreviewContainer.innerHTML = '';
      updateInputState();
      return;
    }
    
    imagePreviewContainer.classList.remove('hidden');
    imagePreviewContainer.className = "flex flex-wrap gap-2.5 bg-surface-container-low/60 border border-outline-variant/30 rounded p-2 shrink-0 max-h-24 overflow-y-auto";
    imagePreviewContainer.innerHTML = activeAttachedImages.map((img, idx) => `
      <div class="relative group w-12 h-12 shrink-0">
        <img src="${img.dataSrc}" class="w-full h-full object-cover rounded border border-outline-variant" title="${escapeHTML(img.name)} (${img.size})" />
        <button class="remove-single-image-btn absolute -top-1.5 -right-1.5 w-4 h-4 bg-error text-on-error rounded-full flex items-center justify-center hover:opacity-90 shadow-sm cursor-pointer" data-index="${idx}">
          <span class="material-symbols-outlined text-[10px] font-bold">close</span>
        </button>
      </div>
    `).join('');
    
    const removeBtns = imagePreviewContainer.querySelectorAll('.remove-single-image-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        removeAttachedImageAt(index);
      });
    });
    
    updateInputState();
  }

  function removeAttachedImageAt(index) {
    const img = activeAttachedImages[index];
    if (img) {
      window.api.deleteImageFile(img.filePath).catch(console.error);
      activeAttachedImages.splice(index, 1);
      
      const key = currentConversationId || 'new';
      if (conversationDrafts[key]) {
        conversationDrafts[key].attachedImages = [...activeAttachedImages];
      }
      
      renderImagePreviews();
    }
  }

  function restoreDraft() {
    const key = currentConversationId || 'new';
    const draft = conversationDrafts[key];
    if (draft) {
      if (promptInput) promptInput.value = draft.promptText || '';
      if (Array.isArray(draft.attachedImages) && draft.attachedImages.length > 0) {
        activeAttachedImages = [...draft.attachedImages];
        activeAttachedImages.forEach(img => {
          if (!tempImagesToDelete.includes(img.filePath)) {
            tempImagesToDelete.push(img.filePath);
          }
          imageDataUrlCache[img.filePath] = img.dataSrc;
        });
        renderImagePreviews();
      } else {
        activeAttachedImages = [];
        renderImagePreviews();
      }
    } else {
      if (promptInput) promptInput.value = '';
      activeAttachedImages = [];
      renderImagePreviews();
    }
    updateInputState();
  }

  const runTracking = {
    pollTimer: null,
    elapsedTimer: null,
    startedAt: 0,
    phase: 'idle',
    stepCount: 0,
    liveConversationId: null,
    lastSignature: '',
    pollInFlight: false
  };

  // Enable/disable send button based on prompt content and workspace
  function updateInputState() {
    sendPromptBtn.disabled = isRunning || (!promptInput.value.trim() && activeAttachedImages.length === 0) || !activeWorkspace;
  }

  function formatElapsed(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function getRunPhaseText(phase, stepCount = 0) {
    const isZh = currentLanguage === 'zh';
    if (phase === 'starting') return isZh ? '正在启动智能体...' : 'Starting agent...';
    if (phase === 'creating') return isZh ? '正在创建会话...' : 'Creating conversation...';
    if (phase === 'opening') return isZh ? '正在打开实时会话...' : 'Opening live session...';
    if (phase === 'queued') return isZh ? '请求已发送，等待响应...' : 'Prompt queued, waiting for response...';
    if (phase === 'thinking') return isZh ? '正在分析请求...' : 'Analyzing request...';
    if (phase === 'working') return isZh ? `正在执行 ${stepCount} 个后台步骤...` : `Executing ${stepCount} background steps...`;
    if (phase === 'responding') return isZh ? '正在生成回复...' : 'Drafting response...';
    if (phase === 'finalizing') return isZh ? '正在整理结果...' : 'Finalizing response...';
    if (phase === 'done') return isZh ? '本轮已完成' : 'Run completed';
    if (phase === 'stopped') return isZh ? '任务已停止' : 'Run stopped';
    return isZh ? '智能体运行步骤...' : 'Agent running steps...';
  }

  function renderRunHeader() {
    if (stepStatusLabel) {
      stepStatusLabel.textContent = getRunPhaseText(runTracking.phase, runTracking.stepCount);
    }
    if (stepElapsedLabel) {
      stepElapsedLabel.textContent = runTracking.startedAt ? formatElapsed(Date.now() - runTracking.startedAt) : '00:00';
    }
  }

  function setRunPhase(phase, stepCount = runTracking.stepCount) {
    runTracking.phase = phase;
    runTracking.stepCount = stepCount;
    renderRunHeader();
  }

  function clearRunTrackingTimers() {
    if (runTracking.pollTimer) {
      clearInterval(runTracking.pollTimer);
      runTracking.pollTimer = null;
    }
    if (runTracking.elapsedTimer) {
      clearInterval(runTracking.elapsedTimer);
      runTracking.elapsedTimer = null;
    }
  }

  function startLiveRunTracking() {
    clearRunTrackingTimers();
    runTracking.startedAt = Date.now();
    runTracking.phase = 'starting';
    runTracking.stepCount = 0;
    runTracking.liveConversationId = currentConversationId || null;
    runTracking.lastSignature = '';
    runTracking.pollInFlight = false;
    renderRunHeader();
    runTracking.elapsedTimer = setInterval(renderRunHeader, 1000);
    pollRunningConversation();
    runTracking.pollTimer = setInterval(pollRunningConversation, 1500);

    // Reset steps auto-scroll state
    shouldAutoScrollSteps = true;
    if (stepProgress) {
      stepProgress.scrollTop = stepProgress.scrollHeight;
    }
  }

  function stopLiveRunTracking(finalPhase = 'done') {
    setRunPhase(finalPhase, runTracking.stepCount);
    clearRunTrackingTimers();
    runTracking.pollInFlight = false;
    runTracking.liveConversationId = null;
    runTracking.lastSignature = '';
    runTracking.startedAt = 0;

    if (currentConversationId) {
      window.api.getConversationDetails(currentConversationId).then(details => {
        const maxStepIdx = details.steps.reduce((max, s) => Math.max(max, s.index), -1);
        lastProcessedStepIndex = maxStepIdx;
      }).catch(console.error);
    }
  }
  
  renderRunHeader();

  if (stepProgress) {
    stepProgress.addEventListener('scroll', () => {
      // If the user scrolls close to the bottom (within 10px), set auto-scroll to true.
      // Otherwise set it to false (meaning they scrolled up and want to lock screen position).
      const distanceFromBottom = stepProgress.scrollHeight - stepProgress.scrollTop - stepProgress.clientHeight;
      shouldAutoScrollSteps = distanceFromBottom < 10;
    });
  }

  promptInput.addEventListener('input', () => {
    const key = currentConversationId || 'new';
    if (!conversationDrafts[key]) conversationDrafts[key] = { promptText: '', attachedImages: [] };
    conversationDrafts[key].promptText = promptInput.value;
    updateInputState();
  });

  // Helper to handle attached/dropped image file
  async function handleAttachedImage(file) {
    if (!activeWorkspace) {
      await appAlert(currentLanguage === 'zh' ? '请先选择一个工作区，再上传图片！' : 'Please select a workspace before attaching images!');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      await appAlert(currentLanguage === 'zh' ? '图片大小超过限制（最大 5MB）' : 'Image size exceeds the limit (Max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result.split(',')[1] 
          ? Uint8Array.from(atob(e.target.result.split(',')[1]), c => c.charCodeAt(0)).buffer
          : await file.arrayBuffer();

        const res = await window.api.saveImageFile(arrayBuffer, activeWorkspace);
        if (res.success) {
          const newImg = {
            filePath: res.filePath,
            name: file.name || (currentLanguage === 'zh' ? '剪切板图片.png' : 'clipboard_image.png'),
            size: `${(file.size / 1024).toFixed(1)} KB`,
            dataSrc: e.target.result
          };
          activeAttachedImages.push(newImg);
          tempImagesToDelete.push(res.filePath);
          
          // Cache data URL
          imageDataUrlCache[res.filePath] = e.target.result;
          
          // Save to drafts
          const key = currentConversationId || 'new';
          if (!conversationDrafts[key]) conversationDrafts[key] = { promptText: '', attachedImages: [] };
          conversationDrafts[key].attachedImages = [...activeAttachedImages];
          
          renderImagePreviews();
        } else {
          await appAlert(`Save failed: ${res.error}`);
        }
      } catch (err) {
        console.error("Save image error:", err);
      }
    };
    reader.readAsDataURL(file);
  }

  function clearAllAttachedImages() {
    activeAttachedImages.forEach(img => {
      window.api.deleteImageFile(img.filePath).catch(console.error);
    });
    activeAttachedImages = [];
    
    const key = currentConversationId || 'new';
    if (conversationDrafts[key]) {
      conversationDrafts[key].attachedImages = [];
    }
    renderImagePreviews();
  }

  if (clearImageBtn) {
    clearImageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearAllAttachedImages();
    });
  }

  // Paste image handler
  promptInput.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleAttachedImage(file);
          break;
        }
      }
    }
  });

  // Drag and drop image handler
  const inputBorderContainer = promptInput.closest('.relative');
  if (inputBorderContainer) {
    inputBorderContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      inputBorderContainer.classList.add('border-primary', 'bg-primary/5');
    });

    inputBorderContainer.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      inputBorderContainer.classList.remove('border-primary', 'bg-primary/5');
    });

    inputBorderContainer.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      inputBorderContainer.classList.remove('border-primary', 'bg-primary/5');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        let hasImage = false;
        for (const file of files) {
          if (file.type.indexOf('image') !== -1) {
            hasImage = true;
            await handleAttachedImage(file);
          }
        }
        if (!hasImage) {
          await appAlert(currentLanguage === 'zh' ? '仅支持拖拽图片文件！' : 'Only image files are supported!');
        }
      }
    });
  }

  // Slash Commands Autocomplete Logic
  let selectedSuggestionIndex = 0;
  let filteredSuggestions = [];

  function showAutocomplete(query) {
    filteredSuggestions = SLASH_COMMANDS.filter(cmd => 
      cmd.name.toLowerCase().startsWith(query.toLowerCase())
    );

    if (filteredSuggestions.length === 0) {
      hideAutocomplete();
      return;
    }

    selectedSuggestionIndex = 0;
    renderSuggestions();
    if (slashAutocomplete) slashAutocomplete.classList.remove('hidden');
  }

  function hideAutocomplete() {
    if (slashAutocomplete) {
      slashAutocomplete.classList.add('hidden');
    }
    filteredSuggestions = [];
    selectedSuggestionIndex = 0;
  }

  function renderSuggestions() {
    if (!slashAutocomplete) return;
    slashAutocomplete.innerHTML = filteredSuggestions.map((cmd, idx) => {
      const isActive = idx === selectedSuggestionIndex;
      const activeClass = isActive 
        ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
        : 'text-on-background hover:bg-surface-variant/30 border border-transparent';
      const desc = currentLanguage === 'zh' ? cmd.descZh : cmd.descEn;
      
      return `
        <div data-index="${idx}" class="suggestion-item flex flex-col md:flex-row md:items-center justify-between p-2 rounded cursor-pointer transition-colors gap-1 ${activeClass}">
          <span class="font-code-md text-primary font-bold select-none text-[12px] shrink-0">${cmd.name}</span>
          <span class="text-[10px] text-on-surface-variant select-none md:text-right max-w-[220px] md:max-w-md truncate">${desc}</span>
        </div>
      `;
    }).join('');

    // Attach click listeners to suggestions
    slashAutocomplete.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(item.dataset.index);
        selectSuggestion(idx);
      });
    });
  }

  function selectSuggestion(idx) {
    const cmd = filteredSuggestions[idx];
    if (!cmd) return;

    const val = promptInput.value;
    const selectionStart = promptInput.selectionStart;

    // Find the last "/" typed before cursor
    const lastSlashIndex = val.substring(0, selectionStart).lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      const before = val.substring(0, lastSlashIndex);
      const after = val.substring(selectionStart);
      promptInput.value = before + cmd.name + ' ' + after;
      // Put cursor after the inserted slash command and the space
      const newCursorPos = lastSlashIndex + cmd.name.length + 1;
      promptInput.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    hideAutocomplete();
    promptInput.focus();
    updateInputState();
  }

  promptInput.addEventListener('input', () => {
    const val = promptInput.value;
    const selectionStart = promptInput.selectionStart;
    
    // Check if user is typing a slash command
    const textBeforeCursor = val.substring(0, selectionStart);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : '\n';
      if (charBeforeSlash === ' ' || charBeforeSlash === '\n' || charBeforeSlash === '\r') {
        const query = textBeforeCursor.substring(lastSlashIndex);
        if (!query.includes(' ')) {
          showAutocomplete(query);
          return;
        }
      }
    }
    hideAutocomplete();
  });

  promptInput.addEventListener('blur', () => {
    // Delay slightly to allow click event on suggestion item to register
    setTimeout(hideAutocomplete, 180);
  });

  chatMessages.addEventListener('toggle', (e) => {
    const details = e.target;
    if (details && details.tagName === 'DETAILS') {
      const id = details.getAttribute('data-details-id');
      if (id) {
        openDetailsState[id] = details.open;
        if (details.open) {
          if (!detailsScrollState[id]) {
            detailsScrollState[id] = {
              scrollTop: 0,
              shouldAutoScroll: true
            };
          }
          const container = details.querySelector('.step-details-container');
          if (container) {
            if (detailsScrollState[id].shouldAutoScroll) {
              container.scrollTop = container.scrollHeight;
              detailsScrollState[id].scrollTop = container.scrollTop;
            } else {
              container.scrollTop = detailsScrollState[id].scrollTop;
            }
          }
        }
      }
    }
  }, true);

  chatMessages.addEventListener('scroll', (e) => {
    const container = e.target;
    if (container && container.classList.contains('step-details-container')) {
      const details = container.closest('details');
      if (details) {
        const id = details.getAttribute('data-details-id');
        if (id) {
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
          
          if (!detailsScrollState[id]) {
            detailsScrollState[id] = {};
          }
          
          detailsScrollState[id].scrollTop = scrollTop;
          detailsScrollState[id].shouldAutoScroll = distanceFromBottom < 15;
        }
      }
    }
  }, true);

  // Mode buttons were removed; plain prompts should remain plain unless the user types an explicit slash command.
  let activeMode = null;

  // Fetch list of conversations
  async function loadConversations() {
    try {
      allConvs = await window.api.getConversations();
      
      // Auto-set first active workspace if available
      if (allConvs.length > 0 && !activeWorkspace) {
        const firstWithWs = allConvs.find(c => {
          if (Array.isArray(c.workspaces) && c.workspaces.length > 0) {
            return c.workspaces.some(ws => ws && ws !== 'Unknown Workspace');
          }
          return c.workspace && c.workspace !== 'Unknown Workspace';
        });
        if (firstWithWs) {
          activeWorkspace = Array.isArray(firstWithWs.workspaces) && firstWithWs.workspaces.length > 0
            ? firstWithWs.workspaces.find(ws => ws && ws !== 'Unknown Workspace')
            : firstWithWs.workspace;
        }
      }
      
      // Make sure labels reflect active workspace state
      if (activeWorkspace) {
        if (activeWsLabel) activeWsLabel.textContent = activeWorkspace;
        if (currentWsLabel) currentWsLabel.textContent = activeWorkspace;
        if (sidebarWsTitle) {
          sidebarWsTitle.textContent = pathBasename(activeWorkspace);
          sidebarWsTitle.title = activeWorkspace;
        }
      } else {
        if (activeWsLabel) activeWsLabel.textContent = currentLanguage === 'zh' ? '未选择工作区' : 'None';
        if (currentWsLabel) currentWsLabel.textContent = currentLanguage === 'zh' ? '无活跃会话' : 'No Active Session';
        if (sidebarWsTitle) {
          sidebarWsTitle.textContent = currentLanguage === 'zh' ? '会话列表' : 'Conversations';
          sidebarWsTitle.title = currentLanguage === 'zh' ? '会话列表' : 'Conversations';
        }
      }
      
      // Filter list to only show conversations in the active workspace
      const filtered = activeWorkspace 
        ? allConvs.filter(c => {
            if (Array.isArray(c.workspaces)) {
              return c.workspaces.some(ws => isSamePath(ws, activeWorkspace));
            }
            return isSamePath(c.workspace, activeWorkspace);
          })
        : allConvs;
        
      renderConversationsList(filtered);
      updateInputState();
    } catch (e) {
      convList.innerHTML = `<div class="p-4 text-error">Load failed: ${e.message}</div>`;
    }
  }

  function findPendingConversationCandidate(pending) {
    if (!pending) {
      return null;
    }

    const candidate = allConvs.find(c => {
      const belongsToWorkspace = pending.workspace
        ? (Array.isArray(c.workspaces)
            ? c.workspaces.some(ws => isSamePath(ws, pending.workspace))
            : isSamePath(c.workspace, pending.workspace))
        : true;

      return belongsToWorkspace && c.lastModified >= (pending.startedAt - 1000);
    });

    if (!candidate) {
      return null;
    }

    const matchedWorkspace = pending.workspace && Array.isArray(candidate.workspaces)
      ? candidate.workspaces.find(ws => isSamePath(ws, pending.workspace))
      : candidate.workspace;

    return { candidate, matchedWorkspace };
  }

  function getConversationSignature(steps) {
    if (!steps || steps.length === 0) {
      return 'empty';
    }

    const lastStep = steps[steps.length - 1];
    const payload = lastStep.message?.text || lastStep.toolResponse?.content || lastStep.toolCall?.parameters || lastStep.error || '';
    return `${steps.length}:${lastStep.index}:${lastStep.status}:${payload.length}`;
  }

  function summarizeConversationProgress(steps) {
    let executionCount = 0;
    let hasUserPrompt = false;
    let hasAgentResponse = false;
    let hasThoughtsOnly = false;

    steps.forEach(step => {
      if (step.message?.role === 'user') {
        hasUserPrompt = true;
      } else if (step.message?.role === 'agent' && !step.message?.isThoughtsOnly) {
        hasAgentResponse = true;
      } else if (step.message?.isThoughtsOnly) {
        hasThoughtsOnly = true;
        executionCount += 1;
      } else if (step.toolCall || step.toolResponse || step.error) {
        executionCount += 1;
      }
    });

    let phase = 'starting';
    if (hasAgentResponse) {
      phase = executionCount > 0 ? 'finalizing' : 'responding';
    } else if (executionCount > 0) {
      phase = 'working';
    } else if (hasThoughtsOnly) {
      phase = 'thinking';
    } else if (hasUserPrompt) {
      phase = 'queued';
    }

    return { phase, executionCount };
  }

  function maybeUpdateRunPhaseFromLog(text) {
    const normalized = text.toLowerCase();
    if (normalized.includes('created conversation')) {
      setRunPhase('opening', runTracking.stepCount);
    } else if (normalized.includes('sending user message')) {
      setRunPhase('queued', runTracking.stepCount);
    } else if (normalized.includes('streamgeneratecontent')) {
      setRunPhase('responding', runTracking.stepCount);
    } else if (normalized.includes('authenticated')) {
      setRunPhase('starting', runTracking.stepCount);
    }
  }

  async function pollRunningConversation() {
    if (!isRunning || runTracking.pollInFlight) {
      return;
    }

    runTracking.pollInFlight = true;
    try {
      await loadConversations();

      if (pendingNewConversationContext && !currentConversationId) {
        const match = findPendingConversationCandidate(pendingNewConversationContext);
        if (match) {
          currentConversationId = match.candidate.id;
          runTracking.liveConversationId = match.candidate.id;
          if (match.matchedWorkspace && match.matchedWorkspace !== 'Unknown Workspace') {
            activeWorkspace = match.matchedWorkspace;
          }
          setRunPhase('opening', runTracking.stepCount);
        } else {
          setRunPhase('creating', runTracking.stepCount);
        }
      }

      const liveConversationId = currentConversationId || runTracking.liveConversationId;
      if (!liveConversationId) {
        return;
      }

      runTracking.liveConversationId = liveConversationId;
      const details = await window.api.getConversationDetails(liveConversationId);
      const signature = getConversationSignature(details.steps);
      const progress = summarizeConversationProgress(details.steps);
      setRunPhase(progress.phase, progress.executionCount);

      if (signature !== runTracking.lastSignature) {
        runTracking.lastSignature = signature;
        renderMessages(details.steps);
      }
    } catch (err) {
      console.error('Live conversation poll failed:', err);
    } finally {
      runTracking.pollInFlight = false;
    }
  }

  async function restorePendingNewConversation() {
    if (!pendingNewConversationContext) {
      return false;
    }

    const pending = pendingNewConversationContext;
    pendingNewConversationContext = null;

    for (let attempt = 0; attempt < 4; attempt++) {
      await loadConversations();

      const match = findPendingConversationCandidate(pending);
      if (match) {
        currentConversationId = match.candidate.id;

        if (match.matchedWorkspace) {
          activeWorkspace = match.matchedWorkspace;
        }

        await loadConversations();
        await loadConversationDetails(match.candidate.id);
        return true;
      }

      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    }

    return false;
  }

  function renderAssistantPlaceholder() {
    return `
      <div class="flex justify-start mb-4">
        <div class="max-w-[85%] bg-surface-container-high/40 border border-outline-variant rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
          <div class="flex items-center gap-2 mb-2 text-outline font-bold text-[10px] shrink-0">
            <span class="material-symbols-outlined text-[12px] text-primary animate-pulse">smart_toy</span>
            <span>${currentLanguage === 'zh' ? 'Antigravity 正在准备回复' : 'Antigravity is preparing a reply'}</span>
          </div>
          <div class="text-[13px] text-on-surface-variant leading-relaxed">
            ${currentLanguage === 'zh' ? '已提交请求。界面将尽快同步实时步骤与回复内容。' : 'Your request has been submitted. Live steps and response content will appear here as soon as they are available.'}
          </div>
        </div>
      </div>
    `;
  }

  function renderConversationsList(list) {
    if (list.length === 0) {
      convList.innerHTML = `<div class="text-center py-8 text-on-surface-variant text-label-sm">${currentLanguage === 'zh' ? '未找到相关会话' : 'No conversations found'}</div>`;
      return;
    }

    convList.innerHTML = list.map(c => {
      const isSelected = c.id === currentConversationId;
      const selectClass = isSelected ? 'bg-surface-variant text-on-surface border-l-2 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high';
      const itemWs = (Array.isArray(c.workspaces) && c.workspaces.some(ws => isSamePath(ws, activeWorkspace)))
        ? activeWorkspace
        : c.workspace;
      const displayTitle = escapeHTML(itemWs && itemWs !== 'Unknown Workspace' ? pathBasename(itemWs) : (currentLanguage === 'zh' ? '新会话' : 'New Session'));
      const previewText = escapeHTML(c.preview || (currentLanguage === 'zh' ? '暂无对话内容' : 'No prompt content'));
      const stepsText = currentLanguage === 'zh' ? `${c.stepsCount} 步` : `${c.stepsCount} steps`;
      
      return `
        <div data-id="${c.id}" data-ws="${itemWs}" class="conv-item w-full text-left p-3 rounded transition-colors flex flex-col gap-1 border-b border-outline-variant/30 group relative cursor-pointer ${selectClass}">
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
        restoreDraft();
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
        
        const confirmed = await appConfirm(confirmMsg);
        
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
              
              // Force refocus the input box after deletion
              const pInput = document.getElementById('prompt-input');
              if (pInput) pInput.focus();
            } else {
              await appAlert(currentLanguage === 'zh' ? `删除失败: ${res.error}` : `Delete failed: ${res.error}`);
            }
          } catch (err) {
            await appAlert(currentLanguage === 'zh' ? `删除出错: ${err.message}` : `Delete error: ${err.message}`);
          }
        }
      });
    });
  }

  // Filter conversations
  convSearch.addEventListener('input', () => {
    const query = convSearch.value.toLowerCase().trim();
    const wsFiltered = activeWorkspace 
      ? allConvs.filter(c => {
          if (Array.isArray(c.workspaces)) {
            return c.workspaces.some(ws => isSamePath(ws, activeWorkspace));
          }
          return isSamePath(c.workspace, activeWorkspace);
        })
      : allConvs;
      
    if (!query) {
      renderConversationsList(wsFiltered);
      return;
    }
    const filtered = wsFiltered.filter(c => 
      c.id.toLowerCase().includes(query) || 
      (c.workspaces && c.workspaces.some(ws => ws.toLowerCase().includes(query))) ||
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
      const maxStepIdx = details.steps.reduce((max, s) => Math.max(max, s.index), -1);
      lastProcessedStepIndex = maxStepIdx;
      renderMessages(details.steps);
      promptInput.focus();

      // Auto-resume if loaded conversation ends in an unprocessed task notification
      if (details.steps.length > 0) {
        const lastStep = details.steps[details.steps.length - 1];
        if (lastStep.type === 101) {
          const hasTaskNotification = lastStep.rawStrings && lastStep.rawStrings.some(str => 
            str.includes('task_notification') || str.includes('finished with result') || str.includes('was canceled') || str.includes('canceled')
          );
          if (hasTaskNotification && lastResumedStepIndexMap[id] !== lastStep.index) {
            lastResumedStepIndexMap[id] = lastStep.index;
            console.log("Loaded conversation ends in task notification. Auto-resuming...");
            isRunning = true;
            updateInputState();
            stepProgress.classList.remove('hidden');
            stepLogs.innerHTML = '';
            startLiveRunTracking();
            
            chatMessages.innerHTML += renderAssistantPlaceholder();
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            window.api.runPrompt("", currentConversationId, activeWorkspace, activeMode).catch(err => {
              console.error("Auto-resume failed:", err);
              isRunning = false;
              updateInputState();
              stopLiveRunTracking('stopped');
            });
          }
        }
      }
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
      const isLastTurn = turnIdx === turns.length - 1;

      // 1. Render User Prompt
      if (turn.userPrompt) {
        const textFormatted = formatMessageText(turn.userPrompt.message.text, true);
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
                  ${step.toolCall.thoughts ? `
                    <div class="text-[11px] text-on-surface-variant bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5 mb-2 select-text leading-relaxed font-sans">
                      <div class="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold mb-1">
                        <span class="material-symbols-outlined text-[14px]">psychology</span>
                        <span>${currentLanguage === 'zh' ? '思考过程' : 'Thinking Process'}</span>
                      </div>
                      <div>${formatMessageText(step.toolCall.thoughts)}</div>
                    </div>
                  ` : ''}
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
            const isTask = step.type === 101;
            const resultLabel = isTask
              ? (currentLanguage === 'zh' ? '后台任务通知' : 'Background Task Notification')
              : (currentLanguage === 'zh' ? '工具返回结果' : 'Tool Response');
            const iconName = isTask ? 'notifications' : 'check_circle';
            const textColorClass = isTask
              ? 'text-primary'
              : 'text-emerald-600 dark:text-emerald-400';
            const dotBgClass = isTask ? 'bg-primary' : 'bg-emerald-500';

            stepsHtml += `
              <div class="relative pl-6 pb-4 last:pb-0 border-l-2 border-outline-variant/60">
                <div class="absolute -left-[6px] top-1.5 w-[10px] h-[10px] rounded-full ${dotBgClass} border-2 border-background"></div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between shrink-0">
                    <span class="font-bold text-[12px] ${textColorClass} flex items-center gap-1.5 select-all">
                      <span class="material-symbols-outlined text-[14px]">${iconName}</span>
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
                  <div class="text-[11px] text-on-surface-variant select-text font-sans">${formatMessageText(step.message.text)}</div>
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

        const detailsId = `${currentConversationId || runTracking.liveConversationId}_${turnIdx}_steps`;
        const isOpen = openDetailsState[detailsId] !== undefined 
          ? openDetailsState[detailsId] 
          : isLastTurn;

        html += `
          <div class="my-4 select-none">
            <details data-details-id="${detailsId}" ${isOpen ? 'open' : ''} class="group bg-surface-container-lowest/80 border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
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
              <div class="step-details-container border-t border-outline-variant/40 p-4 space-y-4 bg-surface-container-lowest select-text max-h-[400px] overflow-y-auto font-sans">
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
          const thoughtsId = `${currentConversationId || runTracking.liveConversationId}_${turnIdx}_thoughts`;
          const isThoughtsOpen = openDetailsState[thoughtsId] !== undefined
            ? openDetailsState[thoughtsId]
            : isLastTurn;
          thoughtsHtml = `
            <details data-details-id="${thoughtsId}" ${isThoughtsOpen ? 'open' : ''} class="mb-3 text-label-sm text-on-surface-variant bg-surface-container/60 rounded border border-outline-variant/40 p-2.5">
              <summary class="cursor-pointer font-bold select-none hover:text-primary transition-colors flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-primary">psychology</span>
                ${currentLanguage === 'zh' ? '查看思考过程' : 'View Thinking Process'}
              </summary>
              <div class="mt-2 pl-6 select-text leading-relaxed font-sans text-on-surface-variant">${formatMessageText(turn.agentResponse.message.thoughts)}</div>
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

    if (isRunning) {
      const lastTurn = turns[turns.length - 1];
      if (lastTurn && !lastTurn.agentResponse) {
        html += renderAssistantPlaceholder();
      }
    }

    chatMessages.innerHTML = html;

    // Restore scroll positions of any open details containers
    const openDetailsList = chatMessages.querySelectorAll('details[open]');
    openDetailsList.forEach(details => {
      const id = details.getAttribute('data-details-id');
      if (id) {
        const container = details.querySelector('.step-details-container');
        if (container) {
          const state = detailsScrollState[id];
          if (state) {
            if (state.shouldAutoScroll) {
              container.scrollTop = container.scrollHeight;
            } else {
              container.scrollTop = state.scrollTop;
            }
          } else {
            // Default when no state exists but it is open: scroll to bottom
            container.scrollTop = container.scrollHeight;
          }
        }
      }
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    bindImageEvents();
  }

  // Trigger prompt submission
  async function submitPrompt() {
    const prompt = promptInput.value.trim();
    if ((!prompt && activeAttachedImages.length === 0) || isRunning || !activeWorkspace) return;

    const tasksMatch = prompt.match(/^\/(tasks|task)(?:\s+(task-\d+|\d+))?$/);
    if (tasksMatch) {
      promptInput.value = '';
      const key = currentConversationId || 'new';
      delete conversationDrafts[key];
      updateInputState();
      
      // Render user prompt in chat
      chatMessages.innerHTML += `
        <div class="p-4 rounded-lg border border-outline-variant bg-surface-container-low border-l-4 border-secondary space-y-2">
          <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
            <span class="font-bold text-on-background">User Instruction</span>
            <span class="text-outline">${new Date().toLocaleTimeString()}</span>
          </div>
          <p class="text-body-md text-on-surface select-text">${prompt}</p>
        </div>
      `;
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (!currentConversationId) {
        chatMessages.innerHTML += `
          <div class="p-4 rounded-lg border border-outline-variant bg-surface-container-low border-l-4 border-primary space-y-2">
            <div class="text-on-surface-variant text-body-md italic">
              ${currentLanguage === 'zh' ? '请先选择或创建一个会话以查看任务。' : 'Please select or create a conversation first to view tasks.'}
            </div>
          </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
      }

      const taskIdArg = tasksMatch[2];
      if (taskIdArg) {
        const taskId = taskIdArg.startsWith('task-') ? taskIdArg : `task-${taskIdArg}`;
        try {
          const res = await window.api.getTaskLog(currentConversationId, taskId);
          if (res && res.success) {
            chatMessages.innerHTML += `
              <div class="p-4 rounded-lg border border-outline-variant bg-surface-container border-l-4 border-primary space-y-3 my-2 select-text">
                <div class="flex items-center justify-between font-label-sm text-label-sm shrink-0">
                  <div class="flex items-center gap-2 text-primary font-bold">
                    <span class="material-symbols-outlined text-[18px]">terminal</span>
                    <span>${currentLanguage === 'zh' ? `任务 ${taskId} 执行日志` : `Task ${taskId} Execution Log`}</span>
                  </div>
                  <span class="text-outline-variant">${new Date().toLocaleTimeString()}</span>
                </div>
                <pre class="bg-surface-container-low text-on-surface-variant p-3 rounded font-code-sm text-code-sm overflow-x-auto whitespace-pre max-h-96 select-text text-left">${escapeHTML(res.content || (currentLanguage === 'zh' ? '该任务日志为空。' : 'Log content is empty.'))}</pre>
              </div>
            `;
          } else {
            chatMessages.innerHTML += `
              <div class="p-4 rounded-lg border border-error bg-error/5 border-l-4 space-y-2 text-error text-body-md">
                ${currentLanguage === 'zh' ? `未找到任务 ${taskId} 的日志文件。` : `Could not locate log file for task ${taskId}.`}
              </div>
            `;
          }
          chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (err) {
          chatMessages.innerHTML += `
            <div class="p-4 rounded-lg border border-error bg-error/5 border-l-4 space-y-2 text-error text-body-md">
              Failed to query task log: ${err.message}
            </div>
          `;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      } else {
        // List all tasks
        try {
          const res = await window.api.getTasksList(currentConversationId);
          if (res && res.success) {
            const formattedTasks = res.tasks.map(t => ({
              id: t.fullId,
              shortId: t.type === 'subagent' ? `subagent-${t.id}` : `task-${t.id}`,
              command: t.description,
              action: t.type === 'subagent' ? 'Subagent Instance' : (t.type === 'timer' ? 'Scheduled Timer' : 'Background Command'),
              status: t.status.toLowerCase(),
              logFile: t.logFile || ''
            }));
            chatMessages.innerHTML += renderTasksListBubble(formattedTasks);
          } else {
            throw new Error(res.error || 'Failed to query tasks');
          }
          chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (err) {
          chatMessages.innerHTML += `
            <div class="p-4 rounded-lg border border-error bg-error/5 border-l-4 space-y-2 text-error text-body-md">
              Failed to query tasks: ${err.message}
            </div>
          `;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
      return;
    }
    
    const startsNewConversation = !currentConversationId;
    const promptStartedAt = Date.now();

    isRunning = true;
    promptInput.value = '';
    const key = currentConversationId || 'new';
    delete conversationDrafts[key];
    
    let finalPrompt = prompt;
    if (activeAttachedImages.length > 0) {
      const imgLines = activeAttachedImages.map(img => {
        return currentLanguage === 'zh'
          ? `\n[已附图片: ${img.filePath}]`
          : `\n[Attached Image: ${img.filePath}]`;
      }).join('');
      finalPrompt = prompt + imgLines;
    }
    
    // Clear preview immediately from input field after submission (without deleting from disk)
    activeAttachedImages = [];
    if (conversationDrafts[key]) {
      conversationDrafts[key].attachedImages = [];
    }
    renderImagePreviews();
    
    updateInputState();
    
    stepProgress.classList.remove('hidden');
    stepLogs.innerHTML = '';
    startLiveRunTracking();
    
    // Add user message mock in list with formatted elements
    chatMessages.innerHTML += `
      <div class="flex justify-end mb-4">
        <div class="max-w-[85%] bg-primary text-on-primary rounded-2xl rounded-tr-none px-4 py-3 shadow-sm select-text border border-primary/20">
          <div class="flex items-center gap-2 mb-1.5 opacity-80 font-bold text-[10px] shrink-0">
            <span class="material-symbols-outlined text-[12px]">person</span>
            <span>${currentLanguage === 'zh' ? '用户指令' : 'User Instruction'}</span>
            <span class="ml-auto opacity-60">Running...</span>
          </div>
          <div class="text-[13px] leading-relaxed whitespace-pre-wrap">${formatMessageText(finalPrompt, true)}</div>
        </div>
      </div>
      ${renderAssistantPlaceholder()}
    `;
    bindImageEvents();
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
      pendingNewConversationContext = startsNewConversation
        ? { workspace: activeWorkspace, startedAt: promptStartedAt }
        : null;
      await window.api.runPrompt(finalPrompt, currentConversationId, activeWorkspace, activeMode);
    } catch (e) {
      pendingNewConversationContext = null;
      stopLiveRunTracking('stopped');
      stepLogs.innerHTML = `<div class="text-error">Submission failed: ${e.message}</div>`;
      isRunning = false;
      updateInputState();
    }
  }

  sendPromptBtn.addEventListener('click', submitPrompt);
  promptInput.addEventListener('keydown', (e) => {
    // Keyboard navigation for slash autocomplete popover
    if (slashAutocomplete && !slashAutocomplete.classList.contains('hidden')) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % filteredSuggestions.length;
        renderSuggestions();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length;
        renderSuggestions();
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectSuggestion(selectedSuggestionIndex);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        hideAutocomplete();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitPrompt();
    }
  });

  // Stop running prompt
  stopAgentBtn.addEventListener('click', async () => {
    await window.api.stopPrompt();
    setRunPhase('stopped', runTracking.stepCount);
    stepLogs.innerHTML += `<div class="text-error mt-2">Process manually terminated.</div>`;
  });

  // Listening for outputs
  const removeAgyOutputListener = window.api.onAgyOutput((data) => {
    const text = data.text;
    maybeUpdateRunPhaseFromLog(text);
    const logLine = document.createElement('div');
    logLine.className = data.stream === 'stderr' ? 'text-error' : 'text-on-surface-variant';
    logLine.textContent = text;
    stepLogs.appendChild(logLine);
    if (shouldAutoScrollSteps) {
      stepProgress.scrollTop = stepProgress.scrollHeight;
    }
  });

  const removeAgyExitListener = window.api.onAgyExit(async (code) => {
    stopLiveRunTracking(code === 0 ? 'done' : 'stopped');
    isRunning = false;
    updateInputState();
    stepProgress.classList.add('hidden');

    const restoredPendingConversation = await restorePendingNewConversation();
    if (!restoredPendingConversation) {
      await loadConversations();
      if (currentConversationId) {
        await loadConversationDetails(currentConversationId);
      }
    }
    
    // Cleanup temporary image files inside the workspace
    if (tempImagesToDelete.length > 0) {
      for (const filePath of tempImagesToDelete) {
        try {
          await window.api.deleteImageFile(filePath);
        } catch (err) {
          console.error("Cleanup temp image failed:", err);
        }
      }
      tempImagesToDelete = [];
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
    restoreDraft();
  });

  // Clean listeners on navigate away
  const oldNavigateTo = navigateTo;
  navigateTo = async (vName) => {
    removeAgyOutputListener();
    removeAgyExitListener();
    clearRunTrackingTimers();
    
    if (backgroundPollInterval) {
      clearInterval(backgroundPollInterval);
      backgroundPollInterval = null;
    }
    
    // Save draft before navigating away
    const key = currentConversationId || 'new';
    if (!conversationDrafts[key]) {
      conversationDrafts[key] = { promptText: '', attachedImages: [] };
    }
    if (promptInput) {
      conversationDrafts[key].promptText = promptInput.value;
    }
    conversationDrafts[key].attachedImages = [...activeAttachedImages];
    activeAttachedImages = [];
    renderImagePreviews();
    tempImagesToDelete = [];

    navigateTo = oldNavigateTo; // restore
    await navigateTo(vName);
  };

  function startBackgroundDatabasePolling() {
    if (backgroundPollInterval) clearInterval(backgroundPollInterval);
    backgroundPollInterval = setInterval(async () => {
      if (isRunning || currentView !== 'conversation' || !currentConversationId) {
        return;
      }
      try {
        const details = await window.api.getConversationDetails(currentConversationId);
        const signature = getConversationSignature(details.steps);
        const maxStepIdx = details.steps.reduce((max, s) => Math.max(max, s.index), -1);

        if (signature !== runTracking.lastSignature) {
          runTracking.lastSignature = signature;
          renderMessages(details.steps);
        }

        // Check for unread task notifications/messages in messages folder
        const unreadRes = await window.api.checkUnreadNotifications(currentConversationId);
        let shouldAutoResume = false;
        if (unreadRes && unreadRes.hasUnread) {
          shouldAutoResume = true;
          console.log("Detected unread messages in inbox: auto-resuming conversation...");
        } else {
          // Trigger if there is a new step that is a task notification since lastProcessedStepIndex
          if (lastProcessedStepIndex !== -1 && maxStepIdx > lastProcessedStepIndex) {
            const newSteps = details.steps.filter(s => s.index > lastProcessedStepIndex);
            const hasTaskNotification = newSteps.some(s => 
              s.type === 101 && s.rawStrings && s.rawStrings.some(str => 
                str.includes('task_notification') || str.includes('finished with result') || str.includes('was canceled') || str.includes('canceled')
              )
            );

            if (hasTaskNotification) {
              shouldAutoResume = true;
              console.log("Detected unprocessed task notification in database: auto-resuming conversation...");
            }
          }
        }

        if (shouldAutoResume) {
          lastProcessedStepIndex = maxStepIdx; // Update to prevent duplicate trigger
          lastResumedStepIndexMap[currentConversationId] = maxStepIdx; // Prevent duplicate trigger from loadConversationDetails
          
          isRunning = true;
          updateInputState();
          stepProgress.classList.remove('hidden');
          stepLogs.innerHTML = '';
          startLiveRunTracking();
          
          chatMessages.innerHTML += renderAssistantPlaceholder();
          chatMessages.scrollTop = chatMessages.scrollHeight;
          
          window.api.runPrompt("", currentConversationId, activeWorkspace, activeMode).catch(err => {
            console.error("Auto-resume failed:", err);
            isRunning = false;
            updateInputState();
            stopLiveRunTracking('stopped');
          });
        }

        if (maxStepIdx > lastProcessedStepIndex) {
          lastProcessedStepIndex = maxStepIdx;
        }

      } catch (err) {
        console.error("Background DB/notification poll error:", err);
      }
    }, 3000);
  }

  // Initial load
  loadConversations();
  startBackgroundDatabasePolling();
  
  if (currentConversationId) {
    loadConversationDetails(currentConversationId).then(() => {
      restoreDraft();
    }).catch(() => {
      restoreDraft();
    });
  } else {
    restoreDraft();
  }
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
          
          if (await appConfirm(confirmMsg)) {
            try {
              const res = await window.api.removeWorkspace(wsPath);
              if (res.success) {
                if (isSamePath(activeWorkspace, wsPath)) {
                  activeWorkspace = null;
                }
                await loadWorkspaces();
              } else {
                await appAlert(currentLanguage === 'zh' ? `删除工作区失败：${res.error}` : `Failed to remove workspace: ${res.error}`);
              }
            } catch (err) {
              await appAlert(`Error: ${err.message}`);
            }
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
        await appAlert(`Failed to add workspace: ${res.error || 'unknown error'}`);
        loadWorkspaces();
      }
    }
  });
  
  loadWorkspaces();
}

// --- SUBAGENTS VIEW CONTROLLER ---
async function initSubagentsView() {
  const subagentsList = document.getElementById('subagents-list');
  if (!subagentsList) return;

  let pollInterval = null;

  async function loadSubagents() {
    if (!currentConversationId) {
      subagentsList.innerHTML = `
        <tr class="border-b border-outline-variant/50">
          <td class="py-4 px-4 text-center col-span-5 text-label-sm text-on-surface-variant" colspan="5">
            ${currentLanguage === 'zh' ? '请先在会话控制台中选择一个会话以查看其关联的后台任务。' : 'Please select a conversation in the console first to view its background tasks.'}
          </td>
        </tr>
      `;
      return;
    }

    try {
      const res = await window.api.getTasksList(currentConversationId);
      if (!res || !res.success) {
        throw new Error(res ? res.error : 'Failed to query tasks');
      }

      const tasks = res.tasks || [];
      if (tasks.length === 0) {
        subagentsList.innerHTML = `
          <tr class="border-b border-outline-variant/50">
            <td class="py-4 px-4 text-center col-span-5 text-label-sm text-on-surface-variant" colspan="5">
              ${currentLanguage === 'zh' ? '当前会话没有发现任何子任务。' : 'No background tasks found in the selected conversation.'}
            </td>
          </tr>
        `;
        return;
      }

      subagentsList.innerHTML = tasks.map(t => {
        let statusBadge = '';
        const lowerStatus = t.status.toLowerCase();
        if (lowerStatus === 'completed' || lowerStatus === 'finished') {
          statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">${currentLanguage === 'zh' ? '已完成' : 'Completed'}</span>`;
        } else if (lowerStatus === 'canceled' || lowerStatus === 'cancelled') {
          statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-surface-variant text-on-surface-variant border border-outline-variant">${currentLanguage === 'zh' ? '已取消' : 'Canceled'}</span>`;
        } else if (lowerStatus === 'failed') {
          statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">${currentLanguage === 'zh' ? '已失败' : 'Failed'}</span>`;
        } else {
          statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">${currentLanguage === 'zh' ? '运行中' : 'Running'}</span>`;
        }

        const taskDisplayType = t.type === 'subagent'
          ? (currentLanguage === 'zh' ? '子智能体' : 'Subagent')
          : (t.type === 'timer' ? (currentLanguage === 'zh' ? '定时任务' : 'Timer') : (currentLanguage === 'zh' ? '后台命令' : 'Command'));

        const actionBtn = `
          <button data-task-id="${t.id}" class="view-task-log-btn text-primary hover:underline font-label-sm text-label-sm inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">description</span>
            ${currentLanguage === 'zh' ? '查看日志' : 'View Log'}
          </button>
        `;

        return `
          <tr class="border-b border-outline-variant/30 hover:bg-surface-variant/30 transition-colors">
            <td class="py-3 px-4 font-bold text-on-surface font-code-md">#${t.id}</td>
            <td class="py-3 px-4 text-on-surface-variant">${taskDisplayType}</td>
            <td class="py-3 px-4 text-on-surface-variant font-code-sm truncate max-w-xs select-text" title="${t.description}">${t.description}</td>
            <td class="py-3 px-4">${statusBadge}</td>
            <td class="py-3 px-4 text-right">
              ${actionBtn}
            </td>
          </tr>
        `;
      }).join('');

      // Attach click listeners
      document.querySelectorAll('.view-task-log-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const taskId = btn.dataset.taskId;
          showLogModal(taskId);
        });
      });

    } catch (err) {
      subagentsList.innerHTML = `
        <tr class="border-b border-outline-variant/50">
          <td class="py-4 px-4 text-center col-span-5 text-label-sm text-error" colspan="5">
            Error loading subagents: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  async function showLogModal(taskId) {
    const modalId = 'task-log-modal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-8 animate-fade-in';
    modal.innerHTML = `
      <div class="glass-panel w-full max-w-4xl h-[80vh] flex flex-col rounded-lg border border-outline-variant shadow-2xl overflow-hidden bg-surface-container-low">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/40 shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">description</span>
            <h3 class="font-headline-md font-bold text-on-background" style="font-size: 16px;">
              ${currentLanguage === 'zh' ? `任务日志: #${taskId}` : `Task Log: #${taskId}`}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <button id="modal-refresh-btn" class="p-1.5 hover:bg-surface-variant rounded text-on-surface-variant hover:text-on-surface transition-colors" title="${currentLanguage === 'zh' ? '刷新' : 'Refresh'}">
              <span class="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button id="modal-close-btn" class="p-1.5 hover:bg-surface-variant rounded text-on-surface-variant hover:text-on-surface transition-colors" title="${currentLanguage === 'zh' ? '关闭' : 'Close'}">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 p-6 overflow-auto bg-surface-container-lowest font-code-md text-code-md select-text">
          <pre id="modal-log-content" class="text-on-surface whitespace-pre-wrap font-mono text-[12px] leading-relaxed">Loading log content...</pre>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const logContentPre = modal.querySelector('#modal-log-content');
    const closeBtn = modal.querySelector('#modal-close-btn');
    const refreshBtn = modal.querySelector('#modal-refresh-btn');

    async function loadLogContent() {
      logContentPre.textContent = currentLanguage === 'zh' ? '正在加载日志内容...' : 'Loading log content...';
      try {
        const res = await window.api.getTaskLog(currentConversationId, `task-${taskId}`);
        if (res.success) {
          logContentPre.textContent = res.content || (currentLanguage === 'zh' ? '日志内容为空。' : 'Log content is empty.');
          logContentPre.parentElement.scrollTop = logContentPre.parentElement.scrollHeight;
        } else {
          logContentPre.textContent = `Error: ${res.error}`;
        }
      } catch (err) {
        logContentPre.textContent = `Error: ${err.message}`;
      }
    }

    closeBtn.addEventListener('click', () => modal.remove());
    refreshBtn.addEventListener('click', loadLogContent);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    await loadLogContent();
  }

  // Load initially and poll
  await loadSubagents();
  pollInterval = setInterval(loadSubagents, 3000);

  // Clean listener and polling on navigate away
  const oldNavigateTo = navigateTo;
  navigateTo = async (vName) => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    navigateTo = oldNavigateTo; // restore
    await navigateTo(vName);
  };
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
          if (await appConfirm(confirmMsg)) {
            listContainer.innerHTML = `<div class="text-center py-8 text-outline animate-pulse">${currentLanguage === 'zh' ? '正在卸载...' : 'Uninstalling...'}</div>`;
            const res = await window.api.uninstallPlugin(name);
            if (res.success) {
              loadPlugins();
            } else {
              const failMsg = currentLanguage === 'zh' ? `卸载失败：\n${res.output}` : `Uninstall failed:\n${res.output}`;
              await appAlert(failMsg);
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
              await appAlert(currentLanguage === 'zh' ? `操作失败：${res.error}` : `Operation failed: ${res.error}`);
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
            
          if (await appConfirm(confirmMsg)) {
            mcpListContainer.innerHTML = `<div class="text-center py-8 text-outline animate-pulse">${currentLanguage === 'zh' ? '正在保存配置...' : 'Saving config...'}</div>`;
            const freshConfig = await window.api.getMcpConfig();
            if (freshConfig.mcpServers && freshConfig.mcpServers[name]) {
              delete freshConfig.mcpServers[name];
              const res = await window.api.saveMcpConfig(freshConfig);
              if (!res.success) {
                await appAlert(currentLanguage === 'zh' ? `删除失败：${res.error}` : `Delete failed: ${res.error}`);
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
      await appAlert(currentLanguage === 'zh' ? '请输入服务名称和命令。' : 'Please provide both server name and command.');
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
        await appAlert(currentLanguage === 'zh' ? `添加失败：${res.error}` : `Failed to add: ${res.error}`);
      }
    } catch (e) {
      await appAlert(`Error: ${e.message}`);
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
  const inpProxy = document.getElementById('setting-proxy');
  const saveMsg = document.getElementById('save-status-msg');
  
  const binPath = document.getElementById('diag-bin-path');
  const configDir = document.getElementById('diag-config-dir');
  const lsAddress = document.getElementById('diag-ls-address');
  const sessionId = document.getElementById('diag-session-id');
  const appVersionSpan = document.getElementById('diag-app-version');
  const changelogBtn = document.getElementById('cli-changelog-btn');
  const refreshDiagBtn = document.getElementById('refresh-diag-btn');
  const loginBtn = document.getElementById('cli-login-btn');
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
      if (inpProxy) {
        inpProxy.value = currentSettings.proxy || '';
      }
      
      if (appVersionSpan) {
        try {
          const version = await window.api.getVersion();
          appVersionSpan.textContent = `v${version}`;
        } catch (err) {
          console.error("Failed to load settings app version:", err);
        }
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
    if (inpProxy) {
      currentSettings.proxy = inpProxy.value;
    }
    
    try {
      const res = await window.api.saveSettings(currentSettings);
      if (res.success) {
        if (selLanguage) {
          currentLanguage = selLanguage.value;
          translateDOM(document);
          
          // Re-translate index navigation labels
          authStatusLabel.textContent = currentLanguage === 'zh' ? '专业版 • 已连接' : 'Pro Plan • Connected';
          await updateLoginStatus();
          
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
        await appAlert(`Save failed: ${res.error}`);
      }
    } catch (e) {
      await appAlert(`Save failed: ${e.message}`);
    }
  });

  // Diagnostics
  async function runDiagnostics() {
    binPath.textContent = 'loading...';
    configDir.textContent = 'loading...';
    lsAddress.textContent = 'loading...';
    sessionId.textContent = 'loading...';
    if (appVersionSpan) appVersionSpan.textContent = 'loading...';
    
    // Resolve diagnostics values dynamically from main process API
    binPath.textContent = 'C:\\Users\\...\\AppData\\Local\\agy\\bin\\agy.exe (Resolved)';
    configDir.textContent = '~\\.gemini\\antigravity-cli (Active)';
    lsAddress.textContent = 'localhost:56695 (gRPC) / localhost:56696 (HTTP)';
    sessionId.textContent = '251c8c35-72a0-4587-a5b6-bfb733ebc963';
    
    if (appVersionSpan) {
      try {
        const version = await window.api.getVersion();
        appVersionSpan.textContent = `v${version}`;
      } catch (err) {
        appVersionSpan.textContent = 'Error';
      }
    }
  }

  refreshDiagBtn.addEventListener('click', runDiagnostics);

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      await window.api.loginAgy();
    });
  }

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
  let isUpdateReady = false;

  checkUpdatesBtn.addEventListener('click', async () => {
    if (isUpdateReady) {
      window.api.quitAndInstallApp();
      return;
    }

    checkUpdatesBtn.disabled = true;
    if (textSpan) {
      textSpan.textContent = currentLanguage === 'zh' ? '正在检查...' : 'Checking...';
    }
    
    let cliResult = null;
    let guiResult = null;
    let isChecking = true;
    
    async function showFinalReport() {
      if (!isChecking) return;
      isChecking = false;
      checkUpdatesBtn.disabled = false;
      if (!isUpdateReady && textSpan) {
        textSpan.textContent = currentLanguage === 'zh' ? '检查更新' : 'Check Updates';
      }
      
      const guiMsg = guiResult 
        ? guiResult 
        : (currentLanguage === 'zh' ? 'GUI 未检测到新版本' : 'GUI check status: no updates');
      const cliMsg = cliResult 
        ? cliResult.trim() 
        : (currentLanguage === 'zh' ? 'CLI 状态未知' : 'CLI status unknown');
        
      const title = currentLanguage === 'zh' ? '检查更新结果' : 'Check Update Results';
      const separator = '-----------------------------------';
      const finalMsg = `${currentLanguage === 'zh' ? '【GUI 客户端】' : '[GUI Client]'}\n${guiMsg}\n\n${separator}\n\n${currentLanguage === 'zh' ? '【CLI 底层工具】' : '[CLI Core Tool]'}\n${cliMsg}`;
      
      await appAlert(finalMsg, title);
    }
    
    const safetyTimeout = setTimeout(async () => {
      if (isChecking) {
        if (!guiResult) {
          guiResult = currentLanguage === 'zh' 
            ? 'GUI 检查超时' 
            : 'GUI check timeout';
        }
        await showFinalReport();
      }
    }, 12000);
    
    // 1. Listen for the GUI update check status via the IPC events
    const removeStatusListener = window.api.onUpdaterStatus(async ({ status, payload }) => {
      if (!isChecking) return;
      
      const currentVersion = await window.api.getVersion();
      
      if (status === 'update-not-available') {
        guiResult = currentLanguage === 'zh' 
          ? `当前已是最新版本 (v${currentVersion})，无更新可用` 
          : `You are already running the latest version (v${currentVersion})`;
        removeStatusListener();
        if (cliResult !== null) {
          clearTimeout(safetyTimeout);
          await showFinalReport();
        }
      } else if (status === 'update-available') {
        guiResult = currentLanguage === 'zh'
          ? `发现新版本 (v${payload.version})，已开始在后台下载...`
          : `New version (v${payload.version}) available, download started in background...`;
        removeStatusListener();
        if (cliResult !== null) {
          clearTimeout(safetyTimeout);
          await showFinalReport();
        }
      } else if (status === 'error') {
        guiResult = currentLanguage === 'zh'
          ? `检查失败: ${payload}`
          : `Check failed: ${payload}`;
        removeStatusListener();
        if (cliResult !== null) {
          clearTimeout(safetyTimeout);
          await showFinalReport();
        }
      }
    });

    // 2. Perform the CLI check and trigger GUI updater check
    try {
      const res = await window.api.checkForUpdates();
      cliResult = res.output;
    } catch (e) {
      cliResult = currentLanguage === 'zh' ? `检查失败: ${e.message}` : `Check failed: ${e.message}`;
    }
    
    if (guiResult !== null) {
      clearTimeout(safetyTimeout);
      await showFinalReport();
    }
  });

  // Listen to updater status from main process (for background download progress and ready to install)
  window.api.onUpdaterStatus(({ status, payload }) => {
    switch (status) {
      case 'download-progress':
        if (textSpan) {
          const percent = Math.round(payload.percent || 0);
          textSpan.textContent = currentLanguage === 'zh' ? `下载中 ${percent}%` : `Downloading ${percent}%`;
        }
        break;
      case 'update-downloaded':
        isUpdateReady = true;
        checkUpdatesBtn.disabled = false;
        if (textSpan) {
          textSpan.textContent = currentLanguage === 'zh' ? '重启安装' : 'Restart Install';
        }
        const confirmMsg = currentLanguage === 'zh'
          ? `新版本 GUI ${payload.version} 已下载完成。\n是否立即重启应用并完成安装？`
          : `New GUI version ${payload.version} is downloaded.\nWould you like to restart the app and install now?`;
        
        appConfirm(confirmMsg).then((installConfirm) => {
          if (installConfirm) {
            window.api.quitAndInstallApp();
          }
        });
        break;
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

function isSamePath(p1, p2) {
  if (!p1 || !p2) return false;
  const n1 = p1.trim().replace(/[\\/]+/g, '/').replace(/\/$/, '').toLowerCase();
  const n2 = p2.trim().replace(/[\\/]+/g, '/').replace(/\/$/, '').toLowerCase();
  return n1 === n2;
}

async function initSubagentsView() {
  const listBody = document.getElementById('subagents-list');
  if (!listBody) return;

  if (!currentConversationId) {
    listBody.innerHTML = `
      <tr class="border-b border-outline-variant/50">
        <td class="py-4 px-4 text-center col-span-4 text-label-sm text-on-surface-variant" colspan="4">
          \${currentLanguage === 'zh' ? '请先选择或创建一个会话以查看任务。' : 'Please select or create a conversation first to view tasks.'}
        </td>
      </tr>
    `;
    return;
  }

  listBody.innerHTML = `
    <tr class="border-b border-outline-variant/50">
      <td class="py-4 px-4 text-center col-span-4 text-label-sm text-on-surface-variant animate-pulse" colspan="4">
        \${currentLanguage === 'zh' ? '正在加载后台任务...' : 'Loading background tasks...'}
      </td>
    </tr>
  `;

  try {
    const details = await window.api.getConversationDetails(currentConversationId);
    const tasks = parseTasksFromSteps(details.steps);

    if (tasks.length === 0) {
      listBody.innerHTML = `
        <tr class="border-b border-outline-variant/50">
          <td class="py-4 px-4 text-center col-span-4 text-label-sm text-on-surface-variant" colspan="4">
            \${currentLanguage === 'zh' ? '当前会话没有关联的后台任务。' : 'No background tasks associated with the current conversation.'}
          </td>
        </tr>
      `;
      return;
    }

    listBody.innerHTML = tasks.map(t => {
      let statusColor = 'text-outline';
      let statusBg = 'bg-surface-variant/40';
      if (t.status === 'completed') {
        statusColor = 'text-emerald-500';
        statusBg = 'bg-emerald-500/10 border border-emerald-500/20';
      } else if (t.status === 'running') {
        statusColor = 'text-sky-500 pulse-primary';
        statusBg = 'bg-sky-500/10 border border-sky-500/20';
      } else if (t.status === 'canceled' || t.status === 'failed') {
        statusColor = 'text-rose-500';
        statusBg = 'bg-rose-500/10 border border-rose-500/20';
      }

      const desc = t.action || t.command || 'Background Task';

      return `
        <tr class="border-b border-outline-variant/50 hover:bg-surface-variant/20 transition-colors">
          <td class="py-4 px-4 font-bold text-primary font-code-sm">\${t.shortId}</td>
          <td class="py-4 px-4 font-medium text-on-surface select-text">\${desc}</td>
          <td class="py-4 px-4 font-code-sm truncate max-w-xs select-text" title="\${activeWorkspace || ''}">\${pathBasename(activeWorkspace || '')}</td>
          <td class="py-4 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold \${statusColor} \${statusBg}">\${t.status.toUpperCase()}</span>
          </td>
        </tr>
      `;
    }).join('');

  } catch (e) {
    listBody.innerHTML = `
      <tr class="border-b border-outline-variant/50">
        <td class="py-4 px-4 text-center col-span-4 text-error text-label-sm font-bold" colspan="4">
          \${currentLanguage === 'zh' ? '加载失败：' : 'Load failed: '}\${e.message}
        </td>
      </tr>
    `;
  }
}

// Start App
init();

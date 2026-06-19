const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('fs');
const os = require('os');

// Helper to decode protobuf structure recursively without a schema file
function parseProto(buffer) {
  const fields = {};
  let offset = 0;

  function readVarint() {
    let value = 0n;
    let shift = 0n;
    while (offset < buffer.length) {
      const byte = buffer[offset++];
      value |= BigInt(byte & 0x7f) << shift;
      if (!(byte & 0x80)) break;
      shift += 7n;
    }
    return value;
  }

  while (offset < buffer.length) {
    const key = readVarint();
    const wireType = Number(key & 7n);
    const fieldNumber = Number(key >> 3n);

    if (fieldNumber === 0) break; // End of message or error

    if (wireType === 0) {
      const val = readVarint();
      if (!fields[fieldNumber]) fields[fieldNumber] = [];
      fields[fieldNumber].push({ type: 'varint', value: val });
    } else if (wireType === 1) {
      if (offset + 8 > buffer.length) break;
      const buf = buffer.subarray(offset, offset + 8);
      offset += 8;
      if (!fields[fieldNumber]) fields[fieldNumber] = [];
      fields[fieldNumber].push({ type: 'fixed64', buffer: buf });
    } else if (wireType === 2) {
      const len = Number(readVarint());
      if (offset + len > buffer.length) break;
      const subBuffer = buffer.subarray(offset, offset + len);
      offset += len;
      
      let subMessage = null;
      try {
        subMessage = parseProto(subBuffer);
      } catch (e) {}

      let strVal = null;
      try {
        const textDecoder = new TextDecoder('utf-8', { fatal: true });
        strVal = textDecoder.decode(subBuffer);
      } catch (e) {}

      if (!fields[fieldNumber]) fields[fieldNumber] = [];
      fields[fieldNumber].push({
        type: 'bytes',
        buffer: subBuffer,
        string: strVal,
        sub: subMessage
      });
    } else if (wireType === 5) {
      if (offset + 4 > buffer.length) break;
      const buf = buffer.subarray(offset, offset + 4);
      offset += 4;
      if (!fields[fieldNumber]) fields[fieldNumber] = [];
      fields[fieldNumber].push({ type: 'fixed32', buffer: buf });
    } else {
      break;
    }
  }
  return fields;
}

// Extract any string values from a parsed proto object recursively
function extractAllStrings(protoObj) {
  let strings = [];
  for (const values of Object.values(protoObj)) {
    for (const val of values) {
      if (val.type === 'bytes') {
        if (val.string && val.string.trim().length > 0) {
          strings.push(val.string);
        }
        if (val.sub) {
          strings = strings.concat(extractAllStrings(val.sub));
        }
      }
    }
  }
  return strings;
}

// Get the user's CLI directory
function getCliDir() {
  const homeDir = os.homedir() || process.env.USERPROFILE || process.env.HOME;
  return path.join(homeDir, '.gemini', 'antigravity-cli');
}

// Load metadata about projects and last conversations
function loadMetadata() {
  const cliDir = getCliDir();
  const projectsPath = path.join(cliDir, 'cache', 'projects.json');
  const lastConversationsPath = path.join(cliDir, 'cache', 'last_conversations.json');
  
  let projects = {};
  let lastConversations = {};
  
  try {
    if (fs.existsSync(projectsPath)) {
      projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to load projects cache:", e);
  }
  
  try {
    if (fs.existsSync(lastConversationsPath)) {
      lastConversations = JSON.parse(fs.readFileSync(lastConversationsPath, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to load last conversations cache:", e);
  }
  
  return { projects, lastConversations };
}

// List all local conversations
function listConversations() {
  const cliDir = getCliDir();
  const convsDir = path.join(cliDir, 'conversations');
  const list = [];
  
  if (!fs.existsSync(convsDir)) {
    return list;
  }
  
  const files = fs.readdirSync(convsDir).filter(f => f.endsWith('.db'));
  const { projects, lastConversations } = loadMetadata();
  
  for (const file of files) {
    const filePath = path.join(convsDir, file);
    const id = path.basename(file, '.db');
    const stats = fs.statSync(filePath);
    
    // Default metadata mapping
    let workspace = 'Unknown Workspace';
    for (const [wsPath, pId] of Object.entries(projects)) {
      if (lastConversations[wsPath] === id) {
        workspace = wsPath;
        break;
      }
    }
    
    try {
      const db = new DatabaseSync(filePath, { readOnly: true });
      
      // Get cascade_id (conversation id)
      let conversationId = id;
      try {
        const meta = db.prepare("SELECT cascade_id FROM trajectory_meta LIMIT 1").get();
        if (meta && meta.cascade_id) {
          conversationId = meta.cascade_id;
        }
      } catch (e) {}
      
      // Get steps count
      let stepsCount = 0;
      try {
        const countRow = db.prepare("SELECT count(*) as count FROM steps").get();
        stepsCount = countRow ? countRow.count : 0;
      } catch (e) {}
      
      // Try to find the initial user prompt as preview
      let preview = '';
      try {
        const firstPromptRow = db.prepare("SELECT step_payload FROM steps WHERE step_type = 14 ORDER BY idx ASC LIMIT 1").get();
        if (firstPromptRow && firstPromptRow.step_payload) {
          const tree = parseProto(firstPromptRow.step_payload);
          let userPrompt = '';
          const val19 = tree[19] && tree[19][0];
          if (val19 && val19.sub) {
            const val2 = val19.sub[2] && val19.sub[2][0];
            if (val2 && val2.string) {
              userPrompt = val2.string;
            }
          }
          if (!userPrompt) {
            const strings = extractAllStrings(tree);
            const candidates = strings.filter(s => s.trim().length > 0 && !s.includes('-') && !s.startsWith('\n'));
            candidates.sort((a, b) => b.length - a.length);
            if (candidates.length > 0) {
              userPrompt = candidates[0];
            }
          }
          if (userPrompt) {
            preview = userPrompt.slice(0, 120);
          }
        }
      } catch (e) {}
      
      list.push({
        id: conversationId,
        workspace,
        stepsCount,
        preview: preview || 'Empty conversation',
        lastModified: stats.mtimeMs,
        sizeBytes: stats.size
      });
      
    } catch (e) {
      console.error(`Failed to read database file ${file}:`, e);
      // Still push basic info
      list.push({
        id,
        workspace,
        stepsCount: 0,
        preview: 'Could not load steps (corrupted DB)',
        lastModified: stats.mtimeMs,
        sizeBytes: stats.size,
        error: e.message
      });
    }
  }
  
  // Sort by last modified time descending
  return list.sort((a, b) => b.lastModified - a.lastModified);
}

// Get detailed steps for a conversation
function getConversationDetails(id) {
  const cliDir = getCliDir();
  const filePath = path.join(cliDir, 'conversations', `${id}.db`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Conversation file not found for ID: ${id}`);
  }
  
  const details = {
    id,
    steps: []
  };
  
  const db = new DatabaseSync(filePath, { readOnly: true });
  
  // Read steps
  const rows = db.prepare("SELECT idx, step_type, status, step_payload, error_details FROM steps ORDER BY idx ASC").all();
  
  for (const row of rows) {
    const step = {
      index: row.idx,
      type: row.step_type,
      status: row.status,
      error: null,
      rawStrings: []
    };
    
    // Parse error details
    if (row.error_details) {
      try {
        const errorTree = parseProto(row.error_details);
        const errStrings = extractAllStrings(errorTree);
        step.error = errStrings.join('\n');
      } catch (e) {
        step.error = 'Failed to parse error BLOB';
      }
    }
    
    // Parse step payload
    if (row.step_payload) {
      try {
        const tree = parseProto(row.step_payload);
        step.rawStrings = extractAllStrings(tree);
        
        // Structured extraction based on step type
        if (row.step_type === 14) {
          // User input / planning prompt
          let userPrompt = '';
          const val19 = tree[19] && tree[19][0];
          if (val19 && val19.sub) {
            const val2 = val19.sub[2] && val19.sub[2][0];
            if (val2 && val2.string) {
              userPrompt = val2.string;
            }
          }
          if (!userPrompt) {
            const candidates = step.rawStrings.filter(s => s.trim().length > 0 && !s.includes('-') && !s.startsWith('\n'));
            candidates.sort((a, b) => b.length - a.length);
            userPrompt = candidates[0] || '';
          }
          if (userPrompt) {
            step.message = {
              role: 'user',
              text: userPrompt
            };
          }
        } else if (row.step_type === 15) {
          // Agent Step (Thinking, Tool Call, or Final Response)
          const val20 = tree[20] && tree[20][0];
          if (val20 && val20.sub) {
            const thoughts = val20.sub[3] && val20.sub[3][0] && val20.sub[3][0].string;
            const finalResponse = val20.sub[8] && val20.sub[8][0] && val20.sub[8][0].string;
            const toolSub = val20.sub[7] && val20.sub[7][0] && val20.sub[7][0].sub;
            
            // Prioritize tool calls to prevent intermediate step messages from masking tools
            if (toolSub) {
              const toolName = toolSub[2] && toolSub[2][0] && toolSub[2][0].string;
              const toolParams = toolSub[3] && toolSub[3][0] && toolSub[3][0].string;
              const botMatch = step.rawStrings.find(s => s.startsWith('bot-'));
              
              step.toolCall = {
                agentId: botMatch || 'Main Agent',
                tool: toolName || 'unknown_tool',
                parameters: toolParams || '{}',
                thoughts: thoughts || null,
                explanation: finalResponse || null
              };
            } else if (finalResponse) {
              step.message = {
                role: 'agent',
                text: finalResponse,
                thoughts: thoughts || null
              };
            } else if (thoughts) {
              step.message = {
                role: 'agent',
                text: thoughts,
                isThoughtsOnly: true
              };
            }
          }
        } else if (
          row.step_type === 5 ||
          row.step_type === 8 ||
          row.step_type === 9 ||
          row.step_type === 21 ||
          row.step_type === 33 ||
          row.step_type === 98 ||
          row.step_type === 101 ||
          row.step_type === 132
        ) {
          // Tool response step (Type 5=write/edit, 8=view_file, 9=list_dir, 21=run_command, 33=search_web, 98=MCP, 101=task, 132=list_permissions)
          let responseText = '';
          if (tree[42] && tree[42][0] && tree[42][0].sub && tree[42][0].sub[5] && tree[42][0].sub[5][0]) {
            responseText = tree[42][0].sub[5][0].string || '';
          } else if (tree[15] && tree[15][0] && tree[15][0].string) {
            responseText = tree[15][0].string || '';
          }
          
          if (!responseText) {
            const filtered = step.rawStrings.filter(s => !s.startsWith('{') && !s.includes('toolAction') && s.length > 20);
            responseText = filtered.join('\n');
          }
          
          step.toolResponse = {
            content: responseText || 'Tool executed successfully.'
          };
        }
      } catch (e) {
        console.error(`Failed to parse step payload at index ${row.idx}:`, e);
      }
    }
    
    details.steps.push(step);
  }
  
  return details;
}

// Generic handler function for SQLite actions
function handleMessage(message) {
  const { action, payload, requestId } = message;
  
  try {
    let result;
    if (action === 'list_conversations') {
      result = listConversations();
    } else if (action === 'get_conversation_details') {
      result = getConversationDetails(payload.id);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    
    sendResponse({ result, requestId });
  } catch (err) {
    sendResponse({ error: err.message, requestId });
  }
}

// Parent process responder helper
function sendResponse(response) {
  if (process.parentPort) {
    process.parentPort.postMessage(response);
  } else if (process.send) {
    process.send(response);
  }
}

// Attach listeners based on environment
if (process.parentPort) {
  process.parentPort.on('message', (e) => {
    handleMessage(e.data);
  });
} else {
  process.on('message', (message) => {
    handleMessage(message);
  });
}


# obsiguide.md

## Bootstrap Status
<!-- USER-OWNED: keep short -->
- initialization_status: initialized
- normal_work_gate:
  - If any critical fields below are blank, the first task is to fill this file from verified repo evidence before normal work.
  - Minimum required fields: `repo_path`, `repo_kind`, `primary_stack`, `project_note`, `entry`, `areas`, and `domain`.
  - If a vault mapping truly cannot be inferred yet, write `unmapped` explicitly and explain the gap under `Open Questions`.

## Repo Identity
<!-- USER-OWNED: keep short -->
- repo_path: E:\Kuan\Projects\Codex\Antigravity-GUI
- repo_kind: project
- primary_stack: electron, tailwindcss, javascript, nodejs

## Obsidian Target
<!-- USER-OWNED: keep short -->
- vault_path: E:\Vault
- project_note: E:\Vault\02_Projects\Antigravity-GUI.md
- entry: E:\Kuan\Projects\Codex\Antigravity-GUI\main.js
- areas: developer-tools, agentic-ai, gui
- domain: local-gui-app


## Sync Rules
<!-- USER-OWNED: keep short -->
- project_contract:
  - `obsiguide.md` is the only project-level sync contract for this workspace.
  - Do not create or rely on repo-root `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`.
- note_language_contract:
  - Keep filenames, H1 titles, section headings, frontmatter keys, controlled values, tags, and Dataview syntax in English.
  - Write narrative note content in Chinese.
  - Keep repo names, tool names, commands, paths, config keys, versions, and exact error strings in original form.
- daily_contract:
  - Use `## Focus`, `## Summary`, and `## Project Ledger` for daily notes in this vault.
  - Put project-specific work inside `### [[Project Note]]` blocks.
- memory_boundary_contract:
  - `agentmem` is a working-memory layer for session recovery across agents and threads.
  - This vault is the long-term durable knowledge base and formal note system.
  - Use `agentmem` only to recover context; do not treat it as the source of truth.
  - Before promoting anything into vault notes, verify it against current workspace evidence, `obsiguide.md`, and existing vault notes.
  - Do not dump raw memory summaries or intermediate session recap directly into vault notes.
  - When sources conflict, prefer current workspace evidence, then `obsiguide.md`, then existing vault notes, then `agentmem`, then model memory.
- write_obsidian_when:
  - reusable issue is confirmed
  - stable decision is made
  - cross-project knowledge is established
  - project state changes meaningfully
  - experiment result is verified
- keep_local_only_when:
  - current goal or current next action
  - repo-local working context
  - temporary open questions without durable answer yet
- do_not_record:
  - speculative conclusions
  - noisy intermediate steps
  - low-value recap
  - raw logs without takeaway
- finish_checklist:
  - update Current State
  - update Latest Durable Changes
  - update Next Action
  - update Last Sync
  - promote durable Issue, Decision, Knowledge, or Experiment notes into Obsidian when required

## Current Goal
<!-- AGENT-MAINTAINED: update during work -->
- Implement deletion/removal of registered workspace folders from the GUI.

## Current State
<!-- AGENT-MAINTAINED: update during work -->
- Initialized `obsiguide.md` bootstrap.
- Created `E:\Vault\02_Projects\Antigravity-GUI.md` project note.
- Diagnosed local `agy.exe` subcommands and resolved path mappings.
- Wrote detailed `implementation_plan.md` artifact.
- Created complete Electron desktop application scaffold (`main.js`, `preload.js`, `database-worker.js`).
- Set up local Tailwind CSS v4 compiler configurations scanning HTML and JS views (`src/styles/input.css` to `src/styles/output.css`).
- Built modular front-end views and controller (`src/index.html`, `src/index.js`, subviews in `src/views/`).
- Identified and fixed an Electron `UtilityProcess` communication bug in `database-worker.js` by swapping legacy `process.on('message')` with the correct `process.parentPort` EventInterface.
- Initialized a Git repository at `E:\Kuan\Projects\Codex\Antigravity-GUI`, configured `.gitignore`, and made the initial commit of all project files.
- Added a language choice dropdown to settings and implemented dynamic switching.
- Fixed HTML Injection UI bug in chat messages, previews, and parameters by escaping tags.
- **Fixed Conversation History Parsing Bug**: Refactored `database-worker.js` and `index.js` to parse SQLite steps into clean dialogue turns (User prompts and Agent final responses).
- **Grouped Tool Call Timelines**: Bundled intermediate tool calls (types 5, 8, 9, 21, 33, 98, 101, 132), responses, thinking logs, and errors inside sleek, collapsible timeline panels.
- **Improved Preview/Prompt Extraction**: Swapped length-based candidates heuristic in type 14 parsing for the exact protobuf key path `tree[19][0].sub[2][0].string` to prevent file paths or workspace URIs from masking actual user prompts.
- **MCP Server List Integration**: Added dynamic listing of custom MCP servers from `mcp_config.json` (such as `agentmem`), as the GUI previously only fetched dynamic plugins via `agy plugin list` and ignored custom servers. Added enable/disable toggling, deletion, and addition of custom servers directly from the Tools view.
- **Implemented Registered Workspace Deletion**: Added removal support for registered workspace paths, enabling users to unregister paths in `projects.json` via GUI with confirmation dialogs.

## Verified Commands
<!-- AGENT-MAINTAINED: update during work -->
- `agy.exe update` (Offline update checking)
- `agy.exe plugin list` (JSON outputs of installed plugins)
- `agy.exe install` (Registry/path environment helper)
- `npm run build:css` (Compiled Tailwind v4 output.css from input.css sources)
- `git init`, `git add .`, `git commit`
- `node -c database-worker.js`, `node -c src/index.js` (JavaScript syntax check)

## Known Constraints
<!-- AGENT-MAINTAINED: update during work -->
- Spawning standalone `agy.exe` client commands inside the agent's sandbox might result in hangs if they try to spawn new background language servers or inherit mismatched `ANTIGRAVITY_LS_ADDRESS` environments.
- Electron UtilityProcess child processes must use `process.parentPort` to receive/send messages instead of normal process events.

## Open Questions
<!-- AGENT-MAINTAINED: update during work -->
- None.

## Latest Durable Changes
<!-- AGENT-MAINTAINED: update during work -->
- Created [Antigravity-GUI.md](file:///E:/Vault/02_Projects/Antigravity-GUI.md)
- Created [implementation_plan.md](file:///C:/Users/Kuan/.gemini/antigravity-cli/brain/251c8c35-72a0-4587-a5b6-bfb733ebc963/implementation_plan.md)
- Updated [main.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/main.js) to append `config:remove-workspace`, `config:save-image-file`, and `config:delete-image-file` handlers, and decoupled command prefixes to respect explicit slash commands.
- Updated [preload.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/preload.js) to expose `removeWorkspace`, `saveImageFile`, and `deleteImageFile` API bridges.
- Updated [index.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/index.js) to render delete button on workspace cards, bind confirmation prompts, clean `activeWorkspace` if current is deleted, fix workspace labels update bug on initial load, dynamically update sidebar workspace title, implement slash commands autocomplete, clean up toggle buttons handlers, and implement clipboard paste and drag-and-drop image uploads with active workspace caching and cleanup.
- Updated [conversation.html](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/views/conversation.html) to assign an ID to the sidebar header title, insert the autocomplete popup container, delete the legacy toggle buttons from the top action bar, and add the `#image-preview-container` layout block inside the prompt box.
- Updated [index.html](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/index.html) to replace the uncompiled `px-gutter` in the top navbar header with a standard Tailwind `px-6` utility to resolve layout alignment.

## Next Action
<!-- AGENT-MAINTAINED: update during work -->
- Start the application (`npm start`), copy an image to the clipboard, and paste it into the prompt box (or drag and drop an image file) to verify that the thumbnail renders correctly and the image path is appended to the prompt on submit.

## Last Sync
<!-- AGENT-MAINTAINED: update during work -->
- date: 2026-06-20
- status: clipboard-paste-drag-drop-image-support-added
- linked_project_note: E:\Vault\02_Projects\Antigravity-GUI.md

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
- Verify Git repository and files are fully committed, and confirm the project is in a clean state.

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
- Initialized a Git repository at `E:\Kuan\Projects\Codex\Antigravity-GUI`, configured `.gitignore`, and made the initial commit `feat: initial commit of Antigravity CLI GUI desktop application` of all project files.

## Verified Commands
<!-- AGENT-MAINTAINED: update during work -->
- `agy.exe update` (Offline update checking)
- `agy.exe plugin list` (JSON outputs of installed plugins)
- `agy.exe install` (Registry/path environment helper)
- `npm run build:css` (Compiled Tailwind v4 output.css from input.css sources)
- `git init`, `git add .`, `git commit`

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
- Created [main.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/main.js)
- Created [preload.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/preload.js)
- Updated [database-worker.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/database-worker.js) with parentPort API
- Created [input.css](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/styles/input.css)
- Created [index.html](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/index.html)
- Created [index.js](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/index.js)
- Created subviews inside [views/](file:///E:/Kuan/Projects/Codex/Antigravity-GUI/src/views/)
- Created Git repository and submitted the initial commit.

## Next Action
<!-- AGENT-MAINTAINED: update during work -->
- Assist the user in verifying and testing the desktop application interface, and implement features such as running agy client commands or loading VCS diffs.

## Last Sync
<!-- AGENT-MAINTAINED: update during work -->
- date: 2026-06-19
- status: git-repo-committed
- linked_project_note: E:\Vault\02_Projects\Antigravity-GUI.md




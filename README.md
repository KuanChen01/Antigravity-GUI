# Antigravity GUI

A modern, elegant Electron-based Desktop Control Center for the **Google Antigravity CLI** (`agy`).

This graphical interface integrates all features of the Antigravity developer assistant, allowing you to manage workspaces, track agent executions, inspect tool calls, and run multimodal prompt operations in a clean, state-of-the-art dual-dialogue interface.

---

## Key Features

- **Multi-Workspace Control**: Register, navigate, and unregister active workspaces directly from the home dashboard.
- **Formated Turn-Based History**: Displays dual-dialogue chat threads (User prompts vs Agent final responses) with intermediate actions grouped neatly.
- **Collapsible Tool Timelines**: Group timeline timelines for internal thoughts, tool calls, tool responses, and background tasks inside collapsible dropdown panels.
- **Slash Commands Autocomplete**: Quick command popover listing (e.g. `/planning`, `/fast`, `/goal`, `/grill-me`) with keyboard navigation support.
- **Multimodal Upload Support**: Seamless clipboard image pasting and drag-and-drop file support with automatic workspace temporary caching and runtime cleanup.
- **Custom MCP Integrations**: Add, delete, and toggle custom MCP server instances (like local memory or databases) alongside core plugins.
- **Settings & Localization**: Dynamic English/Chinese UI language switching and model variant options.
- **Auto-Updater**: One-click check and background auto-updating linked to GitHub Releases.

---

## Installation

1. Go to the [Releases](https://github.com/KuanChen01/Antigravity-GUI/releases) page.
2. Download the latest installer `Antigravity-Setup-1.0.0.exe`.
3. Run the installer wizard on Windows to set up and launch the application.

*Note: Ensure that you have the Antigravity CLI client (`agy.exe`) installed on your system path (or default `AppData/Local/agy/bin/` folder).*

---

## Development Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/KuanChen01/Antigravity-GUI.git
   cd Antigravity-GUI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile styles (Tailwind CSS v4):
   ```bash
   npm run build:css
   ```

### Running Locally
To launch the Electron app in development mode:
```bash
npm start
```

### Packaging & Distribution
To package the app into a Windows installer (`dist/Antigravity-Setup-*.exe`):
```bash
npm run dist
```

---

## License

This project is licensed under the [ISC License](LICENSE).

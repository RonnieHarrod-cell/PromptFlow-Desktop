# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PromptFlow Studio is an Electron + React desktop IDE for prompt engineering. It supports multi-LLM provider A/B testing, real-time collaboration via Firebase Firestore, and auto-updates across platforms.

## Common Commands

```bash
npm run dev              # Start Vite dev server + Electron with hot reload
npm run build           # Full production build (all platforms)
npm run build:win       # Windows only
npm run build:linux     # Linux only
npm run build:vite      # Vite bundle only (outputs dist/)
npm run build:electron  # Electron packaging only (requires existing dist/)
npm run preview         # Preview production build in browser
```

There is no configured linting or test runner.

## Architecture

### Entry Points

- **Renderer**: `index.html` → `src/main.jsx` → `src/App.jsx` (React root, owns all top-level state)
- **Electron main process**: `electron/main.js` (window creation, IPC handlers, auto-updater, menu)
- **Preload bridge**: `electron/preload.js` (exposes safe IPC APIs to renderer via `window.electronAPI`)

### State & Data Flow

`App.jsx` is the orchestration hub — it holds the primary state (`promptContent`, `variables`, `selectedProvider`, `modelId`, A/B params) and passes handlers down. There is no global state library (no Redux, Zustand, etc.).

Key hooks:
- `src/hooks/useStreaming.js` — provider-agnostic SSE streaming. Two independent instances (`streamA`, `streamB`) run in parallel for A/B testing.
- `src/hooks/useWorkspace.js` — all Firebase interactions: auth, workspaces, real-time version sync, chat via Firestore `onSnapshot` listeners.
- `src/hooks/useVersionHistory.js` — local (in-memory) version history.
- `src/hooks/useElectron.js` — IPC bridge for API key storage, menu events, updater triggers.
- `src/hooks/useUpdater.js` — auto-update state (driven by `electron-updater`).

### Provider System

`src/lib/providers.js` defines each LLM provider (Anthropic, OpenAI, Groq, Gemini) as an object with two functions:
- `buildRequest(prompt, model, params)` — formats the provider-specific request body
- `parseDelta(chunk)` — extracts streamed text from that provider's SSE format

`useStreaming` delegates entirely to these; adding a new provider only requires adding an entry here.

### Electron IPC

The preload script exposes `window.electronAPI` with: `keystore` (in-memory API key storage), `window` controls, `updater` events, and `menu` action subscriptions. In browser mode (no Electron), `useElectron.js` falls back to `sessionStorage`.

### Real-Time Collaboration

`useWorkspace` attaches Firestore `onSnapshot` listeners to workspace subcollections (versions, chat, members). All workspace state updates in real-time across clients. Firebase config is read from `VITE_FIREBASE_*` environment variables.

### Monaco & Theming

`src/lib/utils.js` registers a custom `promptflow` language for Monaco (variable highlighting with `{{var}}` syntax). Four themes are defined in `src/lib/themes.js` and applied via CSS variables. Theme choice is persisted in `localStorage`.

## Environment Variables

Required for Firebase features (workspace/collaboration):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Build & Distribution

Electron Builder config lives in the `"build"` field of `package.json`. App ID: `com.promptflow.studio`. Targets: AppImage/deb/rpm (Linux), dmg (macOS), NSIS installer (Windows) — all for x64 and arm64. Auto-updates pull from GitHub releases via `electron-updater`.

CI/CD is in `.github/workflows/build.yml`: builds on push to `main` and version tags, generates icons at build time via a Python script, and publishes artifacts to GitHub releases.

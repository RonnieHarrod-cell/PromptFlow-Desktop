const { app, BrowserWindow, ipcMain, shell, Menu, protocol, net } = require('electron')
const path = require('path')
const url = require('url')

const isDev = process.env.ELECTRON_ENV === 'development'
const DIST_DIR = path.join(__dirname, '../dist')

let mainWindow

function registerAppProtocol() {
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true, bypassCSP: true } }
  ])
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 12 },
    backgroundColor: '#0d0d0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadURL('app://promptflow/index.html')
  }

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' app: 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://*.firebase.com " +
          "https://api.anthropic.com https://api.openai.com " +
          "https://api.groq.com https://generativelanguage.googleapis.com; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline';"
        ],
      },
    })
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // Check for updates after window is shown (production only)
    if (!isDev) {
      setTimeout(() => initAutoUpdater(), 3000)
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ── Auto-updater ──────────────────────────────────────────────────────────────
function initAutoUpdater() {
  const { autoUpdater } = require('electron-updater')

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater:checking')
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater:available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
    })
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('updater:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('updater:progress', {
      percent: Math.round(progress.percent),
      transferred: progress.transferred,
      total: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('updater:downloaded')
  })

  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('updater:error', err.message)
  })

  autoUpdater.checkForUpdates()

  // IPC handlers
  ipcMain.handle('updater:download', () => autoUpdater.downloadUpdate())
  ipcMain.handle('updater:install', () => autoUpdater.quitAndInstall())
  ipcMain.handle('updater:check', () => autoUpdater.checkForUpdates())
}

// ── Menu ──────────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: 'PromptFlow Studio',
      submenu: [
        { label: 'About PromptFlow Studio', role: 'about' },
        { type: 'separator' },
        { label: 'Check for Updates…', click: () => mainWindow?.webContents.send('updater:manual-check') },
        { type: 'separator' },
        { label: 'Hide', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Prompt', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new-prompt') },
        { label: 'Save Version', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { label: 'Fork Version', accelerator: 'CmdOrCtrl+Shift+F', click: () => mainWindow?.webContents.send('menu:fork') },
        { type: 'separator' },
        { label: 'Close Window', role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', role: 'undo' },
        { label: 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', role: 'cut' },
        { label: 'Copy', role: 'copy' },
        { label: 'Paste', role: 'paste' },
        { label: 'Select All', role: 'selectAll' },
      ],
    },
    {
      label: 'Run',
      submenu: [
        { label: 'Run Prompt', accelerator: 'CmdOrCtrl+Return', click: () => mainWindow?.webContents.send('menu:run') },
        { label: 'Stop Streaming', accelerator: 'CmdOrCtrl+.', click: () => mainWindow?.webContents.send('menu:stop') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', role: 'reload' },
        { label: 'Force Reload', role: 'forceReload' },
        { label: 'Toggle DevTools', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', role: 'resetZoom' },
        { label: 'Zoom In', role: 'zoomIn' },
        { label: 'Zoom Out', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Toggle Full Screen', role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', role: 'minimize' },
        { label: 'Zoom', role: 'zoom' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' },
      ],
    },
  ]

  if (process.platform !== 'darwin') template.shift()
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ── Boot ──────────────────────────────────────────────────────────────────────
registerAppProtocol()

let storedApiKey = ''
ipcMain.handle('keystore:get', () => storedApiKey)
ipcMain.handle('keystore:set', (_, key) => { storedApiKey = key })
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => { mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize() })
ipcMain.on('window:close', () => mainWindow?.close())

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const reqUrl = new URL(request.url)
    let filePath = reqUrl.pathname
    if (filePath === '/' || filePath === '') filePath = '/index.html'
    const absolutePath = path.join(DIST_DIR, filePath)
    return net.fetch(url.pathToFileURL(absolutePath).toString())
  })

  buildMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
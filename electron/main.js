const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron')
const path = require('path')

// Reliable dev detection: set ELECTRON_ENV=development in your npm dev script
const isDev = process.env.ELECTRON_ENV === 'development'

let mainWindow

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
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => mainWindow.show())
    mainWindow.on('closed', () => { mainWindow = null })

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })
}

function buildMenu() {
    const template = [
        {
            label: 'PromptFlow Studio',
            submenu: [
                { label: 'About PromptFlow Studio', role: 'about' },
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

let storedApiKey = ''
ipcMain.handle('keystore:get', () => storedApiKey)
ipcMain.handle('keystore:set', (_, key) => { storedApiKey = key })

app.whenReady().then(() => {
    buildMenu()
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Window controls IPC (for custom traffic light buttons on non-mac or when titleBarStyle overrides them)
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())
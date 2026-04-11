const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    keystore: {
        get: () => ipcRenderer.invoke('keystore:get'),
        set: (key) => ipcRenderer.invoke('keystore:set', key),
    },

    // Window controls
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        maximize: () => ipcRenderer.send('window:maximize'),
        close: () => ipcRenderer.send('window:close'),
    },

    // Menu-triggered actions (main → renderer)
    onMenuAction: (callback) => {
        const events = ['menu:run', 'menu:stop', 'menu:save', 'menu:fork', 'menu:new-prompt']
        const listeners = events.map(channel => {
            const handler = (_, ...args) => callback(channel.replace('menu:', ''), ...args)
            ipcRenderer.on(channel, handler)
            return { channel, handler }
        })
        return () => listeners.forEach(({ channel, handler }) => ipcRenderer.removeListener(channel, handler))
    },

    platform: process.platform,
})
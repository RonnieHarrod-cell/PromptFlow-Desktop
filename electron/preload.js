const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  keystore: {
    get: () => ipcRenderer.invoke('keystore:get'),
    set: (key) => ipcRenderer.invoke('keystore:set', key),
  },

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },

  updater: {
    download: () => ipcRenderer.invoke('updater:download'),
    install:  () => ipcRenderer.invoke('updater:install'),
    check:    () => ipcRenderer.invoke('updater:check'),
    onChange: (callback) => {
      const events = [
        'updater:checking',
        'updater:available',
        'updater:not-available',
        'updater:progress',
        'updater:downloaded',
        'updater:error',
        'updater:manual-check',
      ]
      const listeners = events.map(channel => {
        const handler = (_, data) => callback(channel.replace('updater:', ''), data)
        ipcRenderer.on(channel, handler)
        return { channel, handler }
      })
      return () => listeners.forEach(({ channel, handler }) =>
        ipcRenderer.removeListener(channel, handler))
    },
  },

  onMenuAction: (callback) => {
    const events = ['menu:run', 'menu:stop', 'menu:save', 'menu:fork', 'menu:new-prompt']
    const listeners = events.map(channel => {
      const handler = (_, ...args) => callback(channel.replace('menu:', ''), ...args)
      ipcRenderer.on(channel, handler)
      return { channel, handler }
    })
    return () => listeners.forEach(({ channel, handler }) =>
      ipcRenderer.removeListener(channel, handler))
  },

  platform: process.platform,
})
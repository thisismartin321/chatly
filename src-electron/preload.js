const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  saveFile: (defaultPath) => ipcRenderer.invoke('save-file', defaultPath),
  openFile: () => ipcRenderer.invoke('open-file'),
  onUpdate: (callback) => ipcRenderer.on('update-available', callback)
});

// Expose desktop-specific features
window.electronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  saveFile: (defaultPath) => ipcRenderer.invoke('save-file', defaultPath),
  openFile: () => ipcRenderer.invoke('open-file')
};
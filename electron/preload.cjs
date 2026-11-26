const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cz10Electron', {
  pickSwfFolder: () => ipcRenderer.invoke('cz10:pickSwfFolder'),
});

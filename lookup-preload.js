// Lookup Window Preload Script
// Provides IPC bridge for the lookup window

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lookupAPI', {
  // Send extracted data back to main process
  sendExtractedData: (data) => {
    ipcRenderer.send('lookup-extracted-data', data);
  },
  
  // Cancel and close the window
  cancel: () => {
    ipcRenderer.send('lookup-cancel');
  },
  
  // Listen for close signal
  onClose: (callback) => {
    ipcRenderer.on('lookup-close', () => callback());
  },
  
  // Listen for status updates
  onStatus: (callback) => {
    ipcRenderer.on('lookup-status', (event, icon, text, type) => {
      callback(icon, text, type);
    });
  }
});

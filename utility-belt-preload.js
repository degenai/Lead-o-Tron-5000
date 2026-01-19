const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('utilityBeltAPI', {
  // Navigation
  goBack: () => ipcRenderer.send('utility-belt-close'),
  
  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  
  // Route Finder
  getRouteCandidates: (options) => ipcRenderer.invoke('get-route-candidates', options),
  calculateRoute: (options) => ipcRenderer.invoke('calculate-route', options),
  geocodeAddress: (address) => ipcRenderer.invoke('geocode-address', address),
  
  // Google Maps
  openGoogleMaps: (url) => ipcRenderer.invoke('open-external-url', url),
  
  // Export
  saveRouteNotes: (html) => ipcRenderer.invoke('save-route-notes', html),
  
  // Progress updates
  onGeocodeProgress: (callback) => {
    ipcRenderer.on('geocode-progress', (event, data) => callback(data));
  },
  
  removeGeocodeProgressListener: () => {
    ipcRenderer.removeAllListeners('geocode-progress');
  }
});

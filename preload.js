const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Data operations
  getLeads: () => ipcRenderer.invoke('get-leads'),
  saveLeads: (data) => ipcRenderer.invoke('save-leads', data),
  
  // Config operations
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  
  // Lead CRUD
  createLead: (leadData) => ipcRenderer.invoke('create-lead', leadData),
  updateLead: (leadId, updates) => ipcRenderer.invoke('update-lead', leadId, updates),
  deleteLead: (leadId) => ipcRenderer.invoke('delete-lead', leadId),
  
  // Visit management
  addVisit: (leadId, visitData) => ipcRenderer.invoke('add-visit', leadId, visitData),
  
  // Import/Export
  exportJson: () => ipcRenderer.invoke('export-json'),
  importJson: () => ipcRenderer.invoke('import-json'),
  
  // DeepSeek AI
  deepseekLookup: (businessName) => ipcRenderer.invoke('deepseek-lookup', businessName),
  
  // Activity log
  addActivityLog: (message) => ipcRenderer.invoke('add-activity-log', message),
  
  // Utility
  getDataPath: () => ipcRenderer.invoke('get-data-path')
});

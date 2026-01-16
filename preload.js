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
  
  // Contact management
  addContact: (leadId, contactData) => ipcRenderer.invoke('add-contact', leadId, contactData),
  updateContact: (leadId, contactId, updates) => ipcRenderer.invoke('update-contact', leadId, contactId, updates),
  deleteContact: (leadId, contactId) => ipcRenderer.invoke('delete-contact', leadId, contactId),
  setPrimaryContact: (leadId, contactId) => ipcRenderer.invoke('set-primary-contact', leadId, contactId),
  
  // Import/Export
  exportJson: () => ipcRenderer.invoke('export-json'),
  importJson: () => ipcRenderer.invoke('import-json'),
  
  // Business Lookup - BrowserView powered (recommended)
  openLookupWindow: (businessName, location) => ipcRenderer.invoke('open-lookup-window', businessName, location),
  
  // DeepSeek AI - DEPRECATED: Use openLookupWindow instead
  deepseekLookup: (businessName, neighborhoods) => ipcRenderer.invoke('deepseek-lookup', businessName, neighborhoods),
  
  // Activity log
  addActivityLog: (message) => ipcRenderer.invoke('add-activity-log', message),
  
  // Utility
  getDataPath: () => ipcRenderer.invoke('get-data-path')
});

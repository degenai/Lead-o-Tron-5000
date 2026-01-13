const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Data file paths
const userDataPath = app.getPath('userData');
const leadsFilePath = path.join(userDataPath, 'leads.json');
const configFilePath = path.join(userDataPath, 'config.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Lead-o-Tron 5000',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0d5c2e'
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============ DATA MANAGEMENT ============

function loadLeads() {
  try {
    if (fs.existsSync(leadsFilePath)) {
      const data = fs.readFileSync(leadsFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading leads:', error);
  }
  return { leads: [], activityLog: [] };
}

function saveLeads(data) {
  try {
    fs.writeFileSync(leadsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving leads:', error);
    return false;
  }
}

function loadConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return { deepseekApiKey: '' };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

function addActivityLog(data, message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message: message
  };
  data.activityLog.unshift(logEntry);
  // Keep only last 100 entries
  if (data.activityLog.length > 100) {
    data.activityLog = data.activityLog.slice(0, 100);
  }
  return data;
}

// ============ IPC HANDLERS ============

ipcMain.handle('get-leads', async () => {
  return loadLeads();
});

ipcMain.handle('save-leads', async (event, data) => {
  return saveLeads(data);
});

ipcMain.handle('get-config', async () => {
  return loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
  return saveConfig(config);
});

ipcMain.handle('create-lead', async (event, leadData) => {
  const data = loadLeads();
  const newLead = {
    id: uuidv4(),
    name: leadData.name || '',
    address: leadData.address || '',
    neighborhood: leadData.neighborhood || '',
    contactName: leadData.contactName || '',
    contactRole: leadData.contactRole || '',
    phone: leadData.phone || '',
    email: leadData.email || '',
    visits: [],
    scores: {
      space: leadData.scores?.space || 3,
      traffic: leadData.scores?.traffic || 3,
      vibes: leadData.scores?.vibes || 3
    },
    totalScore: (leadData.scores?.space || 3) + (leadData.scores?.traffic || 3) + (leadData.scores?.vibes || 3),
    status: 'active',
    created: new Date().toISOString(),
    lastVisit: null,
    aiEnhanced: leadData.aiEnhanced || false
  };
  
  data.leads.push(newLead);
  addActivityLog(data, `Added new lead: ${newLead.name}`);
  saveLeads(data);
  
  return newLead;
});

ipcMain.handle('update-lead', async (event, leadId, updates) => {
  const data = loadLeads();
  const leadIndex = data.leads.findIndex(l => l.id === leadId);
  
  if (leadIndex !== -1) {
    // Recalculate total score if scores changed
    if (updates.scores) {
      updates.totalScore = updates.scores.space + updates.scores.traffic + updates.scores.vibes;
    }
    
    data.leads[leadIndex] = { ...data.leads[leadIndex], ...updates };
    addActivityLog(data, `Updated lead: ${data.leads[leadIndex].name}`);
    saveLeads(data);
    return data.leads[leadIndex];
  }
  
  return null;
});

ipcMain.handle('delete-lead', async (event, leadId) => {
  const data = loadLeads();
  const leadIndex = data.leads.findIndex(l => l.id === leadId);
  
  if (leadIndex !== -1) {
    const leadName = data.leads[leadIndex].name;
    data.leads.splice(leadIndex, 1);
    addActivityLog(data, `Deleted lead: ${leadName}`);
    saveLeads(data);
    return true;
  }
  
  return false;
});

ipcMain.handle('add-visit', async (event, leadId, visitData) => {
  const data = loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead) {
    const visit = {
      date: visitData.date || new Date().toISOString(),
      notes: visitData.notes || '',
      reception: visitData.reception || 'lukewarm'
    };
    
    lead.visits.push(visit);
    lead.lastVisit = visit.date;
    
    addActivityLog(data, `Logged visit to ${lead.name}`);
    saveLeads(data);
    return lead;
  }
  
  return null;
});

ipcMain.handle('export-json', async () => {
  const data = loadLeads();
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Leads',
    defaultPath: 'leads-backup.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, path: result.filePath };
  }
  
  return { success: false };
});

ipcMain.handle('import-json', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Leads',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const importedData = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
      
      // Validate structure
      if (!importedData.leads || !Array.isArray(importedData.leads)) {
        return { success: false, error: 'Invalid JSON structure' };
      }
      
      const currentData = loadLeads();
      addActivityLog(currentData, `Imported ${importedData.leads.length} leads from backup`);
      
      // Merge imported data
      importedData.activityLog = currentData.activityLog;
      saveLeads(importedData);
      
      return { success: true, count: importedData.leads.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false };
});

ipcMain.handle('get-data-path', async () => {
  return leadsFilePath;
});

// DeepSeek API lookup
ipcMain.handle('deepseek-lookup', async (event, businessName) => {
  const config = loadConfig();
  
  if (!config.deepseekApiKey) {
    return { success: false, error: 'API key not configured' };
  }
  
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that looks up business information. Return ONLY valid JSON with no markdown formatting or code blocks. Return this exact structure: {"address": "full street address or empty string", "neighborhood": "area/district name or empty string", "businessType": "type of business or empty string", "notes": "any relevant info or empty string"}'
          },
          {
            role: 'user',
            content: `Look up business information for: "${businessName}". If you cannot find specific information, return empty strings for those fields. Return only the JSON object.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    const content = result.choices[0]?.message?.content || '{}';
    
    // Try to parse the response as JSON
    try {
      const businessInfo = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
      return { success: true, data: businessInfo };
    } catch (parseError) {
      return { success: false, error: 'Could not parse AI response' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-activity-log', async (event, message) => {
  const data = loadLeads();
  addActivityLog(data, message);
  saveLeads(data);
  return true;
});

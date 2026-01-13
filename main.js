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
      const parsed = JSON.parse(data);
      
      // Migrate leads to new contacts array format
      let needsSave = false;
      if (parsed.leads && Array.isArray(parsed.leads)) {
        parsed.leads = parsed.leads.map(lead => {
          // Check if migration is needed (has old flat contact fields but no contacts array)
          if (!lead.contacts && (lead.contactName || lead.contactRole || lead.phone || lead.email)) {
            needsSave = true;
            // Create contacts array from old flat fields
            const contacts = [];
            if (lead.contactName || lead.phone || lead.email) {
              contacts.push({
                id: uuidv4(),
                name: lead.contactName || '',
                role: lead.contactRole || '',
                phone: lead.phone || '',
                email: lead.email || '',
                isPrimary: true
              });
            }
            // Return migrated lead without old flat fields
            const { contactName, contactRole, phone, email, ...rest } = lead;
            return { ...rest, contacts };
          }
          // Ensure contacts array exists
          if (!lead.contacts) {
            lead.contacts = [];
          }
          return lead;
        });
        
        // Save if migration occurred
        if (needsSave) {
          saveLeads(parsed);
          console.log('Migrated leads to new contacts format');
        }
      }
      
      return parsed;
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
    contacts: leadData.contacts || [],
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

// DeepSeek API lookup with web search
ipcMain.handle('deepseek-lookup', async (event, businessName, existingNeighborhoods = []) => {
  const config = loadConfig();
  
  if (!config.deepseekApiKey) {
    return { success: false, error: 'API key not configured' };
  }
  
  // Build context with zipcode and neighborhoods
  const zipcode = config.defaultZipcode || '';
  const neighborhoodList = existingNeighborhoods.length > 0 
    ? existingNeighborhoods.join(', ') 
    : 'none defined yet';
  
  const locationContext = zipcode 
    ? `near zipcode ${zipcode}` 
    : '';
  
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
            content: `You are a helpful assistant that looks up local business information. Use web search to find accurate, current information.

Return ONLY valid JSON with no markdown formatting or code blocks. Return this exact structure:
{
  "address": "full street address or empty string",
  "neighborhood": "area/district name - PREFER choosing from existing neighborhoods if applicable",
  "phone": "business phone number or empty string",
  "businessType": "type of business or empty string",
  "isNewNeighborhood": true/false (true only if you're suggesting a neighborhood not in the existing list)
}

EXISTING NEIGHBORHOODS (prefer these): ${neighborhoodList}

Only suggest a new neighborhood if the business location clearly doesn't fit any existing ones.`
          },
          {
            role: 'user',
            content: `Look up business information for: "${businessName}" ${locationContext}. Search the web for current address, phone number, and location details. If you cannot find specific information, return empty strings for those fields. Return only the JSON object.`
          }
        ],
        tools: ['web_search'],
        tool_choice: 'auto',
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

// ============ CONTACT MANAGEMENT ============

ipcMain.handle('add-contact', async (event, leadId, contactData) => {
  const data = loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead) {
    const newContact = {
      id: uuidv4(),
      name: contactData.name || '',
      role: contactData.role || '',
      phone: contactData.phone || '',
      email: contactData.email || '',
      isPrimary: contactData.isPrimary || lead.contacts.length === 0 // First contact is primary by default
    };
    
    // If this is set as primary, unset others
    if (newContact.isPrimary) {
      lead.contacts.forEach(c => c.isPrimary = false);
    }
    
    lead.contacts.push(newContact);
    addActivityLog(data, `Added contact ${newContact.name} to ${lead.name}`);
    saveLeads(data);
    return lead;
  }
  
  return null;
});

ipcMain.handle('update-contact', async (event, leadId, contactId, updates) => {
  const data = loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead) {
    const contactIndex = lead.contacts.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      lead.contacts[contactIndex] = { ...lead.contacts[contactIndex], ...updates };
      saveLeads(data);
      return lead;
    }
  }
  
  return null;
});

ipcMain.handle('delete-contact', async (event, leadId, contactId) => {
  const data = loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead) {
    const contactIndex = lead.contacts.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      const deletedContact = lead.contacts[contactIndex];
      lead.contacts.splice(contactIndex, 1);
      
      // If we deleted the primary, make the first remaining contact primary
      if (deletedContact.isPrimary && lead.contacts.length > 0) {
        lead.contacts[0].isPrimary = true;
      }
      
      addActivityLog(data, `Removed contact from ${lead.name}`);
      saveLeads(data);
      return lead;
    }
  }
  
  return null;
});

ipcMain.handle('set-primary-contact', async (event, leadId, contactId) => {
  const data = loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead) {
    // Unset all as primary, then set the target
    lead.contacts.forEach(c => {
      c.isPrimary = c.id === contactId;
    });
    saveLeads(data);
    return lead;
  }
  
  return null;
});

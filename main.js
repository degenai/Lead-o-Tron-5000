const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { v4: uuidv4 } = require('uuid');
const { normalizeLeadsData } = require('./data-normalizer');
const { parseDeepseekContent, buildParseRequestBody } = require('./deepseek-utils');
const { DEFAULTS } = require('./constants');
const { solveRoute, generateGoogleMapsUrl } = require('./route-finder');
const { geocodeAddress, geocodeLeads } = require('./geocoding');

// Data file paths
const userDataPath = app.getPath('userData');
const leadsFilePath = path.join(userDataPath, 'leads.json');
const configFilePath = path.join(userDataPath, 'config.json');

let mainWindow;
let lookupWindow = null;
let utilityBeltWindow = null;
let pendingLookupResolve = null;

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
      nodeIntegration: false,
      spellcheck: false
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

async function loadLeads() {
  try {
    if (fs.existsSync(leadsFilePath)) {
      const data = await fsp.readFile(leadsFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      const { data: normalized, needsSave } = normalizeLeadsData(parsed);
      if (needsSave) {
        await saveLeads(normalized);
        console.log('Migrated leads to latest format');
      }
      return normalized;
    }
  } catch (error) {
    console.error('Error loading leads:', error);
  }
  return { leads: [], activityLog: [] };
}

async function saveLeads(data) {
  try {
    await fsp.writeFile(leadsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving leads:', error);
    return false;
  }
}

async function loadConfig() {
  const defaults = {
    deepseekApiKey: '',
    defaultZipcode: '',
    defaultLocation: '',
    routeStartAddress: '',
    routeStartCoords: null,
    followUpDays: 14
  };
  
  try {
    if (fs.existsSync(configFilePath)) {
      const data = await fsp.readFile(configFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      // Merge with defaults to ensure all fields exist
      return { ...defaults, ...parsed };
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return defaults;
}

async function saveConfig(config) {
  try {
    await fsp.writeFile(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
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
  return await loadLeads();
});

ipcMain.handle('save-leads', async (event, data) => {
  return await saveLeads(data);
});

ipcMain.handle('get-config', async () => {
  return await loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
  return await saveConfig(config);
});

ipcMain.handle('create-lead', async (event, leadData) => {
  const data = await loadLeads();
  
  // Assign UUIDs to contacts
  const contacts = (leadData.contacts || []).map(contact => ({
    ...contact,
    id: contact.id || uuidv4()
  }));
  
  const newLead = {
    id: uuidv4(),
    name: leadData.name || '',
    address: leadData.address || '',
    neighborhood: leadData.neighborhood || '',
    contacts: contacts,
    visits: [],
    scores: {
      space: leadData.scores?.space || 3,
      traffic: leadData.scores?.traffic || 3,
      vibes: leadData.scores?.vibes || 3
    },
    totalScore: (leadData.scores?.space || 3) + (leadData.scores?.traffic || 3) + (leadData.scores?.vibes || 3),
    status: DEFAULTS.STATUS,
    created: new Date().toISOString(),
    lastVisit: null,
    aiEnhanced: leadData.aiEnhanced || false
  };
  
  data.leads.push(newLead);
  await saveLeads(data);
  
  return newLead;
});

ipcMain.handle('update-lead', async (event, leadId, updates) => {
  const data = await loadLeads();
  const leadIndex = data.leads.findIndex(l => l.id === leadId);
  
  if (leadIndex !== -1) {
    // Recalculate total score if scores changed
    if (updates.scores) {
      updates.totalScore = updates.scores.space + updates.scores.traffic + updates.scores.vibes;
    }
    
    // Assign UUIDs to new contacts
    if (updates.contacts) {
      updates.contacts = updates.contacts.map(contact => ({
        ...contact,
        id: contact.id || uuidv4()
      }));
    }
    
    data.leads[leadIndex] = { ...data.leads[leadIndex], ...updates };
    await saveLeads(data);
    return data.leads[leadIndex];
  }
  
  return null;
});

ipcMain.handle('delete-lead', async (event, leadId) => {
  const data = await loadLeads();
  const leadIndex = data.leads.findIndex(l => l.id === leadId);
  
  if (leadIndex !== -1) {
    data.leads.splice(leadIndex, 1);
    await saveLeads(data);
    return true;
  }
  
  return false;
});

ipcMain.handle('add-visit', async (event, leadId, visitData) => {
  const data = await loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead) {
    const visit = {
      date: visitData.date || new Date().toISOString(),
      notes: visitData.notes || '',
      reception: visitData.reception || DEFAULTS.RECEPTION
    };
    
    lead.visits.push(visit);
    lead.lastVisit = visit.date;
    
    await saveLeads(data);
    return lead;
  }
  
  return null;
});

ipcMain.handle('update-visit', async (event, leadId, visitIndex, visitData) => {
  const data = await loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead && lead.visits[visitIndex]) {
    lead.visits[visitIndex] = {
      date: visitData.date || lead.visits[visitIndex].date,
      notes: visitData.notes !== undefined ? visitData.notes : lead.visits[visitIndex].notes,
      reception: visitData.reception || lead.visits[visitIndex].reception
    };
    
    // Recalculate lastVisit (most recent visit date)
    if (lead.visits.length > 0) {
      const sortedVisits = [...lead.visits].sort((a, b) => new Date(b.date) - new Date(a.date));
      lead.lastVisit = sortedVisits[0].date;
    }
    
    await saveLeads(data);
    return lead;
  }
  
  return null;
});

ipcMain.handle('delete-visit', async (event, leadId, visitIndex) => {
  const data = await loadLeads();
  const lead = data.leads.find(l => l.id === leadId);
  
  if (lead && lead.visits[visitIndex] !== undefined) {
    lead.visits.splice(visitIndex, 1);
    
    // Recalculate lastVisit
    if (lead.visits.length > 0) {
      const sortedVisits = [...lead.visits].sort((a, b) => new Date(b.date) - new Date(a.date));
      lead.lastVisit = sortedVisits[0].date;
    } else {
      lead.lastVisit = null;
    }
    
    await saveLeads(data);
    return lead;
  }
  
  return null;
});

ipcMain.handle('export-json', async () => {
  const data = await loadLeads();
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Leads',
    defaultPath: 'leads-backup.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  
  if (!result.canceled && result.filePath) {
    await fsp.writeFile(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
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
      const fileContent = await fsp.readFile(result.filePaths[0], 'utf-8');
      const importedData = JSON.parse(fileContent);
      
      // Validate structure
      if (!importedData.leads || !Array.isArray(importedData.leads)) {
        return { success: false, error: 'Invalid JSON structure' };
      }
      
      const currentData = await loadLeads();
      const { data: normalized } = normalizeLeadsData(importedData);
      
      // Merge imported data
      normalized.activityLog = currentData.activityLog;
      await saveLeads(normalized);
      
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

// @DEPRECATED: This handler is no longer functional.
// Use 'open-lookup-window' instead for BrowserView-powered lookup.
ipcMain.handle('deepseek-lookup', async () => {
  return { 
    success: false, 
    error: 'This method is deprecated. Use the Lookup button to open the Google search window.' 
  };
});

ipcMain.handle('add-activity-log', async (event, message) => {
  const data = await loadLeads();
  addActivityLog(data, message);
  await saveLeads(data);
  return true;
});

// ============ BROWSERVIEW LOOKUP SYSTEM ============

// Open the lookup window with embedded Google search
ipcMain.handle('open-lookup-window', async (event, businessName, location) => {
  return new Promise((resolve) => {
    // Close existing lookup window if any
    if (lookupWindow && !lookupWindow.isDestroyed()) {
      lookupWindow.close();
    }

    // Store the resolve function to call when we get results
    pendingLookupResolve = resolve;

    // Build the search query
    const query = `${businessName} ${location}`.trim();
    const searchParams = new URLSearchParams({
      business: businessName,
      location: location
    });

    // Create the lookup window
    lookupWindow = new BrowserWindow({
      width: 900,
      height: 700,
      parent: mainWindow,
      modal: false,
      title: 'Business Lookup - Lead-o-Tron 5000',
      webPreferences: {
        preload: path.join(__dirname, 'lookup-preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webviewTag: true  // Enable webview tag
      },
      backgroundColor: '#1a1a2e'
    });

    // Load the lookup window HTML with query parameters
    lookupWindow.loadFile('lookup-window.html', {
      query: {
        business: businessName,
        location: location
      }
    });

    // Handle window closed without extracting
    lookupWindow.on('closed', () => {
      lookupWindow = null;
      if (pendingLookupResolve) {
        pendingLookupResolve({ success: false, error: 'Window closed' });
        pendingLookupResolve = null;
      }
    });
  });
});

// Handle extracted data from lookup window
ipcMain.on('lookup-extracted-data', async (event, extractedData) => {
  if (!pendingLookupResolve) return;

  const config = await loadConfig();
  
  // Send status update to lookup window
  if (lookupWindow && !lookupWindow.isDestroyed()) {
    lookupWindow.webContents.send('lookup-status', '🤖', 'Parsing with AI...', 'loading');
  }

  try {
    // Check if we have any useful structured data (name, address, or phone)
    const hasStructuredData = extractedData.name || extractedData.address || extractedData.phone;
    const hasRawText = extractedData.rawText;

    if (!hasStructuredData && !hasRawText) {
      throw new Error('No business information found on page');
    }

    // If we have ANY structured data, use it directly (don't require both name AND address)
    if (hasStructuredData) {
      // Determine confidence based on what we found
      let confidence = 'high';
      if (!extractedData.address) {
        confidence = 'medium'; // No address = medium confidence
      }
      if (!extractedData.name && !extractedData.address) {
        confidence = 'low'; // Only phone = low confidence
      }

      const result = {
        success: true,
        data: {
          correctName: extractedData.name || '',
          address: extractedData.address || '',
          phone: extractedData.phone || '',
          hours: extractedData.hours || '',
          businessType: extractedData.businessType || '',
          rating: extractedData.rating || '',
          reviewCount: extractedData.reviewCount || '',
          website: extractedData.website || '',
          confidence,
          source: 'Google Knowledge Panel'
        },
        // Add warning if address was not found
        warning: !extractedData.address ? 'Address not found - you may need to enter it manually' : undefined
      };

      // Close the lookup window
      if (lookupWindow && !lookupWindow.isDestroyed()) {
        lookupWindow.webContents.send('lookup-status', '✅', 'Data extracted!', 'success');
        setTimeout(() => {
          if (lookupWindow && !lookupWindow.isDestroyed()) {
            lookupWindow.close();
          }
        }, 500);
      }

      pendingLookupResolve(result);
      pendingLookupResolve = null;
      return;
    }

    // Use DeepSeek to parse the raw text if we don't have structured data
    if (!config.deepseekApiKey) {
      throw new Error('API key not configured - cannot parse extracted text');
    }

    const requestBody = buildParseRequestBody(extractedData.rawText || JSON.stringify(extractedData));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.deepseekApiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResult = await response.json();
    const content = apiResult.choices[0]?.message?.content || '';
    const { data, warning } = parseDeepseekContent(content);

    // Add source info
    data.source = 'Google Knowledge Panel (AI parsed)';
    data.confidence = data.address ? 'high' : 'medium';

    // Close the lookup window
    if (lookupWindow && !lookupWindow.isDestroyed()) {
      lookupWindow.webContents.send('lookup-status', '✅', 'Data parsed!', 'success');
      setTimeout(() => {
        if (lookupWindow && !lookupWindow.isDestroyed()) {
          lookupWindow.close();
        }
      }, 500);
    }

    pendingLookupResolve({ success: true, data, warning });
    pendingLookupResolve = null;

  } catch (error) {
    // Send error to lookup window
    if (lookupWindow && !lookupWindow.isDestroyed()) {
      lookupWindow.webContents.send('lookup-status', '❌', error.message, 'error');
    }

    pendingLookupResolve({ success: false, error: error.message });
    pendingLookupResolve = null;
  }
});

// Handle cancel from lookup window
ipcMain.on('lookup-cancel', () => {
  if (lookupWindow && !lookupWindow.isDestroyed()) {
    lookupWindow.close();
  }
});

// ============ CONTACT MANAGEMENT ============

ipcMain.handle('add-contact', async (event, leadId, contactData) => {
  try {
    const data = await loadLeads();
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
      await saveLeads(data);
      return lead;
    }
    
    return null;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
});

ipcMain.handle('update-contact', async (event, leadId, contactId, updates) => {
  try {
    const data = await loadLeads();
    const lead = data.leads.find(l => l.id === leadId);
    
    if (lead) {
      const contactIndex = lead.contacts.findIndex(c => c.id === contactId);
      if (contactIndex !== -1) {
        lead.contacts[contactIndex] = { ...lead.contacts[contactIndex], ...updates };
        await saveLeads(data);
        return lead;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
});

ipcMain.handle('delete-contact', async (event, leadId, contactId) => {
  try {
    const data = await loadLeads();
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
        
        await saveLeads(data);
        return lead;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
});

ipcMain.handle('set-primary-contact', async (event, leadId, contactId) => {
  try {
    const data = await loadLeads();
    const lead = data.leads.find(l => l.id === leadId);
    
    if (lead) {
      // Unset all as primary, then set the target
      lead.contacts.forEach(c => {
        c.isPrimary = c.id === contactId;
      });
      await saveLeads(data);
      return lead;
    }
    
    return null;
  } catch (error) {
    console.error('Error setting primary contact:', error);
    throw error;
  }
});

// ============ UTILITY BELT ============

function createUtilityBeltWindow() {
  if (utilityBeltWindow && !utilityBeltWindow.isDestroyed()) {
    utilityBeltWindow.focus();
    return;
  }

  utilityBeltWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Utility Belt - Lead-o-Tron 5000',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'utility-belt-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0a0a0a'
  });

  utilityBeltWindow.loadFile('utility-belt.html');

  utilityBeltWindow.on('closed', () => {
    utilityBeltWindow = null;
  });
}

// Open utility belt window
ipcMain.handle('open-utility-belt', async () => {
  createUtilityBeltWindow();
  return true;
});

// Close utility belt window
ipcMain.on('utility-belt-close', () => {
  if (utilityBeltWindow && !utilityBeltWindow.isDestroyed()) {
    utilityBeltWindow.close();
  }
});

// Get route candidates (leads due for follow-up)
ipcMain.handle('get-route-candidates', async (event, options) => {
  try {
    const data = await loadLeads();
    const now = Date.now();
    const followUpDays = options.followUpDays || 14;
    const statusFilter = options.statusFilter || 'active';
    
    let candidates = data.leads.filter(lead => {
      // Status filter
      if (statusFilter === 'active' && lead.status !== 'active') {
        return false;
      }
      
      // Must have an address for routing
      if (!lead.address || !lead.address.trim()) {
        return false;
      }
      
      // Follow-up days filter (0 = all leads)
      if (followUpDays > 0) {
        if (!lead.lastVisit) {
          // Never visited - always include
          return true;
        }
        
        const daysSinceVisit = Math.floor((now - new Date(lead.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceVisit >= followUpDays;
      }
      
      return true;
    });
    
    return candidates;
  } catch (error) {
    console.error('Error getting route candidates:', error);
    throw error;
  }
});

// Calculate optimal route
ipcMain.handle('calculate-route', async (event, options) => {
  try {
    const data = await loadLeads();
    const { startCoords, maxStops, followUpDays, statusFilter } = options;
    
    // Get candidates
    const now = Date.now();
    let candidates = data.leads.filter(lead => {
      if (statusFilter === 'active' && lead.status !== 'active') return false;
      if (!lead.address || !lead.address.trim()) return false;
      
      if (followUpDays > 0) {
        if (!lead.lastVisit) return true;
        const daysSinceVisit = Math.floor((now - new Date(lead.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceVisit >= followUpDays;
      }
      return true;
    });
    
    // Geocode any leads without coords
    const leadsNeedingGeocode = candidates.filter(lead => 
      !lead.coords || !lead.coords.lat || !lead.coords.lon
    );
    
    if (leadsNeedingGeocode.length > 0) {
      // Send progress updates
      let geocoded = 0;
      for (const lead of leadsNeedingGeocode) {
        geocoded++;
        
        // Send progress to utility belt window
        if (utilityBeltWindow && !utilityBeltWindow.isDestroyed()) {
          utilityBeltWindow.webContents.send('geocode-progress', {
            current: geocoded,
            total: leadsNeedingGeocode.length,
            message: `Geocoding ${lead.name}... (${geocoded}/${leadsNeedingGeocode.length})`
          });
        }
        
        const coords = await geocodeAddress(lead.address);
        if (coords) {
          lead.coords = coords;
          
          // Update lead in data
          const leadIndex = data.leads.findIndex(l => l.id === lead.id);
          if (leadIndex !== -1) {
            data.leads[leadIndex].coords = coords;
          }
        }
      }
      
      // Save updated coords
      await saveLeads(data);
    }
    
    // Solve the route
    const result = solveRoute(startCoords, candidates, maxStops);
    
    return result;
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
});

// Geocode a single address
ipcMain.handle('geocode-address', async (event, address) => {
  try {
    return await geocodeAddress(address);
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
});

// Open external URL (for Google Maps)
ipcMain.handle('open-external-url', async (event, url) => {
  try {
    await shell.openExternal(url);
    return true;
  } catch (error) {
    console.error('Error opening URL:', error);
    throw error;
  }
});

// Save route notes as HTML file
ipcMain.handle('save-route-notes', async (event, html) => {
  try {
    // Get default filename with date
    const date = new Date().toISOString().split('T')[0];
    const defaultPath = `route-notes-${date}.html`;
    
    // Show save dialog
    const result = await dialog.showSaveDialog({
      title: 'Save Route Notes',
      defaultPath: defaultPath,
      filters: [
        { name: 'HTML Files', extensions: ['html'] }
      ]
    });
    
    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }
    
    // Write the file
    await fsp.writeFile(result.filePath, html, 'utf8');
    
    // Open the file in default browser
    await shell.openPath(result.filePath);
    
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error saving route notes:', error);
    throw error;
  }
});

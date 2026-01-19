// ============================================
// LEAD-O-TRON 5000 - Renderer Process
// The People's Elbow CRM
// ============================================

// State
let leads = [];
let activityLog = [];
let selectedLeadId = null;
let editMode = false;
let sortOrder = 'desc';

// DOM Elements
const elements = {
  // Buttons
  addLeadBtn: document.getElementById('addLeadBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  utilityBeltBtn: document.getElementById('utilityBeltBtn'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  sortOrderBtn: document.getElementById('sortOrderBtn'),
  
  // Filters
  filterStatus: document.getElementById('filterStatus'),
  filterTime: document.getElementById('filterTime'),
  filterNeighborhood: document.getElementById('filterNeighborhood'),
  filterMinScore: document.getElementById('filterMinScore'),
  filterMinScoreValue: document.getElementById('filterMinScoreValue'),
  filterReception: document.getElementById('filterReception'),
  searchInput: document.getElementById('searchInput'),
  sortBy: document.getElementById('sortBy'),
  
  // List
  leadList: document.getElementById('leadList'),
  leadCount: document.getElementById('leadCount'),
  
  // Stats
  statTotal: document.getElementById('statTotal'),
  statActive: document.getElementById('statActive'),
  statConverted: document.getElementById('statConverted'),
  statDue: document.getElementById('statDue'),
  
  // Detail Panel
  detailPanel: document.getElementById('detailPanel'),
  detailTitle: document.getElementById('detailTitle'),
  detailContent: document.getElementById('detailContent'),
  closeDetailBtn: document.getElementById('closeDetailBtn'),
  editLeadBtn: document.getElementById('editLeadBtn'),
  deleteLeadBtn: document.getElementById('deleteLeadBtn'),
  
  // Lead Modal
  leadModal: document.getElementById('leadModal'),
  modalTitle: document.getElementById('modalTitle'),
  leadForm: document.getElementById('leadForm'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  aiLookupBtn: document.getElementById('aiLookupBtn'),
  aiStatus: document.getElementById('aiStatus'),
  
  // Lead Form Fields
  leadId: document.getElementById('leadId'),
  leadName: document.getElementById('leadName'),
  leadAddress: document.getElementById('leadAddress'),
  leadNeighborhood: document.getElementById('leadNeighborhood'),
  leadNeighborhoodOptions: document.getElementById('leadNeighborhoodOptions'),
  leadStatus: document.getElementById('leadStatus'),
  
  // Contacts
  contactsList: document.getElementById('contactsList'),
  addContactBtn: document.getElementById('addContactBtn'),
  scoreSpace: document.getElementById('scoreSpace'),
  scoreTraffic: document.getElementById('scoreTraffic'),
  scoreVibes: document.getElementById('scoreVibes'),
  spaceValue: document.getElementById('spaceValue'),
  trafficValue: document.getElementById('trafficValue'),
  vibesValue: document.getElementById('vibesValue'),
  totalScoreValue: document.getElementById('totalScoreValue'),
  
  // Quick Visit
  quickVisitSection: document.getElementById('quickVisitSection'),
  addQuickVisit: document.getElementById('addQuickVisit'),
  quickVisitFields: document.getElementById('quickVisitFields'),
  quickVisitNotes: document.getElementById('quickVisitNotes'),
  quickVisitReception: document.getElementById('quickVisitReception'),
  
  // AI Tags
  addressAiTag: document.getElementById('addressAiTag'),
  neighborhoodAiTag: document.getElementById('neighborhoodAiTag'),
  
  // Visit Modal
  visitModal: document.getElementById('visitModal'),
  visitForm: document.getElementById('visitForm'),
  closeVisitModalBtn: document.getElementById('closeVisitModalBtn'),
  cancelVisitModalBtn: document.getElementById('cancelVisitModalBtn'),
  visitDate: document.getElementById('visitDate'),
  visitNotes: document.getElementById('visitNotes'),
  visitReception: document.getElementById('visitReception'),
  visitLeadId: document.getElementById('visitLeadId'),
  
  // Settings Modal
  settingsModal: document.getElementById('settingsModal'),
  closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  deepseekApiKey: document.getElementById('deepseekApiKey'),
  defaultLocation: document.getElementById('defaultLocation'),
  defaultZipcode: document.getElementById('defaultZipcode'),
  dataPathDisplay: document.getElementById('dataPathDisplay'),
  
  // Console
  consoleContent: document.getElementById('consoleContent'),
  toggleConsoleBtn: document.getElementById('toggleConsoleBtn')
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  await loadData();
  setupEventListeners();
  renderLeadList();
  renderActivityLog();
  updateStats();
  updateNeighborhoodFilter();
  updateNeighborhoodSelect();
  
  // Show data path
  const dataPath = await window.api.getDataPath();
  elements.dataPathDisplay.textContent = dataPath;
  
  // Load config for settings
  const config = await window.api.getConfig();
  elements.deepseekApiKey.value = config.deepseekApiKey || '';
  elements.defaultLocation.value = config.defaultLocation || '';
  elements.defaultZipcode.value = config.defaultZipcode || '';
  
  logActivity('Lead-o-Tron 5000 initialized. Ready to track leads! 💪');
}

async function loadData() {
  const data = await window.api.getLeads();
  leads = data.leads || [];
  activityLog = data.activityLog || [];
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Header buttons
  elements.addLeadBtn.addEventListener('click', () => openLeadModal());
  elements.exportBtn.addEventListener('click', handleExport);
  elements.importBtn.addEventListener('click', handleImport);
  elements.settingsBtn.addEventListener('click', () => openSettingsModal());
  elements.utilityBeltBtn.addEventListener('click', () => window.api.openUtilityBelt());
  
  // Filters
  elements.filterStatus.addEventListener('change', renderLeadList);
  elements.filterTime.addEventListener('change', renderLeadList);
  elements.filterNeighborhood.addEventListener('change', renderLeadList);
  elements.filterReception.addEventListener('change', renderLeadList);
  elements.filterMinScore.addEventListener('input', () => {
    elements.filterMinScoreValue.textContent = elements.filterMinScore.value + '+';
    renderLeadList();
  });
  elements.searchInput.addEventListener('input', debounce(renderLeadList, 200));
  elements.sortBy.addEventListener('change', renderLeadList);
  elements.sortOrderBtn.addEventListener('click', toggleSortOrder);
  elements.clearFiltersBtn.addEventListener('click', clearFilters);
  
  // Detail panel
  elements.closeDetailBtn.addEventListener('click', closeDetailPanel);
  elements.editLeadBtn.addEventListener('click', () => {
    const lead = leads.find(l => l.id === selectedLeadId);
    if (lead) openLeadModal(lead);
  });
  elements.deleteLeadBtn.addEventListener('click', handleDeleteLead);
  
  // Lead Modal
  elements.closeModalBtn.addEventListener('click', closeLeadModal);
  elements.cancelModalBtn.addEventListener('click', closeLeadModal);
  elements.leadForm.addEventListener('submit', handleLeadSubmit);
  elements.aiLookupBtn.addEventListener('click', handleAiLookup);
  elements.leadList.addEventListener('click', handleLeadListClick);
  elements.detailContent.addEventListener('click', handleDetailContentClick);
  elements.contactsList.addEventListener('click', handleContactsListClick);
  elements.contactsList.addEventListener('change', handleContactsListChange);
  elements.contactsList.addEventListener('input', handleContactsListInput);
  
  // Score sliders
  elements.scoreSpace.addEventListener('input', updateScoreDisplay);
  elements.scoreTraffic.addEventListener('input', updateScoreDisplay);
  elements.scoreVibes.addEventListener('input', updateScoreDisplay);
  
  // Quick visit toggle
  elements.addQuickVisit.addEventListener('change', () => {
    elements.quickVisitFields.classList.toggle('hidden', !elements.addQuickVisit.checked);
  });
  
  // Add contact button
  elements.addContactBtn.addEventListener('click', () => addContactToForm());
  
  // Visit Modal
  elements.closeVisitModalBtn.addEventListener('click', closeVisitModal);
  elements.cancelVisitModalBtn.addEventListener('click', closeVisitModal);
  elements.visitForm.addEventListener('submit', handleVisitSubmit);
  
  // Settings Modal
  elements.closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
  
  // Console toggle
  elements.toggleConsoleBtn.addEventListener('click', toggleConsole);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLeadModal();
      closeVisitModal();
      closeSettingsModal();
    }
  });
}

function handleLeadListClick(event) {
  const actionButton = event.target.closest('[data-action="open-lead-modal"]');
  if (actionButton) {
    openLeadModal();
    return;
  }

  const leadCard = event.target.closest('.lead-card');
  if (leadCard && leadCard.dataset.id) {
    selectLead(leadCard.dataset.id);
  }
}

function handleDetailContentClick(event) {
  const visitButton = event.target.closest('[data-action="open-visit-modal"]');
  if (visitButton && visitButton.dataset.leadId) {
    openVisitModal(visitButton.dataset.leadId);
    return;
  }

  const toggleButton = event.target.closest('[data-action="toggle-other-contacts"]');
  if (toggleButton) {
    const list = toggleButton.nextElementSibling;
    const icon = toggleButton.querySelector('.expand-icon');
    if (list && icon) {
      list.classList.toggle('hidden');
      icon.textContent = list.classList.contains('hidden') ? '▶' : '▼';
    }
  }
}

function handleContactsListClick(event) {
  const removeButton = event.target.closest('[data-action="remove-contact"]');
  if (removeButton) {
    const index = Number(removeButton.dataset.index);
    if (!Number.isNaN(index)) {
      removeContactFromForm(index);
    }
  }
}

function handleContactsListChange(event) {
  const target = event.target;
  if (target.matches('[data-action="set-primary-contact"]')) {
    const index = Number(target.dataset.index);
    if (!Number.isNaN(index)) {
      setFormContactPrimary(index);
    }
  }
}

function handleContactsListInput(event) {
  const target = event.target;
  if (target.matches('[data-action="update-contact"]')) {
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    if (!Number.isNaN(index) && field) {
      updateFormContact(index, field, target.value);
    }
  }
}

// ============================================
// RENDERING
// ============================================

function renderLeadList() {
  const filtered = getFilteredLeads();
  const sorted = getSortedLeads(filtered);
  
  if (sorted.length === 0) {
    elements.leadList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No leads found</div>
        <button class="btn btn-primary" data-action="open-lead-modal">
          + Add Your First Lead
        </button>
      </div>
    `;
  } else {
    elements.leadList.innerHTML = sorted.map(lead => renderLeadCard(lead)).join('');
  }
  
  elements.leadCount.textContent = `${sorted.length} lead${sorted.length !== 1 ? 's' : ''}`;
}

function renderLeadCard(lead) {
  const badge = getTimeBadge(lead.lastVisit);
  const lastVisitText = lead.lastVisit ? formatRelativeDate(lead.lastVisit) : 'Never visited';
  const lastReception = getLastReception(lead);
  const scoreClass = lead.totalScore >= 12 ? 'high' : lead.totalScore >= 8 ? 'medium' : 'low';
  
  return `
    <div class="lead-card ${selectedLeadId === lead.id ? 'selected' : ''}" data-id="${lead.id}">
      <div class="lead-badge ${badge.color}" title="${badge.label}"></div>
      <div class="lead-info">
        <div class="lead-name">${escapeHtml(lead.name)}</div>
        <div class="lead-meta">
          <span class="lead-neighborhood">${escapeHtml(lead.neighborhood) || 'No area'}</span>
          <span class="status-badge ${lead.status}">${lead.status}</span>
        </div>
      </div>
      <div class="reception-indicator" title="Last reception">${getReceptionEmoji(lastReception)}</div>
      <div class="lead-score ${scoreClass}" title="Total Score">${lead.totalScore}</div>
      <div class="lead-last-visit">${lastVisitText}</div>
    </div>
  `;
}

function renderDetailPanel(lead) {
  elements.detailTitle.textContent = lead.name;
  
  const lastReception = getLastReception(lead);
  const badge = getTimeBadge(lead.lastVisit);
  
  elements.detailContent.innerHTML = `
    <div class="detail-section">
      <h3>Status</h3>
      <div style="display: flex; gap: 12px; align-items: center;">
        <span class="status-badge ${lead.status}">${lead.status}</span>
        <span class="lead-badge ${badge.color}" style="width: 16px; height: 16px;"></span>
        <span style="color: var(--text-secondary); font-size: 12px;">${badge.label}</span>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Contact Info</h3>
      <div class="detail-field">
        <div class="detail-label">Address</div>
        <div class="detail-value ${!lead.address ? 'empty' : ''}">${escapeHtml(lead.address) || 'Not set'}</div>
      </div>
      <div class="detail-field">
        <div class="detail-label">Neighborhood</div>
        <div class="detail-value ${!lead.neighborhood ? 'empty' : ''}">${escapeHtml(lead.neighborhood) || 'Not set'}</div>
      </div>
      ${renderContactsSection(lead)}
    </div>
    
    <div class="detail-section">
      <h3>Scores</h3>
      <div class="scores-display">
        <div class="score-item">
          <div class="score-item-label">🪑 Space</div>
          <div class="score-item-value">${lead.scores.space}</div>
        </div>
        <div class="score-item">
          <div class="score-item-label">👥 Traffic</div>
          <div class="score-item-value">${lead.scores.traffic}</div>
        </div>
        <div class="score-item">
          <div class="score-item-label">✨ Vibes</div>
          <div class="score-item-value">${lead.scores.vibes}</div>
        </div>
      </div>
      <div class="total-score-display">
        <div class="total-score-label">Total Score</div>
        <div class="total-score-value">${lead.totalScore}/15</div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3>Visit History (${lead.visits.length})</h3>
      ${lead.visits.length === 0 ? 
        '<p style="color: var(--text-muted); font-style: italic;">No visits logged yet</p>' :
        lead.visits.slice().reverse().map(visit => `
          <div class="visit-item">
            <div class="visit-header">
              <span class="visit-date">${formatDate(visit.date)}</span>
              <span class="visit-reception">${getReceptionEmoji(visit.reception)} ${visit.reception}</span>
            </div>
            <div class="visit-notes ${!visit.notes ? 'empty' : ''}">${escapeHtml(visit.notes) || 'No notes'}</div>
          </div>
        `).join('')
      }
      <button class="btn btn-primary add-visit-btn" data-action="open-visit-modal" data-lead-id="${lead.id}">
        + Log New Visit
      </button>
    </div>
    
    <div class="detail-section" style="color: var(--text-muted); font-size: 11px;">
      <p>Created: ${formatDate(lead.created)}</p>
      <p>Last Visit: ${lead.lastVisit ? formatDate(lead.lastVisit) : 'Never'}</p>
      ${lead.aiEnhanced ? '<p>🤖 AI-enhanced data</p>' : ''}
    </div>
  `;
}

function renderActivityLog() {
  elements.consoleContent.innerHTML = activityLog.slice(0, 50).map(entry => `
    <div class="log-entry">
      <span class="log-time">[${formatTime(entry.timestamp)}]</span>
      <span class="log-message">${escapeHtml(entry.message)}</span>
    </div>
  `).join('');
}

// ============================================
// FILTERING & SORTING
// ============================================

function getFilteredLeads() {
  const status = elements.filterStatus.value;
  const time = elements.filterTime.value;
  const neighborhood = elements.filterNeighborhood.value;
  const minScore = parseInt(elements.filterMinScore.value);
  const reception = elements.filterReception.value;
  const search = elements.searchInput.value.toLowerCase().trim();
  
  return leads.filter(lead => {
    // Status filter
    if (status !== 'all' && lead.status !== status) return false;
    
    // Time filter
    if (time !== 'all') {
      const daysSince = getDaysSinceVisit(lead.lastVisit);
      switch (time) {
        case 'week': if (daysSince > 7) return false; break;
        case 'due-1': if (daysSince < 7) return false; break;
        case 'due-2': if (daysSince < 14) return false; break;
        case 'due-3': if (daysSince < 21) return false; break;
        case 'due-month': if (daysSince < 30) return false; break;
        case 'never': if (lead.lastVisit) return false; break;
      }
    }
    
    // Neighborhood filter
    if (neighborhood !== 'all' && lead.neighborhood !== neighborhood) return false;
    
    // Score filter
    if (lead.totalScore < minScore) return false;
    
    // Reception filter
    if (reception !== 'all') {
      const lastReception = getLastReception(lead);
      if (lastReception !== reception) return false;
    }
    
    // Search filter
    if (search) {
      const contactFields = (lead.contacts || [])
        .flatMap(c => [c.name, c.phone, c.email])
        .filter(Boolean);
      const searchFields = [
        lead.name,
        lead.address,
        lead.neighborhood,
        ...contactFields
      ].join(' ').toLowerCase();
      if (!searchFields.includes(search)) return false;
    }
    
    return true;
  });
}

function getSortedLeads(leadsToSort) {
  const sortField = elements.sortBy.value;
  const multiplier = sortOrder === 'asc' ? 1 : -1;
  
  return [...leadsToSort].sort((a, b) => {
    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'totalScore':
        return multiplier * (a.totalScore - b.totalScore);
      case 'neighborhood':
        return multiplier * (a.neighborhood || '').localeCompare(b.neighborhood || '');
      case 'created':
        return multiplier * (new Date(a.created) - new Date(b.created));
      case 'lastVisit':
      default:
        // Null values go to the end
        if (!a.lastVisit && !b.lastVisit) return 0;
        if (!a.lastVisit) return 1;
        if (!b.lastVisit) return -1;
        return multiplier * (new Date(a.lastVisit) - new Date(b.lastVisit));
    }
  });
}

function toggleSortOrder() {
  sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  elements.sortOrderBtn.textContent = sortOrder === 'asc' ? '↑' : '↓';
  renderLeadList();
}

function clearFilters() {
  elements.filterStatus.value = 'active';
  elements.filterTime.value = 'all';
  elements.filterNeighborhood.value = 'all';
  elements.filterMinScore.value = 3;
  elements.filterMinScoreValue.textContent = '3+';
  elements.filterReception.value = 'all';
  elements.searchInput.value = '';
  renderLeadList();
}

function updateNeighborhoodFilter() {
  const neighborhoods = [...new Set(leads.map(l => l.neighborhood).filter(Boolean))].sort();
  
  elements.filterNeighborhood.innerHTML = '<option value="all">All Areas</option>' +
    neighborhoods.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
}

function updateNeighborhoodSelect() {
  const neighborhoods = [...new Set(leads.map(l => l.neighborhood).filter(Boolean))].sort();
  elements.leadNeighborhoodOptions.innerHTML = neighborhoods
    .map(n => `<option value="${escapeHtml(n)}"></option>`)
    .join('');
}

// ============================================
// LEAD OPERATIONS
// ============================================

function selectLead(leadId) {
  selectedLeadId = leadId;
  const lead = leads.find(l => l.id === leadId);
  
  if (lead) {
    elements.detailPanel.classList.remove('hidden');
    renderDetailPanel(lead);
    renderLeadList(); // Update selection state
  }
}

function closeDetailPanel() {
  selectedLeadId = null;
  elements.detailPanel.classList.add('hidden');
  renderLeadList();
}

// Track contacts being edited in the form
let formContacts = [];

function openLeadModal(lead = null) {
  editMode = !!lead;
  elements.modalTitle.textContent = lead ? 'Edit Lead' : 'Add New Lead';
  elements.quickVisitSection.classList.toggle('hidden', editMode);
  
  // Reset form
  elements.leadForm.reset();
  elements.aiStatus.classList.add('hidden');
  elements.addressAiTag.classList.add('hidden');
  elements.neighborhoodAiTag.classList.add('hidden');
  elements.quickVisitFields.classList.add('hidden');
  
  if (lead) {
    elements.leadId.value = lead.id;
    elements.leadName.value = lead.name;
    elements.leadAddress.value = lead.address;
    elements.leadNeighborhood.value = lead.neighborhood;
    elements.leadStatus.value = lead.status;
    elements.scoreSpace.value = lead.scores.space;
    elements.scoreTraffic.value = lead.scores.traffic;
    elements.scoreVibes.value = lead.scores.vibes;
    
    // Load contacts
    formContacts = (lead.contacts || []).map(c => ({ ...c }));
  } else {
    elements.leadId.value = '';
    elements.scoreSpace.value = 3;
    elements.scoreTraffic.value = 3;
    elements.scoreVibes.value = 3;
    formContacts = [];
  }
  
  renderFormContacts();
  updateScoreDisplay();
  updateNeighborhoodSelect();
  elements.leadModal.classList.remove('hidden');
  elements.leadName.focus();
}

function renderFormContacts() {
  if (formContacts.length === 0) {
    elements.contactsList.innerHTML = `
      <div class="empty-contacts">
        <p>No contacts added yet</p>
      </div>
    `;
  } else {
    elements.contactsList.innerHTML = formContacts.map((contact, index) => `
      <div class="contact-card" data-contact-index="${index}">
        <div class="contact-card-header">
          <label class="primary-checkbox">
            <input type="radio" name="primaryContact" ${contact.isPrimary ? 'checked' : ''} data-action="set-primary-contact" data-index="${index}">
            <span class="primary-label">${contact.isPrimary ? '★ Primary' : 'Set Primary'}</span>
          </label>
          <button type="button" class="btn btn-icon btn-sm remove-contact-btn" data-action="remove-contact" data-index="${index}" title="Remove contact">✕</button>
        </div>
        <div class="contact-card-fields">
          <div class="form-row">
            <div class="form-group flex-grow">
              <label>Name</label>
              <input type="text" value="${escapeHtml(contact.name)}" data-action="update-contact" data-index="${index}" data-field="name" placeholder="Contact name">
            </div>
            <div class="form-group flex-grow">
              <label>Role</label>
              <input type="text" value="${escapeHtml(contact.role)}" data-action="update-contact" data-index="${index}" data-field="role" placeholder="Position/title">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-grow">
              <label>Phone</label>
              <input type="tel" value="${escapeHtml(contact.phone)}" data-action="update-contact" data-index="${index}" data-field="phone" placeholder="Phone number">
            </div>
            <div class="form-group flex-grow">
              <label>Email</label>
              <input type="email" value="${escapeHtml(contact.email)}" data-action="update-contact" data-index="${index}" data-field="email" placeholder="Email address">
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function addContactToForm() {
  const newContact = {
    id: 'temp-' + Date.now(),
    name: '',
    role: '',
    phone: '',
    email: '',
    isPrimary: formContacts.length === 0 // First contact is primary by default
  };
  formContacts.push(newContact);
  renderFormContacts();
  
  // Focus the name field of the new contact
  const lastCard = elements.contactsList.querySelector('.contact-card:last-child input[type="text"]');
  if (lastCard) lastCard.focus();
}

function removeContactFromForm(index) {
  const wasPrimary = formContacts[index].isPrimary;
  formContacts.splice(index, 1);
  
  // If we removed the primary, make the first one primary
  if (wasPrimary && formContacts.length > 0) {
    formContacts[0].isPrimary = true;
  }
  
  renderFormContacts();
}

function updateFormContact(index, field, value) {
  if (formContacts[index]) {
    formContacts[index][field] = value;
  }
}

function setFormContactPrimary(index) {
  formContacts.forEach((c, i) => {
    c.isPrimary = i === index;
  });
  renderFormContacts();
}

function renderContactsSection(lead) {
  const contacts = lead.contacts || [];
  
  if (contacts.length === 0) {
    return `
      <div class="detail-field">
        <div class="detail-label">Contact</div>
        <div class="detail-value empty">No contacts added</div>
      </div>
    `;
  }
  
  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];
  const otherContacts = contacts.filter(c => c !== primaryContact);
  
  let html = `
    <div class="primary-contact-card">
      <div class="contact-badge primary">★ Primary Contact</div>
      <div class="contact-name">${escapeHtml(primaryContact.name) || 'No name'}</div>
      ${primaryContact.role ? `<div class="contact-role">${escapeHtml(primaryContact.role)}</div>` : ''}
      <div class="contact-details">
        <div class="detail-field">
          <div class="detail-label">Phone</div>
          <div class="detail-value ${!primaryContact.phone ? 'empty' : ''}">${escapeHtml(primaryContact.phone) || 'Not set'}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Email</div>
          <div class="detail-value ${!primaryContact.email ? 'empty' : ''}">${escapeHtml(primaryContact.email) || 'Not set'}</div>
        </div>
      </div>
    </div>
  `;
  
  if (otherContacts.length > 0) {
    html += `
      <div class="other-contacts-section">
        <button type="button" class="expand-contacts-btn" data-action="toggle-other-contacts">
          <span class="expand-icon">▶</span> ${otherContacts.length} other contact${otherContacts.length > 1 ? 's' : ''}
        </button>
        <div class="other-contacts-list hidden">
          ${otherContacts.map(contact => `
            <div class="other-contact-card">
              <div class="contact-name">${escapeHtml(contact.name) || 'No name'}</div>
              ${contact.role ? `<div class="contact-role">${escapeHtml(contact.role)}</div>` : ''}
              <div class="contact-mini-details">
                ${contact.phone ? `<span>📞 ${escapeHtml(contact.phone)}</span>` : ''}
                ${contact.email ? `<span>✉️ ${escapeHtml(contact.email)}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  return html;
}

function closeLeadModal() {
  elements.leadModal.classList.add('hidden');
  elements.leadForm.reset();
  formContacts = []; // Clear contacts to prevent stale data on next open
  elements.aiStatus.classList.add('hidden'); // Hide any AI status messages
}

async function handleLeadSubmit(e) {
  e.preventDefault();
  
  // Clean up contacts - remove empty ones and assign proper IDs
  const cleanedContacts = formContacts
    .filter(c => c.name || c.phone || c.email) // Keep contacts with at least some info
    .map(c => ({
      id: c.id.startsWith('temp-') ? undefined : c.id, // Let backend assign new IDs
      name: c.name.trim(),
      role: c.role.trim(),
      phone: c.phone.trim(),
      email: c.email.trim(),
      isPrimary: c.isPrimary
    }));
  
  // Ensure exactly one primary if contacts exist
  if (cleanedContacts.length > 0 && !cleanedContacts.some(c => c.isPrimary)) {
    cleanedContacts[0].isPrimary = true;
  }
  
  const leadData = {
    name: elements.leadName.value.trim(),
    address: elements.leadAddress.value.trim(),
    neighborhood: elements.leadNeighborhood.value.trim(),
    contacts: cleanedContacts,
    status: elements.leadStatus.value,
    scores: {
      space: parseInt(elements.scoreSpace.value),
      traffic: parseInt(elements.scoreTraffic.value),
      vibes: parseInt(elements.scoreVibes.value)
    },
    aiEnhanced: !elements.addressAiTag.classList.contains('hidden')
  };
  
  if (editMode && elements.leadId.value) {
    // Update existing lead
    const updated = await window.api.updateLead(elements.leadId.value, leadData);
    if (updated) {
      const index = leads.findIndex(l => l.id === updated.id);
      if (index !== -1) leads[index] = updated;
      logActivity(`Updated lead: ${updated.name}`);
      
      if (selectedLeadId === updated.id) {
        renderDetailPanel(updated);
      }
    }
  } else {
    // Create new lead
    const newLead = await window.api.createLead(leadData);
    leads.push(newLead);
    
    // Add quick visit if checked
    if (elements.addQuickVisit.checked) {
      await window.api.addVisit(newLead.id, {
        notes: elements.quickVisitNotes.value.trim(),
        reception: elements.quickVisitReception.value
      });
      // Reload to get updated lead with visit
      await loadData();
    }
    
    logActivity(`Added new lead: ${newLead.name}`);
  }
  
  closeLeadModal();
  renderLeadList();
  updateStats();
  updateNeighborhoodFilter();
  updateNeighborhoodSelect();
}

async function handleDeleteLead() {
  if (!selectedLeadId) return;
  
  const lead = leads.find(l => l.id === selectedLeadId);
  if (!lead) return;
  
  if (confirm(`Are you sure you want to delete "${lead.name}"? This cannot be undone.`)) {
    await window.api.deleteLead(selectedLeadId);
    leads = leads.filter(l => l.id !== selectedLeadId);
    logActivity(`Deleted lead: ${lead.name}`);
    
    closeDetailPanel();
    renderLeadList();
    updateStats();
    updateNeighborhoodFilter();
  }
}

// ============================================
// VISIT OPERATIONS
// ============================================

function openVisitModal(leadId) {
  elements.visitLeadId.value = leadId;
  elements.visitDate.value = new Date().toISOString().slice(0, 16);
  elements.visitNotes.value = '';
  elements.visitReception.value = 'lukewarm';
  elements.visitModal.classList.remove('hidden');
  elements.visitNotes.focus();
}

function closeVisitModal() {
  elements.visitModal.classList.add('hidden');
  elements.visitForm.reset();
}

async function handleVisitSubmit(e) {
  e.preventDefault();
  
  const leadId = elements.visitLeadId.value;
  const visitData = {
    date: new Date(elements.visitDate.value).toISOString(),
    notes: elements.visitNotes.value.trim(),
    reception: elements.visitReception.value
  };
  
  const updated = await window.api.addVisit(leadId, visitData);
  if (updated) {
    const index = leads.findIndex(l => l.id === updated.id);
    if (index !== -1) leads[index] = updated;
    
    logActivity(`Logged visit to ${updated.name}`);
    
    if (selectedLeadId === updated.id) {
      renderDetailPanel(updated);
    }
    
    renderLeadList();
    updateStats();
  }
  
  closeVisitModal();
}

// ============================================
// AI LOOKUP
// ============================================

async function handleAiLookup() {
  const businessName = elements.leadName.value.trim();
  if (!businessName) {
    showAiStatus('Please enter a business name first', 'error');
    return;
  }
  
  elements.aiLookupBtn.disabled = true;
  showAiStatus('🔍 Opening Google search...', 'loading');
  
  try {
    // Get config for location
    const config = await window.api.getConfig();
    const location = [config.defaultLocation, config.defaultZipcode].filter(Boolean).join(' ');
    
    // Open the lookup window - this returns when user extracts data or cancels
    const result = await window.api.openLookupWindow(businessName, location);
    
    if (result.success && result.data) {
      const data = result.data;
      let appliedChanges = false;
      
      // Update business name if AI found the correct spelling (e.g., Sucré instead of Sucre)
      if (data.correctName && data.correctName !== businessName) {
        elements.leadName.value = data.correctName;
        appliedChanges = true;
      }
      
      if (data.address && !elements.leadAddress.value) {
        elements.leadAddress.value = data.address;
        elements.addressAiTag.classList.remove('hidden');
        appliedChanges = true;
      }
      
      if (data.neighborhood && !elements.leadNeighborhood.value) {
        elements.leadNeighborhood.value = data.neighborhood;
        elements.neighborhoodAiTag.classList.remove('hidden');
        // Show indicator if AI suggested a new neighborhood
        if (data.isNewNeighborhood) {
          elements.neighborhoodAiTag.textContent = 'AI (new)';
          elements.neighborhoodAiTag.title = 'AI suggested a new neighborhood - review if needed';
        } else {
          elements.neighborhoodAiTag.textContent = 'AI';
          elements.neighborhoodAiTag.title = '';
        }
        appliedChanges = true;
      }
      
      // If AI found a phone and we have no contacts yet, create one with "Main Phone" as name
      if (data.phone && formContacts.length === 0) {
        formContacts.push({
          id: 'temp-' + Date.now(),
          name: 'Main Phone',
          role: '',
          phone: data.phone,
          email: '',
          isPrimary: true
        });
        renderFormContacts();
        appliedChanges = true;
      }
      
      // Show appropriate status based on confidence and warnings
      if (result.warning) {
        showAiStatus(`⚠️ ${result.warning}`, 'warning');
      } else if (data.confidence === 'low') {
        showAiStatus(`⚠️ Low confidence result - please verify${data.source ? ` (source: ${data.source})` : ''}`, 'warning');
      } else if (data.confidence === 'medium') {
        showAiStatus(`✅ Data extracted - verify if needed${data.source ? ` (${data.source})` : ''}`, 'success');
      } else {
        showAiStatus(`✅ Data extracted from Google!${data.source ? ` (${data.source})` : ''}`, 'success');
      }
      logActivity(`Business lookup completed for ${businessName}${appliedChanges ? '' : ' (no new fields applied)'}`);
    } else if (result.error === 'Window closed') {
      // User cancelled - just hide the status
      showAiStatus('', '');
      elements.aiStatus.classList.add('hidden');
    } else {
      showAiStatus(`⚠️ ${result.error || 'Could not find business info'}`, 'error');
    }
  } catch (error) {
    showAiStatus(`❌ Error: ${error.message}`, 'error');
  }
  
  elements.aiLookupBtn.disabled = false;
}

function showAiStatus(message, type) {
  elements.aiStatus.textContent = message;
  elements.aiStatus.className = `ai-status ${type}`;
  elements.aiStatus.classList.remove('hidden');
}

// ============================================
// SETTINGS
// ============================================

function openSettingsModal() {
  elements.settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  elements.settingsModal.classList.add('hidden');
}

async function handleSaveSettings() {
  const config = {
    deepseekApiKey: elements.deepseekApiKey.value.trim(),
    defaultLocation: elements.defaultLocation.value.trim(),
    defaultZipcode: elements.defaultZipcode.value.trim()
  };
  
  await window.api.saveConfig(config);
  logActivity('Settings saved');
  closeSettingsModal();
}

// ============================================
// IMPORT/EXPORT
// ============================================

async function handleExport() {
  const result = await window.api.exportJson();
  if (result.success) {
    logActivity(`Exported leads to ${result.path}`);
  }
}

async function handleImport() {
  const result = await window.api.importJson();
  if (result.success) {
    await loadData();
    renderLeadList();
    updateStats();
    updateNeighborhoodFilter();
    updateNeighborhoodSelect();
    renderActivityLog();
    logActivity(`Imported ${result.count} leads from backup`);
  } else if (result.error) {
    alert(`Import failed: ${result.error}`);
  }
}

// ============================================
// STATS
// ============================================

function updateStats() {
  const total = leads.length;
  const active = leads.filter(l => l.status === 'active').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const due = leads.filter(l => {
    if (l.status !== 'active') return false;
    const days = getDaysSinceVisit(l.lastVisit);
    return days >= 7;
  }).length;
  
  elements.statTotal.textContent = total;
  elements.statActive.textContent = active;
  elements.statConverted.textContent = converted;
  elements.statDue.textContent = due;
  
  if (due > 0) {
    logActivity(`${due} lead${due > 1 ? 's' : ''} due for follow-up this week`, false);
  }
}

// ============================================
// CONSOLE
// ============================================

function toggleConsole() {
  const panel = document.querySelector('.console-panel');
  panel.classList.toggle('collapsed');
  elements.toggleConsoleBtn.textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
}

function logActivity(message, persist = true) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: message
  };
  
  activityLog.unshift(entry);
  if (activityLog.length > 100) {
    activityLog = activityLog.slice(0, 100);
  }
  
  renderActivityLog();
  
  if (persist) {
    window.api.addActivityLog(message);
  }
}

// ============================================
// SCORE DISPLAY
// ============================================

function updateScoreDisplay() {
  const space = parseInt(elements.scoreSpace.value);
  const traffic = parseInt(elements.scoreTraffic.value);
  const vibes = parseInt(elements.scoreVibes.value);
  const total = space + traffic + vibes;
  
  elements.spaceValue.textContent = space;
  elements.trafficValue.textContent = traffic;
  elements.vibesValue.textContent = vibes;
  elements.totalScoreValue.textContent = total;
}

// ============================================
// HELPERS
// ============================================

function getTimeBadge(lastVisit) {
  if (!lastVisit) {
    return { color: 'new', label: 'Never visited' };
  }
  
  const days = getDaysSinceVisit(lastVisit);
  
  if (days <= 7) return { color: 'green', label: 'Visited this week' };
  if (days <= 14) return { color: 'yellow', label: '1-2 weeks ago' };
  if (days <= 21) return { color: 'orange', label: '2-3 weeks ago' };
  if (days <= 28) return { color: 'red', label: '3-4 weeks ago' };
  if (days <= 60) return { color: 'purple', label: '1-2 months ago' };
  return { color: 'black', label: '2+ months ago' };
}

function getDaysSinceVisit(lastVisit) {
  if (!lastVisit) return Infinity;
  const now = new Date();
  const visit = new Date(lastVisit);
  const diffTime = now - visit;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getLastReception(lead) {
  if (!lead.visits || lead.visits.length === 0) return null;
  return lead.visits[lead.visits.length - 1].reception;
}

function getReceptionEmoji(reception) {
  switch (reception) {
    case 'warm': return '🔥';
    case 'lukewarm': return '🌤️';
    case 'cold': return '❄️';
    default: return '➖';
  }
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatRelativeDate(isoString) {
  const days = getDaysSinceVisit(isoString);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize app
init();

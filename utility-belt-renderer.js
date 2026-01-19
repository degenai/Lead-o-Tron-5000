// Utility Belt Renderer with anime.js Animations
// Note: In Electron renderer, we use require for node modules

// ============================================
// ANIMATION UTILITIES (anime.js v4 style)
// Since we can't use ES modules directly in Electron renderer,
// we'll use a simple animation approach that mimics anime.js
// ============================================

const Animations = {
  // Simple animation helper using CSS transitions + JS
  animate(targets, props, options = {}) {
    const elements = typeof targets === 'string' 
      ? document.querySelectorAll(targets) 
      : [targets].flat();
    
    const duration = options.duration || 500;
    const delay = options.delay || 0;
    const easing = options.easing || 'ease-out';
    
    return new Promise(resolve => {
      elements.forEach((el, i) => {
        const itemDelay = typeof delay === 'function' ? delay(el, i, elements.length) : delay;
        
        setTimeout(() => {
          el.style.transition = `all ${duration}ms ${easing}`;
          
          Object.entries(props).forEach(([prop, value]) => {
            if (prop === 'opacity') el.style.opacity = value;
            else if (prop === 'translateX') el.style.transform = `translateX(${value}px)`;
            else if (prop === 'translateY') el.style.transform = `translateY(${value}px)`;
            else if (prop === 'scale') el.style.transform = `scale(${value})`;
            else if (prop === 'transform') el.style.transform = value;
            else el.style[prop] = value;
          });
          
          if (i === elements.length - 1) {
            setTimeout(resolve, duration);
          }
        }, itemDelay);
      });
    });
  },
  
  // Stagger helper
  stagger(value, options = {}) {
    const start = options.start || 0;
    const from = options.from || 'first';
    
    return (el, i, total) => {
      if (from === 'center') {
        const center = (total - 1) / 2;
        return start + Math.abs(i - center) * value;
      }
      if (from === 'last') {
        return start + (total - 1 - i) * value;
      }
      return start + i * value;
    };
  },
  
  // Counter animation
  animateCounter(element, targetValue, options = {}) {
    const duration = options.duration || 1500;
    const startValue = options.startValue || 0;
    const decimals = options.decimals !== undefined ? options.decimals : 1;
    const suffix = options.suffix || '';
    
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * eased;
      
      // For zero decimals, round to integer
      if (decimals === 0) {
        element.textContent = Math.round(current) + suffix;
      } else {
        element.textContent = current.toFixed(decimals) + suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  },
  
  // Pulse animation
  pulse(element, options = {}) {
    const duration = options.duration || 800;
    let running = true;
    
    const animate = () => {
      if (!running) return;
      
      element.style.transition = `transform ${duration / 2}ms ease-in-out`;
      element.style.transform = 'scale(1.2)';
      element.style.opacity = '0.7';
      
      setTimeout(() => {
        if (!running) return;
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
        
        setTimeout(() => {
          if (running) animate();
        }, duration / 2);
      }, duration / 2);
    };
    
    animate();
    
    return {
      stop: () => {
        running = false;
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
      }
    };
  }
};

// ============================================
// STATE
// ============================================

let state = {
  config: {},
  eligibleLeads: [],
  routeResults: null,
  isCalculating: false,
  pulseAnimation: null
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  backBtn: document.getElementById('backBtn'),
  startAddress: document.getElementById('startAddress'),
  followUpDays: document.getElementById('followUpDays'),
  statusFilter: document.getElementById('statusFilter'),
  eligibleCount: document.getElementById('eligibleCount'),
  maxStops: document.getElementById('maxStops'),
  maxStopsValue: document.getElementById('maxStopsValue'),
  calculateBtn: document.getElementById('calculateBtn'),
  progressSection: document.getElementById('progressSection'),
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  resultsSection: document.getElementById('resultsSection'),
  totalDistance: document.getElementById('totalDistance'),
  stopCount: document.getElementById('stopCount'),
  routeList: document.getElementById('routeList'),
  openMapsBtn: document.getElementById('openMapsBtn'),
  exportNotesBtn: document.getElementById('exportNotesBtn'),
  // Export card elements
  includeContacts: document.getElementById('includeContacts'),
  includeVisitHistory: document.getElementById('includeVisitHistory'),
  includeScores: document.getElementById('includeScores'),
  exportStatus: document.getElementById('exportStatus'),
  exportRouteNotesBtn: document.getElementById('exportRouteNotesBtn')
};

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  // Run entrance animations
  await runEntranceAnimations();
  
  // Load config
  await loadConfig();
  
  // Load initial candidates
  await refreshCandidates();
  
  // Setup event listeners
  setupEventListeners();
}

async function runEntranceAnimations() {
  const header = document.querySelector('.utility-header');
  const cards = document.querySelectorAll('.tool-card');
  
  // Header slide in
  await Animations.animate(header, {
    opacity: 1,
    transform: 'translateY(0)'
  }, { duration: 400, easing: 'ease-out' });
  
  // Tool cards stagger reveal
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.style.transition = 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
    }, 100 + i * 120);
  });
}

async function loadConfig() {
  try {
    state.config = await window.utilityBeltAPI.getConfig();
    
    // Prefill starting address from config
    if (state.config.routeStartAddress) {
      elements.startAddress.value = state.config.routeStartAddress;
    }
    
    // Set follow-up days from config
    if (state.config.followUpDays) {
      elements.followUpDays.value = state.config.followUpDays.toString();
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Back button
  elements.backBtn.addEventListener('click', () => {
    window.utilityBeltAPI.goBack();
  });
  
  // Back button hover animation
  elements.backBtn.addEventListener('mouseenter', () => {
    elements.backBtn.style.transform = 'scale(1.1)';
  });
  elements.backBtn.addEventListener('mouseleave', () => {
    elements.backBtn.style.transform = 'scale(1)';
  });
  
  // Filter changes - refresh candidates
  elements.followUpDays.addEventListener('change', refreshCandidates);
  elements.statusFilter.addEventListener('change', refreshCandidates);
  
  // Slider value display
  elements.maxStops.addEventListener('input', () => {
    const value = elements.maxStops.value;
    elements.maxStopsValue.textContent = value;
    
    // Animate the value change
    elements.maxStopsValue.style.transform = 'scale(1.3)';
    setTimeout(() => {
      elements.maxStopsValue.style.transform = 'scale(1)';
    }, 150);
  });
  
  // Calculate button
  elements.calculateBtn.addEventListener('click', calculateRoute);
  
  // Calculate button hover
  elements.calculateBtn.addEventListener('mouseenter', () => {
    if (!state.isCalculating) {
      elements.calculateBtn.style.transform = 'scale(1.02)';
    }
  });
  elements.calculateBtn.addEventListener('mouseleave', () => {
    elements.calculateBtn.style.transform = 'scale(1)';
  });
  
  // Open Maps button
  elements.openMapsBtn.addEventListener('click', openInGoogleMaps);
  
  // Export Notes buttons (both inline and card)
  elements.exportNotesBtn.addEventListener('click', exportRouteNotes);
  elements.exportRouteNotesBtn.addEventListener('click', exportRouteNotes);
  
  // Save start address on blur
  elements.startAddress.addEventListener('blur', async () => {
    const address = elements.startAddress.value.trim();
    if (address && address !== state.config.routeStartAddress) {
      state.config.routeStartAddress = address;
      await window.utilityBeltAPI.saveConfig(state.config);
    }
  });
  
  // Listen for geocoding progress
  window.utilityBeltAPI.onGeocodeProgress((data) => {
    updateProgress(data.current, data.total, data.message);
  });
}

// ============================================
// DATA LOADING
// ============================================

async function refreshCandidates() {
  try {
    const options = {
      followUpDays: parseInt(elements.followUpDays.value),
      statusFilter: elements.statusFilter.value
    };
    
    state.eligibleLeads = await window.utilityBeltAPI.getRouteCandidates(options);
    
    // Animate count update
    const oldCount = parseInt(elements.eligibleCount.textContent) || 0;
    const newCount = state.eligibleLeads.length;
    
    if (oldCount !== newCount) {
      Animations.animateCounter(elements.eligibleCount, newCount, {
        startValue: oldCount,
        duration: 600,
        decimals: 0,
        suffix: ''
      });
    }
    
    // Update slider max
    elements.maxStops.max = Math.max(1, Math.min(15, newCount));
    if (parseInt(elements.maxStops.value) > newCount) {
      elements.maxStops.value = Math.min(5, newCount);
      elements.maxStopsValue.textContent = elements.maxStops.value;
    }
    
  } catch (error) {
    console.error('Failed to refresh candidates:', error);
  }
}

// ============================================
// ROUTE CALCULATION
// ============================================

async function calculateRoute() {
  if (state.isCalculating) return;
  
  const startAddress = elements.startAddress.value.trim();
  if (!startAddress) {
    alert('Please enter a starting address');
    elements.startAddress.focus();
    return;
  }
  
  if (state.eligibleLeads.length === 0) {
    alert('No eligible leads to visit');
    return;
  }
  
  state.isCalculating = true;
  
  // Update button state with animation
  elements.calculateBtn.disabled = true;
  elements.calculateBtn.textContent = '🔄 Calculating...';
  elements.calculateBtn.style.opacity = '0.7';
  
  // Show progress section
  elements.progressSection.classList.add('visible');
  elements.resultsSection.classList.remove('visible');
  
  // Start pulsing indicator
  const indicator = document.querySelector('.calc-indicator');
  state.pulseAnimation = Animations.pulse(indicator);
  
  try {
    // Geocode start address first
    updateProgress(0, 1, 'Geocoding starting address...');
    const startCoords = await window.utilityBeltAPI.geocodeAddress(startAddress);
    
    if (!startCoords) {
      throw new Error('Could not geocode starting address');
    }
    
    // Calculate route
    updateProgress(0, 1, 'Calculating optimal route...');
    
    const options = {
      startAddress,
      startCoords,
      maxStops: parseInt(elements.maxStops.value),
      followUpDays: parseInt(elements.followUpDays.value),
      statusFilter: elements.statusFilter.value
    };
    
    state.routeResults = await window.utilityBeltAPI.calculateRoute(options);
    
    // Hide progress
    if (state.pulseAnimation) {
      state.pulseAnimation.stop();
    }
    elements.progressSection.classList.remove('visible');
    
    // Show results with animations
    await displayResults();
    
  } catch (error) {
    console.error('Route calculation failed:', error);
    alert('Route calculation failed: ' + error.message);
    
    if (state.pulseAnimation) {
      state.pulseAnimation.stop();
    }
    elements.progressSection.classList.remove('visible');
    
  } finally {
    state.isCalculating = false;
    elements.calculateBtn.disabled = false;
    elements.calculateBtn.textContent = '🧮 Calculate Optimal Route';
    elements.calculateBtn.style.opacity = '1';
  }
}

function updateProgress(current, total, message) {
  elements.progressText.textContent = message || `Processing ${current} of ${total}...`;
  
  const progress = total > 0 ? current / total : 0;
  elements.progressFill.style.transform = `scaleX(${progress})`;
}

// ============================================
// RESULTS DISPLAY
// ============================================

async function displayResults() {
  if (!state.routeResults) return;
  
  const { orderedLeads, routeStats } = state.routeResults;
  
  // Show results section
  elements.resultsSection.classList.add('visible');
  
  // Animate stats
  Animations.animateCounter(elements.totalDistance, routeStats.totalDistance, {
    duration: 1200,
    decimals: 1,
    suffix: ''
  });
  
  Animations.animateCounter(elements.stopCount, orderedLeads.length, {
    duration: 800,
    decimals: 0,
    suffix: ''
  });
  
  // Clear previous results
  elements.routeList.innerHTML = '';
  
  // Create route stop elements
  orderedLeads.forEach((lead, i) => {
    const stopEl = createRouteStopElement(lead, i);
    elements.routeList.appendChild(stopEl);
  });
  
  // Animate route stops staggered reveal
  const stops = elements.routeList.querySelectorAll('.route-stop');
  stops.forEach((stop, i) => {
    setTimeout(() => {
      stop.style.transition = 'all 400ms ease-out';
      stop.style.opacity = '1';
      stop.style.transform = 'translateX(0)';
    }, i * 80);
  });
  
  // Animate distance badges with bounce
  const badges = elements.routeList.querySelectorAll('.distance-badge');
  badges.forEach((badge, i) => {
    setTimeout(() => {
      badge.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      badge.style.transform = 'scale(1)';
    }, 300 + i * 60);
  });
  
  // Animate maps button
  setTimeout(() => {
    elements.openMapsBtn.style.animation = 'pulse-glow 2s ease-in-out infinite';
  }, orderedLeads.length * 80 + 500);
  
  // Update export status
  updateExportStatus();
}

function createRouteStopElement(lead, index) {
  const div = document.createElement('div');
  div.className = 'route-stop';
  div.dataset.leadId = lead.id;
  
  const daysSinceVisit = lead.lastVisit 
    ? Math.floor((Date.now() - new Date(lead.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : 'Never';
  
  div.innerHTML = `
    <div class="stop-number">${index + 1}</div>
    <div class="stop-info">
      <div class="stop-name">${escapeHtml(lead.name)}</div>
      <div class="stop-address">${escapeHtml(lead.address || 'No address')}</div>
      <div class="stop-meta">
        <span>Last visit: ${daysSinceVisit === 'Never' ? 'Never' : daysSinceVisit + ' days ago'}</span>
        ${lead.neighborhood ? `<span>📍 ${escapeHtml(lead.neighborhood)}</span>` : ''}
      </div>
    </div>
    ${!lead.coords ? '<span class="geocode-warning" title="Could not geocode address">⚠️</span>' : ''}
    <div class="distance-badge">${lead.distanceFromPrevious || 0} mi</div>
  `;
  
  // Click to select
  div.addEventListener('click', () => {
    document.querySelectorAll('.route-stop').forEach(s => s.classList.remove('selected'));
    div.classList.add('selected');
    
    // Animate selection
    div.style.boxShadow = '0 0 20px rgba(255,199,44,0.4)';
  });
  
  return div;
}

// ============================================
// UPDATE EXPORT STATUS
// ============================================

function updateExportStatus() {
  if (state.routeResults && state.routeResults.orderedLeads.length > 0) {
    elements.exportStatus.classList.add('ready');
    elements.exportStatus.innerHTML = `
      <span class="status-icon">✅</span>
      <span class="status-text">Ready to export ${state.routeResults.orderedLeads.length} stops</span>
    `;
    elements.exportRouteNotesBtn.disabled = false;
  } else {
    elements.exportStatus.classList.remove('ready');
    elements.exportStatus.innerHTML = `
      <span class="status-icon">ℹ️</span>
      <span class="status-text">Calculate a route first to export notes</span>
    `;
    elements.exportRouteNotesBtn.disabled = true;
  }
}

// ============================================
// ROUTE NOTES EXPORT
// ============================================

async function exportRouteNotes() {
  if (!state.routeResults || !state.routeResults.orderedLeads.length) {
    alert('No route to export. Calculate a route first!');
    return;
  }
  
  const options = {
    includeContacts: elements.includeContacts.checked,
    includeVisitHistory: elements.includeVisitHistory.checked,
    includeScores: elements.includeScores.checked
  };
  
  const html = generateMobileHTML(state.routeResults, options);
  
  try {
    const result = await window.utilityBeltAPI.saveRouteNotes(html);
    if (result.success) {
      // Show success feedback
      const btn = elements.exportRouteNotesBtn;
      const originalText = btn.textContent;
      btn.textContent = '✅ Exported!';
      btn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export notes: ' + error.message);
  }
}

function generateMobileHTML(routeResults, options) {
  const { orderedLeads, routeStats } = routeResults;
  const startAddress = elements.startAddress.value.trim();
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let stopsHTML = orderedLeads.map((lead, i) => {
    const daysSinceVisit = lead.lastVisit 
      ? Math.floor((Date.now() - new Date(lead.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Contacts section
    let contactsHTML = '';
    if (options.includeContacts && lead.contacts && lead.contacts.length > 0) {
      const contactsList = lead.contacts.map(c => `
        <div class="contact">
          <strong>${escapeHtml(c.name || 'Unknown')}</strong>
          ${c.role ? `<span class="role">${escapeHtml(c.role)}</span>` : ''}
          ${c.phone ? `<a href="tel:${c.phone}" class="phone">📞 ${escapeHtml(c.phone)}</a>` : ''}
          ${c.email ? `<a href="mailto:${c.email}" class="email">✉️ ${escapeHtml(c.email)}</a>` : ''}
        </div>
      `).join('');
      contactsHTML = `<div class="contacts-section"><h4>📇 Contacts</h4>${contactsList}</div>`;
    }
    
    // Visit history section
    let visitsHTML = '';
    if (options.includeVisitHistory && lead.visits && lead.visits.length > 0) {
      const visitsList = lead.visits.slice(0, 5).map(v => {
        const visitDate = new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const receptionIcon = v.reception === 'warm' ? '🔥' : v.reception === 'cold' ? '🧊' : '😐';
        return `
          <div class="visit">
            <div class="visit-header">
              <span class="visit-date">${visitDate}</span>
              <span class="reception">${receptionIcon} ${v.reception || 'unknown'}</span>
            </div>
            ${v.notes ? `<p class="visit-notes">${escapeHtml(v.notes)}</p>` : ''}
          </div>
        `;
      }).join('');
      visitsHTML = `<div class="visits-section"><h4>📋 Recent Visits</h4>${visitsList}</div>`;
    }
    
    // Scores section
    let scoresHTML = '';
    if (options.includeScores && lead.scores) {
      const { space, traffic, vibes } = lead.scores;
      scoresHTML = `
        <div class="scores-section">
          <span class="score">📐 Space: ${space || '-'}</span>
          <span class="score">🚶 Traffic: ${traffic || '-'}</span>
          <span class="score">✨ Vibes: ${vibes || '-'}</span>
          <span class="score total">Total: ${lead.totalScore || '-'}</span>
        </div>
      `;
    }
    
    return `
      <div class="stop" id="stop-${i + 1}">
        <div class="stop-header">
          <span class="stop-number">${i + 1}</span>
          <div class="stop-title">
            <h3>${escapeHtml(lead.name)}</h3>
            ${lead.neighborhood ? `<span class="neighborhood">📍 ${escapeHtml(lead.neighborhood)}</span>` : ''}
          </div>
        </div>
        
        <div class="address">
          <a href="https://maps.google.com/?q=${encodeURIComponent(lead.address || lead.name)}" target="_blank">
            🗺️ ${escapeHtml(lead.address || 'No address')}
          </a>
        </div>
        
        ${daysSinceVisit !== null ? `<div class="last-visit">Last visited ${daysSinceVisit} days ago</div>` : '<div class="last-visit">Never visited</div>'}
        
        ${scoresHTML}
        ${contactsHTML}
        ${visitsHTML}
        
        <div class="distance-badge">${lead.distanceFromPrevious || 0} mi from previous</div>
      </div>
    `;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>Route Notes - ${date}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #1a1a2e;
      color: #e0e0e0;
      padding: 16px;
      padding-bottom: 80px;
      line-height: 1.5;
    }
    
    header {
      text-align: center;
      padding: 20px 16px;
      background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #ffc72c;
    }
    
    h1 {
      color: #ffc72c;
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .route-date {
      color: #888;
      font-size: 14px;
    }
    
    .route-summary {
      display: flex;
      justify-content: space-around;
      background: #16213e;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .summary-stat {
      text-align: center;
    }
    
    .summary-value {
      font-size: 28px;
      font-weight: 700;
      color: #ffc72c;
    }
    
    .summary-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
    }
    
    .start-location {
      background: #2d3a5a;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    
    .start-location strong {
      color: #ffc72c;
    }
    
    .stop {
      background: #16213e;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      border-left: 4px solid #00a878;
    }
    
    .stop-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .stop-number {
      width: 36px;
      height: 36px;
      background: #00a878;
      color: #fff;
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .stop-title h3 {
      font-size: 18px;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .neighborhood {
      font-size: 13px;
      color: #888;
    }
    
    .address {
      margin-bottom: 8px;
    }
    
    .address a {
      color: #4dabf7;
      text-decoration: none;
      font-size: 14px;
    }
    
    .last-visit {
      font-size: 13px;
      color: #f39c12;
      margin-bottom: 12px;
    }
    
    .scores-section {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .score {
      background: #2d3a5a;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .score.total {
      background: #ffc72c;
      color: #1a1a2e;
      font-weight: 700;
    }
    
    .contacts-section, .visits-section {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #2d3a5a;
    }
    
    .contacts-section h4, .visits-section h4 {
      font-size: 14px;
      color: #ffc72c;
      margin-bottom: 8px;
    }
    
    .contact {
      background: #2d3a5a;
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .contact strong {
      display: block;
      color: #fff;
      margin-bottom: 4px;
    }
    
    .contact .role {
      display: block;
      font-size: 12px;
      color: #888;
      margin-bottom: 6px;
    }
    
    .contact a {
      display: inline-block;
      color: #4dabf7;
      text-decoration: none;
      font-size: 14px;
      padding: 4px 8px;
      background: rgba(77, 171, 247, 0.1);
      border-radius: 4px;
      margin-right: 8px;
      margin-top: 4px;
    }
    
    .visit {
      background: #2d3a5a;
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .visit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .visit-date {
      font-weight: 600;
      color: #fff;
      font-size: 13px;
    }
    
    .reception {
      font-size: 12px;
      text-transform: capitalize;
    }
    
    .visit-notes {
      font-size: 14px;
      color: #ccc;
      white-space: pre-wrap;
    }
    
    .distance-badge {
      display: inline-block;
      background: #00a878;
      color: #fff;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 12px;
    }
    
    /* Quick Nav */
    .quick-nav {
      position: fixed;
      bottom: 16px;
      left: 16px;
      right: 16px;
      background: #16213e;
      padding: 12px;
      border-radius: 12px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      border: 1px solid #ffc72c;
      z-index: 100;
    }
    
    .quick-nav a {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2d3a5a;
      color: #ffc72c;
      text-decoration: none;
      font-weight: 700;
      border-radius: 50%;
      font-size: 14px;
    }
    
    .quick-nav a:active {
      background: #ffc72c;
      color: #1a1a2e;
    }
  </style>
</head>
<body>
  <header>
    <h1>🚗 Route Notes</h1>
    <div class="route-date">${date}</div>
  </header>
  
  <div class="route-summary">
    <div class="summary-stat">
      <div class="summary-value">${orderedLeads.length}</div>
      <div class="summary-label">Stops</div>
    </div>
    <div class="summary-stat">
      <div class="summary-value">${routeStats.totalDistance.toFixed(1)}</div>
      <div class="summary-label">Miles</div>
    </div>
  </div>
  
  <div class="start-location">
    <strong>📍 Starting from:</strong> ${escapeHtml(startAddress)}
  </div>
  
  ${stopsHTML}
  
  <nav class="quick-nav">
    ${orderedLeads.map((_, i) => `<a href="#stop-${i + 1}">${i + 1}</a>`).join('')}
  </nav>
</body>
</html>`;
}

// ============================================
// GOOGLE MAPS EXPORT
// ============================================

function openInGoogleMaps() {
  if (!state.routeResults || !state.routeResults.orderedLeads.length) {
    alert('No route to open');
    return;
  }
  
  const startAddress = elements.startAddress.value.trim();
  const stops = [startAddress];
  
  state.routeResults.orderedLeads.forEach(lead => {
    if (lead.address) {
      stops.push(lead.address);
    }
  });
  
  const encodedStops = stops.map(addr => encodeURIComponent(addr));
  const url = `https://www.google.com/maps/dir/${encodedStops.join('/')}`;
  
  window.utilityBeltAPI.openGoogleMaps(url);
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add CSS for pulse-glow animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3); }
    50% { box-shadow: 0 4px 24px rgba(66, 133, 244, 0.6); }
  }
`;
document.head.appendChild(style);

// ============================================
// START
// ============================================

init();

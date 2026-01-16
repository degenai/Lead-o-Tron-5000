// Lookup Window Renderer Script
// Handles webview interactions and extraction

const webview = document.getElementById('googleWebview');
const extractBtn = document.getElementById('extractBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchQuery = document.getElementById('searchQuery');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

let isExtracting = false;

// Set up status updates
function setStatus(icon, text, type = '') {
  statusIcon.textContent = icon;
  statusText.textContent = text;
  statusText.className = 'status-text' + (type ? ` ${type}` : '');
}

function setLoading(show, text = '') {
  if (show) {
    loadingOverlay.classList.remove('hidden');
    if (text) loadingText.textContent = text;
  } else {
    loadingOverlay.classList.add('hidden');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Get search parameters from the URL
  const params = new URLSearchParams(window.location.search);
  const businessName = params.get('business') || '';
  const location = params.get('location') || '';
  
  const query = `${businessName} ${location}`.trim();
  searchQuery.textContent = query ? `"${query}"` : 'No search query';
  
  if (query) {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    webview.src = googleUrl;
  }
});

// Webview event handlers
webview.addEventListener('did-start-loading', () => {
  setStatus('🔄', 'Loading...', 'loading');
  setLoading(true, 'Loading search results...');
  extractBtn.disabled = true;
});

webview.addEventListener('did-stop-loading', () => {
  setStatus('✅', 'Page loaded - find the Knowledge Panel and click Extract', 'success');
  setLoading(false);
  extractBtn.disabled = false;
});

webview.addEventListener('did-fail-load', (event) => {
  if (event.errorCode !== -3) { // Ignore aborted loads
    setStatus('❌', `Failed to load: ${event.errorDescription}`, 'error');
    setLoading(false);
  }
});

// Extract button click
extractBtn.addEventListener('click', async () => {
  if (isExtracting) return;
  isExtracting = true;
  
  extractBtn.disabled = true;
  setStatus('🤖', 'Extracting data from page...', 'loading');
  setLoading(true, 'Extracting business information...');
  
  try {
    // Inject the scraper script and execute it
    const result = await webview.executeJavaScript(`
      (function() {
        const result = {
          name: null,
          address: null,
          phone: null,
          hours: null,
          rating: null,
          reviewCount: null,
          businessType: null,
          website: null,
          rawText: null
        };
        
        // Try to find Knowledge Panel data using various selectors
        // Business name
        const nameSelectors = [
          '[data-attrid="title"]',
          '.PZPZlf span',
          '.qrShPb span',
          'h2[data-attrid="title"]',
          '.SPZz6b h2 span'
        ];
        for (const sel of nameSelectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim()) {
            result.name = el.textContent.trim();
            break;
          }
        }
        
        // Address - filter out label-only text like "Address:"
        const addressSelectors = [
          '[data-attrid*="address"] span',
          '.LrzXr',
          '[data-item-id="address"] .AeaXub',
          'a[data-dtype="d3adr"] span',
          '[data-attrid="kc:/location/location:address"] span',
          '[data-attrid*="address"] .sXlaZc',
          '.Z1hOCe .AeaXub'
        ];
        for (const sel of addressSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            const text = el.textContent.trim();
            // Must contain a number (street address) and be longer than a label
            const hasAddressContent = /\\d/.test(text) && text.length > 10;
            const isJustLabel = /^address:?$/i.test(text);
            if (hasAddressContent && !isJustLabel) {
              result.address = text;
              break;
            }
          }
        }
        
        // Phone
        const phoneSelectors = [
          '[data-attrid*="phone"] span',
          'a[href^="tel:"]',
          '[data-dtype="d3ph"]',
          '[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"] span'
        ];
        for (const sel of phoneSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            const text = el.textContent.trim();
            // Extract phone number pattern
            const phoneMatch = text.match(/[\\(]?\\d{3}[\\)]?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/);
            if (phoneMatch) {
              result.phone = phoneMatch[0];
              break;
            }
          }
        }
        
        // Hours
        const hoursSelectors = [
          '[data-attrid*="hours"]',
          '.WgFkxc',
          '[data-attrid="kc:/location/location:hours"] span',
          '.t39EBf'
        ];
        for (const sel of hoursSelectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim()) {
            result.hours = el.textContent.trim().substring(0, 200);
            break;
          }
        }
        
        // Rating
        const ratingEl = document.querySelector('.Aq14fc, [data-attrid*="rating"] span');
        if (ratingEl) {
          const text = ratingEl.textContent.trim();
          const ratingMatch = text.match(/([\\d.]+)/);
          if (ratingMatch) result.rating = ratingMatch[1];
        }
        
        // Review count
        const reviewEl = document.querySelector('.hqzQac span, [data-attrid*="review"] span');
        if (reviewEl) {
          const text = reviewEl.textContent;
          const countMatch = text.match(/([\\d,]+)\\s*review/i);
          if (countMatch) result.reviewCount = countMatch[1].replace(',', '');
        }
        
        // Business type
        const typeSelectors = [
          '.YhemCb',
          '.YYKmNd',
          '[data-attrid*="subtitle"] span',
          '.SPZz6b span.YhemCb'
        ];
        for (const sel of typeSelectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent.trim()) {
            result.businessType = el.textContent.trim();
            break;
          }
        }
        
        // Website
        const websiteEl = document.querySelector('a[data-attrid*="website"], a.ab_button[href*="http"]');
        if (websiteEl && websiteEl.href) {
          result.website = websiteEl.href;
        }
        
        // Fallback: grab all Knowledge Panel text
        const panel = document.querySelector('.kp-wholepage, .liYKde, .I6TXqe, .kp-header');
        if (panel) {
          result.rawText = panel.innerText.substring(0, 2000);
        }
        
        // If no panel found, try getting the right sidebar
        if (!result.rawText) {
          const sidebar = document.querySelector('#rhs, .knowledge-panel');
          if (sidebar) {
            result.rawText = sidebar.innerText.substring(0, 2000);
          }
        }
        
        return result;
      })();
    `);
    
    // Send result back to main process
    window.lookupAPI.sendExtractedData(result);
    
    setStatus('✅', 'Data extracted! Parsing...', 'success');
    setLoading(true, 'Sending to AI for parsing...');
    
  } catch (error) {
    setStatus('❌', `Extraction failed: ${error.message}`, 'error');
    setLoading(false);
    isExtracting = false;
    extractBtn.disabled = false;
  }
});

// Cancel button click
cancelBtn.addEventListener('click', () => {
  window.lookupAPI.cancel();
});

// Listen for close signal from main process
window.lookupAPI.onClose(() => {
  window.close();
});

// Listen for status updates from main process
window.lookupAPI.onStatus((icon, text, type) => {
  setStatus(icon, text, type);
  if (type === 'success' || type === 'error') {
    setLoading(false);
  }
});

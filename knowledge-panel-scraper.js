// Knowledge Panel Scraper
// Extracts business information from Google Search Knowledge Panel
// This module exports the scraper function for use in tests and the lookup window

/**
 * Scrapes business information from a Google Search page.
 * Designed to be executed in a browser context (webview or page).
 * 
 * @param {Document} doc - The document object to scrape from (defaults to global document)
 * @returns {Object} Extracted business data
 */
function scrapeKnowledgePanel(doc = document) {
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

  // Helper to find first matching element
  function findFirst(selectors) {
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el && el.textContent.trim()) {
        return el;
      }
    }
    return null;
  }

  // Business name selectors
  const nameSelectors = [
    '[data-attrid="title"]',
    '.PZPZlf span',
    '.qrShPb span',
    'h2[data-attrid="title"]',
    '.SPZz6b h2 span'
  ];
  const nameEl = findFirst(nameSelectors);
  if (nameEl) result.name = nameEl.textContent.trim();

  // Address selectors - need to filter out label-only text like "Address:"
  const addressSelectors = [
    '[data-attrid*="address"] span',
    '.LrzXr',
    '[data-item-id="address"] .AeaXub',
    'a[data-dtype="d3adr"] span',
    '[data-attrid="kc:/location/location:address"] span',
    // Additional selectors for address content
    '[data-attrid*="address"] .sXlaZc',
    '.Z1hOCe .AeaXub'
  ];
  for (const sel of addressSelectors) {
    const el = doc.querySelector(sel);
    if (el) {
      const text = el.textContent.trim();
      // Filter out label-only text - must contain a number (street address) or zip code pattern
      const hasAddressContent = /\d/.test(text) && text.length > 10;
      const isJustLabel = /^address:?$/i.test(text);
      if (hasAddressContent && !isJustLabel) {
        result.address = text;
        break;
      }
    }
  }

  // Phone - need to extract pattern
  const phoneSelectors = [
    '[data-attrid*="phone"] span',
    'a[href^="tel:"]',
    '[data-dtype="d3ph"]',
    '[data-attrid="kc:/collection/knowledge_panels/has_phone:phone"] span'
  ];
  for (const sel of phoneSelectors) {
    const el = doc.querySelector(sel);
    if (el) {
      const text = el.textContent.trim();
      const phoneMatch = text.match(/[\(]?\d{3}[\)]?[-.\s]?\d{3}[-.\s]?\d{4}/);
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
  const hoursEl = findFirst(hoursSelectors);
  if (hoursEl) result.hours = hoursEl.textContent.trim().substring(0, 200);

  // Rating
  const ratingEl = doc.querySelector('.Aq14fc, [data-attrid*="rating"] span');
  if (ratingEl) {
    const text = ratingEl.textContent.trim();
    const ratingMatch = text.match(/([\d.]+)/);
    if (ratingMatch) result.rating = ratingMatch[1];
  }

  // Review count
  const reviewEl = doc.querySelector('.hqzQac span, [data-attrid*="review"] span');
  if (reviewEl) {
    const text = reviewEl.textContent;
    const countMatch = text.match(/([\d,]+)\s*review/i);
    if (countMatch) result.reviewCount = countMatch[1].replace(',', '');
  }

  // Business type
  const typeSelectors = [
    '.YhemCb',
    '.YYKmNd',
    '[data-attrid*="subtitle"] span',
    '.SPZz6b span.YhemCb'
  ];
  const typeEl = findFirst(typeSelectors);
  if (typeEl) result.businessType = typeEl.textContent.trim();

  // Website
  const websiteEl = doc.querySelector('a[data-attrid*="website"], a.ab_button[href*="http"]');
  if (websiteEl && websiteEl.href) {
    result.website = websiteEl.href;
  }

  // Fallback: grab all Knowledge Panel text
  const panelSelectors = ['.kp-wholepage', '.liYKde', '.I6TXqe', '.kp-header'];
  for (const sel of panelSelectors) {
    const panel = doc.querySelector(sel);
    if (panel) {
      result.rawText = panel.innerText.substring(0, 2000);
      break;
    }
  }

  // If no panel found, try getting the right sidebar
  if (!result.rawText) {
    const sidebar = doc.querySelector('#rhs, .knowledge-panel');
    if (sidebar) {
      result.rawText = sidebar.innerText.substring(0, 2000);
    }
  }

  return result;
}

/**
 * Returns the scraper function as a string for injection into a webview.
 * @returns {string} JavaScript code string
 */
function getScraperScript() {
  return `(${scrapeKnowledgePanel.toString()})()`;
}

/**
 * Checks if extracted data has useful business information.
 * @param {Object} data - Extracted data from scrapeKnowledgePanel
 * @returns {boolean} True if at least one useful field has data
 */
function hasUsefulData(data) {
  const usefulFields = ['name', 'address', 'phone', 'hours', 'businessType'];
  return usefulFields.some(field => data[field] && data[field].trim());
}

// Export for Node.js (testing) or make available in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scrapeKnowledgePanel,
    getScraperScript,
    hasUsefulData
  };
}

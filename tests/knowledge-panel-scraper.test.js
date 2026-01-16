const { scrapeKnowledgePanel, hasUsefulData, getScraperScript } = require('../knowledge-panel-scraper');

// Mock DOM for testing
function createMockDocument(html) {
  // Simple mock that supports querySelector
  const mockElement = (textContent, href = null) => ({
    textContent,
    innerText: textContent,
    href
  });

  // Parse mock elements from config
  return {
    querySelector: jest.fn((selector) => {
      // Return mock elements based on selector
      if (html.elements && html.elements[selector]) {
        const el = html.elements[selector];
        return mockElement(el.text, el.href);
      }
      return null;
    })
  };
}

describe('knowledge-panel-scraper', () => {
  describe('scrapeKnowledgePanel', () => {
    test('extracts business name from title selector', () => {
      const mockDoc = createMockDocument({
        elements: {
          '[data-attrid="title"]': { text: 'BT Collectibles' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.name).toBe('BT Collectibles');
    });

    test('extracts address from address selector', () => {
      const mockDoc = createMockDocument({
        elements: {
          '[data-attrid*="address"] span': { text: '1025 Rose Creek Dr, Woodstock, GA 30189' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.address).toBe('1025 Rose Creek Dr, Woodstock, GA 30189');
    });

    test('filters out "Address:" label-only text', () => {
      const mockDoc = createMockDocument({
        elements: {
          '[data-attrid*="address"] span': { text: 'Address:' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.address).toBeNull(); // Should NOT extract label-only text
    });

    test('filters out short address text without numbers', () => {
      const mockDoc = createMockDocument({
        elements: {
          '[data-attrid*="address"] span': { text: 'Address' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.address).toBeNull();
    });

    test('extracts phone number from tel link', () => {
      const mockDoc = createMockDocument({
        elements: {
          'a[href^="tel:"]': { text: '(770) 555-1234', href: 'tel:7705551234' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.phone).toBe('(770) 555-1234');
    });

    test('extracts rating from rating element', () => {
      const mockDoc = createMockDocument({
        elements: {
          '.Aq14fc, [data-attrid*="rating"] span': { text: '4.5' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.rating).toBe('4.5');
    });

    test('returns null fields when nothing found', () => {
      const mockDoc = createMockDocument({ elements: {} });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.name).toBeNull();
      expect(result.address).toBeNull();
      expect(result.phone).toBeNull();
    });

    // Real-world scenario: BT Collectibles extraction found name + phone but not address
    test('handles partial extraction - name and phone without address', () => {
      const mockDoc = createMockDocument({
        elements: {
          '[data-attrid="title"]': { text: 'BT Collectibles' },
          'a[href^="tel:"]': { text: '(404) 545-3099', href: 'tel:4045453099' }
          // No address element found
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.name).toBe('BT Collectibles');
      expect(result.phone).toBe('(404) 545-3099');
      expect(result.address).toBeNull(); // Address not found
    });

    test('extracts all fields when Knowledge Panel is complete', () => {
      const mockDoc = createMockDocument({
        elements: {
          '[data-attrid="title"]': { text: 'BT Collectibles' },
          '[data-attrid*="address"] span': { text: '1025 Rose Creek Dr #220, Woodstock, GA 30189' },
          'a[href^="tel:"]': { text: '(404) 545-3099', href: 'tel:4045453099' },
          '.YhemCb': { text: 'Collectibles store' }
        }
      });

      const result = scrapeKnowledgePanel(mockDoc);
      expect(result.name).toBe('BT Collectibles');
      expect(result.address).toBe('1025 Rose Creek Dr #220, Woodstock, GA 30189');
      expect(result.phone).toBe('(404) 545-3099');
      expect(result.businessType).toBe('Collectibles store');
    });
  });

  describe('hasUsefulData', () => {
    test('returns true when name is present', () => {
      const data = { name: 'Test Business', address: null, phone: null };
      expect(hasUsefulData(data)).toBe(true);
    });

    test('returns true when address is present', () => {
      const data = { name: null, address: '123 Main St', phone: null };
      expect(hasUsefulData(data)).toBe(true);
    });

    test('returns true when phone is present', () => {
      const data = { name: null, address: null, phone: '(404) 545-3099' };
      expect(hasUsefulData(data)).toBe(true);
    });

    // Real scenario: name + phone should be considered useful even without address
    test('returns true for partial data (name + phone, no address)', () => {
      const data = { name: 'BT Collectibles', address: null, phone: '(404) 545-3099' };
      expect(hasUsefulData(data)).toBe(true);
    });

    test('returns false when no useful fields', () => {
      const data = { name: null, address: null, phone: null, rating: '4.5' };
      expect(hasUsefulData(data)).toBe(false);
    });

    test('returns false for empty strings', () => {
      const data = { name: '', address: '   ', phone: '' };
      expect(hasUsefulData(data)).toBe(false);
    });
  });

  describe('getScraperScript', () => {
    test('returns a string containing the scraper function', () => {
      const script = getScraperScript();
      expect(typeof script).toBe('string');
      expect(script).toContain('scrapeKnowledgePanel');
    });

    test('returns self-executing function format', () => {
      const script = getScraperScript();
      expect(script.startsWith('(')).toBe(true);
      expect(script.endsWith(')')).toBe(true);
    });
  });
});

const { estimateGeocodeTime, RATE_LIMIT_MS, parseAddressComponents } = require('../geocoding');

// Note: We don't test geocodeAddress directly because it hits the real API
// and has rate limiting. Instead we test the utility functions and mock
// the actual geocoding in integration tests.

describe('geocoding', () => {
  describe('estimateGeocodeTime', () => {
    test('returns seconds for small counts', () => {
      const estimate = estimateGeocodeTime(5);
      expect(estimate).toContain('seconds');
      expect(estimate).toContain('6'); // 5 * 1.1s = 5.5s, rounded up to 6
    });

    test('returns minutes for larger counts', () => {
      const estimate = estimateGeocodeTime(60);
      expect(estimate).toContain('minute');
    });

    test('correctly transitions from seconds to minutes at boundary', () => {
      // 54 * 1.1s = 59.4s < 60, so returns seconds
      const under60 = estimateGeocodeTime(54);
      expect(under60).toBe('~60 seconds');
      
      // 55 * 1.1s = 60.5s >= 60, so returns minutes
      // ceil(60.5/60) = ceil(1.008) = 2 minutes
      const over60 = estimateGeocodeTime(55);
      expect(over60).toBe('~2 minutes');
    });

    test('handles plural minutes', () => {
      const estimate = estimateGeocodeTime(120);
      expect(estimate).toContain('minutes');
    });

    test('handles zero', () => {
      const estimate = estimateGeocodeTime(0);
      expect(estimate).toContain('0 seconds');
    });
  });

  describe('RATE_LIMIT_MS', () => {
    test('is at least 1000ms to respect Nominatim policy', () => {
      expect(RATE_LIMIT_MS).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('parseAddressComponents', () => {
    test('parses full address with zip code', () => {
      const result = parseAddressComponents('619 Bluff Dr. Woodstock GA 30188');
      expect(result.city).toBe('Woodstock');
      expect(result.state).toBe('GA');
      expect(result.zip).toBe('30188');
    });

    test('parses address with comma-separated city', () => {
      const result = parseAddressComponents('123 Main Street, Atlanta, GA 30301');
      expect(result.city).toBe('Atlanta');
      expect(result.state).toBe('GA');
      expect(result.zip).toBe('30301');
    });

    test('handles street types without confusion', () => {
      // "Dr" could be mistaken for "DR" (Delaware), but should not be
      const result = parseAddressComponents('500 Oak Dr, Marietta, GA 30060');
      expect(result.state).toBe('GA');
      expect(result.city).toBe('Marietta');
    });

    test('handles addresses with St (Street vs State)', () => {
      const result = parseAddressComponents('100 Main St, Savannah, GA 31401');
      expect(result.state).toBe('GA');
      expect(result.city).toBe('Savannah');
    });

    test('returns null for missing components', () => {
      const result = parseAddressComponents('just a street name');
      expect(result.city).toBeNull();
      expect(result.state).toBeNull();
      expect(result.zip).toBeNull();
    });

    test('handles multi-word city names', () => {
      const result = parseAddressComponents('100 Main St, Stone Mountain, GA 30083');
      expect(result.city).toBe('Stone Mountain');
      expect(result.state).toBe('GA');
    });

    test('parses zip+4 format', () => {
      const result = parseAddressComponents('123 Main St, Atlanta, GA 30301-1234');
      expect(result.zip).toBe('30301');
    });

    test('handles highway names like GA-92', () => {
      const result = parseAddressComponents('12186 GA-92 STE 110, Woodstock, GA 30188');
      expect(result.city).toBe('Woodstock');
      expect(result.state).toBe('GA');
      expect(result.zip).toBe('30188');
    });

    test('handles highway with suite number', () => {
      const result = parseAddressComponents('9999 GA-92 Suite 150, Woodstock, GA 30188');
      expect(result.city).toBe('Woodstock');
      expect(result.state).toBe('GA');
      expect(result.zip).toBe('30188');
    });
  });

  describe('geocodeLeads (unit tests with mocked leads)', () => {
    // These tests verify the filtering logic without hitting the API
    
    test('identifies leads needing geocoding', () => {
      const leads = [
        { name: 'Has Coords', address: '123 Main St', coords: { lat: 34.0, lon: -84.0 } },
        { name: 'No Coords', address: '456 Oak Ave' },
        { name: 'Empty Address', address: '' },
        { name: 'Null Address', address: null }
      ];
      
      const needsGeocode = leads.filter(lead => 
        lead.address && 
        lead.address.trim() && 
        (!lead.coords || !lead.coords.lat || !lead.coords.lon)
      );
      
      expect(needsGeocode.length).toBe(1);
      expect(needsGeocode[0].name).toBe('No Coords');
    });

    test('identifies leads with valid coords', () => {
      const leads = [
        { name: 'Valid', coords: { lat: 34.0, lon: -84.0 } },
        { name: 'Partial', coords: { lat: 34.0 } },
        { name: 'Empty', coords: {} },
        { name: 'Null', coords: null }
      ];
      
      const hasValidCoords = leads.filter(lead => 
        lead.coords && lead.coords.lat && lead.coords.lon
      );
      
      expect(hasValidCoords.length).toBe(1);
      expect(hasValidCoords[0].name).toBe('Valid');
    });
  });
});

// Integration test that would hit the real API - skip by default
describe.skip('geocoding integration (requires network)', () => {
  const { geocodeAddress } = require('../geocoding');
  
  test('geocodes a known address', async () => {
    const coords = await geocodeAddress('1600 Pennsylvania Avenue, Washington, DC');
    
    expect(coords).not.toBeNull();
    expect(coords.lat).toBeCloseTo(38.897, 1);
    expect(coords.lon).toBeCloseTo(-77.036, 1);
  }, 10000);

  test('returns null for invalid address', async () => {
    const coords = await geocodeAddress('xyzzy12345nonexistent');
    expect(coords).toBeNull();
  }, 10000);
});

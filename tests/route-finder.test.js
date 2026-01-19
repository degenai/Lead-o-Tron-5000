const {
  haversineDistance,
  buildDistanceMatrix,
  selectNearestLeads,
  nearestNeighborTSP,
  twoOptImprove,
  routeDistance,
  solveRoute,
  generateGoogleMapsUrl
} = require('../route-finder');

describe('route-finder', () => {
  describe('haversineDistance', () => {
    test('returns 0 for same coordinates', () => {
      const dist = haversineDistance(34.0, -84.0, 34.0, -84.0);
      expect(dist).toBe(0);
    });

    test('calculates distance between Atlanta and Woodstock (~30 miles)', () => {
      // Atlanta: 33.749, -84.388
      // Woodstock: 34.101, -84.519
      const dist = haversineDistance(33.749, -84.388, 34.101, -84.519);
      expect(dist).toBeGreaterThan(20);
      expect(dist).toBeLessThan(35);
    });

    test('calculates distance between NYC and LA (~2450 miles)', () => {
      // NYC: 40.7128, -74.0060
      // LA: 34.0522, -118.2437
      const dist = haversineDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(dist).toBeGreaterThan(2400);
      expect(dist).toBeLessThan(2500);
    });

    test('handles negative coordinates', () => {
      // Sydney: -33.8688, 151.2093
      // Auckland: -36.8485, 174.7633
      const dist = haversineDistance(-33.8688, 151.2093, -36.8485, 174.7633);
      expect(dist).toBeGreaterThan(1300);
      expect(dist).toBeLessThan(1400);
    });
  });

  describe('buildDistanceMatrix', () => {
    test('builds symmetric matrix', () => {
      const locations = [
        { lat: 34.0, lon: -84.0 },
        { lat: 34.1, lon: -84.1 },
        { lat: 34.2, lon: -84.2 }
      ];
      const matrix = buildDistanceMatrix(locations);
      
      expect(matrix.length).toBe(3);
      expect(matrix[0][1]).toBe(matrix[1][0]);
      expect(matrix[0][2]).toBe(matrix[2][0]);
      expect(matrix[1][2]).toBe(matrix[2][1]);
    });

    test('diagonal is all zeros', () => {
      const locations = [
        { lat: 34.0, lon: -84.0 },
        { lat: 34.1, lon: -84.1 }
      ];
      const matrix = buildDistanceMatrix(locations);
      
      expect(matrix[0][0]).toBe(0);
      expect(matrix[1][1]).toBe(0);
    });
  });

  describe('selectNearestLeads', () => {
    test('returns all leads if count is less than maxLeads', () => {
      const start = { lat: 34.0, lon: -84.0 };
      const leads = [
        { id: '1', coords: { lat: 34.1, lon: -84.1 } },
        { id: '2', coords: { lat: 34.2, lon: -84.2 } }
      ];
      
      const selected = selectNearestLeads(start, leads, 5);
      expect(selected.length).toBe(2);
    });

    test('selects nearest leads when count exceeds maxLeads', () => {
      const start = { lat: 34.0, lon: -84.0 };
      const leads = [
        { id: 'far', coords: { lat: 35.0, lon: -85.0 } },
        { id: 'near', coords: { lat: 34.05, lon: -84.05 } },
        { id: 'medium', coords: { lat: 34.2, lon: -84.2 } }
      ];
      
      const selected = selectNearestLeads(start, leads, 2);
      expect(selected.length).toBe(2);
      expect(selected[0].id).toBe('near');
      expect(selected[1].id).toBe('medium');
    });
  });

  describe('nearestNeighborTSP', () => {
    test('visits all locations starting from index 0', () => {
      // Simple 3-location case
      const distMatrix = [
        [0, 1, 10],
        [1, 0, 2],
        [10, 2, 0]
      ];
      
      const route = nearestNeighborTSP(distMatrix, 0);
      
      expect(route.length).toBe(3);
      expect(route[0]).toBe(0); // Starts at 0
      expect(new Set(route).size).toBe(3); // All unique
    });

    test('picks nearest unvisited at each step', () => {
      const distMatrix = [
        [0, 1, 100],
        [1, 0, 2],
        [100, 2, 0]
      ];
      
      const route = nearestNeighborTSP(distMatrix, 0);
      
      // From 0, nearest is 1 (distance 1)
      // From 1, nearest unvisited is 2 (distance 2)
      expect(route).toEqual([0, 1, 2]);
    });
  });

  describe('routeDistance', () => {
    test('calculates total route distance', () => {
      const distMatrix = [
        [0, 5, 10],
        [5, 0, 3],
        [10, 3, 0]
      ];
      const route = [0, 1, 2];
      
      const total = routeDistance(route, distMatrix);
      expect(total).toBe(8); // 5 + 3
    });
  });

  describe('twoOptImprove', () => {
    test('improves a suboptimal route', () => {
      // Classic 2-opt improvement case: crossing paths
      // 0 -> 2 -> 1 -> 3 is worse than 0 -> 1 -> 2 -> 3 for a line of points
      const distMatrix = [
        [0, 1, 2, 3],
        [1, 0, 1, 2],
        [2, 1, 0, 1],
        [3, 2, 1, 0]
      ];
      
      const badRoute = [0, 2, 1, 3];
      const improved = twoOptImprove(badRoute, distMatrix);
      
      const badDist = routeDistance(badRoute, distMatrix);
      const improvedDist = routeDistance(improved, distMatrix);
      
      expect(improvedDist).toBeLessThanOrEqual(badDist);
    });

    test('keeps start point fixed', () => {
      const distMatrix = [
        [0, 1, 2],
        [1, 0, 1],
        [2, 1, 0]
      ];
      
      const route = [0, 2, 1];
      const improved = twoOptImprove(route, distMatrix);
      
      expect(improved[0]).toBe(0);
    });
  });

  describe('solveRoute', () => {
    test('returns empty result for no valid leads', () => {
      const start = { lat: 34.0, lon: -84.0 };
      const leads = [
        { id: '1', address: '123 Main St' }, // No coords
        { id: '2', coords: null }
      ];
      
      const result = solveRoute(start, leads, 10);
      
      expect(result.orderedLeads).toEqual([]);
      expect(result.routeStats.leadsIncluded).toBe(0);
      expect(result.routeStats.leadsSkipped).toBe(2);
    });

    test('returns ordered leads with distances', () => {
      const start = { lat: 34.0, lon: -84.0 };
      const leads = [
        { id: '1', name: 'Far Place', coords: { lat: 34.5, lon: -84.5 } },
        { id: '2', name: 'Near Place', coords: { lat: 34.05, lon: -84.05 } }
      ];
      
      const result = solveRoute(start, leads, 10);
      
      expect(result.orderedLeads.length).toBe(2);
      expect(result.orderedLeads[0]).toHaveProperty('routeOrder');
      expect(result.orderedLeads[0]).toHaveProperty('distanceFromPrevious');
      expect(result.routeStats.totalDistance).toBeGreaterThan(0);
    });

    test('respects maxLeads limit', () => {
      const start = { lat: 34.0, lon: -84.0 };
      const leads = [
        { id: '1', coords: { lat: 34.1, lon: -84.1 } },
        { id: '2', coords: { lat: 34.2, lon: -84.2 } },
        { id: '3', coords: { lat: 34.3, lon: -84.3 } },
        { id: '4', coords: { lat: 34.4, lon: -84.4 } }
      ];
      
      const result = solveRoute(start, leads, 2);
      
      expect(result.orderedLeads.length).toBe(2);
      expect(result.routeStats.leadsIncluded).toBe(2);
    });
  });

  describe('generateGoogleMapsUrl', () => {
    test('generates valid URL with encoded addresses', () => {
      const startAddress = '123 Main St, Atlanta, GA';
      const orderedLeads = [
        { address: '456 Oak Ave, Woodstock, GA' },
        { address: '789 Pine Rd, Roswell, GA' }
      ];
      
      const url = generateGoogleMapsUrl(startAddress, orderedLeads);
      
      expect(url).toContain('https://www.google.com/maps/dir/');
      expect(url).toContain(encodeURIComponent('123 Main St, Atlanta, GA'));
      expect(url).toContain(encodeURIComponent('456 Oak Ave, Woodstock, GA'));
      expect(url).toContain(encodeURIComponent('789 Pine Rd, Roswell, GA'));
    });

    test('handles special characters in addresses', () => {
      const startAddress = '123 O\'Brien St #100';
      const orderedLeads = [
        { address: '456 Main & Oak, Suite 200' }
      ];
      
      const url = generateGoogleMapsUrl(startAddress, orderedLeads);
      
      expect(url).toContain(encodeURIComponent("123 O'Brien St #100"));
    });
  });
});

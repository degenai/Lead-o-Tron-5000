const { normalizeLeadsData, normalizeVisit } = require('../data-normalizer');
const { STATUS, RECEPTION, DEFAULTS } = require('../constants');

describe('normalizeLeadsData', () => {
  test('migrates legacy flat contact fields into contacts array', () => {
    const legacy = {
      leads: [
        {
          name: 'Legacy Lead',
          contactName: 'Casey',
          contactRole: 'Manager',
          phone: '555-1111',
          email: 'casey@example.com',
          scores: { space: 4, traffic: 3, vibes: 2 }
        }
      ],
      activityLog: []
    };

    const { data, needsSave } = normalizeLeadsData(legacy);
    const lead = data.leads[0];

    expect(needsSave).toBe(true);
    expect(lead.contacts).toHaveLength(1);
    expect(lead.contacts[0]).toMatchObject({
      name: 'Casey',
      role: 'Manager',
      phone: '555-1111',
      email: 'casey@example.com',
      isPrimary: true
    });
    expect(lead.contactName).toBeUndefined();
    expect(lead.contactRole).toBeUndefined();
    expect(lead.phone).toBeUndefined();
    expect(lead.email).toBeUndefined();
    expect(lead.totalScore).toBe(9);
  });

  test('fills missing arrays and defaults scores', () => {
    const input = { leads: [{}] };
    const { data, needsSave } = normalizeLeadsData(input);
    const lead = data.leads[0];

    expect(needsSave).toBe(true);
    expect(lead.contacts).toEqual([]);
    expect(lead.visits).toEqual([]);
    expect(lead.scores).toEqual({ space: 3, traffic: 3, vibes: 3 });
    expect(lead.totalScore).toBe(9);
    expect(typeof lead.created).toBe('string');
  });

  test('normalizes activity log entries without messages', () => {
    const input = {
      leads: [],
      activityLog: [
        { timestamp: '2024-01-01T00:00:00.000Z', message: 'ok' },
        { timestamp: '2024-01-02T00:00:00.000Z' },
        null
      ]
    };

    const { data, needsSave } = normalizeLeadsData(input);
    expect(needsSave).toBe(true);
    expect(data.activityLog).toHaveLength(1);
    expect(data.activityLog[0]).toMatchObject({ message: 'ok' });
  });

  test('ensures exactly one primary contact', () => {
    const input = {
      leads: [
        {
          name: 'Primary Check',
          contacts: [
            { name: 'A', isPrimary: true },
            { name: 'B', isPrimary: true }
          ]
        },
        {
          name: 'No Primary',
          contacts: [
            { name: 'C' },
            { name: 'D' }
          ]
        }
      ],
      activityLog: []
    };

    const { data } = normalizeLeadsData(input);
    const [first, second] = data.leads;

    expect(first.contacts.filter(c => c.isPrimary)).toHaveLength(1);
    expect(first.contacts[0].isPrimary).toBe(true);

    expect(second.contacts.filter(c => c.isPrimary)).toHaveLength(1);
    expect(second.contacts[0].isPrimary).toBe(true);
  });

  // Edge case tests for malformed data
  describe('edge cases', () => {
    test('handles null input', () => {
      const { data, needsSave } = normalizeLeadsData(null);
      expect(data.leads).toEqual([]);
      expect(data.activityLog).toEqual([]);
      expect(needsSave).toBe(true);
    });

    test('handles undefined input', () => {
      const { data, needsSave } = normalizeLeadsData(undefined);
      expect(data.leads).toEqual([]);
      expect(data.activityLog).toEqual([]);
      expect(needsSave).toBe(true);
    });

    test('handles empty object input', () => {
      const { data, needsSave } = normalizeLeadsData({});
      expect(data.leads).toEqual([]);
      expect(data.activityLog).toEqual([]);
      expect(needsSave).toBe(true);
    });

    test('handles invalid status values', () => {
      const input = {
        leads: [
          { name: 'Invalid Status', status: 'invalid' },
          { name: 'Number Status', status: 123 },
          { name: 'Null Status', status: null }
        ]
      };
      const { data, needsSave } = normalizeLeadsData(input);
      
      expect(needsSave).toBe(true);
      expect(data.leads[0].status).toBe(DEFAULTS.STATUS);
      expect(data.leads[1].status).toBe(DEFAULTS.STATUS);
      expect(data.leads[2].status).toBe(DEFAULTS.STATUS);
    });

    test('preserves valid status values', () => {
      const input = {
        leads: [
          { name: 'Active', status: STATUS.ACTIVE },
          { name: 'Converted', status: STATUS.CONVERTED },
          { name: 'Archived', status: STATUS.ARCHIVED }
        ]
      };
      const { data } = normalizeLeadsData(input);
      
      expect(data.leads[0].status).toBe(STATUS.ACTIVE);
      expect(data.leads[1].status).toBe(STATUS.CONVERTED);
      expect(data.leads[2].status).toBe(STATUS.ARCHIVED);
    });

    test('handles malformed visits array', () => {
      const input = {
        leads: [{
          name: 'Malformed Visits',
          visits: [
            null,
            undefined,
            { date: '2024-01-01' },
            'not an object'
          ]
        }]
      };
      const { data, needsSave } = normalizeLeadsData(input);
      
      expect(needsSave).toBe(true);
      expect(data.leads[0].visits).toHaveLength(4);
      // All should have valid structure after normalization
      data.leads[0].visits.forEach(visit => {
        expect(visit).toHaveProperty('date');
        expect(visit).toHaveProperty('notes');
        expect(visit).toHaveProperty('reception');
      });
    });

    test('handles invalid scores', () => {
      const input = {
        leads: [{
          name: 'Invalid Scores',
          scores: { space: 'high', traffic: null, vibes: undefined }
        }]
      };
      const { data } = normalizeLeadsData(input);
      
      expect(data.leads[0].scores).toEqual({ space: 3, traffic: 3, vibes: 3 });
      expect(data.leads[0].totalScore).toBe(9);
    });

    test('handles missing scores object', () => {
      const input = {
        leads: [{ name: 'No Scores' }]
      };
      const { data } = normalizeLeadsData(input);
      
      expect(data.leads[0].scores).toEqual({ space: 3, traffic: 3, vibes: 3 });
      expect(data.leads[0].totalScore).toBe(9);
    });

    test('handles non-string name values', () => {
      const input = {
        leads: [
          { name: 123 },
          { name: null },
          { name: { nested: 'object' } }
        ]
      };
      const { data } = normalizeLeadsData(input);
      
      expect(typeof data.leads[0].name).toBe('string');
      expect(typeof data.leads[1].name).toBe('string');
      expect(typeof data.leads[2].name).toBe('string');
    });
  });
});

describe('normalizeVisit', () => {
  test('handles invalid reception values', () => {
    const { visit, changed } = normalizeVisit({ 
      date: '2024-01-01', 
      notes: 'test', 
      reception: 'invalid' 
    });
    
    expect(changed).toBe(true);
    expect(visit.reception).toBe(DEFAULTS.RECEPTION);
  });

  test('preserves valid reception values', () => {
    const warmVisit = normalizeVisit({ date: '2024-01-01', reception: RECEPTION.WARM });
    const coldVisit = normalizeVisit({ date: '2024-01-01', reception: RECEPTION.COLD });
    
    expect(warmVisit.visit.reception).toBe(RECEPTION.WARM);
    expect(coldVisit.visit.reception).toBe(RECEPTION.COLD);
  });

  test('handles null visit input', () => {
    const { visit, changed } = normalizeVisit(null);
    
    expect(changed).toBe(true);
    expect(visit).toHaveProperty('date');
    expect(visit).toHaveProperty('notes');
    expect(visit.reception).toBe(DEFAULTS.RECEPTION);
  });

  test('handles undefined visit input', () => {
    const { visit, changed } = normalizeVisit(undefined);
    
    expect(changed).toBe(true);
    expect(visit.reception).toBe(DEFAULTS.RECEPTION);
  });
});

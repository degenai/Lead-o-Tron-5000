const { normalizeLeadsData } = require('../data-normalizer');

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
});

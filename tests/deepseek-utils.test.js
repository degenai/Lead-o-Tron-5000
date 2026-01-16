const { buildDeepseekRequestBody, parseDeepseekContent, buildParseRequestBody } = require('../deepseek-utils');

describe('deepseek-utils', () => {
  describe('buildDeepseekRequestBody', () => {
    test('includes thinking, web_search, and location context', () => {
      const body = buildDeepseekRequestBody({
        businessName: 'BT Collectables',
        existingNeighborhoods: ['Towne Lake'],
        zipcode: '30189',
        location: 'Woodstock, GA'
      });

      expect(body.thinking).toEqual({ type: 'enabled' });
      expect(body.web_search).toEqual({ enable: true });
      expect(body.messages[1].content).toContain('in Woodstock, GA 30189');
      expect(body.messages[0].content).toContain('Google Maps');
      expect(body.temperature).toBe(0);
    });

    test('handles missing location gracefully', () => {
      const body = buildDeepseekRequestBody({
        businessName: 'Test Business',
        existingNeighborhoods: [],
        zipcode: '',
        location: ''
      });

      expect(body.messages[1].content).not.toContain('in ');
    });
  });

  describe('parseDeepseekContent', () => {
    test('parses JSON and returns data', () => {
      const content = JSON.stringify({
        address: '1025 Rose Creek Dr Suit 220',
        neighborhood: 'Towne Lake',
        phone: '(404) 545-3099'
      });

      const result = parseDeepseekContent(content);
      expect(result.data.address).toContain('1025 Rose Creek');
      expect(result.warning).toBeUndefined();
    });

    test('returns warning when data has no useful fields', () => {
      const result = parseDeepseekContent('{}');
      expect(result.data).toEqual({});
      expect(result.warning).toBe('No business details found');
    });

    test('handles markdown-wrapped JSON', () => {
      const content = '```json\n{"address":"123 Main St"}\n```';
      const result = parseDeepseekContent(content);
      expect(result.data.address).toBe('123 Main St');
    });
  });

  describe('buildParseRequestBody', () => {
    test('creates request body without web_search', () => {
      const body = buildParseRequestBody('BT Collectibles\n1025 Rose Creek Dr');
      
      // Should NOT have web_search
      expect(body.web_search).toBeUndefined();
      
      // Should have the extracted text in user message
      expect(body.messages[1].content).toContain('BT Collectibles');
      expect(body.messages[1].content).toContain('1025 Rose Creek Dr');
      
      // Should use temperature 0 for consistency
      expect(body.temperature).toBe(0);
    });

    test('includes neighborhood hints when provided', () => {
      const body = buildParseRequestBody(
        'Some business text',
        ['Towne Lake', 'Downtown']
      );
      
      expect(body.messages[0].content).toContain('Towne Lake');
      expect(body.messages[0].content).toContain('Downtown');
    });

    test('creates valid JSON structure prompt', () => {
      const body = buildParseRequestBody('Test text');
      
      // System prompt should describe expected JSON format
      expect(body.messages[0].content).toContain('correctName');
      expect(body.messages[0].content).toContain('address');
      expect(body.messages[0].content).toContain('phone');
      expect(body.messages[0].content).toContain('hours');
      expect(body.messages[0].content).toContain('confidence');
    });

    test('instructs not to guess missing data', () => {
      const body = buildParseRequestBody('Test text');
      
      expect(body.messages[0].content).toContain('empty string');
      expect(body.messages[0].content).toContain('Do not guess');
    });
  });
});

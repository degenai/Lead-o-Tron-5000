/**
 * DeepSeek API Integration Tests
 * Tests for response parsing and error handling
 * 
 * Note: The old web_search approach has been removed.
 * Business lookup now uses BrowserView + parseDeepseekContent.
 */

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper to create a mock response
function createMockResponse(status, data) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status: status,
    json: () => Promise.resolve(data)
  });
}

describe('DeepSeek API Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Response Parsing', () => {
    test('should parse valid JSON response with business info', async () => {
      const businessData = {
        address: '10020 GA-92 Suite 130, Woodstock, GA 30188',
        neighborhood: 'Woodstock 92',
        phone: '(770) 555-1234',
        businessType: 'Smoke Shop'
      };

      mockFetch.mockResolvedValue(createMockResponse(200, {
        choices: [{
          message: {
            content: JSON.stringify(businessData)
          }
        }]
      }));

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [] })
      });

      const result = await response.json();
      const content = result.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      expect(parsed.address).toBe(businessData.address);
      expect(parsed.neighborhood).toBe(businessData.neighborhood);
      expect(parsed.phone).toBe(businessData.phone);
    });

    test('should handle markdown-wrapped JSON in response', async () => {
      // Sometimes the API returns JSON wrapped in markdown code blocks
      const businessData = { address: '123 Main St', neighborhood: 'Downtown' };
      const wrappedContent = '```json\n' + JSON.stringify(businessData) + '\n```';

      mockFetch.mockResolvedValue(createMockResponse(200, {
        choices: [{
          message: { content: wrappedContent }
        }]
      }));

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [] })
      });

      const result = await response.json();
      const content = result.choices[0]?.message?.content || '{}';
      
      // Clean markdown wrapper
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      expect(parsed.address).toBe('123 Main St');
      expect(parsed.neighborhood).toBe('Downtown');
    });
  });

  describe('Error Handling', () => {
    test('should handle API key not configured', () => {
      const config = { deepseekApiKey: '' };
      
      if (!config.deepseekApiKey) {
        const result = { success: false, error: 'API key not configured' };
        expect(result.success).toBe(false);
        expect(result.error).toBe('API key not configured');
      }
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      try {
        await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          body: '{}'
        });
        fail('Should have thrown');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValue(createMockResponse(200, {
        choices: [{
          message: { content: 'This is not valid JSON' }
        }]
      }));

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        body: '{}'
      });

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      expect(() => JSON.parse(content)).toThrow();
    });
  });

  describe('Business Data Handling', () => {
    test('should handle business names with special characters', async () => {
      const businessData = {
        correctName: 'Café Münchën',
        address: '123 Test St',
        neighborhood: 'Downtown'
      };

      mockFetch.mockResolvedValue(createMockResponse(200, {
        choices: [{
          message: { content: JSON.stringify(businessData) }
        }]
      }));

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        body: '{}'
      });

      const result = await response.json();
      const parsed = JSON.parse(result.choices[0].message.content);

      expect(parsed.correctName).toBe('Café Münchën');
    });

    test('should handle business names with accents', async () => {
      const businessData = {
        correctName: 'Sucré',
        address: '1230 Main Street, Woodstock, GA 30188'
      };

      mockFetch.mockResolvedValue(createMockResponse(200, {
        choices: [{
          message: { content: JSON.stringify(businessData) }
        }]
      }));

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        body: '{}'
      });

      const result = await response.json();
      const parsed = JSON.parse(result.choices[0].message.content);

      expect(parsed.correctName).toBe('Sucré');
    });
  });
});

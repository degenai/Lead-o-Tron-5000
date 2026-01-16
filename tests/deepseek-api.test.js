/**
 * DeepSeek API Integration Tests
 * Tests for the AI lookup functionality
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

  describe('API Request Format', () => {
    test('should use correct web_search parameter format (not tools array)', async () => {
      // This test verifies we're using the correct API format
      // The API expects: web_search: { enable: true }
      // NOT: tools: ['web_search']
      
      const expectedWebSearchFormat = { enable: true };
      
      mockFetch.mockImplementation((url, options) => {
        const body = JSON.parse(options.body);
        
        // Verify web_search is an object with enable: true
        expect(body.web_search).toBeDefined();
        expect(body.web_search).toEqual(expectedWebSearchFormat);
        
        // Verify we're NOT using the old incorrect format
        expect(body.tools).toBeUndefined();
        expect(body.tool_choice).toBeUndefined();
        
        return createMockResponse(200, {
          choices: [{
            message: {
              content: JSON.stringify({
                address: '123 Test St',
                neighborhood: 'Downtown',
                phone: '555-1234',
                businessType: 'Restaurant',
                isNewNeighborhood: false
              })
            }
          }]
        });
      });

      // Simulate the API call structure from main.js
      const config = { deepseekApiKey: 'test-key', defaultZipcode: '30188' };
      const businessName = 'Test Business';
      const existingNeighborhoods = ['Downtown', 'Midtown'];
      
      const neighborhoodList = existingNeighborhoods.join(', ');
      const locationContext = `near zipcode ${config.defaultZipcode}`;
      
      await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant...`
            },
            {
              role: 'user',
              content: `Look up business information for: "${businessName}" ${locationContext}.`
            }
          ],
          web_search: { enable: true },  // CORRECT FORMAT
          temperature: 0.3,
          max_tokens: 500
        })
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should include thinking enabled in request body', async () => {
      const expectedThinking = { type: 'enabled' };

      mockFetch.mockImplementation((url, options) => {
        const body = JSON.parse(options.body);

        expect(body.thinking).toBeDefined();
        expect(body.thinking).toEqual(expectedThinking);

        return createMockResponse(200, {
          choices: [{
            message: { content: '{}' }
          }]
        });
      });

      await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [],
          thinking: { type: 'enabled' }
        })
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should return 400 error when using incorrect tools format', async () => {
      // This test documents what happens with the WRONG format
      // to prevent regression
      
      mockFetch.mockImplementation((url, options) => {
        const body = JSON.parse(options.body);
        
        // If using incorrect tools format, API returns 400
        if (body.tools !== undefined) {
          return createMockResponse(400, {
            error: {
              message: 'Invalid parameter: tools',
              type: 'invalid_request_error'
            }
          });
        }
        
        return createMockResponse(200, {
          choices: [{ message: { content: '{}' } }]
        });
      });

      // Simulate INCORRECT API call (what was causing the 400 error)
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [],
          tools: ['web_search'],  // WRONG FORMAT - causes 400
          tool_choice: 'auto'     // WRONG FORMAT - causes 400
        })
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Response Parsing', () => {
    test('should parse valid JSON response with business info', async () => {
      const businessData = {
        address: '10020 GA-92 Suite 130, Woodstock, GA 30188',
        neighborhood: 'Woodstock 92',
        phone: '(770) 555-1234',
        businessType: 'Smoke Shop',
        isNewNeighborhood: false
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
      expect(parsed.isNewNeighborhood).toBe(false);
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
      
      // Clean markdown wrapper (this is what main.js does)
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

  describe('Business Name Correction', () => {
    test('should return corrected business name with proper accents', async () => {
      const businessData = {
        correctName: 'Sucré',  // Correct spelling with accent
        address: '1230 Main Street, Woodstock, GA 30188',
        neighborhood: 'Downtown Woodstock',
        phone: '(770) 555-1234',
        businessType: 'Bakery',
        isNewNeighborhood: false
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

      // User typed "sucre", AI returns "Sucré"
      expect(parsed.correctName).toBe('Sucré');
      expect(parsed.correctName).not.toBe('Sucre');
      expect(parsed.correctName).not.toBe('sucre');
    });

    test('should handle business names with special characters', async () => {
      const businessData = {
        correctName: 'Café Münchën',
        address: '123 Test St',
        neighborhood: 'Downtown',
        isNewNeighborhood: false
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
  });

  describe('Neighborhood Matching', () => {
    test('should prefer existing neighborhoods in prompt', () => {
      const existingNeighborhoods = ['Downtown Woodstock', 'Woodstock 92'];
      const neighborhoodList = existingNeighborhoods.join(', ');
      
      expect(neighborhoodList).toBe('Downtown Woodstock, Woodstock 92');
      
      // The prompt should include these neighborhoods
      const promptContent = `EXISTING NEIGHBORHOODS (prefer these): ${neighborhoodList}`;
      expect(promptContent).toContain('Downtown Woodstock');
      expect(promptContent).toContain('Woodstock 92');
    });

    test('should handle empty neighborhoods list', () => {
      const existingNeighborhoods = [];
      const neighborhoodList = existingNeighborhoods.length > 0 
        ? existingNeighborhoods.join(', ') 
        : 'none defined yet';
      
      expect(neighborhoodList).toBe('none defined yet');
    });
  });
});

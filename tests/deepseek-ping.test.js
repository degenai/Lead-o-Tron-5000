require('dotenv').config();
const https = require('https');

function pingDeepseek(apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.deepseek.com',
        path: '/models',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode, body });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

describe('DeepSeek API Ping', () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    test('skipped: DEEPSEEK_API_KEY not set', () => {
      expect(true).toBe(true);
    });
    return;
  }

  test('responds to /models with 200', async () => {
    const response = await pingDeepseek(apiKey);
    expect(response.status).toBe(200);
  }, 20000);
});

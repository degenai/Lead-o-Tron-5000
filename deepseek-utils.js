const USEFUL_FIELDS = ['correctName', 'address', 'neighborhood', 'phone', 'businessType'];

/**
 * @deprecated Use BrowserView lookup with buildParseRequestBody instead.
 * This function uses DeepSeek's unreliable web_search feature.
 * Kept for backward compatibility only.
 */
function buildDeepseekRequestBody({ businessName, existingNeighborhoods, zipcode, location }) {
  const neighborhoodList = existingNeighborhoods.length > 0
    ? existingNeighborhoods.join(', ')
    : 'none defined yet';

  // Build location context from both location (city/state) and zipcode
  const locationParts = [];
  if (location) locationParts.push(location);
  if (zipcode) locationParts.push(zipcode);
  const locationContext = locationParts.length > 0
    ? `in ${locationParts.join(' ')}`
    : '';

  return {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that looks up local business information. Use web search to find accurate, current information.

CRITICAL: Only return information you can verify from Google Maps, Google Business Profile, or the business's official website. If you cannot find the exact business at the specified location, return empty strings rather than guessing.

Return ONLY valid JSON with no markdown formatting or code blocks. Return this exact structure:
{
  "correctName": "the official/correct business name with proper spelling, accents, capitalization",
  "address": "full street address from Google Maps or empty string if not found",
  "neighborhood": "area/district name - PREFER choosing from existing neighborhoods if applicable",
  "phone": "business phone number or empty string",
  "businessType": "type of business or empty string",
  "isNewNeighborhood": true/false (true only if suggesting a neighborhood not in the existing list),
  "confidence": "high/medium/low - based on how certain you are this is the correct business",
  "source": "where you found this info (e.g., 'Google Maps', 'business website') or empty string"
}

IMPORTANT RULES:
1. If you find multiple businesses with similar names, pick the one closest to the provided location.
2. If you're not confident this is the right business, set confidence to "low" or return empty strings.
3. Always verify the address is in the correct city/state before returning it.

EXISTING NEIGHBORHOODS (prefer these): ${neighborhoodList}

Only suggest a new neighborhood if the business location clearly doesn't fit any existing ones.`
      },
      {
        role: 'user',
        content: `Look up business information for: "${businessName}" ${locationContext}. Search Google Maps or Google Business Profile for the current address, phone number, and details. If you cannot find this specific business at this location, return empty strings. Return only the JSON object.`
      }
    ],
    thinking: { type: 'enabled' },
    web_search: { enable: true },
    temperature: 0,
    max_tokens: 600
  };
}

function parseDeepseekContent(content) {
  const cleaned = String(content ?? '').replace(/```json\n?|\n?```/g, '').trim();
  if (!cleaned) {
    return { data: {}, warning: 'No business details found' };
  }

  const parsed = JSON.parse(cleaned);
  const businessInfo = parsed && typeof parsed === 'object' ? parsed : {};
  const hasUsefulData = USEFUL_FIELDS.some((key) => {
    return typeof businessInfo[key] === 'string' && businessInfo[key].trim();
  });

  return {
    data: businessInfo,
    warning: hasUsefulData ? undefined : 'No business details found'
  };
}

/**
 * Build a request body for DeepSeek to PARSE extracted text into structured JSON.
 * This does NOT use web_search - it only parses text that was already scraped.
 * 
 * @param {string} extractedText - Raw text from Google Knowledge Panel or similar
 * @param {string[]} existingNeighborhoods - Optional list of known neighborhoods
 * @returns {Object} Request body for DeepSeek API
 */
function buildParseRequestBody(extractedText, existingNeighborhoods = []) {
  const neighborhoodHint = existingNeighborhoods.length > 0
    ? `\n\nKNOWN NEIGHBORHOODS (prefer these if applicable): ${existingNeighborhoods.join(', ')}`
    : '';

  return {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `You are a data extraction assistant. Parse the provided text (scraped from a Google search result) and extract business information.

Return ONLY valid JSON with no markdown formatting or code blocks. Use this exact structure:
{
  "correctName": "the business name exactly as shown",
  "address": "full street address or empty string",
  "neighborhood": "area/district if mentioned or empty string",
  "phone": "phone number in format (XXX) XXX-XXXX or empty string",
  "hours": "business hours summary or empty string",
  "businessType": "type of business or empty string",
  "rating": "star rating if shown (e.g., '4.5') or empty string",
  "reviewCount": "number of reviews if shown or empty string",
  "website": "website URL if shown or empty string",
  "confidence": "high/medium/low based on data quality"
}

RULES:
1. Only extract information that is clearly present in the text
2. Do not guess or infer missing information - use empty strings
3. Clean up formatting (remove extra whitespace, normalize phone numbers)
4. If the text appears to be an error page or CAPTCHA, return all empty strings with confidence "low"${neighborhoodHint}`
      },
      {
        role: 'user',
        content: `Extract business information from this text:\n\n${extractedText}`
      }
    ],
    temperature: 0,
    max_tokens: 500
  };
}

module.exports = {
  buildDeepseekRequestBody,
  parseDeepseekContent,
  buildParseRequestBody
};

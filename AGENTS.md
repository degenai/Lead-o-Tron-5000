# Agent Notes

## Architecture Overview

Lead-o-Tron 5000 is an Electron desktop application for tracking door-to-door outreach leads.

### Process Structure
- **Main Process** (`main.js`): Handles file I/O, IPC communication, window management, and DeepSeek API calls
- **Renderer Process** (`renderer.js`): UI logic, event handling, and form management
- **Lookup Window**: Separate BrowserWindow with its own preload and renderer for AI-powered business lookup

### Key Modules
- `data-normalizer.js` - Normalizes and migrates lead data, ensures schema compliance
- `deepseek-utils.js` - DeepSeek API request/response handling (parsing scraped text, not web search)
- `knowledge-panel-scraper.js` - DOM scraping logic for Google Knowledge Panels
- `constants.js` - Shared constants for status values, reception values, and defaults

### AI Lookup System
The business lookup uses a BrowserView-powered approach:
1. Opens a visible browser window with Google search
2. User navigates to the correct business listing
3. Client-side scraper extracts Knowledge Panel data
4. DeepSeek parses raw text into structured JSON (no web_search - it's unreliable)

### Data Storage
Data is stored in JSON files in the user's app data directory:
- `leads.json` - All leads and activity log
- `config.json` - User settings (API key, default location, etc.)

---

## Data Schema

### Lead Object
```javascript
{
  id: string,           // UUID
  name: string,         // Business name
  address: string,      // Full address
  neighborhood: string, // Area/district
  status: 'active' | 'converted' | 'archived',
  created: string,      // ISO date
  lastVisit: string,    // ISO date or null
  aiEnhanced: boolean,  // Whether AI has enhanced this lead
  contacts: Contact[],  // Array of contacts
  visits: Visit[],      // Array of visits
  scores: {
    space: number,      // 1-5 rating
    traffic: number,    // 1-5 rating
    vibes: number       // 1-5 rating
  },
  totalScore: number    // Computed sum of scores
}
```

### Contact Object
```javascript
{
  id: string,           // UUID
  name: string,         // Contact name
  role: string,         // Position/title
  phone: string,        // Phone number
  email: string,        // Email address
  isPrimary: boolean    // Whether this is the primary contact
}
```

### Visit Object
```javascript
{
  date: string,         // ISO date
  notes: string,        // Visit notes
  reception: 'warm' | 'lukewarm' | 'cold'
}
```

---

## Data Compatibility
- Lead JSON files are backward compatible. On load, the app normalizes legacy fields (flat contact fields) into the current `contacts` array and fills missing required fields.
- Migrations run on load and save back in the latest format; avoid dropping unknown fields or data.
- Invalid status/reception values are replaced with defaults (see `constants.js`)

## AI Autofill Behavior
- AI autofill is treated as a spellcheck assistant: it should not overwrite user-entered fields and should only fill empty fields.
- When AI finds a phone number but no contacts exist, it creates a contact named "Main Phone"
- Confidence levels (high/medium/low) indicate data quality; warnings are shown for missing addresses

## Development

### Running Tests
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

### Test-Driven Bug Fixing Procedure
When fixing bugs, follow this process:
1. **Write a test** that reproduces or catches the issue
2. **Run the test** to confirm it fails (or documents the expected behavior)
3. **Fix the code**
4. **Run the test again** to verify the fix
5. **Run all tests** to check for regressions

This ensures fixes are verified and prevents regressions.

### Environment Variables
Create a `.env` file with:
```
deepseekApiKey=your-api-key-here
```

### Key Directories
- `tests/` - Jest test files
- User data: `%APPDATA%/lead-o-tron-5000/` (Windows)

---

## Known Gotchas

### Lookup Window Scraper
The scraper code in `lookup-renderer.js` is **intentionally inlined** rather than imported from `knowledge-panel-scraper.js`. This is because:
- Electron's sandboxed preload scripts cannot `require()` local modules reliably
- The scraper must be a self-contained string for `webview.executeJavaScript()`
- `knowledge-panel-scraper.js` exists for unit testing the scraper logic

**If updating selectors**: Update BOTH `lookup-renderer.js` (inline script) AND `knowledge-panel-scraper.js` (for tests).

### Node.js vs Electron Contexts
- **Main process**: Full Node.js, can use `require()`, `fs`, etc.
- **Renderer process**: Browser-like, uses preload bridge for Node access
- **Preload scripts**: Sandboxed, limited `require()` - avoid importing local modules
- **Webview content**: Runs in Google's page context, must be self-contained JavaScript strings
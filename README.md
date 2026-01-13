# Lead-o-Tron 5000 💪

**Personal CRM for The People's Elbow - Door-to-door outreach tracking**

A lightweight desktop app for tracking business outreach visits for chair massage card distribution. Built with the same mutual aid spirit as [peoples-elbow.com](https://peoples-elbow.com).

## Features

### Core Functionality
- 📋 **Lead Management** - Track businesses with contact info, addresses, and notes
- 📍 **Neighborhood Filtering** - Organize leads by geographic area
- 🎯 **Scoring System** - Rate venues on Space, Traffic, and Vibes (1-5 each)
- 📝 **Visit History** - Log visits with notes and reception tracking
- 💾 **Local JSON Storage** - Human-readable, easy to backup/transfer

### Visual Indicators
Time-based badges showing urgency:
- 🟢 Green: Visited within 1 week
- 🟡 Yellow: 1-2 weeks ago
- 🟠 Orange: 2-3 weeks ago
- 🔴 Red: 3-4 weeks ago
- 🟣 Purple: 1-2 months ago
- ⚫ Black: 2+ months (needs attention)

Reception indicators:
- 🔥 Warm
- 🌤️ Lukewarm
- ❄️ Cold

### Filters
- Status (Active/Converted/Archived)
- Time since last visit
- Neighborhood/area
- Minimum score threshold
- Last reception type
- Full-text search

### AI Integration (DeepSeek)
- Auto-fill address and neighborhood for new businesses
- AI-enhanced fields are clearly marked
- Works offline (AI features gracefully degrade)

### Data Management
- Auto-save on every change
- Export/Import JSON backups
- Activity log console

## Installation

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## Usage

### Adding a Lead
1. Click **"+ New Lead"** button
2. Enter business name (required)
3. Optionally click **"🤖 AI Lookup"** to auto-fill address/neighborhood
4. Set scores and add a quick visit if desired
5. Save

### Logging Visits
1. Click on a lead to open the detail panel
2. Click **"+ Log New Visit"**
3. Add notes and set reception (warm/lukewarm/cold)

### Filtering
Use the sidebar to filter by:
- Status
- Time since visit
- Neighborhood
- Minimum score
- Last reception

### Data Location
Your data is stored in:
- **Windows**: `%APPDATA%/lead-o-tron-5000/leads.json`
- **macOS**: `~/Library/Application Support/lead-o-tron-5000/leads.json`
- **Linux**: `~/.config/lead-o-tron-5000/leads.json`

### API Key Setup
1. Click the ⚙️ settings button
2. Enter your DeepSeek API key
3. Get a key at: https://platform.deepseek.com

## Data Model

```json
{
  "id": "uuid",
  "name": "Business Name",
  "address": "Full address",
  "neighborhood": "Area/district",
  "contactName": "Person I talked to",
  "contactRole": "Their role",
  "phone": "optional",
  "email": "optional",
  "visits": [
    {
      "date": "ISO date",
      "notes": "Free text notes",
      "reception": "warm|lukewarm|cold"
    }
  ],
  "scores": {
    "space": 1-5,
    "traffic": 1-5,
    "vibes": 1-5
  },
  "totalScore": 3-15,
  "status": "active|converted|archived",
  "created": "ISO date",
  "lastVisit": "ISO date"
}
```

## Tech Stack

- **Electron** - Desktop app framework
- **Vanilla JS** - No frameworks, just clean JavaScript
- **CSS Variables** - People's Elbow green/gold theme
- **DeepSeek API** - AI-powered business lookup

## Theme

Colors inspired by [peoples-elbow.com](https://peoples-elbow.com):
- 🟢 Wrestling Green: `#0d5c2e`
- 🟡 Championship Gold: `#ffc72c`

---

*Fighting the Forces of Tension, one elbow at a time!* 💪

**Built with mutual aid principles for The People's Elbow**

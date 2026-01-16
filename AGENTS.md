# Agent Notes

## Data Compatibility
- Lead JSON files are backward compatible. On load, the app normalizes legacy fields (flat contact fields) into the current `contacts` array and fills missing required fields.
- Migrations run on load and save back in the latest format; avoid dropping unknown fields or data.

## AI Autofill Behavior
- AI autofill is treated as a spellcheck assistant: it should not overwrite user-entered fields and should only fill empty fields.

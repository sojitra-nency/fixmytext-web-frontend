# Adding a New Tool (Frontend)

> How to register a new text tool in the FixMyText frontend.

## Overview

The frontend defines all 200+ tools as data objects in `src/constants/tools.js`. The UI renders tools dynamically from this array. Every new tool needs an entry here.

| Tool Type | Files to Change |
|-----------|----------------|
| `api` / `ai` / `select` | `tools.js` (backend endpoint must exist) |
| `local` | `tools.js` only (runs in browser) |
| `action` / `drawer` | `tools.js` + possibly a new component |

## Step 1: Plan Your Tool

Choose a unique snake_case `id` (e.g., `reverse_words`).

Verify uniqueness:
```bash
grep -c "id: 'reverse_words'" src/constants/tools.js
# Should return 0
```

Pick one of 14 **groups**: `case`, `cleanup`, `encoding`, `lines`, `ciphers`, `developer`, `ai_writing`, `ai_content`, `language`, `generate`, `utility`, `hashing`, `compare`, `escaping`

Pick a **type**:
| Type | Description |
|------|-------------|
| `api` | Calls backend text_service (most common) |
| `ai` | Calls backend AI service via Groq |
| `local` | Runs entirely in browser, no API call |
| `select` | Dropdown with options sent to backend |
| `action` | Triggers a side effect (copy, export) |
| `drawer` | Opens a specialized panel component |

## Step 2: Add the Tool Definition

File: `src/constants/tools.js`

Add your tool object in the appropriate group section:

```javascript
{
  id: 'reverse_words',
  label: 'Reverse Words',
  description: 'Reverses the order of words on each line',
  icon: 'icon-refresh',
  color: 'purple',
  group: 'lines',
  tabs: ['transform'],
  type: 'api',
  endpoint: '/api/v1/text/reverse-words',
  successMsg: 'Words reversed!',
  keywords: ['flip', 'invert', 'word', 'order']
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique snake_case ID. Also used as `operation` in API responses |
| `label` | string | Display name shown in the tool list and search |
| `description` | string | Tooltip text. Also indexed for tool search |
| `icon` | string | Icon key (see existing tools for available icons) |
| `color` | string | Theme color for the tool card (blue, green, purple, etc.) |
| `group` | string | Category key, one of the 14 groups listed above |
| `tabs` | string[] | Which tabs show this tool, usually `['transform']` |
| `type` | string | Tool type: `api`, `ai`, `local`, `select`, `action`, `drawer` |
| `endpoint` | string | Backend route path. Must exactly match the FastAPI route |
| `successMsg` | string | Toast notification after successful transformation |
| `keywords` | string[] | Extra search terms beyond label and description |

## Step 3: Verify Endpoint Match

For `api` and `ai` tools, the `endpoint` field must exactly match the backend FastAPI route:
- Your `endpoint`: `/api/v1/text/reverse-words`
- Backend route: `@router.post("/reverse-words")` under the `/api/v1/text` prefix

If the backend endpoint doesn't exist yet, see the backend repo's `docs/adding-a-tool.md`.

## Step 4: Test

1. Run `npm run dev`
2. Open http://localhost:3000
3. Search for your tool name in the tool search
4. Verify it appears in the correct category
5. Enter sample text, click the tool, verify the result

## Checklist

- [ ] `id` is unique in `tools.js`
- [ ] `endpoint` matches the backend route exactly (for api/ai types)
- [ ] `group` is one of the 14 valid categories
- [ ] `type` is correct for how the tool works
- [ ] `successMsg` is clear and user-friendly
- [ ] Tool appears in search results
- [ ] Tool works end-to-end with the backend

# Metadata Tracking System Documentation

## Overview
A comprehensive metadata tracking system for the Prompt Library application that automatically tracks and displays important information about each prompt, including AI model used, timestamps, and token estimates.

## Features Implemented

### 1. Core Functions

#### `estimateTokens(text, isCode)`
Estimates the token count for a given text.

**Parameters:**
- `text` (string): The text to estimate tokens for
- `isCode` (boolean): Whether the text is code-related (applies 1.3x multiplier)

**Returns:**
```javascript
{
  min: number,        // Minimum estimated tokens (0.75 * word_count)
  max: number,        // Maximum estimated tokens (0.25 * char_count)
  confidence: string  // 'high' (<1000), 'medium' (1000-5000), 'low' (>5000)
}
```

**Algorithm:**
- Base calculation: `min = 0.75 * word_count`, `max = 0.25 * character_count`
- Code multiplier: Both values × 1.3 if `isCode=true`
- Confidence based on average token count

#### `trackModel(modelName, content, isCode)`
Creates a complete metadata object for a new prompt.

**Parameters:**
- `modelName` (string): AI model name (max 100 characters, non-empty)
- `content` (string): Prompt content for token estimation
- `isCode` (boolean): Whether content is code-related

**Returns:**
```javascript
{
  model: string,
  createdAt: string,      // ISO 8601 format
  updatedAt: string,      // ISO 8601 format
  tokenEstimate: {
    min: number,
    max: number,
    confidence: 'high' | 'medium' | 'low'
  }
}
```

**Throws:**
- Error if model name is invalid (empty, too long, not a string)
- Error if content is invalid

#### `updateTimestamps(metadata)`
Updates the `updatedAt` timestamp in existing metadata.

**Parameters:**
- `metadata` (object): Existing metadata object with `createdAt` field

**Returns:**
- Updated metadata object with new `updatedAt` timestamp

**Validation:**
- Ensures `updatedAt >= createdAt`
- Validates ISO 8601 format for timestamps

### 2. UI Components

#### Model Input Field
- Added to the prompt form
- Required field, max 100 characters
- Placeholder: "e.g., GPT-4, Claude 3, Gemini Pro..."

#### Code Checkbox
- Checkbox to indicate if prompt is code-related
- Applies 1.3x multiplier to token estimates

#### Metadata Display
Each prompt card now displays:

**Model Badge** 🤖
- Shows the AI model name
- Teal color with hover effect

**Token Estimate Badge** 📊
- Shows token range (min-max)
- Color-coded by confidence:
  - **Green**: High confidence (<1000 tokens)
  - **Yellow**: Medium confidence (1000-5000 tokens)
  - **Red**: Low confidence (>5000 tokens)

**Timestamps** 📅
- Created date (always shown)
- Updated date (shown only if different from created)
- Human-readable format: "Dec 26, 2:30 PM"

### 3. Data Migration

The system automatically migrates old prompts without metadata:
- Assigns "Unknown Model" as the model name
- Calculates token estimates based on existing content
- Preserves original `createdAt` timestamp if available
- Sets `isCode=false` for legacy prompts

### 4. Sorting

Prompts are now sorted by creation date (newest first) using the metadata's `createdAt` field.

## Validation Rules

### Model Name
- ✅ Non-empty string
- ✅ Maximum 100 characters
- ✅ Trimmed of whitespace
- ❌ Throws error if empty, null, or exceeds limit

### Timestamps
- ✅ ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- ✅ `updatedAt` must be >= `createdAt`
- ❌ Throws error for invalid dates

### Content
- ✅ Non-empty string
- ❌ Throws error if empty or not a string

## Error Handling

All metadata functions include try/catch blocks:
- User-friendly error messages via `alert()`
- Console logging for debugging
- Graceful degradation for legacy data

## Visual Design

### Color Scheme
- **Model Badge**: Teal (#64ffda) - matches app theme
- **High Confidence**: Green (#4ade80)
- **Medium Confidence**: Yellow (#fbbf24)
- **Low Confidence**: Red (#f87171)

### Layout
- Metadata container with subtle background
- Badges in flexible row layout
- Responsive design for mobile devices
- Hover effects for interactivity

## Usage Example

```javascript
// Creating metadata for a new prompt
const metadata = trackModel('GPT-4', 'Write a function to...', true);
// Returns:
// {
//   model: 'GPT-4',
//   createdAt: '2025-12-26T10:30:00.000Z',
//   updatedAt: '2025-12-26T10:30:00.000Z',
//   tokenEstimate: {
//     min: 8,
//     max: 7,
//     confidence: 'high'
//   }
// }

// Updating timestamps
const updatedMetadata = updateTimestamps(metadata);
// Returns same object with new updatedAt timestamp

// Token estimation
const tokens = estimateTokens('Hello world', false);
// Returns:
// {
//   min: 2,     // 0.75 * 2 words
//   max: 3,     // 0.25 * 11 characters
//   confidence: 'high'
// }
```

## Browser Compatibility

- Pure JavaScript (ES6+)
- No external dependencies
- Works in all modern browsers
- Uses localStorage for persistence

## Future Enhancements

Potential improvements:
1. Edit metadata after creation
2. Filter/sort by model or token count
3. Export metadata as JSON/CSV
4. Model usage statistics
5. Token usage analytics
6. Custom token estimation algorithms per model
7. API integration for accurate token counts

## Testing

To test the system:
1. Open the Prompt Library in a browser
2. Fill in the form with:
   - Title: "Test Prompt"
   - Model: "GPT-4"
   - Content: "Generate a sorting algorithm"
   - Check "This is a code-related prompt"
3. Click "Save Prompt"
4. Observe the metadata display in the prompt card
5. Verify color-coding and token estimates

## Technical Notes

- Token estimation is approximate and varies by actual model tokenizer
- Timestamps use UTC timezone
- All data stored in browser's localStorage
- Migration happens automatically on page load


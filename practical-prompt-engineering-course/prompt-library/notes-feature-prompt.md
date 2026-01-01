# Notes Section Feature Implementation Prompt

Build a notes management system for a prompt library application where users can add, edit, save, and delete notes for each prompt with the following requirements:

## Technical Specifications

**Core Functionality:**

- Collapsible notes section within each prompt card (expand/collapse toggle)
- "Add Note" button that reveals a textarea input
- Save button to persist new notes to the prompt
- Edit mode for existing notes (click to edit inline)
- Delete button for individual notes (no confirmation dialog for simplicity)
- Timestamp display for when each note was created
- Character limit of 500 characters per note with live counter

**Visual Requirements:**

- Notes section appears below the star rating in each prompt card
- Collapsed state shows "Notes (3)" badge with note count
- Expanded state displays all notes in a scrollable container
- Each note displayed in a light card with timestamp and action buttons
- Empty state message: "No notes yet. Click 'Add Note' to get started."
- Visual feedback: smooth expand/collapse animation (0.3s ease)

## Implementation Details

**User Interactions:**

1. Click "Notes" badge to expand/collapse the notes section
2. Click "Add Note" button to show textarea input field
3. Type note content with live character counter (e.g., "245/500")
4. Click "Save" to add note, or "Cancel" to discard
5. Click pencil icon on existing note to enter edit mode
6. Click trash icon to immediately delete note
7. Section auto-collapses when empty

**Data Flow:**

- Notes stored in prompt's `notes` array in localStorage
- Each note save triggers prompt card re-render
- Deletion updates localStorage and refreshes display
- Edit mode replaces note text with textarea, preserves timestamp

**CSS Specifications:**

- Notes badge: small pill shape, subtle background (#3a3a4e)
- Expanded section: max-height 300px with custom scrollbar
- Note cards: lighter background than prompt card (#353548)
- Edit/Delete icons: small (14px), appear on note hover
- Character counter: gray when under limit, red when at limit
- Smooth transitions for all state changes

## Expected Deliverables

Provide production-ready code with clear separation of concerns:

### 1. HTML Structure

```html
<!-- Inside prompt card, after star-rating -->
<div class="notes-section">
  <button class="notes-toggle">
    <span class="notes-icon">📝</span>
    Notes <span class="notes-count">(0)</span>
  </button>
  <div class="notes-content hidden">
    <div class="notes-list">
      <!-- Individual notes appear here -->
    </div>
    <button class="btn-add-note">+ Add Note</button>
  </div>
</div>
```

### 2. CSS Styling

Include styles for:

- `.notes-section` - Container styling
- `.notes-toggle` - Clickable badge with hover effect
- `.notes-content` - Expandable content area with smooth transition
- `.note-card` - Individual note styling with timestamp
- `.note-input-area` - Textarea for adding/editing notes
- `.character-counter` - Character limit indicator
- `.note-actions` - Edit and delete button positioning
- Responsive scrollbar for notes list

### 3. JavaScript Functions

Implement these functions with inline documentation:

```javascript
// Create notes section UI for a prompt card
function createNotesSection(prompt) {}

// Toggle notes section expand/collapse
function toggleNotesSection(promptId) {}

// Show add note input area
function showAddNoteInput(promptId) {}

// Save new note to prompt
function saveNote(promptId, noteContent) {}

// Delete note from prompt
function deleteNote(promptId, noteId) {}

// Enable edit mode for existing note
function editNote(promptId, noteId) {}

// Update note after editing
function updateNote(promptId, noteId, newContent) {}

// Get notes for a specific prompt
function getPromptNotes(promptId) {}
```

## Data Structure Integration

Extend the existing prompt object to include a notes array:

```javascript
const prompt = {
  id: 1234567890,
  title: 'Blog Writer',
  content: 'Generate blog posts...',
  createdAt: '2025-12-26T10:30:00.000Z',
  rating: 4,
  isFavorite: true,
  notes: [
    {
      id: 1234567891,
      content: 'Works great for technical blog posts',
      createdAt: '2025-12-26T11:15:00.000Z',
    },
    {
      id: 1234567892,
      content: 'Add more context about target audience for better results',
      createdAt: '2025-12-26T14:22:00.000Z',
    },
  ],
};
```

**Storage Operations:**

- Initialize `notes: []` for prompts without the property
- Use `Date.now()` for note IDs and timestamps
- Update entire prompt object in localStorage on note changes
- Maintain backward compatibility with prompts lacking notes

## Additional Requirements

**User Experience:**

- Input field auto-focuses when "Add Note" is clicked
- Cancel button clears input and hides textarea
- Save button disabled when textarea is empty or exceeds limit
- Timestamp displayed in readable format: "Dec 26, 2:30 PM"
- Keyboard support: Enter to save (with Shift+Enter for new lines)

**Edge Cases:**

- Handle localStorage quota exceeded gracefully
- Validate note content is not just whitespace
- Prevent duplicate simultaneous edits
- Show note count badge even when section is collapsed
- Hide "Add Note" button when input is already visible

**Code Quality:**

- Use event delegation for dynamically added notes
- Extract timestamp formatting to utility function
- Add JSDoc comments for all functions
- Follow existing code style and naming conventions
- Ensure no memory leaks with event listeners

## Integration Notes

This feature integrates with the existing prompt library app by:

1. Adding notes section to `createPromptCard()` function
2. Updating prompt data structure in `getPromptsFromStorage()`
3. Using existing localStorage patterns and card styling
4. Maintaining consistency with favorites and ratings features
5. No changes required to form submission or delete prompt functions

The implementation should feel like a natural extension of the existing application, maintaining visual consistency and code patterns already established in the codebase.

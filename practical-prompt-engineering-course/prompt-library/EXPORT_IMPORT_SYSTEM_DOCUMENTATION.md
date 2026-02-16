# Export/Import System Documentation

## Overview
A complete backup and data portability system for the Prompt Library application with validation, conflict resolution, and automatic error recovery.

## Features

### 1. Export System

#### Export JSON Schema (Version 1.0)

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-29T10:30:00.000Z",
  "statistics": {
    "totalPrompts": 25,
    "averageRating": 4.2,
    "mostUsedModel": "GPT-4",
    "totalNotes": 47,
    "favoritesCount": 8,
    "totalTokensEstimate": {
      "min": 12500,
      "max": 18750
    }
  },
  "prompts": [
    {
      "id": 1735468200000,
      "title": "Example Prompt",
      "content": "Prompt content here...",
      "createdAt": "2025-12-29T10:30:00.000Z",
      "rating": 5,
      "isFavorite": true,
      "notes": [],
      "metadata": {
        "model": "GPT-4",
        "createdAt": "2025-12-29T10:30:00.000Z",
        "updatedAt": "2025-12-29T10:30:00.000Z",
        "tokenEstimate": {
          "min": 500,
          "max": 750,
          "confidence": "high"
        }
      }
    }
  ]
}
```

#### Export Features

- **Data Validation**: Validates all data before export
- **Statistics Generation**: Automatically calculates:
  - Total prompts count
  - Average rating
  - Most used AI model
  - Total notes count
  - Favorites count
  - Total token estimates (min/max)
- **Timestamped Files**: Downloads as `prompt-library-backup-YYYY-MM-DDTHH-mm-ss.json`
- **Integrity Checks**: Warns if validation issues found
- **User Confirmation**: Allows user to proceed or cancel on warnings

### 2. Import System

#### Validation Steps

1. **File Type Check**: Ensures `.json` extension
2. **JSON Parse**: Validates proper JSON syntax
3. **Schema Validation**:
   - Version number check
   - Required fields validation
   - Prompts array validation
   - Export timestamp validation
4. **Data Integrity**: Validates each prompt's required fields and metadata
5. **Duplicate Detection**: Identifies prompts with matching IDs

#### Conflict Resolution

When duplicate IDs are found, users get three options:

##### 🔄 Merge Option
- **Action**: Keep existing prompts, add only new ones
- **Use Case**: Adding new prompts without losing existing data
- **Result**: `existing_count` + `new_unique_count` total prompts

##### ⚡ Replace All Option
- **Action**: Delete all existing prompts, import all from file
- **Use Case**: Complete restoration from backup
- **Result**: `imported_count` total prompts (existing data lost)

##### ❌ Cancel Option
- **Action**: Abort import process
- **Use Case**: User changed their mind or wants to review file
- **Result**: No changes made

#### Merge Dialog UI

Beautiful modal dialog with:
- Conflict summary (existing/new/duplicate counts)
- Visual option cards with icons
- Color-coded hover states
- Clear descriptions for each option

### 3. Error Recovery System

#### Automatic Backup

Before every import:
1. Creates backup in `localStorage.prompts_backup`
2. Includes timestamp and full prompts array
3. Stored separately from main data

#### Automatic Rollback

If import fails:
1. Shows error message with details
2. Automatically restores from backup
3. Confirms successful restoration
4. Reloads prompts display

#### Error Types Handled

- **JSON Parse Errors**: Invalid JSON syntax
- **Schema Validation Errors**: Missing required fields
- **Version Incompatibility**: Wrong schema version
- **Data Corruption**: Invalid prompt structure
- **Storage Errors**: localStorage quota exceeded
- **User Cancellation**: Graceful abort

## Step-by-Step Implementation

### Step 1: Data Analysis ✅

Identified all exportable data:
- Prompt ID, title, content
- Created/updated timestamps
- Rating and favorite status
- Notes array with note data
- Metadata (model, timestamps, token estimates)

### Step 2: JSON Schema Design ✅

Created versioned schema with:
- `version`: Schema version for future compatibility
- `exportedAt`: Export timestamp
- `statistics`: Calculated stats object
- `prompts`: Complete prompts array

### Step 3: Export Function ✅

Implemented `exportPrompts()`:
- Gathers data from localStorage
- Validates data integrity
- Calculates statistics
- Creates JSON blob
- Triggers browser download with timestamp

### Step 4: Import Function ✅

Implemented `importPrompts(file)`:
- Reads uploaded file
- Validates JSON structure and version
- Checks for duplicate IDs
- Shows merge dialog if conflicts exist
- Merges or replaces based on user choice
- Saves to localStorage
- Reloads display

### Step 5: Error Recovery ✅

Implemented:
- `createBackup()`: Stores backup before import
- `restoreFromBackup()`: Rolls back on failure
- Try/catch blocks throughout
- Detailed error messages
- Confirmation dialogs

### Step 6: UI Components ✅

Added:
- Export button (📤 Export)
- Import button (📥 Import) with hidden file input
- Merge conflict resolution modal dialog
- Responsive layout

### Step 7: Styling ✅

Added CSS for:
- Export/Import buttons with gradient
- Hover animations
- Modal overlay with fade-in
- Dialog with slide-up animation
- Option cards with hover states
- Mobile-responsive design

## Usage Guide

### Exporting Prompts

1. Click the **📤 Export** button in the header
2. If validation warnings appear, choose to continue or cancel
3. File downloads automatically as `prompt-library-backup-[timestamp].json`
4. Success message shows count of exported prompts

### Importing Prompts

1. Click the **📥 Import** button in the header
2. Select a `.json` file from your computer
3. Confirm the import in the dialog
4. If conflicts detected, choose resolution option:
   - **Merge**: Keep existing + add new
   - **Replace All**: Complete replacement
   - **Cancel**: Abort import
5. Success/error message appears
6. Prompts reload automatically

### Backup Management

- **Automatic Backup**: Created before every import
- **Stored In**: `localStorage.prompts_backup`
- **Used For**: Automatic rollback on import failure
- **Manual Recovery**: Use browser dev tools if needed

## Technical Details

### Functions Reference

#### Export Functions

```javascript
exportPrompts()
// Main export function - gathers, validates, downloads

calculateStatistics(prompts)
// Returns: { totalPrompts, averageRating, mostUsedModel, ... }

validateDataIntegrity(prompts)
// Returns: { isValid, errors: [] }
```

#### Import Functions

```javascript
importPrompts(file)
// Main import function - async

validateImportData(importData)
// Returns: { isValid, errors: [] }

checkForDuplicates(existing, imported)
// Returns: { hasDuplicates, duplicateCount, duplicates }

showMergeDialog(conflictInfo)
// Returns: Promise<'merge' | 'replace' | 'cancel'>

handleImportFile(event)
// Event handler for file input
```

#### Recovery Functions

```javascript
createBackup()
// Returns: boolean (success/failure)

restoreFromBackup()
// Returns: boolean (success/failure)
```

### Schema Version Management

Current version: **1.0**

Future versions can:
- Add new fields to schema
- Maintain backward compatibility
- Include migration logic
- Update `EXPORT_SCHEMA_VERSION` constant

### Browser Compatibility

- **File API**: Used for file reading
- **Blob API**: Used for file download
- **Promises/Async**: Used for import flow
- **localStorage**: Used for data storage
- **Works In**: All modern browsers (Chrome, Firefox, Safari, Edge)

### Storage Considerations

#### localStorage Limits
- Typical limit: 5-10 MB
- Quota exceeded error handling included
- User warned if storage issues occur

#### File Size
- JSON files are text-based (small)
- Pretty-printed (2-space indentation)
- Typical prompt library: 50-500 KB

## Security Considerations

1. **File Validation**: All imports validated before processing
2. **User Confirmation**: Required before destructive operations
3. **Automatic Backup**: Prevents data loss
4. **Error Recovery**: Rollback on any failure
5. **No Server**: All processing client-side (privacy)

## Testing Checklist

### Export Testing
- [ ] Export with no prompts (should show alert)
- [ ] Export with single prompt
- [ ] Export with multiple prompts
- [ ] Export with validation warnings (should show dialog)
- [ ] Verify file downloads with correct timestamp
- [ ] Verify JSON structure matches schema
- [ ] Verify statistics are calculated correctly

### Import Testing
- [ ] Import valid backup file
- [ ] Import invalid JSON (should show error)
- [ ] Import wrong schema version (should show error)
- [ ] Import with no conflicts (should add to existing)
- [ ] Import with conflicts → Choose Merge
- [ ] Import with conflicts → Choose Replace All
- [ ] Import with conflicts → Choose Cancel
- [ ] Import invalid file type (should reject)

### Error Recovery Testing
- [ ] Backup created before import
- [ ] Rollback on JSON parse error
- [ ] Rollback on validation error
- [ ] Rollback on user cancellation
- [ ] Verify data restored correctly after rollback

### UI Testing
- [ ] Export button visible and clickable
- [ ] Import button visible and clickable
- [ ] File picker opens on import click
- [ ] Merge dialog appears on conflicts
- [ ] Dialog buttons work correctly
- [ ] Dialog closes after selection
- [ ] Hover effects work on all buttons
- [ ] Mobile responsive layout works

## Common Use Cases

### 1. Regular Backups
**Scenario**: Create weekly backups of all prompts
- Click Export weekly
- Store files in safe location
- Name files descriptively

### 2. Device Migration
**Scenario**: Move prompts to new computer
- Export on old device
- Transfer file (email, USB, cloud)
- Import on new device
- Choose "Replace All"

### 3. Sharing Prompt Libraries
**Scenario**: Share prompts with team/colleagues
- Export your library
- Share JSON file
- Colleagues import with "Merge" option
- Keeps their existing prompts + adds yours

### 4. Disaster Recovery
**Scenario**: Accidentally deleted prompts
- Have old backup file
- Import the backup
- Choose appropriate merge option
- Data restored

### 5. Syncing Multiple Devices
**Scenario**: Keep prompts synced across devices
- Export from device A
- Import to device B with "Replace All"
- Repeat periodically or as needed

## Future Enhancements

Potential improvements:
1. **Cloud Sync**: Auto-sync via cloud service
2. **Selective Export**: Export specific prompts/favorites
3. **Import Preview**: Show what will change before importing
4. **Version Migration**: Auto-upgrade old schema versions
5. **Conflict Resolution**: More granular per-prompt choices
6. **Scheduled Backups**: Automatic periodic exports
7. **Export Formats**: CSV, Markdown, or plain text
8. **Compression**: ZIP files for large libraries
9. **Encryption**: Password-protected exports
10. **Merge Smart**: Detect and merge updated prompts

## Troubleshooting

### Export Issues

**Problem**: "No prompts to export" alert
- **Cause**: No prompts in localStorage
- **Solution**: Create some prompts first

**Problem**: File doesn't download
- **Cause**: Browser blocking download
- **Solution**: Check browser download settings/permissions

### Import Issues

**Problem**: "Invalid import file" error
- **Cause**: Corrupted or wrong file format
- **Solution**: Ensure file is valid JSON from export

**Problem**: "Unsupported version" error
- **Cause**: File from incompatible schema version
- **Solution**: Check export was from same app version

**Problem**: Import succeeds but no prompts show
- **Cause**: All prompts filtered out or IDs conflicted
- **Solution**: Check filter tabs, verify merge option choice

### Recovery Issues

**Problem**: "Backup restoration failed"
- **Cause**: No backup exists or localStorage corrupted
- **Solution**: Use external backup file to import

**Problem**: Data looks wrong after import
- **Cause**: Wrong merge option chosen
- **Solution**: Import original backup again with correct option

## Best Practices

1. **Export Regularly**: Create backups before major changes
2. **Keep Backups**: Store export files in multiple locations
3. **Test Imports**: Try on copy of data first
4. **Name Files**: Use descriptive names for easy identification
5. **Verify Data**: Check prompts after import
6. **Use Merge**: Safer than replace when unsure
7. **Read Errors**: Error messages contain helpful details
8. **Don't Panic**: Automatic backup provides safety net

## Example Export File

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-29T15:45:30.123Z",
  "statistics": {
    "totalPrompts": 3,
    "averageRating": 4.67,
    "mostUsedModel": "GPT-4",
    "totalNotes": 5,
    "favoritesCount": 2,
    "totalTokensEstimate": {
      "min": 1875,
      "max": 2812
    }
  },
  "prompts": [
    {
      "id": 1735478730000,
      "title": "Code Review Assistant",
      "content": "Review this code for best practices...",
      "createdAt": "2025-12-29T15:45:30.000Z",
      "rating": 5,
      "isFavorite": true,
      "notes": [
        {
          "id": 1735478750000,
          "content": "Works great for JavaScript",
          "createdAt": "2025-12-29T15:45:50.000Z"
        }
      ],
      "metadata": {
        "model": "GPT-4",
        "createdAt": "2025-12-29T15:45:30.000Z",
        "updatedAt": "2025-12-29T15:45:30.000Z",
        "tokenEstimate": {
          "min": 625,
          "max": 937,
          "confidence": "high"
        }
      }
    }
  ]
}
```

## Conclusion

This export/import system provides:
- ✅ Complete data portability
- ✅ Automatic backups and recovery
- ✅ Intelligent conflict resolution
- ✅ User-friendly interface
- ✅ Comprehensive error handling
- ✅ Future-proof versioned schema

All implemented with pure JavaScript, no external dependencies required!



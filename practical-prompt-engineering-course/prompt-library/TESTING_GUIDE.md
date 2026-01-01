# Export/Import System Testing Guide

## Quick Start Testing

### 1. Basic Export Test (2 minutes)

1. Open `index.html` in your browser
2. Create 2-3 test prompts:
   - Title: "Test Prompt 1"
   - Model: "GPT-4"
   - Content: "This is a test prompt"
   - Save each one
3. Click **📤 Export** button
4. Verify file downloads with timestamp name
5. Open the downloaded JSON file
6. Verify it contains your prompts

**Expected Result**: ✅ File downloads, contains valid JSON with your prompts

---

### 2. Basic Import Test (3 minutes)

#### Using Provided Sample File

1. Keep your existing prompts in the browser
2. Click **📥 Import** button
3. Select `sample-export.json` from the repo
4. Confirm the import
5. See merge dialog appear (duplicates detected)
6. Click **🔄 Merge** option
7. Verify new prompts added

**Expected Result**: ✅ Sample prompts added, your original prompts remain

---

### 3. Merge Conflict Test (3 minutes)

1. Export your current prompts
2. Delete all prompts from the app
3. Create 1 new prompt with a different title
4. Import the file you just exported
5. Merge dialog appears (has conflicts)
6. Try each option:
   - **Merge**: Adds old prompts + keeps new one
   - **Replace All**: Restores only exported prompts
   - **Cancel**: Does nothing

**Expected Result**: ✅ Each option works as described

---

### 4. Error Recovery Test (2 minutes)

1. Have some prompts in the app
2. Create a bad JSON file:
   ```json
   {
     "invalid": "data"
   }
   ```
3. Try to import it
4. See error message
5. Verify your original prompts still exist (rollback worked)

**Expected Result**: ✅ Error shown, data unchanged, backup restored

---

## Detailed Test Scenarios

### Export Tests

#### Test 1: Empty Library Export
```
Steps:
1. Clear all prompts (delete them all)
2. Click Export button

Expected: Alert "No prompts to export!"
Result: ☐ Pass ☐ Fail
```

#### Test 2: Single Prompt Export
```
Steps:
1. Create one prompt
2. Click Export
3. Check downloaded file

Expected: Valid JSON with 1 prompt, statistics show totalPrompts: 1
Result: ☐ Pass ☐ Fail
```

#### Test 3: Statistics Accuracy
```
Steps:
1. Create 5 prompts with different ratings (1-5 stars)
2. Favorite 2 of them
3. Add notes to 3 prompts
4. Export
5. Check statistics in JSON

Expected: 
- totalPrompts: 5
- averageRating: 3.0
- favoritesCount: 2
- totalNotes: (depends on how many you added)
Result: ☐ Pass ☐ Fail
```

#### Test 4: Metadata Integrity
```
Steps:
1. Create prompt with specific model name
2. Export
3. Check prompt's metadata in JSON

Expected: All metadata fields present and correct
Result: ☐ Pass ☐ Fail
```

---

### Import Tests

#### Test 5: Valid Import (No Conflicts)
```
Steps:
1. Have 2 prompts in library
2. Import sample-export.json (has different IDs)
3. Choose any option

Expected: Sample prompts added (no conflict dialog if IDs different)
Result: ☐ Pass ☐ Fail
```

#### Test 6: Merge Strategy
```
Steps:
1. Export your library (file A)
2. Create 2 new prompts
3. Import file A
4. Choose "Merge"

Expected: Original prompts + 2 new ones = total combined
Result: ☐ Pass ☐ Fail
```

#### Test 7: Replace Strategy
```
Steps:
1. Have 5 prompts
2. Export when you had 3 prompts (file B)
3. Import file B
4. Choose "Replace All"

Expected: Library now has exactly 3 prompts from file B
Result: ☐ Pass ☐ Fail
```

#### Test 8: Cancel Strategy
```
Steps:
1. Have 3 prompts
2. Try to import file with conflicts
3. Choose "Cancel"

Expected: No changes, still have 3 original prompts
Result: ☐ Pass ☐ Fail
```

#### Test 9: Invalid JSON
```
Steps:
1. Create file: invalid.json with content: {invalid json
2. Try to import it

Expected: Error message about invalid JSON, rollback successful
Result: ☐ Pass ☐ Fail
```

#### Test 10: Wrong Schema Version
```
Steps:
1. Create file with version: "2.0" in JSON
2. Try to import

Expected: Error about unsupported version
Result: ☐ Pass ☐ Fail
```

#### Test 11: Missing Required Fields
```
Steps:
1. Create JSON without "prompts" array
2. Try to import

Expected: Error about missing prompts array
Result: ☐ Pass ☐ Fail
```

---

### Error Recovery Tests

#### Test 12: Backup Creation
```
Steps:
1. Have prompts in library
2. Open browser DevTools → Application → Local Storage
3. Try to import any file
4. Check for "prompts_backup" key

Expected: Backup created before import attempt
Result: ☐ Pass ☐ Fail
```

#### Test 13: Automatic Rollback
```
Steps:
1. Have 3 prompts
2. Try to import invalid JSON
3. Check library after error

Expected: Still have original 3 prompts, rollback message shown
Result: ☐ Pass ☐ Fail
```

#### Test 14: Multiple Import Attempts
```
Steps:
1. Import valid file (creates backup)
2. Import another valid file (creates new backup)
3. Import invalid file (should rollback to last good state)

Expected: Last successful import's data restored
Result: ☐ Pass ☐ Fail
```

---

### UI/UX Tests

#### Test 15: Export Button
```
Steps:
1. Look for Export button in header
2. Click it
3. Check hover effect

Expected: Button visible, hover animation works, triggers export
Result: ☐ Pass ☐ Fail
```

#### Test 16: Import Button
```
Steps:
1. Look for Import button in header
2. Click it
3. Check file picker opens

Expected: Button visible, opens file selection dialog
Result: ☐ Pass ☐ Fail
```

#### Test 17: Merge Dialog Appearance
```
Steps:
1. Import file with conflicts
2. Check dialog appearance

Expected: Modal overlay, centered dialog, clear options
Result: ☐ Pass ☐ Fail
```

#### Test 18: Merge Dialog Options
```
Steps:
1. Hover over each option in merge dialog
2. Check visual feedback

Expected: Hover effects with color changes, clear visual distinction
Result: ☐ Pass ☐ Fail
```

#### Test 19: Mobile Responsiveness
```
Steps:
1. Resize browser to mobile width (400px)
2. Check Export/Import buttons
3. Trigger merge dialog

Expected: Buttons stack/resize properly, dialog fits screen
Result: ☐ Pass ☐ Fail
```

---

### Integration Tests

#### Test 20: Export → Import Round Trip
```
Steps:
1. Create 5 prompts with various metadata
2. Export to file
3. Delete all prompts
4. Import the file back
5. Verify all data matches

Expected: Perfect restoration of all prompts and metadata
Result: ☐ Pass ☐ Fail
```

#### Test 21: Cross-Session Persistence
```
Steps:
1. Create prompts and export
2. Close browser completely
3. Reopen browser
4. Import the file

Expected: Import works, data persists
Result: ☐ Pass ☐ Fail
```

#### Test 22: Large Library Test
```
Steps:
1. Create 50+ prompts (or use script to generate)
2. Export
3. Check file size and download time
4. Import back

Expected: Handles large libraries smoothly
Result: ☐ Pass ☐ Fail
```

#### Test 23: Special Characters
```
Steps:
1. Create prompts with special characters: 
   - Emojis: 🚀💻🎨
   - Unicode: 中文, العربية, עברית
   - Code: <script>, \n\t, quotes "'"
2. Export and import back

Expected: All special characters preserved
Result: ☐ Pass ☐ Fail
```

#### Test 24: Metadata Preservation
```
Steps:
1. Create prompt with:
   - Rating: 5 stars
   - Favorite: Yes
   - Notes: 3 notes
   - Model: "GPT-4"
2. Export
3. Import (replace all)
4. Check all fields preserved

Expected: All metadata exactly preserved
Result: ☐ Pass ☐ Fail
```

---

## Automated Testing Script

Copy this into browser console for quick testing:

```javascript
// Create test prompts
function createTestPrompts(count) {
  for (let i = 1; i <= count; i++) {
    const prompt = {
      id: Date.now() + i,
      title: `Test Prompt ${i}`,
      content: `This is test content for prompt ${i}`,
      createdAt: new Date().toISOString(),
      rating: i % 5 + 1,
      isFavorite: i % 2 === 0,
      notes: [],
      metadata: trackModel(`GPT-${i % 4 + 3}`, `Test content ${i}`, false)
    };
    
    const prompts = getPromptsFromStorage();
    prompts.push(prompt);
    localStorage.setItem('prompts', JSON.stringify(prompts));
  }
  loadPrompts();
  console.log(`Created ${count} test prompts`);
}

// Clear all prompts
function clearAllPrompts() {
  localStorage.setItem('prompts', '[]');
  loadPrompts();
  console.log('Cleared all prompts');
}

// Usage:
// createTestPrompts(10);  // Create 10 test prompts
// clearAllPrompts();      // Clear all prompts
```

---

## Performance Benchmarks

### Expected Performance

| Operation | Prompts | Expected Time |
|-----------|---------|---------------|
| Export | 10 | <100ms |
| Export | 100 | <500ms |
| Export | 1000 | <2s |
| Import | 10 | <200ms |
| Import | 100 | <1s |
| Import | 1000 | <5s |
| Backup | Any | <50ms |
| Rollback | Any | <100ms |

---

## Common Issues and Solutions

### Issue 1: File Won't Download
**Symptom**: Export button clicked but no download
**Solution**: Check browser download settings, allow pop-ups

### Issue 2: Import Does Nothing
**Symptom**: Import completes but no prompts appear
**Solution**: Check filter tabs (might be filtered out), verify merge option

### Issue 3: "CRITICAL: Backup restoration failed"
**Symptom**: Error message after failed import
**Solution**: Manually import last known good backup file

### Issue 4: Merge Dialog Won't Close
**Symptom**: Stuck on merge dialog
**Solution**: Click any option button, refresh page if needed

### Issue 5: Statistics Wrong
**Symptom**: Statistics in export don't match
**Solution**: Check calculation logic, verify all prompts counted

---

## Test Coverage Summary

- [x] Export functionality (4 tests)
- [x] Import functionality (7 tests)
- [x] Error recovery (3 tests)
- [x] UI/UX (5 tests)
- [x] Integration (5 tests)

**Total Tests**: 24 comprehensive test scenarios

---

## Sign-Off Checklist

Before considering the system complete:

- [ ] All 24 tests pass
- [ ] No console errors during normal operation
- [ ] Error messages are user-friendly
- [ ] Export files are valid JSON
- [ ] Import handles all edge cases
- [ ] Backup/rollback works reliably
- [ ] UI is responsive on mobile
- [ ] Merge dialog clearly explains options
- [ ] Documentation is complete
- [ ] Sample export file is valid

---

## Reporting Issues

If you find bugs during testing, report with:

1. **Test Number**: Which test failed
2. **Steps**: Exact steps to reproduce
3. **Expected**: What should happen
4. **Actual**: What actually happened
5. **Browser**: Chrome/Firefox/Safari + version
6. **Console**: Any error messages
7. **Data**: Sample export file if relevant

---

## Next Steps After Testing

Once all tests pass:

1. ✅ System is production-ready
2. Share documentation with users
3. Encourage regular backups
4. Monitor for edge cases
5. Gather user feedback
6. Plan future enhancements

Happy Testing! 🚀


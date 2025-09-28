# Export Changes Feature Implementation

## Overview
Added a changes popup modal that appears when clicking "Export All" button, showing a detailed summary of all changes made since importing the files.

## Features

### Changes Summary Modal
- Shows total number of languages and keys being exported
- Displays count of modified keys
- Lists all changed keys with detailed before/after values
- Color-coded change status (new/modified/deleted)
- Allows user to review changes before confirming export

### Change Detection
- Compares current state with original imported state
- Shows language-specific changes for each key
- Displays old vs new values for modified keys
- Handles new keys that were added after import

### User Experience
- Clear visual indicators for different types of changes
- Scrollable list for many changes
- Cancel option to abort export
- Confirm button shows number of files being exported
- Success message after all files are downloaded

## Implementation Details

### Key Components

#### 1. Export Changes Modal (in JsonTable.vue)
```html
<dialog id="export_changes_modal" class="modal">
  <!-- Summary information -->
  <!-- Detailed changes list -->
  <!-- Action buttons -->
</dialog>
```

#### 2. Change Detection Logic
- Uses existing `filesStore.changedKeys` getter
- Leverages `filesStore.getKeyChangeDetails(key)` method
- Provides structured data for display

#### 3. Export Flow
1. User clicks "Export All" 
2. System calculates changes summary
3. Modal shows with change details
4. User reviews and confirms/cancels
5. Export proceeds with original functionality

### Usage Scenario
1. Import iOS .strings files
2. Edit translations in the editor
3. Click "Export All" button
4. Review changes in popup before export
5. Confirm to download all language files

This provides transparency and confidence when exporting modified translation files.
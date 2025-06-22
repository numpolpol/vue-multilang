# Key Editing Feature Implementation

## Overview
Added inline key editing functionality to the Multi Language Editor, allowing users to edit key names directly in the table without needing external tools.

## Features Implemented

### 1. Inline Key Editing
- **Click to Edit**: Click on any key name to start editing
- **Hover Edit Button**: Shows an edit icon on hover for clear indication
- **Input Validation**: 
  - Prevents empty keys
  - Checks for duplicate keys
  - Shows error messages for invalid inputs

### 2. User Experience
- **Auto-focus**: Input field automatically focuses and selects text when editing starts
- **Keyboard Shortcuts**:
  - `Enter`: Save changes
  - `Escape`: Cancel editing
- **Visual Feedback**:
  - Error states with red borders
  - Success/cancel buttons with icons
  - Clear hover states

### 3. Store Integration
- **Cross-Language Updates**: Renaming a key updates it across all language files
- **Consistency**: Maintains data integrity across the entire project
- **Validation**: Server-side validation prevents conflicts

## Technical Implementation

### Frontend (JsonTable.vue)
```typescript
// Reactive state for editing
const editingKey = ref<string | null>(null)
const editKeyValue = ref<string>('')
const editKeyError = ref<string>('')
const editKeyInput = ref<HTMLInputElement | null>(null)

// Key editing functions
function startEditKey(key: string)
function saveEditKey()
function cancelEditKey()
function onEditKeyKeydown(event: KeyboardEvent)
```

### Backend (files.ts store)
```typescript
// New store method
renameKey(oldKey: string, newKey: string): boolean {
  // Validation and duplicate checking
  // Cross-language key renaming
  // Data synchronization
}
```

### Template Updates
```vue
<div v-else-if="editingKey === key" class="space-y-1">
  <input v-model="editKeyValue" @keydown="onEditKeyKeydown" @blur="saveEditKey" />
  <div v-if="editKeyError" class="text-xs text-error">{{ editKeyError }}</div>
  <div class="flex gap-1">
    <button @click="saveEditKey">Save</button>
    <button @click="cancelEditKey">Cancel</button>
  </div>
</div>
```

## User Workflow

### Basic Editing
1. Click on any key name in the table
2. Edit the key name in the input field
3. Press `Enter` to save or `Escape` to cancel
4. Changes apply across all language files automatically

### Error Handling
- **Empty Key**: Shows "Key cannot be empty" error
- **Duplicate Key**: Shows "Key already exists" error  
- **Save Failure**: Shows "Failed to rename key" error

### Visual States
- **Normal**: Key displayed as text with hover edit button
- **Editing**: Input field with save/cancel buttons
- **Error**: Red border on input with error message below

## Benefits

### For Product Teams
- **Quick Fixes**: Correct typos in key names instantly
- **Standardization**: Easily rename keys to follow naming conventions
- **No External Tools**: Edit keys directly in the interface

### For Development Teams
- **Consistency**: Key changes apply to all platforms (iOS/Android)
- **Version Control**: Changes are immediate and visible
- **Collaboration**: Team members can fix key names without file access

### For QA Teams
- **Traceability**: See key changes in real-time
- **Verification**: Verify key names match specifications
- **Testing**: Test with corrected key names immediately

## Best Practices

### Key Naming Conventions
- Use descriptive names: `home_welcome_message` instead of `text1`
- Follow prefix patterns: `section_element_description`
- Avoid special characters except underscore and dash
- Use lowercase with underscores

### Usage Guidelines
- Plan key names before implementation when possible
- Use the edit feature for corrections and improvements
- Check for naming consistency across related keys
- Communicate key changes to team members

## Technical Notes

### Performance
- Changes are applied immediately to all language data
- No database calls required - pure client-side operation
- Minimal UI re-rendering through Vue's reactivity

### Compatibility
- Works with both merged keys and regular keys
- Compatible with all existing features (search, filter, export)
- Maintains image annotations and project save/load functionality

## Future Enhancements
- Bulk key renaming
- Key naming validation rules
- Undo/redo functionality for key changes
- Auto-suggestions for key names based on patterns

## Testing
The feature has been tested with:
- ✅ Basic key editing workflow
- ✅ Error validation (empty keys, duplicates)
- ✅ Keyboard shortcuts (Enter/Escape)
- ✅ Cross-language data consistency
- ✅ Build and runtime compatibility

## Documentation
This feature is part of the broader Multi Language Editor documentation:
- [Thai Documentation](./MULTI_LANGUAGE_EDITOR_DOCUMENTATION.md)
- [English Documentation](./MULTI_LANGUAGE_EDITOR_DOCUMENTATION_EN.md)

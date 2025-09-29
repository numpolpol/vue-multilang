# Export Changes Detail Feature

## Overview
The "Export All" functionality now includes an additional **changes detail file** that provides a comprehensive summary of all modifications made to the localization keys since the original import.

## Implementation Details

### What's New
When users click "Export All", the system now exports:
1. **All language .strings files** (as before)
2. **One changes detail markdown file** (NEW) - `{ProjectName}_changes_{timestamp}.md`

### Changes Detail File Content
The exported markdown file includes:

#### Header Information
- **Project Name**: Current project name or "Unnamed Project"
- **Export Date**: Timestamp of export
- **Total Languages**: Number of language columns
- **Total Keys**: Number of localization keys
- **Changed Keys**: Number of keys that have been modified

#### Change Types Tracked
For each modified key, the system shows:

1. **Modified**: Key value was changed
   - Original value
   - Current value

2. **Added**: New key was created
   - New value

3. **Deleted**: Key was removed
   - Original value

#### Example Output
```markdown
# Export Changes Summary

**Project:** My iOS App
**Export Date:** 9/30/2025, 2:30:15 PM
**Total Languages:** 4
**Total Keys:** 120
**Changed Keys:** 3

## Detailed Changes

### 1. Key: "welcome_message"

**English (en):** Modified
- **Original:** "Welcome!"
- **Current:** "Welcome to our app!"

**ไทย (th):** Modified
- **Original:** "ยินดีต้อนรับ!"
- **Current:** "ยินดีต้อนรับสู่แอปของเรา!"

### 2. Key: "new_feature_title"

**English (en):** Added
- **Value:** "New Feature"

**ไทย (th):** Added
- **Value:** "ฟีเจอร์ใหม่"
```

## Technical Implementation

### Core Function
- **Location**: `src/components/JsonTable.vue`
- **Function**: `exportChangesDetail()`
- **Integration**: Called from `confirmExportAll()`

### Key Features
- Uses existing change tracking system from store
- Generates timestamped filenames
- Exports as `.md` format for readability
- Handles cases with no changes detected
- Supports all 4 languages (th, en, my, km)

### File Naming Convention
`{ProjectName}_changes_{ISO-timestamp}.md`

Example: `MyApp_changes_2025-09-30T14-30-15.md`

## User Experience

### Export Process
1. User clicks "Export All" button
2. Changes summary modal appears (existing behavior)
3. User clicks "Export" to confirm
4. System downloads:
   - 4 language .strings files
   - 1 changes detail .md file
5. Success message shows: "Started downloading 4 language files + 1 changes detail file"

### Benefits
- **Audit Trail**: Clear record of what changed
- **Review Process**: Easy to review modifications before deployment
- **Documentation**: Automatic changelog for localization updates
- **Quality Assurance**: Helps verify that changes are intentional

## Compatibility
- Works with existing project structure
- Compatible with comment preservation
- Supports both new projects and legacy projects
- No breaking changes to existing export functionality

## Testing
- ✅ Build passes
- ✅ Development server runs
- ✅ Export functionality accessible
- ✅ No TypeScript errors
- ✅ Compatible with existing change tracking system

## Future Enhancements
Potential improvements could include:
- Export as JSON format option
- Include export summary in project save
- Add export history tracking
- Custom change detail templates
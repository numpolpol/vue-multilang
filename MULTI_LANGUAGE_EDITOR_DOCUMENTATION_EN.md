# Multi Language Editor - Documentation (English)

## Overview

Multi Language Editor is a specialized tool designed to streamline and reduce errors in the multilingual app development workflow, particularly in environments where multiple teams collaborate on iOS and Android applications.

## Current Workflow Problems

### A. Product & Translation Teams
1. **Complex Process**: Need to export images from Figma to Google Sheets and manually match with text
2. **Inaccurate Positioning**: Must manually number text positions, often with mismatches
3. **Inconsistencies**: Images and text often don't align properly
4. **Difficult Updates**: Hard to locate specific items that need changes
5. **Lack of Visibility**: Difficult to track what text already exists in the app
6. **Translation Tracking**: Hard to identify untranslated content

### B. Development Teams (iOS/Android)
1. **Time-Consuming Search**: Must search by old text, similar content, or related keys
2. **Multiple File Management**: Need to edit 4 files per platform for each language change
3. **Copy-Paste Errors**: Manual copying can lead to mistakes or omissions
4. **No Unified Keys**: iOS and Android use different keys, making searches harder
5. **Language Barriers**: Non-native speakers struggle with checking Thai content

### C. QA Teams
1. **Manual Testing**: Must open app and check every flow manually
2. **No Change Tracking**: Cannot identify which keys were added or modified

## Multi Language Editor Solutions

### 1. Advanced Language File Management
- **Multi-Format Support**: iOS (.strings), Android (.xml), JSON with automatic flattening
- **Folder Import**: Import entire folders of language files with automatic detection
- **Complete Comment Preservation**: All comments, headers, and formatting preserved from import to export
- **Simultaneous Editing**: Edit all languages in one view without opening multiple files
- **Structure-Preserving Export**: Export with original comments and formatting intact

### 2. Unified Key System and Naming Standards
- **Shared Keys**: iOS and Android use identical keys
- **Prefix Grouping**: e.g., `home_title`, `profile_name` for better organization
- **Dash Support in Prefix**: e.g., `home-screen_title` for complex sections

### 3. Image Preview and Annotation System
- **UI Image Upload**: Upload images from Figma or other design tools
- **Drag & Drop Annotation**: Drag key names onto images to mark positions
- **Numbered Indicators**: Display numbers on images to identify text positions
- **Position Storage**: Automatically save annotation positions

### 4. Advanced Editing Tools
- **Direct Key Editing**: Click to edit key names instantly
- **Multi-Column Paste**: Paste multiple language content simultaneously
- **Dual-Key Mode**: Merge identical values across languages for efficient editing
- **Search and Filter**: Powerful filtering with multiple criteria
- **Highlight Mode**: Highlight edited, duplicate, or identical text across languages
- **JSON Flattening**: Automatic conversion of nested JSON to flat key structures
- **Project Management**: Save/load complete project states with all data preserved

### 5. Project Management
- **Save and Load Projects**: Save work and resume later
- **Language-Specific Export**: Export only selected languages
- **Create from Snippets**: Create new projects from existing keys

## Benefits

### For Product & Translation Teams
✅ **Reduced Workflow Steps**: No need for complex Google Sheet management  
✅ **Accurate Annotation**: Mark text positions directly on images  
✅ **Easy Translation Tracking**: Instantly see which content needs translation  
✅ **Quick Updates**: Edit and see results immediately  

### For Development Teams
✅ **Time Savings**: Use same keys across iOS and Android  
✅ **Reduced Errors**: Copy content from one source, no multi-source copy-pasting  
✅ **Better Organization**: Language files are organized with consistent standards  
✅ **International Friendly**: English UI, easy for non-native speakers  

### For QA Teams
✅ **Change Tracking**: Know which keys were added or modified  
✅ **Efficient Testing**: Know specific areas to check  
✅ **Easy Comparison**: See all language content in one place  

## Key Features

### 1. Side-by-Side Editing
```
Key               | Paste | English      | Thai         | Khmer        | Myanmar
home_title        | Paste | Home         | หน้าหลัก      | ទំព័រដើម      | ပင်မစာမျက်နှာ
profile_name      | Paste | Profile      | โปรไฟล์       | ប្រវត្តិរូប     | ပရိုဖိုင်
```

### 2. Section-Based Grouping
- **All Keys View**: View all keys in one place
- **Page Sections View**: Group by prefix (home, profile, settings)

### 3. Flexible Export System
- Export all languages together
- Export specific selected languages
- Export filtered keys only
- Support both iOS (.strings) and Android (.xml)

### 4. Intelligent Key Management
- Edit keys by clicking on them
- Automatic duplicate key detection
- Support merged keys for related content

## Usage Guide

### Method 1: Individual File Upload
1. **Upload Files**: Click "Upload File" to add individual .strings files
2. **Language Detection**: System automatically detects language from filename
3. **Comment Preservation**: All comments and formatting are preserved
4. **Edit Content**: Use the side-by-side editor to modify values
5. **Export**: Download files with original structure intact

### Method 2: Folder Import (Recommended)
1. **Select Folder**: Click "Import Folder" and choose a directory containing .strings files
2. **Batch Processing**: All files are processed simultaneously
3. **Auto-Detection**: Language codes extracted from filenames (en.strings, th.strings, etc.)
4. **Project Creation**: Automatically creates a new project with all languages
5. **Structure Preservation**: Complete comment and formatting preservation

### Advanced Features

#### Dual-Key Mode
1. **Toggle Mode**: Enable dual-key mode in the navigation bar
2. **Key Merging**: Keys with identical values across all languages are merged
3. **Efficient Editing**: Edit merged values once to update all languages
4. **Visual Indicators**: Merged keys are marked with chain icons

#### JSON Flattening
1. **Upload JSON**: Import nested JSON files directly
2. **Automatic Flattening**: System converts nested objects to flat key structure
3. **Dot Notation**: Uses dot notation for nested keys (e.g., `user.profile.name`)
4. **Export Options**: Can export back to nested JSON or flat formats

#### Project Management
1. **Save Projects**: Projects are automatically saved to browser storage
2. **Load Projects**: Resume work from previously saved projects
3. **Export All**: Bulk export all languages in selected formats

## Best Practices

### Key Naming
```
✅ Good:
- home_title
- profile_edit_button
- settings_language_label

❌ Avoid:
- text1
- button_click_here
- very_long_key_name_that_is_hard_to_understand
```

### Section Organization
```
✅ Good Organization:
- login_* (login_title, login_button, login_forgot_password)
- home_* (home_welcome, home_menu, home_search)
- profile_* (profile_name, profile_edit, profile_logout)
```

### Using Merged Keys
For keys with same meaning but different names:
```
old_welcome_text + welcome_message → Display as single key in UI
```

## Team-Specific Solutions

### Product Team
- Use Image Annotation for clear text positioning
- Use Section Mode to organize work by feature
- Use Export to deliver files to dev team

### Development Team  
- Use shared keys between iOS and Android
- Use language-specific export for only needed files
- Use Search to quickly find required keys

### QA Team
- Use Highlight Mode to see changes
- Use Filter to view newly added or modified keys
- Use Image Annotation to compare with actual UI

## Expected Results

### Time Reduction
- **Product Team**: 70% reduction in management time (from Google Sheets to Visual Tool)
- **Development Team**: 80% reduction in key search and copy-paste time
- **QA Team**: 60% reduction in text comparison time

### Error Reduction
- **Duplicate Keys**: Automatic system detection
- **Copy-paste Errors**: Use multi-column paste instead
- **Missing Translation**: Clearly show untranslated content

### Quality Improvement
- **Consistency**: Keys and content follow same standards
- **Traceability**: Track changes at every step
- **Collaboration**: Teams work together more effectively

## Conclusion

Multi Language Editor is a tool designed to solve specific problems faced by app development teams managing multilingual content. It reduces complexity, minimizes errors, and improves collaboration efficiency across all teams.

Using shared keys from the product design stage helps:
- Developers work faster
- QA testing becomes more accurate  
- Product teams manage more efficiently
- Reduce miscommunication between teams

This tool not only reduces redundant work but also helps establish better working standards for multilingual app development.

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

### 1. Centralized Language File Management
- **Supports iOS (.strings) and Android (strings.xml)** in one interface
- **Simultaneous Editing**: Edit all languages in one view without opening multiple files
- **Automatic Export**: Export to appropriate file formats for each platform

### 2. Unified Key System and Naming Standards
- **Shared Keys**: iOS and Android use identical keys
- **Prefix Grouping**: e.g., `home_title`, `profile_name` for better organization
- **Dash Support in Prefix**: e.g., `home-screen_title` for complex sections

### 3. Image Preview and Annotation System
- **UI Image Upload**: Upload images from Figma or other design tools
- **Drag & Drop Annotation**: Drag key names onto images to mark positions
- **Numbered Indicators**: Display numbers on images to identify text positions
- **Position Storage**: Automatically save annotation positions

### 4. Editing Tools
- **Direct Key Editing**: Click to edit key names instantly
- **Multi-Column Paste**: Paste multiple language content simultaneously
- **Search and Filter**: Easily search keys or content
- **Highlight Mode**: Highlight edited, duplicate, or identical text across languages

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

### 1. Starting a Project
1. Select "Create New Project" 
2. Choose desired languages (English, Thai, Khmer, Myanmar)
3. System creates basic keys (`common_ok`, `common_cancel`, `common_welcome`)

### 2. Adding New Keys
1. Click "Add Key" 
2. Specify key name (recommend `section_description` format)
3. Fill in text for each language

### 3. Uploading and Annotating Images
1. Switch to "Page Sections View"
2. Select desired section
3. Upload UI images
4. Drag keys from list onto image
5. System automatically saves positions

### 4. Exporting
1. Select languages to export
2. Choose format (iOS or Android)
3. System generates ready-to-use files

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

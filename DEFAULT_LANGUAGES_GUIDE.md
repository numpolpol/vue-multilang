# Default Language Columns Usage Guide

## Overview

The app now comes with 4 default language columns pre-configured:
- **Thai (th)**
- **English (en)** 
- **Khmer (km)**
- **Myanmar (my)**

## Features

### 1. Default Language Columns
- Each language column is ready to accept .strings or .xml files
- No need to upload files initially - you can start editing right away
- Each column shows the language name and code in the header

### 2. File Upload per Language
- Each language column has a 📁 upload button in the header
- Click the upload button to choose between:
  - `.strings file` - for iOS format files
  - `.xml file` - for Android format files
- Files can be uploaded at any time

### 3. Key Replacement
- When uploading a file to a language column that already has data:
  - **Existing keys with same name will be replaced** with new values
  - **New keys from the uploaded file will be added**
  - **Existing keys not in the uploaded file will be kept**
- This allows you to update translations incrementally

### 4. Multi Key Mode
- The app supports "Multi Key Mode" where keys with identical values are merged
- Merged keys display as: `primary_key (secondary_key1 + secondary_key2)`
- This helps identify duplicate translations across your app

## How to Use

### Basic Workflow:
1. **Start Fresh**: Open the app - you'll see 4 empty language columns (Thai, English, Khmer, Myanmar)
2. **Add Keys**: Use the "Add Key" button to create new translation keys
3. **Enter Translations**: Type directly into the input fields for each language
4. **Upload Files**: Use the 📁 button in each column header to upload existing .strings or .xml files
5. **Update Translations**: Re-upload files to the same language to update existing keys

### Upload Example:
1. Click 📁 in the "English" column header
2. Select "`.strings file`" from the dropdown
3. Choose your `en.strings` file
4. Keys from the file will be loaded/updated in the English column
5. Repeat for other languages as needed

### Key Replacement Example:
If your English column has:
```
"hello" = "Hello";
"goodbye" = "Goodbye";
```

And you upload a new `en.strings` file with:
```
"hello" = "Hi there";
"welcome" = "Welcome";
```

Result:
```
"hello" = "Hi there";      // Updated
"goodbye" = "Goodbye";     // Kept
"welcome" = "Welcome";     // Added
```

## Benefits

- **Quick Setup**: Start translating immediately with pre-configured languages
- **Flexible Updates**: Upload new translations without losing existing work
- **Visual Organization**: Clear column layout makes it easy to see all languages
- **Multi-format Support**: Works with both iOS (.strings) and Android (.xml) formats
- **Incremental Updates**: Add or update translations without starting over

This makes the workflow much more efficient for managing multi-language iOS/Android app translations!

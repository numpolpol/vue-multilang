# Structure Preservation and Minimal Changes Implementation

## Overview
Enhanced the Vue Multi-Language Editor to preserve file structure, maintain key order, and make minimal changes during import/export operations.

## Key Features Implemented

### 1. **Structure Preservation During Import**
- **Enhanced FolderFile Interface**: Added `originalStructure` and `originalContent` fields
- **Dual Parsing**: Uses both `parseStrings()` for data and `parseStringsWithStructure()` for structure
- **Structure Storage**: Preserves comments, blank lines, and original key order in LanguageColumn
- **Folder Import**: Enhanced `processFolderFiles()` to capture and store original file structure

### 2. **Order-Preserving Export**
- **Smart Export Logic**: `exportLanguageColumn()` uses `toStringsWithStructure()` when original structure exists
- **Minimal Changes**: Only modifies lines where values have actually changed
- **Comment Preservation**: Maintains all comments, blank lines, and formatting
- **Fallback Support**: Uses standard export when no structure is available

### 3. **Structure-Aware Processing**
- **parseStringsWithStructure()**: Parses while preserving structure elements
- **toStringsWithStructure()**: Exports with original structure intact
- **Duplicate Handling**: Removes duplicate keys while preserving structure
- **Key Order**: Maintains original key order from source files

## Implementation Details

### Import Process
```typescript
// Folder processing now preserves structure
const content = await readFileAsText(file)
const parseResult = parseStrings(content, true)          // For data
const structuredResult = parseStringsWithStructure(content) // For structure

const folderFile: FolderFile = {
  // ... other fields
  originalStructure: structuredResult.structure,
  originalContent: structuredResult.originalContent
}
```

### Export Process
```typescript
// Export logic chooses appropriate method
if (language.originalStructure) {
  // Structure-preserving export - maintains comments and order
  content = toStringsWithStructure(columnData, language.originalStructure)
} else {
  // Standard export - simple key-value pairs
  content = toStrings(columnData)
}
```

### Structure Elements Preserved
- **Comments**: Both `//` line comments and `/* */` block comments
- **Blank Lines**: Empty lines for formatting
- **Key Order**: Original order from source file
- **Whitespace**: Indentation and spacing within lines
- **Unchanged Values**: Exact original line preservation when values haven't changed

## Benefits

### 1. **Minimal File Changes**
- Only modified keys generate new lines
- Unchanged keys preserve original formatting exactly
- Comments and structure remain intact
- Reduces diff noise in version control

### 2. **Order Preservation**
- Keys maintain their original order from source files
- No unexpected rearrangement during round-trip operations
- Consistent file organization across imports/exports

### 3. **Comment Retention**
- Developer comments preserved across editing sessions
- Documentation and context maintained
- Team collaboration improved with preserved annotations

### 4. **Format Consistency**
- Original file formatting style maintained
- Team coding standards preserved
- No forced reformatting during operations

## Test Coverage

### Structure Preservation Tests ✅
- Comment preservation during export
- Blank line handling
- Graceful fallback when no structure available
- Proper handling of removed keys

### Folder Import Tests ✅
- Structure capture during folder import
- Order maintenance in exported files
- Minimal changes during round-trip operations

### Basic Functionality Tests ✅
- All existing folder processor functionality
- File filtering and language detection
- Project name generation
- Error handling

## Usage Examples

### Importing with Structure Preservation
```typescript
// Folder import automatically preserves structure
const result = await processFolderFiles(files)
// result.languages now include originalStructure and originalContent

// Store maintains structure
await filesStore.createNewProject(projectName)
for (const language of result.languages) {
  await filesStore.addLanguageColumn(language.code, language.name)
  // Structure is preserved in the language column
}
```

### Exporting with Minimal Changes
```typescript
// Export automatically uses structure when available
exportLanguageColumn('en') 
// Results in file with preserved comments, order, and minimal changes
```

### Example of Preserved Structure
**Original File:**
```strings
/* App Configuration */
"app_name" = "My App";

// User Interface
"welcome_msg" = "Welcome!";
"error_msg" = "Error occurred";

/* Messages */
"success_msg" = "Success!";
```

**After Editing (only welcome_msg changed):**
```strings
/* App Configuration */
"app_name" = "My App";

// User Interface  
"welcome_msg" = "Welcome Back!";  // ← Only this line changed
"error_msg" = "Error occurred";

/* Messages */
"success_msg" = "Success!";
```

## File Types Supported
- **iOS .strings**: Full structure preservation
- **Folder Import**: Structure preserved for all .strings files
- **Individual Upload**: Structure preserved when using parseStringsWithStructure
- **Export**: Always attempts structure preservation when available

This implementation ensures that the Vue Multi-Language Editor makes minimal changes to files, preserves developer comments and formatting, and maintains consistent key ordering across import/export operations.
# Duplicate Keys Detection & Summary Feature

## Overview
When importing .strings files, the system now automatically detects duplicate keys and shows a comprehensive summary modal with detailed information about which values were kept vs discarded, including the ability to copy the report.

## Implementation Details

### What's New
When users import folders or files with duplicate keys:
1. **Automatic Detection**: System detects duplicates during parsing
2. **Modal Display**: Shows comprehensive duplicate keys summary
3. **Copy Functionality**: Users can copy summary or detailed reports
4. **Visual Feedback**: Clear indication of which values were used/discarded

### Duplicate Detection Process

#### Parser Enhancement
- **Enhanced parseStrings()**: Now tracks all occurrences with line numbers
- **Detailed Tracking**: Records every duplicate occurrence with metadata
- **Structure Preservation**: Maintains file structure while tracking duplicates

#### Detection Points
1. **Single File Import**: When uploading individual .strings files
2. **Folder Import**: When processing entire folders with multiple .strings files
3. **Batch Processing**: Aggregates duplicates across all files in a folder

### Modal Features

#### Summary Statistics
- **Total Duplicate Keys**: Count of unique keys that had duplicates
- **Files Affected**: Number of files containing duplicates
- **Total Occurrences**: Sum of all duplicate instances

#### Detailed Breakdown
For each duplicate key:
- **Key Name**: The localization key that was duplicated
- **All Occurrences**: Every instance found with line numbers
- **Value Comparison**: Shows all different values found
- **Usage Status**: Clearly marked which value was kept (✓ USED) vs discarded (✗ DISCARDED)
- **Line Numbers**: Exact location in source files

#### Copy Functionality
1. **Copy Summary**: Basic report with statistics and key list
2. **Copy Detailed Report**: Complete breakdown in markdown format

### Example Output

#### Summary Report
```markdown
# Duplicate Keys Summary Report

**File:** my_app_en.strings
**Date:** 10/6/2025, 3:00:00 PM
**Total Duplicate Keys:** 3
**Total Occurrences:** 7

## Summary
Some files contain duplicate keys - the latest values will be used.

## Affected Keys
1. "welcome_message"
2. "app_title"
3. "button_ok"
```

#### Detailed Report
```markdown
### 1. Key: "welcome_message"

**Line 10:** ✓ USED (Latest value kept)
```
"welcome_message" = "Welcome to our app!";
```

**Line 5:** ✗ DISCARDED
```
"welcome_message" = "Welcome!";
```
```

### User Experience

#### Workflow
1. User imports folder/file with duplicates
2. Processing completes successfully
3. Modal automatically appears showing duplicate summary
4. User can review which values were kept
5. User can copy report for documentation
6. User clicks "Continue Import" to proceed

#### Visual Design
- **Color Coding**: Green for kept values, neutral for discarded
- **Clear Icons**: ✓ and ✗ symbols for immediate recognition
- **Line Numbers**: Badge-style indicators for easy reference
- **Responsive Layout**: Works on all screen sizes

### Technical Implementation

#### Core Files Modified

**1. src/utils/strings.ts**
- Enhanced `parseStrings()` with detailed duplicate tracking
- New `ParseResult` interface with `duplicateDetails` array
- Line number tracking for all key occurrences
- "Last wins" strategy with comprehensive logging

**2. src/components/DuplicateKeysModal.vue**
- New modal component for duplicate visualization
- Copy-to-clipboard functionality
- Responsive design with DaisyUI styling
- Summary and detailed report generation

**3. src/components/FolderUploader.vue**
- Integration with duplicate detection
- Modal triggering after processing
- Enhanced warning messages with actionable information

**4. src/stores/files.ts**
- Added `lastDuplicateData` state for modal data
- Enhanced return types for import functions
- Support for duplicate data structure

### Integration Points

#### Folder Import Flow
```typescript
1. processFolderFiles() → detects duplicates per file
2. Aggregate duplicate data across all files
3. Create modal data structure
4. Show modal if duplicates found
5. User reviews and continues
```

#### Single File Import Flow
```typescript
1. uploadFileToLanguage() → parseStrings with details
2. Check for duplicates in result
3. Store duplicate data in store
4. Return signal to show modal
5. Component handles modal display
```

### Data Structures

#### DuplicateData Interface
```typescript
interface DuplicateData {
  duplicateCount: number        // Unique duplicate keys
  duplicateKeys: string[]       // Array of key names
  duplicateDetails: Array<{     // Detailed breakdown
    key: string
    occurrences: Array<{
      value: string
      lineNumber: number
      used: boolean             // Latest value wins
    }>
  }>
  fileName?: string            // For single file imports
  affectedFiles?: number       // For folder imports
}
```

### Benefits

#### For Developers
- **Transparency**: Know exactly what changes during import
- **Debugging**: Line numbers help locate issues in source files
- **Documentation**: Copy reports for team communication
- **Quality Assurance**: Verify correct values were retained

#### For Teams
- **Communication**: Share duplicate reports with colleagues
- **Review Process**: Systematic way to handle conflicting localizations
- **Audit Trail**: Record of import decisions
- **Consistency**: Standardized approach to duplicate resolution

### Compatibility

#### File Format Support
- **iOS .strings only**: Specialized for iOS localization workflow
- **Comment Preservation**: Duplicates respect comment structure
- **Encoding Support**: UTF-8 with special character handling

#### Platform Integration
- **Xcode Compatible**: "Last wins" matches Xcode behavior
- **Structure Preserving**: Maintains original file formatting
- **Multi-language**: Works across all 4 supported languages (th, en, my, km)

### Error Handling

#### Edge Cases
- **Empty Files**: Handled gracefully with appropriate messages
- **Malformed .strings**: Clear error reporting with line context
- **Large Files**: Efficient processing with truncation safeguards
- **Memory Management**: Optimized for large projects (4,000+ keys)

### Performance Considerations

#### Optimization Features
- **Lazy Loading**: Modal content loads only when needed
- **Efficient Parsing**: Single-pass duplicate detection
- **Memory Efficient**: Minimal duplicate data storage
- **Responsive UI**: Non-blocking modal display

### Future Enhancements

#### Potential Improvements
- **Duplicate Resolution Options**: Let users choose "first wins" vs "last wins"
- **Interactive Resolution**: Manual selection of preferred values
- **Export Integration**: Include duplicate info in export changes report
- **Batch Conflict Resolution**: Handle duplicates across multiple imports

## Testing

- ✅ Build successful
- ✅ Modal displays correctly
- ✅ Copy functionality works
- ✅ Integration with folder import
- ✅ Proper TypeScript typing
- ✅ Responsive design
- ✅ Error handling

## Conclusion

This feature provides comprehensive duplicate key detection and reporting, enhancing transparency and control during the localization import process. It aligns with iOS development best practices while providing detailed audit capabilities for teams managing complex localization projects.
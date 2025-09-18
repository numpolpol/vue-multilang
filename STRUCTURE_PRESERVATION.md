# Structure Preservation Feature

## Overview

The Vue Multilang editor now preserves the original structure, comments, and key order when exporting iOS .strings files. This ensures that when you import a .strings file, edit the values, and export it back, the exported file maintains the same format as the original.

## How It Works

### 1. Enhanced Parsing
When uploading a .strings file, the editor now uses `parseStringsWithStructure()` which:
- Parses key-value pairs into editable data
- Preserves the original file structure including:
  - Block comments (`/* ... */`)
  - Line comments (`// ...`)
  - Blank lines
  - Key order
  - Original formatting

### 2. Structure-Preserving Export
When exporting, the editor uses `toStringsWithStructure()` which:
- Maintains original comments and blank lines
- Updates key-value pairs with edited values
- Preserves the original key order
- Adds new keys at the end with a comment marker
- Removes keys that were deleted during editing

### 3. Export Modes
- **Export All**: Exports all keys with current values
- **Export Changed**: Exports only keys that have been modified
- **Keep Order**: Uses structure preservation to maintain original format ✨

## Example

### Original File
```objc
/*
 * Financial App Localization - English
 * 4 Main Features: Account, Transactions, Investments, Settings
 */

// MARK: - Account Management Feature (25 strings)
/* Account Management - User accounts, profiles */

"account.title" = "My Account";
"account.balance" = "Account Balance";
"account.login" = "Sign In";

// MARK: - Transactions Feature (25 strings)
/* Transactions - Payments, transfers */

"transactions.title" = "Transactions";
"transactions.send_money" = "Send Money";
```

### After Editing and Export
```objc
/*
 * Financial App Localization - English
 * 4 Main Features: Account, Transactions, Investments, Settings
 */

// MARK: - Account Management Feature (25 strings)
/* Account Management - User accounts, profiles */

"account.title" = "My Profile";           // ← Value updated
"account.balance" = "Available Balance";  // ← Value updated
"account.login" = "Sign In";             // ← Unchanged

// MARK: - Transactions Feature (25 strings)
/* Transactions - Payments, transfers */

"transactions.title" = "Transactions";   // ← Unchanged
"transactions.send_money" = "Send Money"; // ← Unchanged

// New keys added during editing
"account.new_feature" = "New Feature";   // ← New key added
```

## Benefits

1. **Maintains Organization**: Comments and structure help organize large localization files
2. **Preserves Context**: MARK comments and feature groupings remain intact
3. **Version Control Friendly**: Minimal diffs when only values change
4. **Team Collaboration**: Developers can maintain their file organization
5. **Documentation**: Comments provide context for translators

## Technical Implementation

### Store Enhancement
```typescript
export interface LanguageColumn {
  // ... existing properties
  originalStructure?: ParsedStringsFile['structure']
  originalContent?: string
}
```

### Enhanced Parsing
```typescript
interface ParsedStringsFile {
  data: Record<string, string>
  structure: Array<{
    type: 'comment' | 'key' | 'blank'
    content: string
    key?: string
    value?: string
  }>
  originalContent: string
}
```

### Export Functions
- `toStrings()`: Simple export (legacy)
- `toStringsWithStructure()`: Structure-preserving export ✨

## Fallback Behavior

If original structure is not available (e.g., for files created from scratch), the export falls back to the simple format without comments.

## Compatibility

This feature is fully backward compatible:
- Existing projects continue to work unchanged
- New uploads automatically gain structure preservation
- Both export modes are available for all files
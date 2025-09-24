<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization #_use-a-githubcopilotinstructionsmd-file -->

# Vue Multi-Language Editor - iOS .strings File Manager

## Core Architecture
This is a **Vue 3 + TypeScript + Pinia + Vite** webapp specialized for editing iOS `.strings` files in a multi-language workflow. The app supports side-by-side editing of localization keys across multiple languages with advanced features like key merging, JSON flattening, and dual-key mode.

## Key Data Structures & Patterns

### Dual State Management
The app maintains **two parallel data structures** for backward compatibility:
- **New Structure**: `LanguageColumn[]` in `src/stores/files.ts` with `{code, name, data, hasFile, fileType}`
- **Legacy Structure**: `File[]` + `Record<string, string>[]` for existing components
- **Critical**: Always call `syncLanguagesToFiles()` after language column updates

### File Format Support
- **iOS .strings**: `"key" = "value";` - Primary format with structure preservation
- **Android .xml**: `<string name="key">value</string>` - Secondary for dual-key mode  
- **JSON**: Nested objects with automatic flattening via `src/utils/jsonFlattening.ts`
- **TSV**: Tab-separated multi-language import (key + th/en/km/my columns)

### Key Merging Logic (Dual-Key Mode)
When enabled via navbar toggle, keys with **identical values across ALL languages** are merged:
```typescript
// Example: "common_ok" + "android_common_ok" if both = "OK" in all languages
// Implemented in findMergeableKeys() and applyKeyMerging()
```

## Essential Developer Workflows

### Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Type-check + build
npm run test         # Run Vitest tests
npm run test:ui      # Interactive test UI
npm run deploy       # Build + deploy to GitHub Pages
```

### Testing Key Features
Use sample files in `src/sample/` for testing:
- `test_en.strings` + `test_th.strings` for basic multi-language
- `test_en.xml` for dual-key mode testing
- JSON files for flattening tests

### Key File Locations
- **State Management**: `src/stores/files.ts` - Main store with language columns + dual-key logic
- **String Parsing**: `src/utils/strings.ts` - iOS .strings parser with structure preservation
- **JSON Flattening**: `src/utils/jsonFlattening.ts` - Nested JSON ↔ flat key conversion
- **Main Editor**: `src/views/Editor.vue` + `src/components/JsonTable.vue`

## Project-Specific Conventions

### File Parsing Approach
```typescript
// Always use parseStrings() with duplicate detection
const parseResult = parseStrings(content, true) 
// Returns: {data, duplicateCount, duplicateKeys}

// For structure preservation (.strings only):
const parsed = parseStringsWithStructure(content)
// Returns: {data, structure, originalContent}
```

### Language Column Management
```typescript
// Add language: creates empty entries for all existing keys
store.addLanguageColumn(code, name)

// Upload to specific language with file type detection
await store.uploadFileToLanguage(languageCode, file, fileType)

// Always sync after language column changes
store.syncLanguagesToFiles()
```

### Export Format Rules
- **iOS Export**: Uses `splitMergedData()` to separate merged keys back to iOS format
- **Android Export**: Extracts Android-specific keys from merged pairs
- **JSON Export**: Uses `unflattenObject()` to reconstruct nested structure

## Critical Integration Points

### Dual-Key Mode State
- Toggle in navbar sets `store.useDualKeys` 
- Triggers `processMergedKeys()` which calls `findMergeableKeys()` + `applyKeyMerging()`
- Visual indicator: chain icon (🔗) in table header + "merged" badges on rows

### Notification System
Uses `src/composables/useNotifications.ts` for user feedback:
```typescript
const { info, warning, error } = useNotifications()
warning(`${duplicateCount} duplicate keys`, 'Details...')
```

### GitHub Pages Deployment
- Custom `vite-plugins.ts` fixes asset paths for `/vue-multilang/` base path
- Deploy: `npm run deploy` (builds + pushes to gh-pages branch)
- Production base configured in `vite.config.ts`

## Component Communication Patterns
- **Props down**: File data flows from store → Editor → JsonTable → TableRow
- **Events up**: User actions emit events that trigger store actions
- **Store reactivity**: Components reactively update when store getters change
- **Modal patterns**: Uses DaisyUI modals with `dialog` elements for key editing

Focus on iOS `.strings` format as primary use case, with Android XML and JSON as secondary supported formats.

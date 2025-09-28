<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization #_use-a-githubcopilotinstructionsmd-file -->

# Vue Multi-Language Editor - iOS .strings File Manager

## Core Architecture
This is a **Vue 3 + TypeScript + Pinia + Vite** webapp specialized for editing iOS `.strings` files. The app supports side-by-side editing of localization keys across 4 supported languages with comment preservation and project management features.

## Supported Languages (iOS Only)
- **Thai (th)**: ไทย (Thai)
- **English (en)**: English  
- **Myanmar (my)**: မြန်မာ (Myanmar)
- **Khmer (km)**: ខ្មែរ (Khmer)

## Key Data Structures & Patterns

### Language Column Structure
The app uses `LanguageColumn[]` in `src/stores/files.ts`:
```typescript
interface LanguageColumn {
  code: string                    // Language code (th, en, my, km)
  name: string                    // Display name
  data: Record<string, string>    // Key-value pairs
  hasFile: boolean               // Whether file was uploaded
  fileType?: 'strings'           // Only iOS .strings supported
  originalStructure?: Array<...> // Preserve comments & formatting
  originalContent?: string       // Original file content
}
```

### File Format Support
- **iOS .strings**: `"key" = "value";` - ONLY supported format with full structure preservation
- **Comment Preservation**: Full support for `/* */`, `//` comments and original formatting

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
- `multi_en.strings` + `multi_th.strings` for structure preservation tests
- Any `.strings` files for comment preservation validation

### Key File Locations
- **State Management**: `src/stores/files.ts` - Main store with language columns (iOS-only)
- **String Parsing**: `src/utils/strings.ts` - iOS .strings parser with structure preservation
- **Folder Processing**: `src/utils/folderProcessor.ts` - Language validation and filtering
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
- **iOS Export**: Uses `toStringsWithStructure()` to preserve comments and original structure when available
- **Structure Preservation**: Maintains original file formatting and comments through save/load cycle

## Critical Integration Points

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

Focus on iOS `.strings` format as primary use case, supporting only 4 languages (th, en, my, km) with full comment preservation.

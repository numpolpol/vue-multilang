# Multi Language Editor

A Vue 3 + TypeScript webapp for editing multiple iOS .strings files side-by-side, designed to streamline multilingual app development workflows.

## 📚 Documentation

- **[Thai Documentation](./MULTI_LANGUAGE_EDITOR_DOCUMENTATION.md)** - เอกสารภาษาไทยแบบละเอียด
- **[English Documentation](./MULTI_LANGUAGE_EDITOR_DOCUMENTATION_EN.md)** - Comprehensive English documentation

## 🚀 Quick Start

### Core Features
- **Multi-Format Support**: iOS .strings, Android .xml, JSON with automatic flattening
- **Import Options**: Individual file uploads or complete folder imports
- **Complete Comment Preservation**: All comments, structure, and formatting maintained from import to export
- **Side-by-Side Editing**: View and edit all languages simultaneously
- **Dual-Key Mode**: Merge identical values across languages for efficient editing
- **Advanced Export**: Structure-preserving exports with original comments and formatting
- **Project Management**: Save/load projects with full state preservation
- **Visual Annotation**: Upload UI images and map text positions
- **Search & Filter**: Powerful filtering and search capabilities

### How to Use

#### Method 1: Individual File Upload
1. **Upload Files**: Use "Upload File" to add individual .strings files (en.strings, th.strings, etc.)
2. **Edit Content**: View all languages side-by-side, edit values directly in the table
3. **Export**: Download individual language files with all comments preserved

#### Method 2: Folder Import (Recommended)
1. **Select Folder**: Click "Import Folder" and select a folder containing .strings files
2. **Auto-Detection**: Language codes are automatically detected from filenames (en.strings, th.strings, etc.)
3. **Batch Processing**: All files processed simultaneously with structure preservation
4. **Project Creation**: Automatically creates a new project with all languages loaded

#### Advanced Features
- **Comment Preservation**: All comments (header, inline, block) are preserved exactly during editing
- **Dual-Key Mode**: Toggle to merge keys with identical values across all languages
- **JSON Flattening**: Import nested JSON and automatically flatten for localization
- **Multi-Format Export**: Export to iOS .strings, Android .xml, or JSON formats
- **Visual Annotation**: Upload UI screenshots and annotate text positions for context

#### Export Options
- **Single Language**: Click column header menu → "Export Language"
- **All Languages**: Use export controls to download all languages at once
- **Format Selection**: Choose between iOS .strings, Android .xml, or JSON format
- **Structure Preservation**: All original comments and formatting maintained

## 🛠 Tech Stack
- Vue 3 + TypeScript + Pinia + Vite
- Tailwind CSS + DaisyUI
- GitHub Pages deployment

## 💡 Why This Tool?

This tool solves common problems in multilingual app development:
- **For Product Teams**: Visual text positioning on UI images
- **For Developers**: Unified key system across iOS/Android
- **For QA Teams**: Easy change tracking and verification

See the documentation links above for detailed problem analysis and solutions.

---

*This project was built to solve real workflow problems in multilingual mobile app development.*

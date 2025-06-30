# JSON Flattening Support for Multi-language Localization

## 📄 Overview

The Vue Multilingual Translation App now supports **JSON file uploads with automatic flattening**, allowing you to work with complex nested JSON structures as simple key-value pairs. This feature is perfect for modern web applications that use nested i18n JSON files.

## ✨ Key Features

### 🔄 Automatic JSON Flattening
- **Upload nested JSON files** directly to any language column
- **Automatically flattens** complex structures to editable key-value pairs
- **Maintains data integrity** through the flatten/unflatten process
- **Supports reconstruction** back to original nested structure

### 📊 Flexible Configuration
- **Multiple presets** for different use cases (web, mobile, config, simple)
- **Configurable separators** (dot notation, underscore, custom)
- **Depth control** to prevent excessive nesting
- **Array handling** with multiple strategies

### 🎯 Multi-format Export
- **JSON export** (nested structure)
- **iOS .strings export** (flat key-value)
- **Android XML export** (flat key-value)

## 🚀 How to Use

### 1. Upload JSON Files
1. Go to any language column in the Editor
2. Click the **📁 Upload button**
3. Select **"JSON File"** option
4. Choose your nested JSON file
5. The system automatically flattens it to editable keys

### 2. Edit Flattened Data
- All nested keys become flat keys like `user.profile.name`
- Edit values directly in the table
- Use all existing features (search, filter, etc.)

### 3. Export Results
- **JSON format**: Reconstructs the original nested structure
- **iOS/Android formats**: Uses flattened keys
- Choose format in the export dialog

## 📋 Supported JSON Structures

### Nested Objects
```json
{
  "user": {
    "profile": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```
**Becomes:** `user.profile.name`, `user.profile.email`

### Mixed Data Types
```json
{
  "config": {
    "debug": true,
    "version": 1.2,
    "features": ["auth", "notifications"]
  }
}
```
**Becomes:** `config.debug`, `config.version`, `config.features`

### Deep Nesting
```json
{
  "app": {
    "ui": {
      "components": {
        "button": {
          "primary": "Submit",
          "secondary": "Cancel"
        }
      }
    }
  }
}
```
**Becomes:** `app.ui.components.button.primary`, `app.ui.components.button.secondary`

## 🔧 Flattening Presets

### Web Applications (Default)
```typescript
{
  separator: '.',
  maxDepth: 5,
  preserveArrays: true,
  includeArrayIndices: false
}
```
Best for: React/Vue i18n files, web app configurations

### Mobile Applications
```typescript
{
  separator: '_',
  maxDepth: 3,
  preserveArrays: false,
  includeArrayIndices: true
}
```
Best for: iOS/Android localization files

### Configuration Files
```typescript
{
  separator: '.',
  maxDepth: 10,
  preserveArrays: false,
  includeArrayIndices: true
}
```
Best for: Complex config files, API responses

### Simple Key-Value
```typescript
{
  separator: '_',
  maxDepth: 2,
  preserveArrays: true,
  includeArrayIndices: false
}
```
Best for: Simple flat structures, basic translations

## 📚 Examples

### Input: Complex Web App i18n
```json
{
  "navigation": {
    "header": {
      "home": "Home",
      "about": "About Us"
    },
    "footer": {
      "contact": "Contact",
      "privacy": "Privacy Policy"
    }
  },
  "forms": {
    "login": {
      "title": "Sign In",
      "fields": {
        "username": "Username",
        "password": "Password"
      },
      "actions": {
        "submit": "Login",
        "forgot": "Forgot Password?"
      }
    }
  }
}
```

### Output: Flattened Keys
```
navigation.header.home = "Home"
navigation.header.about = "About Us"
navigation.footer.contact = "Contact"
navigation.footer.privacy = "Privacy Policy"
forms.login.title = "Sign In"
forms.login.fields.username = "Username"
forms.login.fields.password = "Password"
forms.login.actions.submit = "Login"
forms.login.actions.forgot = "Forgot Password?"
```

### Export Options

#### 1. JSON Export (Reconstructed)
```json
{
  "navigation": {
    "header": {
      "home": "Accueil",
      "about": "À Propos"
    }
  }
}
```

#### 2. iOS .strings Export
```
"navigation.header.home" = "Accueil";
"navigation.header.about" = "À Propos";
```

#### 3. Android XML Export
```xml
<resources>
    <string name="navigation.header.home">Accueil</string>
    <string name="navigation.header.about">À Propos</string>
</resources>
```

## 🎯 Use Cases

### 1. **Modern Web Applications**
- React i18next JSON files
- Vue i18n nested translations
- Angular locale files

### 2. **API Responses**
- Multilingual content from CMS
- Dynamic translation keys
- Server-side localization data

### 3. **Configuration Files**
- App settings with translations
- Feature flags with descriptions
- User preference labels

### 4. **Content Management**
- Blog post metadata
- Product descriptions
- Marketing copy

## 🔍 Sample Files

Try the feature with our sample files:

**English (en.json):**
- Contains complete nested structure
- App interface, forms, validation messages
- 67+ translation keys

**Thai (th.json):**
- Thai translations for all English keys
- Demonstrates Unicode support
- Perfect for testing Asian languages

## ⚡ Performance

- **Fast processing**: Handles large JSON files efficiently
- **Memory optimized**: Streaming approach for big files
- **Error handling**: Graceful fallbacks for invalid JSON
- **Type safety**: Full TypeScript support

## 🛠️ Technical Details

### File Processing Pipeline
1. **Upload** → Parse JSON content
2. **Validate** → Check structure and syntax
3. **Flatten** → Convert to key-value pairs
4. **Integrate** → Merge with existing data
5. **Edit** → Use standard table interface
6. **Export** → Choose output format

### Supported File Types
- `.json` - Standard JSON files
- **Any text file** containing valid JSON
- **Drag & drop** or file picker upload
- **UTF-8 encoding** for international characters

## 📖 Getting Started

1. **Create a new project** or open existing one
2. **Download sample files**: `src/sample/en.json`, `src/sample/th.json`
3. **Upload JSON file** to any language column
4. **Edit translations** in the flattened table view
5. **Export results** in your preferred format

## 🎉 Benefits

- ✅ **Zero learning curve** - works with existing interface
- ✅ **No data loss** - perfect reconstruction capability
- ✅ **Flexible export** - multiple output formats
- ✅ **Unicode support** - works with all languages
- ✅ **Performance optimized** - handles large files
- ✅ **Type safe** - full TypeScript integration

---

*This feature enhances the Vue Multilingual Translation App to support modern development workflows while maintaining the simplicity of the key-value editing interface.*

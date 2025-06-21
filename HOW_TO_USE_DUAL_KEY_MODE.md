# How to Use Dual Key Mode

## Overview
Dual Key Mode allows you to work with both iOS (.strings) and Android (.xml) translation files simultaneously, automatically merging keys that have identical values across all languages.

## Step-by-Step Instructions

### Step 1: Enable Dual Key Mode
1. Open the Vue Multilang Editor
2. Look at the **navbar (top center)** of the application
3. Find the toggle labeled **"Dual Keys (.strings + .xml)"**
4. **Click the toggle** to enable it - it should turn blue/accent color when enabled

### Step 2: Prepare Your Files
You need matching translation files for the same languages:

**Example file structure:**
```
en.strings    (iOS English)
en.xml        (Android English)
th.strings    (iOS Thai)  
th.xml        (Android Thai)
```

**Sample iOS file (en.strings):**
```
"common_ok" = "OK";
"common_cancel" = "Cancel";
"home_title" = "Welcome";
```

**Sample Android file (en.xml):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="android_common_ok">OK</string>
    <string name="android_common_cancel">Cancel</string>
    <string name="android_home_welcome">Welcome</string>
</resources>
```

### Step 3: Upload Files
1. Click the **"Add Language Column"** button (+ icon)
2. Select **multiple files** at once (both .strings and .xml for each language)
3. The system will automatically group files by language
4. You'll see a confirmation message about how many language groups were processed

### Step 4: What You'll See

#### Visual Indicators:
- **Dual Key Badge**: A small chain/link icon (🔗) appears next to "Key" in the table header
- **Merged Keys**: Keys with matching values are displayed as `ios_key + android_key`
- **Merged Badge**: Individual merged rows show a small "merged" badge

#### Key Merging Examples:
If these keys have **identical values** across ALL languages:
- `common_ok = "OK"` (iOS)
- `android_common_ok = "OK"` (Android)

They will be **merged** and displayed as:
- `common_ok + android_common_ok = "OK"`

### Step 5: Editing Merged Keys
1. **Edit normally** - type in the value field
2. **Changes apply to both** iOS and Android keys automatically
3. **Values stay synchronized** across both platforms

### Step 6: Export Files
1. Click the **export button** (hamburger menu → Export)
2. Choose your export format:
   - **iOS (.strings)**: Gets the iOS keys (`common_ok = "OK"`)
   - **Android (.xml)**: Gets the Android keys (`<string name="android_common_ok">OK</string>`)
3. Merged keys are automatically split back to their original platform-specific formats

## Key Merging Rules

### ✅ Keys WILL be merged when:
- Values are **identical** across ALL languages
- Only **2 keys** have the same values (iOS + Android)
- All language files contain the same value for both keys

### ❌ Keys will NOT be merged when:
- Values are **different** in any language
- **Missing values** in some languages
- **More than 2 keys** have the same values
- **Empty values** in any language

## Example Workflow

### 1. Before Merging:
```
English:
- common_ok = "OK"
- android_common_ok = "OK" 
- home_title = "Welcome"
- android_home_title = "Hello"  (different value)

Thai:
- common_ok = "ตกลง"
- android_common_ok = "ตกลง"
- home_title = "ยินดีต้อนรับ" 
- android_home_title = "สวัสดี"  (different value)
```

### 2. After Merging:
```
✅ MERGED: common_ok + android_common_ok = "OK", "ตกลง"
❌ SEPARATE: home_title = "Welcome", "ยินดีต้อนรับ"
❌ SEPARATE: android_home_title = "Hello", "สวัสดี"
```

## Troubleshooting

### "I don't see the dual key badge"
- Make sure the toggle is **enabled** (blue/accent color)
- Upload some files first
- The badge only appears when dual key mode is active

### "My keys aren't merging"
- Check that values are **exactly identical** across all languages
- Verify you have both .strings and .xml files for the same language
- Look for extra spaces or different quotation marks

### "Export isn't working correctly"
- The system automatically splits merged keys during export
- iOS export gets the first part of merged keys
- Android export gets the second part of merged keys

## Benefits of Dual Key Mode

1. **Reduce Duplication**: No need to edit identical translations twice
2. **Visual Clarity**: See which keys are shared between platforms
3. **Sync Editing**: Edit once, update both platforms
4. **Smart Export**: Automatic platform-specific file generation
5. **Error Prevention**: Avoid inconsistencies between iOS and Android translations

## Quick Test
Try it with the sample files in `/src/sample/`:
- `test_en.strings` and `test_en.xml` 
- `test_th.xml`

These contain matching keys that will demonstrate the merging behavior!

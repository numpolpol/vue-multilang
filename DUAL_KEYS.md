# Dual Key Support Feature

## Overview
The dual key feature allows users to upload and merge both `.strings` (primary) and `.xml` (secondary) files for the same language. This is useful when working with iOS and Android localization files that may have overlapping keys.

## How it works

### 1. Enable Dual Key Mode
- In the editor navbar, toggle "Dual Keys (.strings + .xml)" to enable dual key mode
- A link icon appears in the "Key" column header when active

### 2. Upload Multiple Files
- When dual key mode is enabled, you can upload multiple files at once
- Files are automatically grouped by language code (filename prefix)
- Example: `en.strings` and `en.xml` will be grouped as "en" language

### 3. Merge Logic
The system uses the following merge logic:

#### For matching keys:
- If values are the same → Use the common value (merged row)
- If values differ → Keep primary (.strings) value, add secondary (.xml) with `_secondary` suffix

#### For unique keys:
- Keys only in `.strings` → Included as-is
- Keys only in `.xml` → Included as-is

### 4. Visual Indicators
- Dual key mode shows a link icon in the Key column header
- All editing functionality remains the same
- Export works with merged data

## Example Usage

### Input Files:
**en.strings:**
```
"register_foreigner_title" = "Registration";
"shared_key" = "Shared Value";
"ios_only_key" = "iOS Only";
```

**en.xml:**
```xml
<resources>
    <string name="register_foreigner_title">Registration</string>
    <string name="shared_key">Different Value</string>
    <string name="android_only_key">Android Only</string>
</resources>
```

### Merged Result:
- `register_foreigner_title` = "Registration" (values match)
- `shared_key` = "Shared Value" (primary value kept)
- `shared_key_secondary` = "Different Value" (secondary value with suffix)
- `ios_only_key` = "iOS Only"
- `android_only_key` = "Android Only"

## Benefits
1. **Unified editing**: Edit both iOS and Android strings in one interface
2. **Conflict resolution**: Clear handling of differing values
3. **No data loss**: All keys from both files are preserved
4. **Flexible workflow**: Can toggle dual key mode on/off as needed

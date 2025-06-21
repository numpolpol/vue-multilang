# Key Merging Feature

## Overview

The key merging feature automatically combines iOS (.strings) and Android (.xml) translation keys when their values match across all languages. This reduces redundancy and makes it easier to manage translations that are the same across platforms.

## How It Works

### 1. Key Detection
When dual key mode is enabled, the system looks for keys that have identical values across all uploaded language files.

### 2. Merging Logic
- If two keys have the same values in ALL languages, they are merged into a single row
- The iOS key (from .strings files) is treated as the primary key
- The Android key (from .xml files) is treated as the secondary key
- The merged row displays both keys: `primary_key + secondary_key`

### 3. Example

**Before merging:**
```
iOS file (en.strings):
"common_ok" = "OK";

Android file (en.xml):
<string name="android_common_ok">OK</string>

iOS file (th.strings):
"common_ok" = "ตกลง";

Android file (th.xml):
<string name="android_common_ok">ตกลง</string>
```

**After merging:**
The table shows a single row:
- Key: `common_ok + android_common_ok` (with special formatting)
- English value: "OK"
- Thai value: "ตกลง"

## Usage

1. Enable **Dual Keys Mode** in the navbar
2. Upload both .strings and .xml files for the same languages
3. Keys with matching values will automatically be merged and displayed with a "merged" badge
4. Edit values normally - changes apply to both the iOS and Android keys
5. Export will generate separate .strings and .xml files with the correct keys

## UI Indicators

- **Dual Key Mode Badge**: Shows when dual key mode is active
- **Merged Key Display**: Primary key shown in blue, secondary key in gray
- **Merged Badge**: Small "merged" badge indicates which keys have been combined

## Key Matching Rules

- Keys are only merged if ALL language values are identical
- Empty or missing values prevent merging
- Keys with different values remain separate
- More than 2 keys with the same values are kept separate for clarity

## Benefits

- Reduces visual clutter in the translation table
- Prevents duplicate work when iOS and Android use the same text
- Maintains separate export files for each platform
- Easy to identify which keys are shared across platforms

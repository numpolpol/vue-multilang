# How to Test Dual Key Mode and Key Merging

## Steps to see the dual key mode indicator:

### 1. Enable Dual Key Mode
- Go to the navbar in the center
- Look for the "Dual Keys (.strings + .xml)" toggle
- Click the toggle to enable it (it should turn blue/accent color)

### 2. Upload Test Files
You can use the sample files I created:
- `src/sample/test_en.strings`
- `src/sample/test_en.xml` 
- `src/sample/test_th.xml`

Or create your own files with matching keys:

**test_en.strings:**
```
"common_ok" = "OK";
"common_cancel" = "Cancel";
```

**test_en.xml:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="android_common_ok">OK</string>
    <string name="android_common_cancel">Cancel</string>
</resources>
```

### 3. Expected Results
- **Navbar**: The dual key toggle should be turned ON (blue/accent color)
- **Table Header**: A small badge with a link icon should appear next to "Key" 
- **Merged Rows**: Keys with matching values will show as "common_ok + android_common_ok"
- **Visual Indicators**: Merged rows will have a "merged" badge

### 4. If you don't see the dual key indicator:
- Make sure the toggle in the navbar is enabled (blue/accent color)
- Make sure you have files uploaded
- The badge only appears when dual key mode is actually active

## What the dual key mode badge looks like:
It's a small blue/accent badge with a chain/link icon (🔗) that appears next to "Key" in the table header.

## Testing the Merging:
1. Enable dual key mode
2. Upload files with matching values across languages
3. Look for merged keys displayed as "primary_key + secondary_key"
4. Merged keys should have a small "merged" badge in the key cell

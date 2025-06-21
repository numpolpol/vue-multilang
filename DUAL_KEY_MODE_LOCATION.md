# Visual Guide: Where to Find Dual Key Mode

## Location: Top Navigation Bar (Center Section)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ☰  Multi Language Editor                                           │
│                                                                     │
│           [View Mode ▼] [Highlight ◯] [Skip Columns ▼] [Dual Keys ◯]│
│             All Keys      Changes         0             .strings+.xml│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Steps to Enable:

### 1. Look for the Toggle Switch
- In the **center** of the top navigation bar
- Labeled **"Dual Keys (.strings + .xml)"**
- It's a small toggle switch (like a light switch)

### 2. Current State Indicators:
- **OFF**: Toggle is gray/neutral color
- **ON**: Toggle is blue/accent color

### 3. Click to Enable
- Click the toggle switch
- It should change from gray to blue
- The text may also change to indicate it's active

## What Happens When Enabled:

### ✅ Dual Key Mode ON:
- Toggle is **blue/accent** color
- When you upload files, you'll see the chain icon (🔗) next to "Key" in the table
- Files will be processed for key merging
- Upload dialog will group .strings and .xml files by language

### ❌ Dual Key Mode OFF:
- Toggle is **gray/neutral** color
- Files are processed individually (normal mode)
- No key merging occurs
- No dual key indicators appear

## Quick Test:
1. ✅ Enable the toggle (make it blue)
2. ✅ Upload the test files from `/src/sample/`:
   - `test_en.strings` 
   - `test_en.xml`
   - `test_th.strings` 
   - `test_th.xml`
3. ✅ Look for the chain icon (🔗) next to "Key" in the table header
4. ✅ Look for merged keys like `common_ok + android_common_ok`

## Troubleshooting:
- **Can't find the toggle?** Look in the center section of the top navbar
- **Toggle won't turn blue?** Try clicking directly on the switch part
- **Still no dual key indicator?** Make sure you upload files AFTER enabling the toggle

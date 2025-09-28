# Section Filtering in Pages Mode

## Overview
Enhanced the search functionality in Pages/Sections mode to intelligently filter both sections and keys simultaneously, providing a much better user experience when working with large localization projects.

## Problem Solved
Previously, when in Pages mode (sectioned by key prefixes like `home_`, `settings_`, etc.), searching would only filter the keys within the currently selected section. Empty sections would remain visible even if they had no matching results, causing confusion.

## New Behavior

### **Smart Section Filtering**
- **Search Query** → Filters both keys AND sections
- **Empty Sections** → Automatically hidden during search
- **Auto-Switch** → Jumps to first section with results
- **Clear Search** → Restores all sections

### **How It Works**

1. **Search Applied**:
   ```
   Original: [home, settings, profile, help] sections
   Search: "button"
   Result: [home, settings] sections (only ones with "button" keys)
   ```

2. **Section Auto-Switch**:
   ```
   Current section: "profile"
   Search: "login" 
   → Auto-switches to "auth" section (first with login keys)
   ```

3. **Visual Feedback**:
   - Section tabs show only relevant sections
   - Keys within sections are filtered normally
   - Search counters reflect both section and key filtering

## Implementation Details

### **Key Components Added**

#### 1. Filtered Page Prefixes
```typescript
const filteredPagePrefixes = computed(() => {
  const query = debouncedSearch.value.trim()
  if (!query) return pagePrefixes.value
  
  const matchingKeys = getFilteredKeysForQuery(query, allKeys.value)
  const matchingPrefixes = new Set<string>()
  matchingKeys.forEach(key => {
    const prefix = getPagePrefix(key)
    if (prefix) matchingPrefixes.add(prefix)
  })
  
  return Array.from(matchingPrefixes)
})
```

#### 2. Extracted Search Logic
```typescript
const getFilteredKeysForQuery = (query: string, keysToFilter: string[]) => {
  // Reusable search logic for both main filtering and section analysis
  // Supports all search modes: empty:, key:, value:, regex, multi-term
}
```

#### 3. Auto-Section Switching
```typescript
watch([filteredPagePrefixes, debouncedSearch], () => {
  if (mode.value === 'paging' && debouncedSearch.value.trim()) {
    if (selectedPage.value && !filteredPagePrefixes.value.includes(selectedPage.value)) {
      if (filteredPagePrefixes.value.length > 0) {
        selectedPage.value = filteredPagePrefixes.value[0]
      }
    }
  }
})
```

## Usage Examples

### **Scenario 1: Button Search**
```
Sections: home_, settings_, profile_, auth_, help_
Search: "button"
Result: Shows only [home_, settings_] tabs with matching button keys
```

### **Scenario 2: Empty Search Result**
```
Search: "nonexistent"
Result: No section tabs shown, empty state displayed
```

### **Scenario 3: Specific Value Search**
```
Search: "value:Login"
Result: Shows sections containing keys with "Login" in their values
```

### **Scenario 4: Key Pattern Search**
```
Search: "key:error"
Result: Shows sections with keys containing "error" in key names
```

## Benefits

✅ **Better Navigation** - Only see relevant sections  
✅ **Faster Discovery** - No need to check empty sections  
✅ **Intuitive UX** - Auto-switches to results  
✅ **Consistent Behavior** - Works with all search modes  
✅ **Performance** - Efficient filtering without API changes  

## Backwards Compatibility

- All existing search modes work unchanged
- No breaking changes to component APIs
- Graceful fallback when no sections match
- Preserves section selection when search is cleared

This enhancement makes working with large, well-structured localization projects much more efficient! 🎯
# Page Section Support for Keys with Dashes

## Overview
The application now supports keys with dashes (-) in the page section name. The character(s) before the underscore (_) will be treated as the page section identifier.

## Key Format
```
[page-section]_[key-name]
```

## Examples

### ✅ Supported Key Formats

#### Original Format (still supported)
```
home_title = "Home Title";
home_subtitle = "Subtitle";
settings_button = "Settings";
```
**Page Section:** `home`, `settings`

#### New Format with Dashes
```
home-screen_title = "Welcome Home";
home-screen_subtitle = "Your dashboard overview";
user-profile_name = "Full Name";
user-profile_email = "Email Address";
login-form_username = "Username";
login-form_password = "Password";
shopping-cart_total = "Total Amount";
product-details_price = "Price";
```
**Page Sections:** `home-screen`, `user-profile`, `login-form`, `shopping-cart`, `product-details`

#### Multiple Dashes
```
main-navigation-bar_logo = "Logo";
user-account-settings_privacy = "Privacy";
```
**Page Sections:** `main-navigation-bar`, `user-account-settings`

#### Keys Without Underscores
```
dashboard = "Dashboard";
welcome = "Welcome";
```
**Page Sections:** `dashboard`, `welcome` (each key is its own section)

## How It Works

### Page Section Extraction
The application uses a `getPagePrefix()` function that:
1. Finds the first underscore (_) in the key
2. Takes everything before that underscore as the page section
3. If no underscore is found, the entire key becomes the page section

### Page Sections View
When you switch to "Page Sections View" mode:
- Keys are grouped by their page section prefix
- Tabs are created for each unique page section
- Keys like `home-screen_title` and `home-screen_subtitle` will appear under the `home-screen` tab
- Original keys like `home_title` will appear under the `home` tab

### Fullscreen Image Annotations
In the fullscreen image view with annotations:
- Only keys belonging to the current page section are shown in the key list
- For example, if viewing an image for the `user-profile` section, only keys starting with `user-profile_` will be available for annotation

## Migration
- **Backward Compatible:** All existing keys without dashes continue to work exactly as before
- **No Breaking Changes:** The update only extends support for dash characters
- **Flexible:** You can mix old and new formats in the same project

## Use Cases
This feature is particularly useful for:
- **Screen-based Organization:** `login-screen_`, `signup-screen_`, `dashboard-screen_`
- **Component-based Keys:** `nav-bar_`, `side-menu_`, `footer-section_`
- **Feature-based Grouping:** `user-profile_`, `shopping-cart_`, `payment-form_`
- **Multi-word Sections:** `forgot-password_`, `terms-of-service_`, `privacy-policy_`

## Technical Implementation
- **Function:** `getPagePrefix(key: string): string`
- **Logic:** `key.substring(0, key.indexOf('_'))` or return the full key if no underscore
- **Performance:** O(1) operation using native string methods
- **Memory:** Minimal overhead, no regex or complex parsing

## Implementation Details
The implementation uses a simple and efficient approach:

```javascript
function getPagePrefix(key: string): string {
  // Find the first underscore and take everything before it as the prefix
  const underscoreIndex = key.indexOf('_')
  if (underscoreIndex === -1) return key // If no underscore, the whole key is the prefix
  return key.substring(0, underscoreIndex)
}
```

This function is used in:
- `pagePrefixes` computed property - to get all unique page sections
- `visibleKeys` computed property - to filter keys for the current page section
- `currentPageKeys` computed property - to get keys for fullscreen image annotations

## Testing
You can test this feature by:
1. Creating keys with dashes in the page section (e.g., `home-screen_title`)
2. Switching to "Page Sections View" mode
3. Verifying that keys are properly grouped under the correct page section tabs
4. Using the fullscreen image annotation feature to see filtered keys by section

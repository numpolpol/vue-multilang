# Comment Preservation Guide

## Overview

The Multi-Language Editor now fully preserves **all comments and formatting** from your imported .strings files through the entire editing workflow. This means your file headers, section comments, and inline documentation remain intact from import to export.

## What Comments Are Preserved

✅ **Header Comments**: Multi-line copyright and file information  
✅ **Section Comments**: `// MARK:` and other organizational comments  
✅ **Inline Comments**: Comments after key-value pairs  
✅ **Block Comments**: `/* */` style comments anywhere in the file  
✅ **Mixed Comments**: Lines with both comments and code  
✅ **Formatting**: All spacing and structure preserved exactly  

## Example

### Input File (km.strings)
```strings
/* 
  km.strings
  V1

  Created by stephen.bod on 22/6/2564 BE.
  Copyright © 2564 BE Ascend Money Thailand. All rights reserved.
*/

// MARK: Common
"common_transaction_complete" = "ជោគជ័យ";
"common_mobile_number" = "Mobile number"; // Input field
"common_email" = "Email";
/* Button text */ "common_footer_share_button" = "ស៊ែរ";
```

### After Editing and Export
```strings
/* 
  km.strings
  V1

  Created by stephen.bod on 22/6/2564 BE.
  Copyright © 2564 BE Ascend Money Thailand. All rights reserved.
*/

// MARK: Common
"common_transaction_complete" = "ជោគជ័យ (Updated)";
"common_mobile_number" = "Mobile number"; // Input field
"common_email" = "Email Address";
/* Button text */ "common_footer_share_button" = "ស៊ែរ";
```

## How It Works

### Individual File Upload
1. **Upload**: Comments are preserved during parsing
2. **Edit**: Make changes to values while preserving structure
3. **Export**: Download with all original comments intact

### Folder Import
1. **Import Folder**: All .strings files processed with structure preservation
2. **Batch Processing**: Comments preserved across all files
3. **Project Creation**: Full structure data maintained in project
4. **Export**: Any language exports with complete comment preservation

## Technical Details

- **Parser Enhancement**: Improved parsing prioritizes key-value pairs while preserving comments
- **Structure Storage**: Original file structure and comments stored alongside data
- **Smart Export**: Export function uses structure data when available, falls back to simple format otherwise
- **Inline Comment Detection**: Captures comments after semicolons in key-value lines
- **Prefix Comment Support**: Preserves comments that appear before key-value pairs on the same line

## Verification

To verify comment preservation is working:

1. Import a .strings file with comments
2. Make some value changes in the editor
3. Export the file
4. Compare with original - all comments should be preserved exactly

The system automatically detects when structure data is available and uses the advanced export format to maintain all formatting and comments.
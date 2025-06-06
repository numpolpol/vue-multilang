<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Project context
- This is a Vue 3 + TypeScript + Pinia + Vite webapp for editing multiple iOS .strings files side-by-side.
- Users can upload multiple .strings files (same keys), edit all values, and export.
- UI: show all files side-by-side, allow editing all string fields, support collapse/expand for grouped keys (if any), and 'Paste' per-field for multi-language input.
- If all files have the same value for a key, show only one row; always show at least one key; remove all search/filter logic; robust handling of undefined/empty fields; array/field rendering and editing must be robust.
- Focus on iOS .strings format (key = "value";), not JSON.

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

# iOS .strings Multi-file Editor (Vue 3 + TypeScript + Pinia)

## Overview
This webapp lets you upload, view, and edit multiple iOS .strings files (multi-language) side-by-side. You can edit all string values, paste translations, and export the files back. If all files have the same value for a key, only one row is shown. Robust handling for missing/empty fields. No search/filter logic.

## Features
- Upload multiple iOS .strings files (same keys/structure)
- View and edit all string values side-by-side
- Collapse/expand grouped keys (if any)
- Paste per-field for multi-language input (e.g. from Google Sheet)
- Export all files after editing
- Handles undefined/empty fields gracefully

## How to use
1. Upload multiple .strings files (e.g. en.strings, th.strings)
2. Click Ready to view and edit all keys/values side-by-side
3. Edit values directly, or use Paste to fill multiple languages at once
4. Export all files when done

## Tech Stack
- Vue 3 + TypeScript + Pinia + Vite

---

*This project was bootstrapped and iteratively built with GitHub Copilot.*

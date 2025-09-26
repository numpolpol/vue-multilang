import { parseStrings, parseStringsWithStructure, type ParseResult } from './strings'
import type { LanguageColumn } from '../stores/files'

export interface FolderFile {
  file: File
  name: string
  languageCode: string
  languageName: string
  size: number
  isValidStrings: boolean
  parseResult?: ParseResult
  originalStructure?: Array<{ type: 'comment' | 'key' | 'blank', content: string, key?: string, value?: string }>
  originalContent?: string
}

export interface FolderImportResult {
  files: FolderFile[]
  languages: LanguageColumn[]
  keyCount: number
  totalDuplicates: number
  hasErrors: boolean
  errors: string[]
}

/**
 * Extract language code from filename
 * Supports patterns like: en.strings, Localizable_en.strings, en_US.strings
 */
export function extractLanguageCode(filename: string): { code: string; name: string } {
  // Remove .strings extension
  const nameWithoutExt = filename.replace(/\.strings$/i, '')
  
  // Common language code patterns
  const patterns = [
    // Direct language codes: en.strings, th.strings
    /^([a-z]{2})$/i,
    // With country: en_US.strings, zh_CN.strings
    /^([a-z]{2})_[A-Z]{2}$/i,
    // With country prefixed: Localizable_en_US.strings
    /.*_([a-z]{2})_[A-Z]{2}$/i,
    // Prefixed: Localizable_en.strings (must come after country patterns)
    /.*_([a-z]{2})$/i,
  ]

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern)
    if (match) {
      const code = match[1].toLowerCase()
      return {
        code,
        name: getLanguageName(code)
      }
    }
  }

  // Fallback: use filename as language code
  const fallbackCode = nameWithoutExt.toLowerCase()
  return {
    code: fallbackCode,
    name: getLanguageName(fallbackCode) || fallbackCode.charAt(0).toUpperCase() + fallbackCode.slice(1)
  }
}

/**
 * Get display name for language code
 */
function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'th': 'ไทย (Thai)',
    'km': 'ខ្មែរ (Khmer)',
    'my': 'မြန်မာ (Myanmar)',
    'zh': '中文 (Chinese)',
    'ja': '日本語 (Japanese)',
    'ko': '한국어 (Korean)',
    'vi': 'Tiếng Việt (Vietnamese)',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'tl': 'Filipino',
    'es': 'Español (Spanish)',
    'fr': 'Français (French)',
    'de': 'Deutsch (German)',
    'it': 'Italiano (Italian)',
    'pt': 'Português (Portuguese)',
    'ru': 'Русский (Russian)',
    'ar': 'العربية (Arabic)',
    'hi': 'हिन्दी (Hindi)',
  }

  return languageNames[code] || code.toUpperCase()
}

/**
 * Validate if file is a .strings file
 * Only allows files with .strings extension
 */
export function isStringsFile(file: File): boolean {
  // Must have .strings extension (case insensitive)
  const hasStringsExtension = file.name.toLowerCase().endsWith('.strings')
  
  // Must be a text file or have empty type (common for .strings files)
  const isTextFile = file.type === 'text/plain' || file.type === '' || file.type === 'text/x-strings'
  
  return hasStringsExtension && isTextFile
}

/**
 * Process a folder of files and extract .strings files
 */
export async function processFolderFiles(files: File[]): Promise<FolderImportResult> {
  const result: FolderImportResult = {
    files: [],
    languages: [],
    keyCount: 0,
    totalDuplicates: 0,
    hasErrors: false,
    errors: []
  }

  // Filter for .strings files
  const stringsFiles = files.filter(isStringsFile)
  
  if (stringsFiles.length === 0) {
    result.hasErrors = true
    result.errors.push('No .strings files found in the selected folder')
    return result
  }

  // Process each .strings file
  for (const file of stringsFiles) {
    try {
      const content = await readFileAsText(file)
      const parseResult = parseStrings(content, true)
      const structuredResult = parseStringsWithStructure(content)
      const { code, name } = extractLanguageCode(file.name)

      const folderFile: FolderFile = {
        file,
        name: file.name,
        languageCode: code,
        languageName: name,
        size: file.size,
        isValidStrings: true,
        parseResult,
        originalStructure: structuredResult.structure,
        originalContent: structuredResult.originalContent
      }

      result.files.push(folderFile)
      result.totalDuplicates += parseResult.duplicateCount

      // Update key count (use max from all files)
      result.keyCount = Math.max(result.keyCount, Object.keys(parseResult.data).length)

    } catch (error) {
      result.hasErrors = true
      result.errors.push(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Still add the file but mark as invalid
      const { code, name } = extractLanguageCode(file.name)
      result.files.push({
        file,
        name: file.name,
        languageCode: code,
        languageName: name,
        size: file.size,
        isValidStrings: false
      })
    }
  }

  // Create language columns
  const languageMap = new Map<string, LanguageColumn>()
  
  for (const folderFile of result.files) {
    if (folderFile.isValidStrings && folderFile.parseResult) {
      if (!languageMap.has(folderFile.languageCode)) {
        languageMap.set(folderFile.languageCode, {
          code: folderFile.languageCode,
          name: folderFile.languageName,
          data: {},
          hasFile: true,
          fileType: 'strings',
          originalStructure: folderFile.originalStructure,
          originalContent: folderFile.originalContent
        })
      }

      // Merge data if multiple files for same language
      const existing = languageMap.get(folderFile.languageCode)!
      Object.assign(existing.data, folderFile.parseResult.data)
      
      // Preserve the first file's structure if we don't have one yet
      if (!existing.originalStructure && folderFile.originalStructure) {
        existing.originalStructure = folderFile.originalStructure
        existing.originalContent = folderFile.originalContent
      }
    }
  }

  result.languages = Array.from(languageMap.values())

  return result
}

/**
 * Read file as text content
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsText(file)
  })
}

/**
 * Validate folder structure and provide suggestions
 */
export function validateFolderStructure(files: FolderFile[]): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // Check for duplicate language codes
  const languageCounts = new Map<string, number>()
  files.forEach(file => {
    const count = languageCounts.get(file.languageCode) || 0
    languageCounts.set(file.languageCode, count + 1)
  })

  languageCounts.forEach((count, code) => {
    if (count > 1) {
      warnings.push(`Multiple files detected for language '${code}' - data will be merged`)
    }
  })

  // Check for common issues
  const validFiles = files.filter(f => f.isValidStrings)
  if (validFiles.length < files.length) {
    warnings.push(`${files.length - validFiles.length} files could not be parsed`)
  }

  // Suggestions
  if (validFiles.length < 2) {
    suggestions.push('Consider adding more language files for better multi-language support')
  }

  if (validFiles.some(f => f.parseResult && f.parseResult.duplicateCount > 0)) {
    suggestions.push('Some files contain duplicate keys - the latest values will be used')
  }

  return {
    isValid: validFiles.length > 0,
    warnings,
    suggestions
  }
}

/**
 * Get all unique keys across all language files
 */
export function getAllKeys(languages: LanguageColumn[]): string[] {
  const allKeys = new Set<string>()
  
  languages.forEach(lang => {
    Object.keys(lang.data).forEach(key => allKeys.add(key))
  })

  return Array.from(allKeys).sort()
}

/**
 * Generate project name from folder content
 */
export function generateProjectName(files: FolderFile[]): string {
  const validFiles = files.filter(f => f.isValidStrings)
  
  if (validFiles.length === 0) {
    return 'Imported Project'
  }

  // Try to extract common prefix from filenames
  const firstFile = validFiles[0].name
  
  // First try to remove language code pattern
  let baseName = firstFile.replace(/[._-][a-z]{2}([_-][A-Z]{2})?\.strings$/i, '')
  
  // If no language code pattern found, try to extract base name from .strings file
  if (baseName === firstFile) {
    const nameWithoutExt = firstFile.replace(/\.strings$/i, '')
    // Only use as base name if it doesn't look like a pure language code
    if (nameWithoutExt && !/^[a-z]{2}([_-][A-Z]{2})?$/i.test(nameWithoutExt)) {
      baseName = nameWithoutExt
    }
  }
  
  if (baseName && baseName !== firstFile && baseName.length > 0) {
    return `${baseName} - Multi-Language`
  }

  // Fallback to language count
  const langCount = new Set(validFiles.map(f => f.languageCode)).size
  return `Project (${langCount} languages)`
}
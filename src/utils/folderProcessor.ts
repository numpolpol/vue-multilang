import { parseStrings, parseStringsWithStructure, type ParseResult } from './strings'
import { parseAndroidXml, parseAndroidXmlWithStructure, isAndroidXml, type StructureItem } from './androidXml'
import type { LanguageColumn } from '../stores/files'

export interface FolderFile {
  file: File
  name: string
  languageCode: string
  languageName: string
  size: number
  isValidStrings: boolean
  fileType: 'strings' | 'android-xml'
  parseResult?: ParseResult
  originalStructure?: StructureItem[]
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
 * Extract language code from filename (iOS .strings and Android XML)
 * Returns null for unsupported languages or invalid patterns
 */
export function extractLanguageCode(filename: string): string | null {
  // Check for .strings files (iOS)
  if (filename.toLowerCase().endsWith('.strings')) {
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
        // Only return if it's a supported language
        if (isValidLanguageCode(code)) {
          return code
        }
      }
    }
  }
  
  // Check for Android XML files
  if (filename.toLowerCase().endsWith('.xml')) {
    // Android pattern: values/strings.xml (default/English)
    //                  values-th/strings.xml (Thai)
    //                  values-km/strings.xml (Khmer)
    //                  values-my/strings.xml (Myanmar)
    
    // Extract from parent folder path if available
    // This will be handled in processFolder where we have full path
    // For now, check if filename is strings.xml (indicates Android format)
    if (filename.toLowerCase() === 'strings.xml') {
      return 'android-xml' // Special marker to be resolved later
    }
  }
  
  return null
}

// Supported languages - only these will be accepted in folder import (iOS only)
const SUPPORTED_LANGUAGES: Record<string, string> = {
  'en': 'English',
  'th': 'ไทย (Thai)',
  'km': 'ខ្មែរ (Khmer)',
  'my': 'မြန်မာ (Myanmar)',
}

/**
 * Get display name for language code - only return supported languages
 */
function getLanguageName(code: string): string | null {
  return SUPPORTED_LANGUAGES[code] || null // Return null for unsupported languages
}

/**
 * Check if a language code is valid/supported
 */
export function isValidLanguageCode(code: string): boolean {
  return code in SUPPORTED_LANGUAGES
}

/**
 * Validate if file is a .strings file or Android strings.xml
 */
export function isStringsFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  
  // iOS .strings file
  const isIosStrings = fileName.endsWith('.strings') && 
    (file.type === 'text/plain' || file.type === '' || file.type === 'text/x-strings')
  
  // Android strings.xml file
  const isAndroidXml = fileName === 'strings.xml' &&
    (file.type === 'text/xml' || file.type === 'application/xml' || file.type === 'text/plain' || file.type === '')
  
  return isIosStrings || isAndroidXml
}

/**
 * Process a folder of files and extract .strings files and Android XML
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

  // Filter for .strings files and Android XML
  const stringsFiles = files.filter(isStringsFile)
  
  if (stringsFiles.length === 0) {
    result.hasErrors = true
    result.errors.push('No .strings or strings.xml files found in the selected folder')
    return result
  }

  // Track all unique keys across files
  const allKeys = new Set<string>()

  // Process each file
  for (const file of stringsFiles) {
    try {
      const content = await readFileAsText(file)
      const fileName = file.name.toLowerCase()
      const isAndroid = fileName === 'strings.xml'
      
      // Detect file type and parse accordingly
      let parseResult: ParseResult
      let structuredResult: any
      let fileType: 'strings' | 'android-xml'
      
      if (isAndroid || isAndroidXml(content)) {
        // Android XML
        fileType = 'android-xml'
        parseResult = parseAndroidXml(content, true) as ParseResult
        structuredResult = parseAndroidXmlWithStructure(content)
      } else {
        // iOS .strings
        fileType = 'strings'
        parseResult = parseStrings(content, true)
        structuredResult = parseStringsWithStructure(content)
      }
      
      // Extract language code
      let languageCode: string | null = null
      
      if (fileType === 'android-xml') {
        // For Android, check webkitRelativePath for values-XX folder
        const webkitPath = (file as any).webkitRelativePath || file.name
        const valuesMatch = webkitPath.match(/values-([a-z]{2})/i)
        
        if (valuesMatch) {
          const code = valuesMatch[1].toLowerCase()
          if (isValidLanguageCode(code)) {
            languageCode = code
          }
        } else if (webkitPath.includes('values/') || webkitPath === 'strings.xml') {
          // Default values folder = English
          languageCode = 'en'
        }
      } else {
        // iOS .strings
        languageCode = extractLanguageCode(file.name)
      }
      
      // Skip files with unsupported languages
      if (!languageCode) {
        result.hasErrors = true
        const identifier = fileType === 'android-xml' 
          ? `Android XML from ${file.name}` 
          : file.name.replace(/\.strings$/i, '')
        result.errors.push(`Language '${identifier}' is not supported. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`)
        continue
      }
      
      const code = languageCode
      const name = getLanguageName(languageCode)!

      // Check if parsing actually found valid content
      const hasValidContent = Object.keys(parseResult.data).length > 0 || 
                             content.trim() === '' || // Empty files are valid
                             /^\s*(\/\/.*|<!--.*-->|\s)*$/.test(content) // Comments/whitespace only are valid

      const folderFile: FolderFile = {
        file,
        name: file.name,
        languageCode: code,
        languageName: name,
        size: file.size,
        isValidStrings: hasValidContent,
        fileType,
        parseResult,
        originalStructure: structuredResult.structure,
        originalContent: structuredResult.originalContent
      }

      result.files.push(folderFile)
      
      if (hasValidContent) {
        result.totalDuplicates += parseResult.duplicateCount
        // Add all keys from this file to the set
        Object.keys(parseResult.data).forEach(key => allKeys.add(key))
      } else {
        result.hasErrors = true
        result.errors.push(`File ${file.name} contains invalid ${fileType === 'android-xml' ? 'XML' : '.strings'} syntax`)
      }

    } catch (error) {
      result.hasErrors = true
      result.errors.push(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Still add the file but mark as invalid
      const languageCode = extractLanguageCode(file.name)
      const code = languageCode || 'unknown'
      const name = languageCode ? getLanguageName(languageCode)! : 'Unknown'
      result.files.push({
        file,
        name: file.name,
        languageCode: code,
        languageName: name,
        size: file.size,
        isValidStrings: false,
        fileType: file.name.toLowerCase() === 'strings.xml' ? 'android-xml' : 'strings'
      })
    }
  }

  // Set the total unique key count
  result.keyCount = allKeys.size

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
          fileType: folderFile.fileType,
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
        existing.fileType = folderFile.fileType
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
// Enhanced structure to preserve original file format
export interface ParsedStringsFile {
  data: Record<string, string>
  structure: Array<{
    type: 'comment' | 'key' | 'blank'
    content: string
    key?: string
    value?: string
  }>
  originalContent: string
}

// Utility to parse iOS .strings file into JS object with structure preservation
export function parseStrings(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  
  if (!content || content.trim().length === 0) {
    return result
  }
  
  // Parse iOS .strings format only
  try {
    const lines = content
      .replace(/\/\*[^]*?\*\//g, '') // block comments
      .replace(/\/\/.*$/gm, '') // line comments
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && /=/g.test(l))
    
    for (const line of lines) {
      // Support quoted or unquoted keys
      const match = line.match(/^"?(.*?)"?\s*=\s*"([\s\S]*?)"\s*;?\s*$/)
      if (match) {
        const [, key, value] = match
        if (key) {
          result[key] = value || ''
        }
      }
    }
  } catch (error) {
    console.warn('Failed to parse .strings content:', error)
  }
  
  return result
}

// Enhanced parsing with structure preservation
export function parseStringsWithStructure(content: string): ParsedStringsFile {
  const data: Record<string, string> = {}
  const structure: Array<{ type: 'comment' | 'key' | 'blank', content: string, key?: string, value?: string }> = []
  
  if (!content || content.trim().length === 0) {
    return { data, structure, originalContent: content }
  }
  
  try {
    const lines = content.split(/\r?\n/)
    
    let inBlockComment = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Handle blank lines
      if (!trimmedLine) {
        structure.push({ type: 'blank', content: line })
        continue
      }
      
      // Handle block comments
      if (trimmedLine.includes('/*') && !inBlockComment) {
        inBlockComment = true
        structure.push({ type: 'comment', content: line })
        if (trimmedLine.includes('*/')) {
          inBlockComment = false
        }
        continue
      }
      
      if (inBlockComment) {
        structure.push({ type: 'comment', content: line })
        if (trimmedLine.includes('*/')) {
          inBlockComment = false
        }
        continue
      }
      
      // Handle line comments
      if (trimmedLine.startsWith('//')) {
        structure.push({ type: 'comment', content: line })
        continue
      }
      
      // Handle key-value pairs
      const match = trimmedLine.match(/^"?(.*?)"?\s*=\s*"([\s\S]*?)"\s*;?\s*$/)
      if (match) {
        const [, key, value] = match
        if (key) {
          data[key] = value || ''
          structure.push({ type: 'key', content: line, key, value: value || '' })
        }
      } else {
        // Unknown line format, preserve as comment
        structure.push({ type: 'comment', content: line })
      }
    }
  } catch (error) {
    console.warn('Failed to parse .strings content with structure:', error)
  }
  
  return { data, structure, originalContent: content }
}

// Enhanced export with structure preservation
export function toStringsWithStructure(
  data: Record<string, string>, 
  originalStructure?: ParsedStringsFile['structure']
): string {
  try {
    if (!originalStructure) {
      // Fallback to simple export
      return toStrings(data)
    }
    
    const lines: string[] = []
    const processedKeys = new Set<string>()
    
    // Process structure and update key-value pairs
    for (const item of originalStructure) {
      if (item.type === 'key' && item.key) {
        // Update with current value if key exists
        if (data.hasOwnProperty(item.key)) {
          const currentValue = data[item.key] || ''
          const escapedValue = currentValue.replace(/"/g, '\\"')
          lines.push(`"${item.key}" = "${escapedValue}";`)
          processedKeys.add(item.key)
        }
        // Skip keys that no longer exist in data
      } else {
        // Preserve comments and blank lines as-is
        lines.push(item.content)
      }
    }
    
    // Add any new keys that weren't in the original structure
    const newKeys = Object.keys(data).filter(key => !processedKeys.has(key))
    if (newKeys.length > 0) {
      if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
        lines.push('') // Add blank line before new keys
      }
      lines.push('// New keys added during editing')
      for (const key of newKeys) {
        const escapedValue = (data[key] || '').replace(/"/g, '\\"')
        lines.push(`"${key}" = "${escapedValue}";`)
      }
    }
    
    return lines.join('\n')
  } catch (error) {
    console.warn('Failed to export with structure preservation:', error)
    return toStrings(data) // Fallback
  }
}

// Utility to stringify JS object to iOS .strings format
export function toStrings(obj: Record<string, string>): string {
  try {
    const splitData = splitMergedData(obj) // Split for iOS export
    return Object.entries(splitData)
      .filter(([key, value]) => key && value !== undefined)
      .map(([k, v]) => `"${k}" = "${(v || '').replace(/"/g, '\\"')}";`)
      .join('\n')
  } catch (error) {
    console.warn('Failed to convert to .strings format:', error)
    return ''
  }
}

// Utility to merge primary (.strings) and secondary (.xml) files for multi key support
export interface FileGroup {
  language: string
  primaryFile?: File
  secondaryFile?: File
  primaryData: Record<string, string>
  secondaryData: Record<string, string>
  mergedData: Record<string, string>
  hasBothFiles: boolean
}

export interface KeyMapping {
  primaryKey: string
  secondaryKeys: string[] // Changed from secondaryKey to support multiple keys
  allKeys: string[] // All keys in this group
  values: string[] // Values across all languages
  shouldMerge: boolean
}

export function groupFilesByLanguage(files: File[]): FileGroup[] {
  const groups = new Map<string, FileGroup>()
  
  files.forEach(file => {
    // Extract language code from filename (e.g., "en.strings" -> "en")
    const match = file.name.match(/^([^.]+)\.(strings)$/)
    if (!match) return
    
    const [, language] = match
    
    // Get or create group for this language
    if (!groups.has(language)) {
      groups.set(language, {
        language,
        primaryData: {},
        secondaryData: {},
        mergedData: {},
        hasBothFiles: false
      })
    }
    
    const group = groups.get(language)!
    
    // Only handle .strings files
    group.primaryFile = file
    
    // No secondary files in iOS-only mode
    group.hasBothFiles = false
  })
  
  return Array.from(groups.values())
}

export async function processFileGroups(
  groups: FileGroup[], 
  shouldMergeKeys: boolean = false
): Promise<{
  files: File[]
  data: Record<string, string>[]
  mergedKeys?: string[]
}> {
  const resultFiles: File[] = []
  const resultData: Record<string, string>[] = []
  
  for (const group of groups) {
    // Parse primary file (.strings)
    if (group.primaryFile) {
      const content = await readFileContent(group.primaryFile)
      group.primaryData = parseStrings(content)
    }
    
    // Use only primary data (no secondary files in iOS-only mode)
    group.mergedData = { ...group.primaryData }
    
    // Use the .strings file
    if (group.primaryFile) {
      resultFiles.push(group.primaryFile)
      resultData.push(group.mergedData)
    }
  }
  
  // Apply key merging if requested
  if (shouldMergeKeys && resultData.length > 0) {
    const keyMappings = findMergeableKeys(resultData)
    const { files, data, mergedKeys } = applyKeyMerging(resultFiles, resultData, keyMappings)
    return { files, data, mergedKeys }
  }
  
  return { files: resultFiles, data: resultData }
}

// Function to find keys that should be merged when their values match across all languages (Multi Key Mode)
export function findMergeableKeys(allData: Record<string, string>[]): KeyMapping[] {
  const keyMappings: KeyMapping[] = []
  const processedKeys = new Set<string>()
  
  // Get all unique keys across all languages
  const allKeys = new Set<string>()
  allData.forEach(data => {
    Object.keys(data).forEach(key => allKeys.add(key))
  })
  
  // Helper function to normalize values for comparison (ignore empty/undefined)
  const normalizeValues = (values: string[]): string[] => {
    return values.map(v => v || '').filter(v => v.trim() !== '')
  }
  
  // Group keys by their normalized value patterns
  const valueGroups = new Map<string, string[]>() // normalized signature -> [keys with those values]
  
  Array.from(allKeys).forEach(key => {
    if (processedKeys.has(key)) return
    
    // Get values for this key across all languages
    const rawValues = allData.map(data => data[key] || '')
    const normalizedValues = normalizeValues(rawValues)
    
    // Skip keys that have no values or only empty values
    if (normalizedValues.length === 0) {
      return
    }
    
    // Create signature: sort values to handle column swapping, then join
    const valueSignature = normalizedValues.slice().sort().join('|')
    
    if (!valueGroups.has(valueSignature)) {
      valueGroups.set(valueSignature, [])
    }
    valueGroups.get(valueSignature)!.push(key)
  })
  
  // Process value groups to create mappings
  valueGroups.forEach((keys) => {
    if (keys.length === 1) {
      // Single key, no merging
      const rawValues = allData.map(data => data[keys[0]] || '')
      keyMappings.push({
        primaryKey: keys[0],
        secondaryKeys: [],
        allKeys: [keys[0]],
        values: rawValues,
        shouldMerge: false
      })
      processedKeys.add(keys[0])
    } else {
      // Multiple keys with matching values - merge them
      // Choose primary key (prefer iOS keys, then common keys, then first one)
      const iosKey = keys.find(k => k.includes('ios_') || (!k.includes('android_') && !k.includes('xml_')))
      const primaryKey = iosKey || keys[0]
      const secondaryKeys = keys.filter(k => k !== primaryKey)
      
      const rawValues = allData.map(data => data[primaryKey] || '')
      
      keyMappings.push({
        primaryKey,
        secondaryKeys,
        allKeys: keys,
        values: rawValues,
        shouldMerge: true
      })
      
      // Mark all keys as processed
      keys.forEach(k => processedKeys.add(k))
    }
  })
  
  return keyMappings
}

// Function to apply key merging to the data (Multi Key Mode)
export function applyKeyMerging(
  files: File[],
  data: Record<string, string>[],
  keyMappings: KeyMapping[]
): {
  files: File[]
  data: Record<string, string>[]
  mergedKeys: string[]
} {
  const newData = data.map(() => ({})) as Record<string, string>[]
  const mergedKeys: string[] = []
  
  keyMappings.forEach(mapping => {
    if (mapping.shouldMerge && mapping.secondaryKeys.length > 0) {
      // Create merged key display name with all keys
      const allKeysDisplay = [mapping.primaryKey, ...mapping.secondaryKeys].join(' + ')
      mergedKeys.push(allKeysDisplay)
      
      // Use values from mapping
      mapping.values.forEach((value, index) => {
        if (newData[index]) {
          newData[index][allKeysDisplay] = value
        }
      })
    } else {
      // Keep original key
      mapping.values.forEach((value, index) => {
        if (newData[index]) {
          newData[index][mapping.primaryKey] = value
        }
      })
    }
  })
  
  return {
    files,
    data: newData,
    mergedKeys
  }
}

// Utility to split merged keys back for export (iOS only)
export function splitMergedData(data: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (key.includes(' + ')) {
      // This is a merged key - split it back to individual keys
      const allKeys = key.split(' + ')
      
      // For iOS-only, prefer keys that don't look like platform-specific
      const preferredKey = allKeys.find(k => !k.startsWith('android_')) || allKeys[0]
      result[preferredKey] = value
    } else {
      // Regular key - include as-is for iOS
      result[key] = value
    }
  })
  
  return result
}

// Utility to parse TSV format with 1-4 language values (key + th/en/km/my in order)
export function parseTSVMultiLanguage(content: string): {
  th: Record<string, string>
  en: Record<string, string>
  km: Record<string, string>
  my: Record<string, string>
} {
  const result = {
    th: {} as Record<string, string>,
    en: {} as Record<string, string>,
    km: {} as Record<string, string>,
    my: {} as Record<string, string>
  }
  
  if (!content || content.trim().length === 0) {
    return result
  }
  
  try {
    const lines = content
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0)
    
    for (const line of lines) {
      // Split by tab or multiple spaces/tabs
      const parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0)
      
      // Expect 2-5 parts: key + 1-4 language values
      if (parts.length >= 2 && parts.length <= 5) {
        const [key, ...values] = parts
        
        // Validate key format
        if (key && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
          // Map values to languages in order: th, en, km, my
          const languages = ['th', 'en', 'km', 'my']
          
          for (let i = 0; i < languages.length; i++) {
            const lang = languages[i] as keyof typeof result
            result[lang][key] = values[i] || '' // Use value if available, otherwise empty string
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to parse TSV content:', error)
  }
  
  return result
}

// Check if content is TSV format (has tabs/spaces and 2-5 columns per row)
export function isTSVFormat(content: string): boolean {
  if (!content || content.trim().length === 0) return false
  
  const lines = content
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0)
  
  if (lines.length === 0) return false
  
  // Check if most lines have 2-5 tab-separated or space-separated parts
  let validLines = 0
  for (const line of lines) {
    const parts = line.split(/\t+|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0)
    if (parts.length >= 2 && parts.length <= 5) {
      validLines++
    }
  }
  
  // If more than 50% of lines have 2-5 parts, consider it TSV format
  return validLines > 0 && (validLines / lines.length) > 0.5
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

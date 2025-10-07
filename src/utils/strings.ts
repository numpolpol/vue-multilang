// Helper function to safely escape quotes and backslashes for export
function escapeQuotesForExport(value: string): string {
  let result = value
  
  // Escape backslashes first (must be done before quotes)
  result = result.replace(/\\/g, '\\\\')
  
  // Escape quotes
  result = result.replace(/"/g, '\\"')
  
  // Handle newlines
  result = result.replace(/\n/g, '\\n')
  
  return result
}

// Enhanced structure to preserve original file format
export interface ParsedStringsFile {
  data: Record<string, string>
  structure: Array<{
    type: 'comment' | 'key' | 'blank'
    content: string
    key?: string
    value?: string
    inlineComment?: string // Capture inline comments after key-value pairs
  }>
  originalContent: string
}

// Utility to parse iOS .strings file into JS object with duplicate key removal
export interface ParseResult {
  data: Record<string, string>
  duplicateCount: number
  duplicateKeys: string[]
  duplicateDetails: Array<{
    key: string
    occurrences: Array<{
      value: string
      lineNumber: number
      used: boolean // true if this value was kept
    }>
  }>
}

export function parseStrings(content: string): Record<string, string>
export function parseStrings(content: string, returnDetails: true): ParseResult
export function parseStrings(content: string, returnDetails?: boolean): Record<string, string> | ParseResult {
  const result: Record<string, string> = {}
  const duplicateKeys = new Set<string>()
  const duplicateDetails: Array<{
    key: string
    occurrences: Array<{
      value: string
      lineNumber: number
      used: boolean
    }>
  }> = []
  const keyOccurrences = new Map<string, Array<{ value: string, lineNumber: number }>>()
  
  if (!content || content.trim().length === 0) {
    return returnDetails 
      ? { data: result, duplicateCount: 0, duplicateKeys: [], duplicateDetails: [] }
      : result
  }
  
  // Parse iOS .strings format only
  try {
  // Clean content (remove comments and process lines)
  const lines = content
    .replace(/\/\*[^]*?\*\//g, '') // block comments
    // Only remove // comments that are not inside quoted strings
    .split(/\r?\n/)
    .map(line => {
      // Remove // comments only if they're not inside quotes
      let inQuotes = false
      let result = ''
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]
        
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes
        }
        
        // If we find // outside of quotes, truncate the line here
        if (!inQuotes && char === '/' && nextChar === '/') {
          break
        }
        
        result += char
      }
      return result
    })
    .map(l => l.trim())
    .filter(l => l && /=/g.test(l))
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      const lineNumber = lineIndex + 1
      
      // Parse key-value pairs with proper handling of escaped quotes
      const keyMatch = line.match(/^"?(.*?)"?\s*=\s*"/)
      if (keyMatch) {
        const key = keyMatch[1]
        if (!key) continue
        
        // Find the value by parsing from the opening quote to the closing quote
        // Handle escaped quotes properly
        const valueStart = line.indexOf('"', line.indexOf('=')) + 1
        let value = ''
        let i = valueStart
        
        while (i < line.length) {
          const char = line[i]
          const nextChar = i + 1 < line.length ? line[i + 1] : null
          
          if (char === '\\' && nextChar === '"') {
            // This is an escaped quote (\") - unescape it to just a quote
            value += '"'
            i += 2 // Skip both the backslash and the quote
          } else if (char === '\\' && nextChar === '\\') {
            // This is an escaped backslash (\\) - unescape it to a single backslash
            value += '\\'
            i += 2 // Skip both backslashes
          } else if (char === '\\' && nextChar === 'n') {
            // This is an escaped newline (\n) - convert to actual newline
            value += '\n'
            i += 2
          } else if (char === '\\' && nextChar) {
            // This is a backslash followed by some other character - keep both for now
            value += char + nextChar
            i += 2
          } else if (char === '"') {
            // Found unescaped quote - this should be the end of the value
            break
          } else {
            // Regular character
            value += char
            i++
          }
        }
        
        if (key) {
          // Track all occurrences
          if (!keyOccurrences.has(key)) {
            keyOccurrences.set(key, [])
          }
          keyOccurrences.get(key)!.push({ value, lineNumber })
          
          // Check for duplicate keys and handle them with "latest wins" + position preservation
          if (key in result) {
            duplicateKeys.add(key)
            console.warn(`Duplicate key detected: "${key}" - Previous value: "${result[key]}", New value: "${value}" (keeping latest at bottom)`)
            // Remove the old key to reinsert it at the bottom with new value
            delete result[key]
          }
          // Add/re-add the key at the end (bottom position)
          result[key] = value
        }
      }
    }
    
    // Process duplicates to create detailed information
    for (const [key, occurrences] of keyOccurrences) {
      if (occurrences.length > 1) {
        const finalValue = result[key]
        duplicateDetails.push({
          key,
          occurrences: occurrences.map((occ, index) => ({
            ...occ,
            used: occ.value === finalValue && index === occurrences.length - 1 // Last occurrence with final value
          }))
        })
      }
    }
    
    // Log summary of duplicates found
    if (duplicateKeys.size > 0) {
      console.info(`Import completed. ${duplicateKeys.size} duplicate key(s) were detected and replaced with the latest values:`, Array.from(duplicateKeys))
    }
  } catch (error) {
    console.warn('Failed to parse .strings content:', error)
  }
  
  return returnDetails 
    ? { data: result, duplicateCount: duplicateKeys.size, duplicateKeys: Array.from(duplicateKeys), duplicateDetails }
    : result
}

// Enhanced parsing with structure preservation
export function parseStringsWithStructure(content: string): ParsedStringsFile {
  const data: Record<string, string> = {}
  const structure: Array<{ type: 'comment' | 'key' | 'blank', content: string, key?: string, value?: string, inlineComment?: string }> = []
  
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
      
      // Prioritize key-value pairs over comments
      // Handle key-value pairs with proper escaped quote handling
      // Look for pattern anywhere in the line: "key" = "value"
      const keyMatch = trimmedLine.match(/"([^"]+)"\s*=\s*"/)
      if (keyMatch) {
        const key = keyMatch[1]
        if (key) {
          // Find the value by parsing from the opening quote to the closing quote
          // Handle escaped quotes properly
          const valueStart = trimmedLine.indexOf('"', trimmedLine.indexOf('=')) + 1
          let value = ''
          let i = valueStart
          
          while (i < trimmedLine.length) {
            const char = trimmedLine[i]
            const nextChar = i + 1 < trimmedLine.length ? trimmedLine[i + 1] : null
            
            if (char === '\\' && nextChar === '"') {
              // This is an escaped quote (\") - unescape it to just a quote
              value += '"'
              i += 2 // Skip both the backslash and the quote
            } else if (char === '\\' && nextChar === '\\') {
              // This is an escaped backslash (\\) - unescape it to a single backslash
              value += '\\'
              i += 2 // Skip both backslashes
            } else if (char === '\\' && nextChar === 'n') {
              // This is an escaped newline (\n) - convert to actual newline
              value += '\n'
              i += 2
            } else if (char === '\\' && nextChar) {
              // This is a backslash followed by some other character - keep both for now
              value += char + nextChar
              i += 2
            } else if (char === '"') {
              // Found unescaped quote - this should be the end of the value
              break
            } else {
              // Regular character
              value += char
              i++
            }
          }
          
          // Extract inline comment if present (after the closing quote and semicolon)
          let inlineComment = ''
          const afterValue = trimmedLine.substring(i + 1).trim() // Everything after the closing quote
          if (afterValue.startsWith(';')) {
            const afterSemicolon = afterValue.substring(1).trim()
            if (afterSemicolon.startsWith('//') || afterSemicolon.startsWith('/*')) {
              inlineComment = afterSemicolon
            }
          }
          
          // Always update data to keep the latest value (like regular parseStrings)
          data[key] = value
          structure.push({ type: 'key', content: line, key, value, inlineComment: inlineComment || undefined })
        }
      } else {
        // Handle block comments
        if (trimmedLine.includes('/*') && !inBlockComment) {
          inBlockComment = true
          structure.push({ type: 'comment', content: line })
          if (trimmedLine.includes('*/')) {
            inBlockComment = false
          }
        } else if (inBlockComment) {
          structure.push({ type: 'comment', content: line })
          if (trimmedLine.includes('*/')) {
            inBlockComment = false
          }
        } else if (trimmedLine.startsWith('//')) {
          // Handle line comments
          structure.push({ type: 'comment', content: line })
        } else {
          // Unknown line format, preserve as comment
          structure.push({ type: 'comment', content: line })
        }
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
    
    // Process structure in REVERSE order to find last occurrence of each key
    // This ensures "latest wins" behavior for duplicate keys
    const reversedStructure = [...originalStructure].reverse()
    const keysToProcess = new Map<string, any>() // key -> structure item
    
    // First pass: collect the last occurrence of each key
    for (const item of reversedStructure) {
      if (item.type === 'key' && item.key && data.hasOwnProperty(item.key)) {
        if (!keysToProcess.has(item.key)) {
          keysToProcess.set(item.key, item) // Only keep the first one we encounter (which is the last in original order)
        }
      }
    }
    
    // Second pass: process structure in original order, but only include keys we decided to keep
    for (const item of originalStructure) {
      if (item.type === 'key' && item.key) {
        // Only process this key if it's the last occurrence we want to keep
        const keyToKeep = keysToProcess.get(item.key)
        if (keyToKeep && keyToKeep === item && !processedKeys.has(item.key)) {
          const currentValue = data[item.key] || ''
          // If the value hasn't changed, preserve the original line exactly
          if (currentValue === item.value) {
            lines.push(item.content)
          } else {
            // Value has changed - create new line with proper escaping
            const escapedValue = escapeQuotesForExport(currentValue)
            
            // Preserve prefix comments (comments before the key-value pair)
            const originalContent = item.content || ''
            const keyValueMatch = originalContent.match(/"[^"]+"\s*=\s*"[^"]*"/)
            
            if (keyValueMatch) {
              const keyValueStart = originalContent.indexOf(keyValueMatch[0])
              const prefix = keyValueStart > 0 ? originalContent.substring(0, keyValueStart) : ''
              
              let newLine = prefix + `"${item.key}" = "${escapedValue}";`
              
              // Preserve inline comment if it exists
              if (item.inlineComment) {
                newLine += ` ${item.inlineComment}`
              }
              
              lines.push(newLine)
            } else {
              // Fallback to simple format
              let newLine = `"${item.key}" = "${escapedValue}";`
              if (item.inlineComment) {
                newLine += ` ${item.inlineComment}`
              }
              lines.push(newLine)
            }
          }
          processedKeys.add(item.key)
        }
        // Skip keys that are duplicates or no longer exist in data
      } else if (item.type === 'comment' || item.type === 'blank') {
        // Check if this comment line contains a duplicate key that we should skip
        let shouldSkip = false
        if (item.type === 'comment') {
          // Check if the comment line looks like a key-value pair that's a duplicate
          const keyMatch = item.content.match(/"([^"]+)"\s*=/)
          if (keyMatch && keyMatch[1] && processedKeys.has(keyMatch[1])) {
            shouldSkip = true // Skip this line as it's a duplicate key
          }
        }
        
        if (!shouldSkip) {
          lines.push(item.content)
        }
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
        const value = data[key] || ''
        const escapedValue = escapeQuotesForExport(value)
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
      .map(([k, v]) => {
        const escapedValue = escapeQuotesForExport(v || '')
        return `"${k}" = "${escapedValue}";`
      })
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
  duplicateInfo?: { totalCount: number, byFile: Array<{ fileName: string, count: number, keys: string[] }> }
}> {
  const resultFiles: File[] = []
  const resultData: Record<string, string>[] = []
  const duplicateInfo = { totalCount: 0, byFile: [] as Array<{ fileName: string, count: number, keys: string[] }> }
  
  for (const group of groups) {
    // Parse primary file (.strings)
    if (group.primaryFile) {
      const content = await readFileContent(group.primaryFile)
      const parseResult = parseStrings(content, true)
      group.primaryData = parseResult.data
      
      // Track duplicate info
      if (parseResult.duplicateCount > 0) {
        duplicateInfo.totalCount += parseResult.duplicateCount
        duplicateInfo.byFile.push({
          fileName: group.primaryFile.name,
          count: parseResult.duplicateCount,
          keys: parseResult.duplicateKeys
        })
      }
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
    return { files, data, mergedKeys, duplicateInfo: duplicateInfo.totalCount > 0 ? duplicateInfo : undefined }
  }
  
  return { files: resultFiles, data: resultData, duplicateInfo: duplicateInfo.totalCount > 0 ? duplicateInfo : undefined }
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

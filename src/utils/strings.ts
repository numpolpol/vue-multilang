// Utility to parse iOS .strings file into JS object
export function parseStrings(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  
  if (!content || content.trim().length === 0) {
    return result
  }
  
  if (content.trim().startsWith('<?xml')) {
    // Parse Android XML format
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(content, 'text/xml')
      const strings = xmlDoc.getElementsByTagName('string')
      for (const str of strings) {
        const name = str.getAttribute('name')
        if (name) {
          result[name] = str.textContent?.replace(/\\"/g, '"') || ''
        }
      }
    } catch (error) {
      console.warn('Failed to parse XML content:', error)
    }
  } else {
    // Parse iOS .strings format
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
  }
  
  return result
}

// Utility to stringify JS object to iOS .strings format
export function toStrings(obj: Record<string, string>): string {
  try {
    const splitData = splitMergedData(obj, true) // Split for iOS export
    return Object.entries(splitData)
      .filter(([key, value]) => key && value !== undefined)
      .map(([k, v]) => `"${k}" = "${(v || '').replace(/"/g, '\\"')}";`)
      .join('\n')
  } catch (error) {
    console.warn('Failed to convert to .strings format:', error)
    return ''
  }
}

// Utility to stringify JS object to Android strings.xml format
export function toAndroidStrings(obj: Record<string, string>): string {
  try {
    const splitData = splitMergedData(obj, false) // Split for Android export
    const xmlContent = Object.entries(splitData)
      .filter(([key, value]) => key && value !== undefined)
      .map(([key, value]) => 
        `    <string name="${key}">${(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '\\"')}</string>`)
      .join('\n')
    return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${xmlContent}\n</resources>`
  } catch (error) {
    console.warn('Failed to convert to Android XML format:', error)
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
    const match = file.name.match(/^([^.]+)\.(strings|xml)$/)
    if (!match) return
    
    const [, language, extension] = match
    
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
    
    // Assign file based on extension
    if (extension === 'strings') {
      group.primaryFile = file
    } else if (extension === 'xml') {
      group.secondaryFile = file
    }
    
    // Update hasBothFiles flag
    group.hasBothFiles = !!(group.primaryFile && group.secondaryFile)
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
    
    // Parse secondary file (.xml)
    if (group.secondaryFile) {
      const content = await readFileContent(group.secondaryFile)
      group.secondaryData = parseStrings(content)
    }
    
    // Merge both data sources
    group.mergedData = { ...group.primaryData, ...group.secondaryData }
    
    // Create a representative file (prefer .strings, fallback to .xml)
    const representativeFile = group.primaryFile || group.secondaryFile
    if (representativeFile) {
      resultFiles.push(representativeFile)
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

// Utility to split merged keys back for export (Multi Key Mode)
export function splitMergedData(data: Record<string, string>, isIosExport: boolean): Record<string, string> {
  const result: Record<string, string> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (key.includes(' + ')) {
      // This is a merged key - split it back to individual keys
      const allKeys = key.split(' + ')
      
      if (isIosExport) {
        // For iOS export, prefer iOS-style keys (ios_* or not android_*)
        const iosKeys = allKeys.filter(k => k.startsWith('ios_'))
        if (iosKeys.length > 0) {
          // Use the first iOS key found
          result[iosKeys[0]] = value
        } else {
          // Fallback to non-android keys
          const nonAndroidKeys = allKeys.filter(k => !k.startsWith('android_'))
          result[nonAndroidKeys[0] || allKeys[0]] = value
        }
      } else {
        // For Android export, prefer Android-style keys (android_*)
        const androidKeys = allKeys.filter(k => k.startsWith('android_'))
        if (androidKeys.length > 0) {
          // Use the first Android key found
          result[androidKeys[0]] = value
        } else {
          // Fallback: use a key that's not iOS-specific
          const neutralKey = allKeys.find(k => !k.match(/^(home_|settings_|nav_|tab_)/))
          result[neutralKey || allKeys[0]] = value
        }
      }
    } else {
      // Regular key - include based on platform preference
      if (isIosExport) {
        // For iOS export, include keys that don't look like Android-specific keys
        if (!key.startsWith('android_')) {
          result[key] = value
        }
      } else {
        // For Android export, include Android keys and keys that aren't clearly iOS-specific
        if (key.startsWith('android_') || (!key.match(/^(home_|settings_|nav_|tab_)/))) {
          result[key] = value
        }
      }
    }
  })
  
  return result
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

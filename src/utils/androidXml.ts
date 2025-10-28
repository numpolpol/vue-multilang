/**
 * Android XML strings.xml parser and exporter
 * Similar to iOS .strings format but for Android XML
 */

// Structure item type that's compatible with iOS .strings structure
export type StructureItem = {
  type: 'comment' | 'string' | 'blank' | 'header' | 'footer' | 'key'
  content: string
  key?: string
  value?: string
  attributes?: string // For preserving attributes like translatable="false"
  inlineComment?: string // For compatibility with iOS structure
}

// Enhanced structure to preserve original file format
export interface ParsedAndroidXmlFile {
  data: Record<string, string>
  structure: StructureItem[]
  originalContent: string
}

export interface ParseResult {
  data: Record<string, string>
  duplicateCount: number
  duplicateKeys: string[]
}

/**
 * Parse Android strings.xml file
 * Format: <string name="key">value</string>
 */
export function parseAndroidXml(content: string): Record<string, string>
export function parseAndroidXml(content: string, returnDetails: true): ParseResult
export function parseAndroidXml(content: string, returnDetails?: boolean): Record<string, string> | ParseResult {
  const result: Record<string, string> = {}
  const duplicateKeys = new Set<string>()
  const seenKeys = new Set<string>()
  
  if (!content || content.trim().length === 0) {
    return returnDetails 
      ? { data: result, duplicateCount: 0, duplicateKeys: [] }
      : result
  }

  try {
    // Remove XML comments
    let cleanContent = content.replace(/<!--[\s\S]*?-->/g, '')
    
    // Match all <string> tags
    // Supports: <string name="key">value</string>
    // Supports: <string name="key" translatable="false">value</string>
    const stringRegex = /<string\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/string>/g
    
    let match
    while ((match = stringRegex.exec(cleanContent)) !== null) {
      const key = match[1]
      let value = match[2]
      
      // Decode XML entities
      value = decodeXmlEntities(value)
      
      // Handle duplicates - keep the last occurrence (latest wins)
      if (seenKeys.has(key)) {
        duplicateKeys.add(key)
        // Delete old value, will add new one
        delete result[key]
      }
      
      seenKeys.add(key)
      result[key] = value
    }
    
  } catch (e) {
    console.error('Error parsing Android XML:', e)
  }

  if (returnDetails) {
    return {
      data: result,
      duplicateCount: duplicateKeys.size,
      duplicateKeys: Array.from(duplicateKeys)
    }
  }
  
  return result
}

/**
 * Parse Android XML with structure preservation
 */
export function parseAndroidXmlWithStructure(content: string): ParsedAndroidXmlFile {
  const result: ParsedAndroidXmlFile = {
    data: {},
    structure: [],
    originalContent: content
  }
  
  if (!content || content.trim().length === 0) {
    return result
  }

  const lines = content.split(/\r?\n/)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Blank line
    if (!trimmedLine) {
      result.structure.push({
        type: 'blank',
        content: line
      })
      continue
    }
    
    // XML header or DOCTYPE
    if (trimmedLine.startsWith('<?xml') || trimmedLine.startsWith('<!DOCTYPE')) {
      result.structure.push({
        type: 'header',
        content: line
      })
      continue
    }
    
    // Resources opening tag
    if (trimmedLine.startsWith('<resources')) {
      result.structure.push({
        type: 'header',
        content: line
      })
      continue
    }
    
    // Resources closing tag
    if (trimmedLine.startsWith('</resources>')) {
      result.structure.push({
        type: 'footer',
        content: line
      })
      continue
    }
    
    // Comment
    if (trimmedLine.startsWith('<!--')) {
      let commentContent = line
      // Handle multi-line comments
      if (!trimmedLine.endsWith('-->')) {
        while (i < lines.length - 1) {
          i++
          commentContent += '\n' + lines[i]
          if (lines[i].trim().endsWith('-->')) break
        }
      }
      result.structure.push({
        type: 'comment',
        content: commentContent
      })
      continue
    }
    
    // String entry
    const stringMatch = trimmedLine.match(/<string\s+name="([^"]+)"([^>]*)>([\s\S]*?)<\/string>/)
    if (stringMatch) {
      const key = stringMatch[1]
      const attributes = stringMatch[2].trim()
      let value = stringMatch[3]
      
      // Decode XML entities for internal use
      const decodedValue = decodeXmlEntities(value)
      
      result.data[key] = decodedValue
      result.structure.push({
        type: 'string',
        content: line,
        key,
        value: decodedValue,
        attributes: attributes || undefined
      })
      continue
    }
    
    // Multi-line string entry (opening tag)
    const multiLineMatch = trimmedLine.match(/<string\s+name="([^"]+)"([^>]*)>(.*)/)
    if (multiLineMatch && !trimmedLine.includes('</string>')) {
      const key = multiLineMatch[1]
      const attributes = multiLineMatch[2].trim()
      let value = multiLineMatch[3]
      let fullContent = line
      
      // Collect multi-line content
      while (i < lines.length - 1) {
        i++
        fullContent += '\n' + lines[i]
        const endMatch = lines[i].match(/(.*)<\/string>/)
        if (endMatch) {
          value += '\n' + endMatch[1]
          break
        } else {
          value += '\n' + lines[i]
        }
      }
      
      const decodedValue = decodeXmlEntities(value)
      result.data[key] = decodedValue
      result.structure.push({
        type: 'string',
        content: fullContent,
        key,
        value: decodedValue,
        attributes: attributes || undefined
      })
      continue
    }
    
    // Other XML content (keep as-is)
    result.structure.push({
      type: 'header',
      content: line
    })
  }
  
  return result
}

/**
 * Export to Android XML format (basic)
 */
export function toAndroidXml(data: Record<string, string>): string {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n'
  xml += '<resources>\n'
  
  Object.entries(data).forEach(([key, value]) => {
    const encodedValue = encodeXmlEntities(value)
    xml += `    <string name="${key}">${encodedValue}</string>\n`
  })
  
  xml += '</resources>\n'
  return xml
}

/**
 * Export to Android XML with structure preservation
 */
export function toAndroidXmlWithStructure(
  data: Record<string, string>,
  structure: StructureItem[]
): string {
  if (!structure || structure.length === 0) {
    return toAndroidXml(data)
  }

  // Create a set of keys we need to export
  const keysToExport = new Set(Object.keys(data))
  const exportedKeys = new Set<string>()
  
  let result = ''
  
  // First pass: reconstruct file following original structure
  for (const item of structure) {
    if (item.type === 'string' && item.key) {
      const key = item.key
      
      // Skip if key no longer exists in data
      if (!keysToExport.has(key)) {
        continue
      }
      
      // Get current value
      const currentValue = data[key]
      
      // Mark as exported
      exportedKeys.add(key)
      
      // Reconstruct the line with current value
      const encodedValue = encodeXmlEntities(currentValue)
      
      // Preserve attributes if they exist
      const attributesPart = item.attributes ? ' ' + item.attributes : ''
      
      // Check if original was multi-line
      if (item.content.includes('\n')) {
        // Preserve indentation from original
        const indent = item.content.match(/^(\s*)/)?.[1] || '    '
        result += `${indent}<string name="${key}"${attributesPart}>${encodedValue}</string>\n`
      } else {
        // Single line - preserve indentation
        const indent = item.content.match(/^(\s*)/)?.[1] || '    '
        result += `${indent}<string name="${key}"${attributesPart}>${encodedValue}</string>\n`
      }
    } else {
      // Keep comments, blanks, headers, footers as-is
      result += item.content + '\n'
    }
  }
  
  // Second pass: add any new keys that weren't in original structure
  const newKeys = Array.from(keysToExport).filter(key => !exportedKeys.has(key))
  
  if (newKeys.length > 0) {
    // Find the last </resources> tag and insert before it
    const lines = result.split('\n')
    let insertIndex = lines.length - 1
    
    // Find last </resources>
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '</resources>') {
        insertIndex = i
        break
      }
    }
    
    // Insert new keys
    const newLines: string[] = []
    if (insertIndex > 0 && lines[insertIndex - 1].trim() !== '') {
      newLines.push('') // Add blank line before new entries
    }
    newLines.push('    <!-- New entries added by editor -->')
    
    newKeys.forEach(key => {
      const value = data[key]
      const encodedValue = encodeXmlEntities(value)
      newLines.push(`    <string name="${key}">${encodedValue}</string>`)
    })
    
    // Insert new lines
    lines.splice(insertIndex, 0, ...newLines)
    result = lines.join('\n')
  }
  
  return result
}

/**
 * Decode XML entities to plain text
 */
function decodeXmlEntities(text: string): string {
  let result = text
  
  // Decode common entities
  result = result.replace(/&lt;/g, '<')
  result = result.replace(/&gt;/g, '>')
  result = result.replace(/&quot;/g, '"')
  result = result.replace(/&apos;/g, "'")
  result = result.replace(/&amp;/g, '&') // Must be last
  
  // Decode numeric entities
  result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // Handle escaped quotes in Android XML
  result = result.replace(/\\"/g, '"')
  result = result.replace(/\\'/g, "'")
  result = result.replace(/\\n/g, '\n')
  result = result.replace(/\\t/g, '\t')
  result = result.replace(/\\\\/g, '\\')
  
  return result
}

/**
 * Encode plain text to XML entities
 */
function encodeXmlEntities(text: string): string {
  let result = text
  
  // Encode special characters (order matters - & must be first)
  result = result.replace(/&/g, '&amp;')
  result = result.replace(/</g, '&lt;')
  result = result.replace(/>/g, '&gt;')
  result = result.replace(/"/g, '&quot;')
  result = result.replace(/'/g, '&apos;')
  
  // Escape special characters for Android
  result = result.replace(/\n/g, '\\n')
  result = result.replace(/\t/g, '\\t')
  
  return result
}

/**
 * Detect if content is Android XML format
 */
export function isAndroidXml(content: string): boolean {
  const trimmed = content.trim()
  return (
    (trimmed.includes('<resources>') || trimmed.includes('<resources ')) &&
    trimmed.includes('<string name=')
  )
}

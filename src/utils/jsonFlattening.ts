/**
 * JSON Flattening Utility for Multi-language Localization
 * Converts nested JSON objects to flat key-value pairs and vice versa
 */

export interface FlattenOptions {
  separator?: string
  maxDepth?: number
  preserveArrays?: boolean
  includeArrayIndices?: boolean
}

export interface UnflattenOptions {
  separator?: string
  parseNumbers?: boolean
  parseArrays?: boolean
}

const DEFAULT_FLATTEN_OPTIONS: Required<FlattenOptions> = {
  separator: '.',
  maxDepth: 10,
  preserveArrays: false,
  includeArrayIndices: true
}

const DEFAULT_UNFLATTEN_OPTIONS: Required<UnflattenOptions> = {
  separator: '.',
  parseNumbers: true,
  parseArrays: true
}

/**
 * Flattens a nested JSON object into a flat key-value structure
 * Example: { user: { name: "John", settings: { theme: "dark" } } } 
 * becomes: { "user.name": "John", "user.settings.theme": "dark" }
 */
export function flattenJson(
  obj: any, 
  options: Partial<FlattenOptions> = {},
  parentKey = '',
  depth = 0
): Record<string, string> {
  const opts = { ...DEFAULT_FLATTEN_OPTIONS, ...options }
  const result: Record<string, string> = {}

  // Check max depth
  if (depth >= opts.maxDepth) {
    result[parentKey || 'deep_object'] = JSON.stringify(obj)
    return result
  }

  // Handle null/undefined
  if (obj === null || obj === undefined) {
    result[parentKey] = String(obj)
    return result
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    result[parentKey] = String(obj)
    return result
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (opts.preserveArrays) {
      result[parentKey] = JSON.stringify(obj)
      return result
    }

    obj.forEach((item, index) => {
      const key = opts.includeArrayIndices 
        ? `${parentKey}${parentKey ? opts.separator : ''}[${index}]`
        : `${parentKey}${parentKey ? opts.separator : ''}${index}`
      
      const flattened = flattenJson(item, opts, key, depth + 1)
      Object.assign(result, flattened)
    })

    return result
  }

  // Handle objects
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const newKey = parentKey ? `${parentKey}${opts.separator}${key}` : key
    
    const flattened = flattenJson(value, opts, newKey, depth + 1)
    Object.assign(result, flattened)
  })

  return result
}

/**
 * Unflattens a flat key-value object back to nested JSON structure
 * Example: { "user.name": "John", "user.settings.theme": "dark" }
 * becomes: { user: { name: "John", settings: { theme: "dark" } } }
 */
export function unflattenJson(
  flatObj: Record<string, string>,
  options: Partial<UnflattenOptions> = {}
): any {
  const opts = { ...DEFAULT_UNFLATTEN_OPTIONS, ...options }
  const result: any = {}

  Object.keys(flatObj).forEach(key => {
    const value = flatObj[key]
    const keys = key.split(opts.separator)
    
    let current = result

    for (let i = 0; i < keys.length; i++) {
      const keyPart = keys[i]
      const isLast = i === keys.length - 1
      
      // Handle array notation [0], [1], etc.
      const arrayMatch = keyPart.match(/^(.+)?\[(\d+)\]$/)
      if (arrayMatch) {
        const [, baseKey, indexStr] = arrayMatch
        const index = parseInt(indexStr, 10)
        
        if (baseKey) {
          // Key like "items[0]"
          if (!current[baseKey]) {
            current[baseKey] = []
          }
          if (!Array.isArray(current[baseKey])) {
            current[baseKey] = []
          }
          
          if (isLast) {
            current[baseKey][index] = parseValue(value, opts)
          } else {
            if (!current[baseKey][index]) {
              current[baseKey][index] = {}
            }
            current = current[baseKey][index]
          }
        } else {
          // Key like "[0]" (root array)
          if (!Array.isArray(current)) {
            // Convert object to array if needed
            const temp = { ...current }
            current = result
            Object.keys(temp).forEach(k => {
              const idx = parseInt(k, 10)
              if (!isNaN(idx)) {
                current[idx] = temp[k]
              }
            })
          }
          
          if (isLast) {
            current[index] = parseValue(value, opts)
          } else {
            if (!current[index]) {
              current[index] = {}
            }
            current = current[index]
          }
        }
      } else {
        // Regular key
        if (isLast) {
          current[keyPart] = parseValue(value, opts)
        } else {
          if (!current[keyPart]) {
            // Look ahead to see if next key suggests an array
            const nextKey = keys[i + 1]
            const isNextArray = /^\d+$/.test(nextKey) || /^\[/.test(nextKey)
            current[keyPart] = isNextArray && opts.parseArrays ? [] : {}
          }
          current = current[keyPart]
        }
      }
    }
  })

  return result
}

/**
 * Parse string value to appropriate type
 */
function parseValue(value: string, options: Required<UnflattenOptions>): any {
  if (value === 'null') return null
  if (value === 'undefined') return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  
  // Try to parse as number
  if (options.parseNumbers && /^-?\d+\.?\d*$/.test(value)) {
    const num = Number(value)
    if (!isNaN(num)) return num
  }
  
  // Try to parse as JSON (for objects/arrays that were stringified)
  if ((value.startsWith('{') && value.endsWith('}')) || 
      (value.startsWith('[') && value.endsWith(']'))) {
    try {
      return JSON.parse(value)
    } catch {
      // If parsing fails, return as string
    }
  }
  
  return value
}

/**
 * Convert JSON file content to flat key-value pairs
 */
export function parseJsonToFlat(content: string, options: Partial<FlattenOptions> = {}): Record<string, string> {
  try {
    const jsonObj = JSON.parse(content)
    return flattenJson(jsonObj, options)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    throw new Error('Invalid JSON format')
  }
}

/**
 * Convert flat key-value pairs to JSON string
 */
export function flatToJsonString(flatObj: Record<string, string>, options: Partial<UnflattenOptions> = {}): string {
  try {
    const nestedObj = unflattenJson(flatObj, options)
    return JSON.stringify(nestedObj, null, 2)
  } catch (error) {
    console.error('Failed to convert to JSON:', error)
    throw new Error('Failed to convert to JSON format')
  }
}

/**
 * Detect if content is JSON format
 */
export function isJsonContent(content: string): boolean {
  const trimmed = content.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'))
}

/**
 * Common flattening presets for different use cases
 */
export const FLATTEN_PRESETS = {
  // Standard web app localization
  web: {
    separator: '.',
    maxDepth: 5,
    preserveArrays: true,
    includeArrayIndices: false
  },
  
  // Mobile app localization (iOS/Android)
  mobile: {
    separator: '_',
    maxDepth: 3,
    preserveArrays: false,
    includeArrayIndices: true
  },
  
  // Deep nested configuration
  config: {
    separator: '.',
    maxDepth: 10,
    preserveArrays: false,
    includeArrayIndices: true
  },
  
  // Simple key-value pairs
  simple: {
    separator: '_',
    maxDepth: 2,
    preserveArrays: true,
    includeArrayIndices: false
  }
} as const

/**
 * Example usage and test function
 */
export function testJsonFlattening() {
  const sampleJson = {
    app: {
      name: "My App",
      version: "1.0.0",
      settings: {
        theme: "dark",
        language: "en",
        features: {
          notifications: true,
          analytics: false
        }
      },
      users: [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 }
      ],
      metadata: {
        tags: ["production", "web", "mobile"],
        config: {
          debug: false,
          api: {
            endpoint: "https://api.example.com",
            timeout: 5000
          }
        }
      }
    }
  }

  console.log('Original JSON:', JSON.stringify(sampleJson, null, 2))
  
  const flattened = flattenJson(sampleJson, FLATTEN_PRESETS.web)
  console.log('Flattened:', flattened)
  
  const restored = unflattenJson(flattened)
  console.log('Restored:', JSON.stringify(restored, null, 2))
  
  return { original: sampleJson, flattened, restored }
}

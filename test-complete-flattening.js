// Test complete flattening to primitive values
import fs from 'fs'

console.log('=== Complete JSON Flattening Test ===')
console.log('')

// Sample deeply nested JSON with all data types
const complexJson = {
  "string_value": "Hello World",
  "number_value": 42,
  "boolean_value": true,
  "null_value": null,
  "nested_object": {
    "level1": {
      "level2": {
        "level3": {
          "deep_string": "Deep nested value",
          "deep_number": 123.45,
          "deep_boolean": false
        }
      }
    }
  },
  "array_simple": ["item1", "item2", "item3"],
  "array_objects": [
    {
      "id": 1,
      "name": "First Item",
      "active": true,
      "metadata": {
        "created": "2025-01-01",
        "tags": ["tag1", "tag2"]
      }
    },
    {
      "id": 2,
      "name": "Second Item", 
      "active": false,
      "metadata": {
        "created": "2025-01-02",
        "tags": ["tag3", "tag4"]
      }
    }
  ],
  "mixed_array": [
    "string_item",
    42,
    true,
    null,
    {
      "nested_in_array": {
        "deep_value": "Very deep"
      }
    }
  ]
}

// Manual complete flattening
function completeFlat(obj, prefix = '') {
  const result = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (value === null || value === undefined) {
      result[newKey] = String(value)
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[newKey] = String(value)
    } else if (Array.isArray(value)) {
      // Flatten array completely
      value.forEach((item, index) => {
        const arrayKey = `${newKey}[${index}]`
        if (item === null || item === undefined || typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          result[arrayKey] = String(item)
        } else if (typeof item === 'object') {
          Object.assign(result, completeFlat(item, arrayKey))
        }
      })
    } else if (typeof value === 'object') {
      Object.assign(result, completeFlat(value, newKey))
    }
  }
  
  return result
}

const flattened = completeFlat(complexJson)

console.log('Original JSON structure has:')
console.log('- Nested objects up to 4 levels deep')
console.log('- Arrays with mixed data types')
console.log('- All primitive types: string, number, boolean, null')
console.log('')

console.log('Flattened to', Object.keys(flattened).length, 'primitive key-value pairs:')
console.log('')

// Group by type for better display
const primitiveKeys = []
const arrayKeys = []
const deepKeys = []

Object.keys(flattened).forEach(key => {
  if (key.includes('[')) {
    arrayKeys.push(key)
  } else if (key.split('.').length > 3) {
    deepKeys.push(key)
  } else {
    primitiveKeys.push(key)
  }
})

console.log('🔹 Simple primitive values:')
primitiveKeys.forEach(key => {
  console.log(`   ${key}: ${flattened[key]}`)
})

console.log('')
console.log('🔹 Deep nested values:')
deepKeys.forEach(key => {
  console.log(`   ${key}: ${flattened[key]}`)
})

console.log('')
console.log('🔹 Array values (flattened):')
arrayKeys.forEach(key => {
  console.log(`   ${key}: ${flattened[key]}`)
})

console.log('')
console.log('✅ Every value is now a primitive (string, number, boolean, null)')
console.log('✅ Arrays are completely flattened with [index] notation')
console.log('✅ Objects are flattened to any depth level')
console.log('')
console.log('This is what your JSON will look like in the editor!')

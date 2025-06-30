// Test complete flattening with the user's actual th.json file
import fs from 'fs'

console.log('=== Your th.json Complete Flattening Test ===')
console.log('')

// Read the user's th.json file
const thJsonPath = '/Users/numpolpoldongnok/Downloads/th.json'
const thJsonContent = fs.readFileSync(thJsonPath, 'utf8')
const thData = JSON.parse(thJsonContent)

console.log('📁 Original th.json structure:')
console.log('   - applicationSteps array:', thData.visaApplication.applicationSteps.length, 'items')
console.log('   - notifications array:', thData.visaApplication.notifications.length, 'items')
console.log('   - First step has', thData.visaApplication.applicationSteps[0].requirements.length, 'requirements')
console.log('   - Deeply nested objects with arrays within arrays')
console.log('')

// Manual complete flattening function
function completeFlat(obj, prefix = '') {
  const result = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (value === null || value === undefined) {
      result[newKey] = String(value)
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[newKey] = String(value)
    } else if (Array.isArray(value)) {
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

const flattened = completeFlat(thData)

console.log('🔧 After complete flattening:')
console.log('   Total flattened keys:', Object.keys(flattened).length)
console.log('')

console.log('📋 Sample flattened keys from your visa application:')
const sampleKeys = Object.keys(flattened).slice(0, 15)
sampleKeys.forEach(key => {
  const value = flattened[key]
  const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value
  console.log(`   ${key}: ${displayValue}`)
})

console.log('')
console.log('🔍 Deep array flattening examples:')
const arrayKeys = Object.keys(flattened).filter(key => key.includes('[') && key.includes('requirements')).slice(0, 8)
arrayKeys.forEach(key => {
  console.log(`   ${key}: ${flattened[key]}`)
})

console.log('')
console.log('✅ Results:')
console.log('   • Every nested object is flattened to dot notation')
console.log('   • Every array element gets [index] notation') 
console.log('   • All values are now primitive strings/numbers/booleans')
console.log('   • No more complex JSON objects - only key-value pairs!')
console.log('')
console.log('🎯 Perfect for editing in the table interface!')

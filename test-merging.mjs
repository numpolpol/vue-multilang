import { parseStrings, findMergeableKeys, applyKeyMerging } from './src/utils/strings.js'

// Test data simulating iOS and Android files with matching values
const testData = [
  // English
  {
    'common_ok': 'OK',
    'android_common_ok': 'OK',
    'common_cancel': 'Cancel', 
    'android_common_cancel': 'Cancel',
    'home_title': 'Welcome',
    'android_home_title': 'Hello', // Different value - should not merge
    'unique_ios': 'iOS Only'
  },
  // Thai
  {
    'common_ok': 'ตกลง',
    'android_common_ok': 'ตกลง', 
    'common_cancel': 'ยกเลิก',
    'android_common_cancel': 'ยกเลิก',
    'home_title': 'ยินดีต้อนรับ',
    'android_home_title': 'สวัสดี', // Different value - should not merge
    'unique_ios': 'เฉพาะ iOS'
  }
]

console.log('🧪 Testing Key Merging Logic\n')

console.log('📊 Original data:')
testData.forEach((data, index) => {
  const lang = index === 0 ? 'English' : 'Thai'
  console.log(`${lang}:`, data)
})

console.log('\n🔍 Finding mergeable keys...')
const keyMappings = findMergeableKeys(testData)

console.log('\n📋 Key mappings found:')
keyMappings.forEach(mapping => {
  if (mapping.shouldMerge) {
    console.log(`✅ MERGE: ${mapping.primaryKey} + ${mapping.secondaryKey}`)
    console.log(`   Values: ${mapping.values.join(', ')}`)
  } else {
    console.log(`❌ KEEP: ${mapping.primaryKey}`)
    console.log(`   Values: ${mapping.values.join(', ')}`)
  }
})

console.log('\n🔄 Applying key merging...')
const mockFiles = [
  new File([''], 'en.strings'),
  new File([''], 'th.strings')
]

const result = applyKeyMerging(mockFiles, testData, keyMappings)

console.log('\n📊 Merged data:')
result.data.forEach((data, index) => {
  const lang = index === 0 ? 'English' : 'Thai'
  console.log(`${lang}:`)
  Object.entries(data).forEach(([key, value]) => {
    const isMerged = result.mergedKeys?.includes(key)
    console.log(`  ${isMerged ? '🔗' : '📝'} ${key}: "${value}"`)
  })
})

console.log('\n🎯 Summary:')
console.log(`Total merged keys: ${result.mergedKeys?.length || 0}`)
if (result.mergedKeys?.length) {
  console.log('Merged keys:', result.mergedKeys)
}

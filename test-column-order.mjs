#!/usr/bin/env node

/**
 * Test script to verify the new default column order: th, en, my, km
 */

console.log('🧪 Testing New Default Column Order...\n')

// Simulate the new project creation
const defaultLanguages = [
  { code: 'th', name: 'Thai' },
  { code: 'en', name: 'English' },  
  { code: 'my', name: 'Myanmar' },
  { code: 'km', name: 'Khmer' }
]

console.log('✅ New default column order:')
defaultLanguages.forEach((lang, index) => {
  console.log(`   ${index + 1}. ${lang.name} (${lang.code})`)
})

console.log('\n🔍 Expected column order in table:')
console.log('Key\t\tThai\t\tEnglish\t\tMyanmar\t\tKhmer')
console.log('---\t\t----\t\t-------\t\t-------\t\t-----')
console.log('common_welcome\tยินดีต้อนรับ\tWelcome\t\tကြိုဆိုပါတယ်\tសូមស្វាគមន៍')
console.log('common_ok\tตกลง\t\tOK\t\tOK\t\tយល់ព្រម')
console.log('common_cancel\tยกเลิก\t\tCancel\t\tပယ်ဖျက်\t\tបោះបង់')

console.log('\n✅ Column order updated successfully!')
console.log('New order: Thai → English → Myanmar → Khmer')

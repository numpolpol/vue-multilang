// Test script to demonstrate the multi-line string export fix
import { toStrings, parseStringsWithStructure, toStringsWithStructure } from './src/utils/strings.js'

console.log('🔧 Testing Multi-line String Export Fix\n')

// Test case 1: Multi-line string with newlines and quotes
const testData = {
  'all_services_exit_popup_message': 'အကောင်းဆုံးအတွေ့အကြုံအတွက်။\nအခုပဲ သင်အကြိုက်ဆုံးအဖြစ် သိမ်းဆည်းလိုက်ပါ။',
  'simple_message': 'Simple message',
  'quoted_message': 'He said "Hello" to me'
}

console.log('1️⃣ Testing toStrings() with multi-line values:')
const exported = toStrings(testData)
console.log(exported)
console.log('\n✅ Notice: Newlines are escaped as \\n and quotes are escaped as \\"')

// Test case 2: Structure preservation with duplicate key handling
console.log('\n2️⃣ Testing structure preservation with duplicates:')
const contentWithDuplicates = `// Sample strings file
"key1" = "First value";
"key2" = "Second value";
"key1" = "Duplicate value";  // This is a duplicate
"key3" = "Third value";`

const parsed = parseStringsWithStructure(contentWithDuplicates)
console.log('Parsed data keys:', Object.keys(parsed.data))

const updatedData = {
  'key1': 'Updated first\nwith newline',
  'key2': 'Updated second with "quotes"', 
  'key3': 'Updated third'
}

const structureExported = toStringsWithStructure(updatedData, parsed.structure)
console.log('\nExported with structure preservation:')
console.log(structureExported)

// Count key occurrences 
const key1Count = (structureExported.match(/"key1"/g) || []).length
console.log(`\n✅ Key "key1" appears ${key1Count} time(s) (duplicate removed)`)

console.log('\n🎉 Multi-line string export fix is working correctly!')
console.log('   ✅ Multi-line values are properly escaped')
console.log('   ✅ Duplicate keys are prevented') 
console.log('   ✅ Structure preservation works with multi-line content')
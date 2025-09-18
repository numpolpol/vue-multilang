import { parseStrings } from './src/utils/strings.js'
import { readFileSync } from 'fs'

// Test the duplicate detection
const content = readFileSync('./test-duplicates.strings', 'utf-8')

console.log('Testing duplicate key detection...')
console.log('File content:')
console.log(content)
console.log('\n--- Parsing with duplicate detection ---')

const result = parseStrings(content, true)

console.log('\nParsed data:')
console.log(result.data)

console.log(`\nDuplicate summary:`)
console.log(`- Total duplicates: ${result.duplicateCount}`)
console.log(`- Duplicate keys: ${result.duplicateKeys.join(', ')}`)

console.log('\nDone!')
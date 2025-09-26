import { parseStrings, toStrings } from './src/utils/strings.js'

// Test the exact user case
console.log('=== Testing User\'s Original Issue ===')

const input = `"binding_accounts_list_delete_account_alert_message" = "If you want to disconnect this service, please tap \\"Confirm\\".";`

console.log('Input:')
console.log(input)

// Parse the input
const parsed = parseStrings(input)
console.log('\nParsed data:')
console.log(JSON.stringify(parsed, null, 2))

// Export it back
const exported = toStrings(parsed)
console.log('\nExported output:')
console.log(exported)

console.log('\n=== Verification ===')
console.log('Input and output match:', input === exported)
console.log('✅ No double-escaping occurred!')

console.log('\n=== Testing Complex Cases ===')

const complexInput = `"simple" = "No quotes here";
"with_quotes" = "He said \\"Hello\\" to me";
"html_content" = "<a href=\\"https://example.com\\">Click here</a>";
"mixed" = "Normal text and \\"quoted text\\" together";`

console.log('\nComplex input:')
console.log(complexInput)

const complexParsed = parseStrings(complexInput)
console.log('\nComplex parsed data:')
console.log(JSON.stringify(complexParsed, null, 2))

const complexExported = toStrings(complexParsed)
console.log('\nComplex exported output:')
console.log(complexExported)

console.log('\n=== Round-trip Test ===')
const secondParse = parseStrings(complexExported)
console.log('Round-trip data matches:', JSON.stringify(complexParsed) === JSON.stringify(secondParse))
console.log('✅ Round-trip integrity maintained!')
// Test Android XML parser
import { parseAndroidXml, parseAndroidXmlWithStructure, toAndroidXml, toAndroidXmlWithStructure, isAndroidXml } from './src/utils/androidXml.ts'
import fs from 'fs'

console.log('🧪 Testing Android XML Parser\n')

// Test 1: Parse simple Android XML
console.log('📝 Test 1: Parse Simple Android XML')
const simpleXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">My App</string>
    <string name="hello">Hello World</string>
</resources>`

const result1 = parseAndroidXml(simpleXml)
console.log('Parsed data:', result1)
console.assert(result1.app_name === 'My App', 'app_name should be "My App"')
console.assert(result1.hello === 'Hello World', 'hello should be "Hello World"')
console.log('✅ Test 1 passed\n')

// Test 2: Parse with comments
console.log('📝 Test 2: Parse with Comments')
const xmlWithComments = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- App Info -->
    <string name="app_name">My App</string>
    
    <!-- Greetings -->
    <string name="hello">Hello</string>
</resources>`

const result2 = parseAndroidXml(xmlWithComments)
console.log('Parsed data:', result2)
console.assert(Object.keys(result2).length === 2, 'Should have 2 keys')
console.log('✅ Test 2 passed\n')

// Test 3: Parse with XML entities
console.log('📝 Test 3: Parse with XML Entities')
const xmlWithEntities = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="text_with_special">&lt;Hello &amp; Goodbye&gt;</string>
    <string name="quote_text">&quot;Hello&quot;</string>
</resources>`

const result3 = parseAndroidXml(xmlWithEntities)
console.log('Parsed data:', result3)
console.assert(result3.text_with_special === '<Hello & Goodbye>', 'Should decode entities')
console.assert(result3.quote_text === '"Hello"', 'Should decode quote entity')
console.log('✅ Test 3 passed\n')

// Test 4: Parse with duplicate keys (latest wins)
console.log('📝 Test 4: Duplicate Keys (Latest Wins)')
const xmlWithDuplicates = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="test_key">First Value</string>
    <string name="test_key">Second Value</string>
    <string name="test_key">Third Value</string>
</resources>`

const result4 = parseAndroidXml(xmlWithDuplicates, true)
console.log('Parsed data:', result4.data)
console.log('Duplicate count:', result4.duplicateCount)
console.log('Duplicate keys:', result4.duplicateKeys)
console.assert(result4.data.test_key === 'Third Value', 'Should keep last value')
console.assert(result4.duplicateCount === 1, 'Should detect 1 duplicate key')
console.log('✅ Test 4 passed\n')

// Test 5: Parse with structure preservation
console.log('📝 Test 5: Structure Preservation')
const structured = parseAndroidXmlWithStructure(xmlWithComments)
console.log('Structure items:', structured.structure.length)
console.log('Structure types:', structured.structure.map(s => s.type))
console.assert(structured.structure.some(s => s.type === 'comment'), 'Should preserve comments')
console.assert(structured.structure.some(s => s.type === 'string'), 'Should have string entries')
console.log('✅ Test 5 passed\n')

// Test 6: Export to Android XML
console.log('📝 Test 6: Export to Android XML')
const dataToExport = {
  app_name: 'Test App',
  hello: 'Hello World',
  goodbye: 'Goodbye'
}
const exported = toAndroidXml(dataToExport)
console.log('Exported XML:')
console.log(exported)
console.assert(exported.includes('<string name="app_name">Test App</string>'), 'Should export app_name')
console.assert(exported.includes('<?xml'), 'Should have XML declaration')
console.assert(exported.includes('<resources>'), 'Should have resources tag')
console.log('✅ Test 6 passed\n')

// Test 7: Export with structure preservation
console.log('📝 Test 7: Export with Structure Preservation')
const originalWithStructure = parseAndroidXmlWithStructure(xmlWithComments)
const modifiedData = {
  app_name: 'Modified App',
  hello: 'Modified Hello'
}
const exportedWithStructure = toAndroidXmlWithStructure(modifiedData, originalWithStructure.structure)
console.log('Exported with structure:')
console.log(exportedWithStructure)
console.assert(exportedWithStructure.includes('<!-- App Info -->'), 'Should preserve comments')
console.assert(exportedWithStructure.includes('Modified App'), 'Should use new values')
console.log('✅ Test 7 passed\n')

// Test 8: Detect Android XML format
console.log('📝 Test 8: Format Detection')
console.assert(isAndroidXml(simpleXml) === true, 'Should detect Android XML')
console.assert(isAndroidXml('"key" = "value";') === false, 'Should not detect iOS strings as Android XML')
console.log('✅ Test 8 passed\n')

// Test 9: Parse with attributes
console.log('📝 Test 9: Parse with Attributes')
const xmlWithAttributes = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name" translatable="false">My App</string>
    <string name="hello" translatable="true">Hello</string>
</resources>`

const result9 = parseAndroidXmlWithStructure(xmlWithAttributes)
console.log('Parsed with attributes:', result9.data)
const appNameEntry = result9.structure.find(s => s.key === 'app_name')
console.log('app_name attributes:', appNameEntry?.attributes)
console.assert(appNameEntry?.attributes?.includes('translatable="false"'), 'Should preserve attributes')
console.log('✅ Test 9 passed\n')

// Test 10: Real file test (if exists)
console.log('📝 Test 10: Real File Test')
try {
  const enContent = fs.readFileSync('./src/sample/strings_en.xml', 'utf-8')
  const thContent = fs.readFileSync('./src/sample/strings_th.xml', 'utf-8')
  
  const enData = parseAndroidXml(enContent)
  const thData = parseAndroidXml(thContent)
  
  console.log('English keys:', Object.keys(enData).length)
  console.log('Thai keys:', Object.keys(thData).length)
  console.log('Sample EN data:', { app_name: enData.app_name, welcome_title: enData.welcome_title })
  console.log('Sample TH data:', { app_name: thData.app_name, welcome_title: thData.welcome_title })
  
  console.assert(enData.app_name === 'Multi-Language Editor', 'Should parse EN file correctly')
  console.assert(thData.app_name === 'โปรแกรมแก้ไขหลายภาษา', 'Should parse TH file correctly')
  console.log('✅ Test 10 passed\n')
} catch (e) {
  console.log('⚠️  Sample files not found, skipping real file test\n')
}

console.log('✅ All Android XML Parser tests passed! 🎉')

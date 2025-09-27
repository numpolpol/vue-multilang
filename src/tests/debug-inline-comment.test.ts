import { describe, test, expect } from 'vitest'
import { parseStringsWithStructure, toStringsWithStructure } from '../utils/strings'

describe('Debug Inline Comment Preservation', () => {
  test('should show exactly what happens with inline comment preservation', () => {
    const originalContent = `/*
 * Header comment block
 * Application: Vue Multi-Lang
 */

// Section comment
"app_name" = "My App"; // Inline comment

/* Block comment */ "version" = "1.0";

// Another section
"debug" = "false"; /* Inline block comment */

/*
 Multi-line
 block comment
 */
"feature" = "enabled";

// End comment`

    console.log('=== ORIGINAL CONTENT ===')
    console.log(originalContent)

    const parsed = parseStringsWithStructure(originalContent)
    console.log('\n=== PARSED DATA ===')
    console.log('Keys:', Object.keys(parsed.data))
    console.log('Structure items:', parsed.structure.length)

    // Find the debug entry
    const debugStructure = parsed.structure.find(item => 
        item.type === 'key' && item.key === 'debug'
    )
    console.log('\n=== DEBUG STRUCTURE ===')
    console.log(JSON.stringify(debugStructure, null, 2))

    // Show all structure items
    console.log('\n=== ALL STRUCTURE ITEMS ===')
    parsed.structure.forEach((item: any, index: number) => {
      console.log(`${index}: ${item.type} - ${JSON.stringify(item)}`)
    })

    // Modify the data
    const modifiedData = { ...parsed.data }
    modifiedData.debug = 'true'

    console.log('\n=== MODIFIED DATA ===')
    console.log('debug value changed to:', modifiedData.debug)

    const exported = toStringsWithStructure(modifiedData, parsed.structure)
    console.log('\n=== EXPORTED CONTENT ===')
    console.log(exported)

    // Check if inline comment is preserved
    if (exported.includes('/* Inline block comment */')) {
      console.log('\n✅ Inline comment preserved!')
    } else {
      console.log('\n❌ Inline comment lost!')
    }

    // This test should fail so we can see the debug output
    expect(false).toBe(true)
  })
})
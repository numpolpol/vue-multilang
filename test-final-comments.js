import { describe, it, expect } from 'vitest'
import { parseStringsWithStructure, toStringsWithStructure } from '../utils/strings'

describe('Complete Comment Preservation', () => {
  it('should preserve ALL comment types from import to export', () => {
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

    const parsed = parseStringsWithStructure(originalContent)
    
    // Modify one value to test inline comment preservation
    const modifiedData = {
      ...parsed.data,
      debug: 'true' // This should preserve the inline block comment
    }

    const exported = toStringsWithStructure(modifiedData, parsed.structure)

    // All comment types should be preserved
    expect(exported).toContain('Header comment block')
    expect(exported).toContain('// Section comment')
    expect(exported).toContain('; // Inline comment')
    expect(exported).toContain('/* Block comment */')
    expect(exported).toContain('Multi-line')
    expect(exported).toContain('block comment')
    expect(exported).toContain('// End comment')
    
    // Modified key should preserve inline block comment
    expect(exported).toContain('"debug" = "true"; /* Inline block comment */')
    
    // Unchanged keys should be identical
    expect(exported).toContain('"app_name" = "My App"; // Inline comment')
    expect(exported).toContain('/* Block comment */ "version" = "1.0";')
  })
})
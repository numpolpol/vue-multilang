import { describe, it, expect } from 'vitest'
import { 
  parseStrings, 
  toStrings, 
  toStringsWithStructure,
  parseStringsWithStructure
} from '../utils/strings'

describe('String Quote Escaping', () => {
  describe('parseStrings with escaped quotes', () => {
    it('should correctly parse strings with escaped quotes', () => {
      const input = `"binding_accounts_list_delete_account_alert_message" = "If you want to disconnect this service, please tap \\"Confirm\\".";`
      const result = parseStrings(input)
      
      expect(result['binding_accounts_list_delete_account_alert_message'])
        .toBe('If you want to disconnect this service, please tap "Confirm".')
    })

    it('should handle multiple escaped quotes in a single value', () => {
      const input = `"multi_quote_key" = "He said \\"Hello\\" and then \\"Goodbye\\".";`
      const result = parseStrings(input)
      
      expect(result['multi_quote_key'])
        .toBe('He said "Hello" and then "Goodbye".')
    })

    it('should handle mixed escaped and unescaped content', () => {
      const input = `"mixed_content" = "Normal text with \\"quoted text\\" and more normal text.";`
      const result = parseStrings(input)
      
      expect(result['mixed_content'])
        .toBe('Normal text with "quoted text" and more normal text.')
    })
  })

  describe('toStrings export without double-escaping', () => {
    it('should not double-escape quotes that are already escaped in the data', () => {
      // This simulates data that was parsed from a .strings file and contains unescaped quotes
      const data = {
        'binding_accounts_list_delete_account_alert_message': 'If you want to disconnect this service, please tap "Confirm".'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"binding_accounts_list_delete_account_alert_message" = "If you want to disconnect this service, please tap \\"Confirm\\".";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should properly escape quotes in new content that has unescaped quotes', () => {
      const data = {
        'new_key': 'This has "unescaped" quotes that need escaping.'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"new_key" = "This has \\"unescaped\\" quotes that need escaping.";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle newlines correctly', () => {
      const data = {
        'multiline_key': 'Line 1\nLine 2\nLine 3'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"multiline_key" = "Line 1\\nLine 2\\nLine 3";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle mixed quotes and newlines', () => {
      const data = {
        'complex_key': 'Line 1 with "quotes"\nLine 2 with normal text'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"complex_key" = "Line 1 with \\"quotes\\"\\nLine 2 with normal text";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle empty values', () => {
      const data = {
        'empty_key': '',
        'another_key': 'Normal value'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"empty_key" = "";\n"another_key" = "Normal value";`
      
      expect(result).toBe(expectedOutput)
    })
  })

  describe('toStringsWithStructure export without double-escaping', () => {
    it('should preserve original content when value hasnt changed', () => {
      const originalContent = `"binding_accounts_list_delete_account_alert_message" = "If you want to disconnect this service, please tap \\"Confirm\\".";`
      
      const parsed = parseStringsWithStructure(originalContent)
      const result = toStringsWithStructure(parsed.data, parsed.structure)
      
      expect(result).toBe(originalContent)
    })

    it('should properly escape modified values without double-escaping', () => {
      const originalContent = `"test_key" = "Original value with \\"quotes\\".";`
      
      const parsed = parseStringsWithStructure(originalContent)
      // Modify the data to simulate user editing
      parsed.data['test_key'] = 'Modified value with "different quotes".'
      
      const result = toStringsWithStructure(parsed.data, parsed.structure)
      const expectedOutput = `"test_key" = "Modified value with \\"different quotes\\".";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle new keys added during editing', () => {
      const originalContent = `"existing_key" = "Original value.";`
      
      const parsed = parseStringsWithStructure(originalContent)
      // Add a new key with quotes
      parsed.data['new_key'] = 'New value with "quotes".'
      
      const result = toStringsWithStructure(parsed.data, parsed.structure)
      
      expect(result).toContain(`"existing_key" = "Original value.";`)
      expect(result).toContain(`"new_key" = "New value with \\"quotes\\".";`)
      expect(result).toContain('// New keys added during editing')
    })

    it('should handle complex structure with comments and multiple keys', () => {
      const originalContent = `// Header comment
"key1" = "Value with \\"quotes\\".";
// Another comment
"key2" = "Simple value.";

// Final comment`
      
      const parsed = parseStringsWithStructure(originalContent)
      // Modify one key
      parsed.data['key2'] = 'Updated value with "new quotes".'
      
      const result = toStringsWithStructure(parsed.data, parsed.structure)
      
      expect(result).toContain('// Header comment')
      expect(result).toContain(`"key1" = "Value with \\"quotes\\".";`)
      expect(result).toContain(`"key2" = "Updated value with \\"new quotes\\".";`)
      expect(result).toContain('// Final comment')
    })
  })

  describe('Round-trip testing (parse -> export -> parse)', () => {
    it('should maintain quote integrity through parse-export-parse cycle', () => {
      const originalContent = `"binding_accounts_list_delete_account_alert_message" = "If you want to disconnect this service, please tap \\"Confirm\\".";
"multi_quote_key" = "He said \\"Hello\\" and then \\"Goodbye\\".";
"simple_key" = "Simple value without quotes.";`

      // First parse
      const firstParse = parseStrings(originalContent)
      
      // Export back to strings format
      const exported = toStrings(firstParse)
      
      // Parse again
      const secondParse = parseStrings(exported)
      
      // Values should be identical after round-trip
      expect(secondParse['binding_accounts_list_delete_account_alert_message'])
        .toBe('If you want to disconnect this service, please tap "Confirm".')
      expect(secondParse['multi_quote_key'])
        .toBe('He said "Hello" and then "Goodbye".')
      expect(secondParse['simple_key'])
        .toBe('Simple value without quotes.')
      
      // The data should be exactly the same
      expect(secondParse).toEqual(firstParse)
    })

    it('should handle structure preservation round-trip', () => {
      const originalContent = `// Comment
"key1" = "Value with \\"quotes\\".";
"key2" = "Simple value.";`

      const parsed = parseStringsWithStructure(originalContent)
      const exported = toStringsWithStructure(parsed.data, parsed.structure)
      const secondParsed = parseStrings(exported)
      
      expect(secondParsed).toEqual(parsed.data)
    })
  })

  describe('Edge cases', () => {
    it('should handle backslashes correctly', () => {
      const data = {
        'backslash_key': 'Path: C:\\Program Files\\App'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"backslash_key" = "Path: C:\\\\Program Files\\\\App";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle consecutive quotes', () => {
      const data = {
        'consecutive_quotes': 'Text with "" empty quotes.'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"consecutive_quotes" = "Text with \\"\\" empty quotes.";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle quotes at start and end of string', () => {
      const data = {
        'edge_quotes': '"Quoted entire string"'
      }
      
      const result = toStrings(data)
      const expectedOutput = `"edge_quotes" = "\\"Quoted entire string\\"";`
      
      expect(result).toBe(expectedOutput)
    })

    it('should handle the original user case correctly', () => {
      // Test the exact case from the user's request
      const input = `"binding_accounts_list_delete_account_alert_message" = "If you want to disconnect this service, please tap \\"Confirm\\".";`
      
      // Parse the input
      const parsed = parseStrings(input)
      
      // Export it back
      const exported = toStrings(parsed)
      
      // Should match the original input exactly
      expect(exported).toBe(input)
    })
  })
})
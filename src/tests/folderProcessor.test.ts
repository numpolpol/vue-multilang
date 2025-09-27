import { describe, it, expect } from 'vitest'
import { 
  extractLanguageCode, 
  isStringsFile, 
  processFolderFiles,
  validateFolderStructure,
  generateProjectName,
  getAllKeys,
  type FolderFile 
} from '../utils/folderProcessor'

// Mock File implementation
class MockFile implements File {
  public readonly lastModified: number = Date.now()
  public readonly webkitRelativePath: string = ''
  
  constructor(
    public readonly content: string,
    public readonly name: string,
    public readonly type: string = 'text/plain'
  ) {}
  
  get size(): number {
    return this.content.length
  }
  
  async arrayBuffer(): Promise<ArrayBuffer> {
    return new TextEncoder().encode(this.content).buffer
  }
  
  async bytes(): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(this.content)
    return new Uint8Array(uint8Array.buffer)
  }
  
  stream(): ReadableStream<Uint8Array> {
    const content = this.content
    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const uint8Array = encoder.encode(content)
        controller.enqueue(new Uint8Array(uint8Array.buffer))
        controller.close()
      }
    })
  }
  
  async text(): Promise<string> {
    return this.content
  }
  
  slice(start?: number, end?: number, contentType?: string): Blob {
    const sliced = this.content.slice(start, end)
    return new MockFile(sliced, this.name, contentType || this.type) as unknown as Blob
  }
}

function createMockFile(content: string, name: string, type: string = 'text/plain'): File {
  return new MockFile(content, name, type) as unknown as File
}

describe('Folder Processor', () => {
  
  describe('extractLanguageCode', () => {
    it('should extract language code from simple patterns', () => {
      expect(extractLanguageCode('en.strings')).toEqual({ code: 'en', name: 'English' })
      expect(extractLanguageCode('th.strings')).toEqual({ code: 'th', name: 'ไทย (Thai)' })
      expect(extractLanguageCode('km.strings')).toEqual({ code: 'km', name: 'ខ្មែរ (Khmer)' })
    })

    it('should extract language code from prefixed patterns', () => {
      expect(extractLanguageCode('Localizable_en.strings')).toEqual({ code: 'en', name: 'English' })
      expect(extractLanguageCode('InfoPlist_th.strings')).toEqual({ code: 'th', name: 'ไทย (Thai)' })
    })

    it('should extract language code from country code patterns', () => {
      expect(extractLanguageCode('en_US.strings')).toEqual({ code: 'en', name: 'English' })
      expect(extractLanguageCode('zh_CN.strings')).toEqual({ code: 'zh', name: '中文 (Chinese)' })
    })

    it('should handle complex patterns', () => {
      expect(extractLanguageCode('Localizable_en_US.strings')).toEqual({ code: 'en', name: 'English' })
      expect(extractLanguageCode('MyApp_zh_CN.strings')).toEqual({ code: 'zh', name: '中文 (Chinese)' })
    })

    it('should fallback to filename for unknown patterns', () => {
      expect(extractLanguageCode('unknown_pattern.strings')).toEqual({ 
        code: 'unknown_pattern', 
        name: 'UNKNOWN_PATTERN' 
      })
      expect(extractLanguageCode('custom123.strings')).toEqual({ 
        code: 'custom123', 
        name: 'CUSTOM123' 
      })
    })
  })

  describe('isStringsFile', () => {
    it('should identify valid .strings files', () => {
      const validFile = createMockFile('content', 'test.strings', 'text/plain')
      expect(isStringsFile(validFile)).toBe(true)
    })

    it('should identify .strings files with empty type', () => {
      const validFile = createMockFile('content', 'test.strings', '')
      expect(isStringsFile(validFile)).toBe(true)
    })

    it('should reject non-.strings files', () => {
      const invalidFile = createMockFile('content', 'test.txt', 'text/plain')
      expect(isStringsFile(invalidFile)).toBe(false)
      
      const xmlFile = createMockFile('content', 'strings.xml', 'text/xml')
      expect(isStringsFile(xmlFile)).toBe(false)
    })

    it('should be case insensitive', () => {
      const upperCaseFile = createMockFile('content', 'TEST.STRINGS', 'text/plain')
      expect(isStringsFile(upperCaseFile)).toBe(true)
    })
  })

  describe('processFolderFiles', () => {
    const createStringsFile = (name: string, content: string) => {
      return createMockFile(content, name, 'text/plain')
    }

    it('should process valid .strings files', async () => {
      const files = [
        createStringsFile('en.strings', '"hello" = "Hello";\n"world" = "World";'),
        createStringsFile('th.strings', '"hello" = "สวัสดี";\n"world" = "โลก";')
      ]

      const result = await processFolderFiles(files)

      expect(result.files).toHaveLength(2)
      expect(result.languages).toHaveLength(2)
      expect(result.keyCount).toBe(2)
      expect(result.hasErrors).toBe(false)
      
      // Check language data
      const enLang = result.languages.find(lang => lang.code === 'en')
      const thLang = result.languages.find(lang => lang.code === 'th')
      
      expect(enLang?.data).toEqual({ hello: 'Hello', world: 'World' })
      expect(thLang?.data).toEqual({ hello: 'สวัสดี', world: 'โลก' })
    })

    it('should handle files with duplicate keys', async () => {
      const files = [
        createStringsFile('en.strings', '"key1" = "Value 1";\n"key1" = "Value 2";')
      ]

      const result = await processFolderFiles(files)

      expect(result.totalDuplicates).toBe(1)
      expect(result.files[0].parseResult?.duplicateCount).toBe(1)
      expect(result.languages[0].data.key1).toBe('Value 2') // Latest value should be kept
    })

    it('should handle empty folder', async () => {
      const result = await processFolderFiles([])
      
      expect(result.hasErrors).toBe(true)
      expect(result.errors).toContain('No .strings files found in the selected folder')
    })

    it('should handle invalid .strings content', async () => {
      const files = [
        createStringsFile('invalid.strings', 'invalid content')
      ]

      const result = await processFolderFiles(files)

      expect(result.files).toHaveLength(1)
      expect(result.files[0].isValidStrings).toBe(false)
      expect(result.hasErrors).toBe(true)
    })

    it('should merge data from multiple files with same language code', async () => {
      const files = [
        createStringsFile('en.strings', '"key1" = "Value 1";'),
        createStringsFile('Localizable_en.strings', '"key2" = "Value 2";')
      ]

      const result = await processFolderFiles(files)

      expect(result.languages).toHaveLength(1) // Should merge into one language
      const enLang = result.languages.find(lang => lang.code === 'en')
      expect(enLang?.data).toEqual({ key1: 'Value 1', key2: 'Value 2' })
    })

    it('should filter out non-.strings files', async () => {
      const files = [
        createStringsFile('en.strings', '"key" = "value";'),
        createMockFile('content', 'readme.txt', 'text/plain'),
        createMockFile('content', 'config.json', 'application/json')
      ]

      const result = await processFolderFiles(files)

      expect(result.files).toHaveLength(1)
      expect(result.files[0].name).toBe('en.strings')
    })
  })

  describe('validateFolderStructure', () => {
    const createFolderFile = (name: string, languageCode: string, isValid: boolean = true): FolderFile => ({
      file: createMockFile('', name, 'text/plain'),
      name,
      languageCode,
      languageName: languageCode.toUpperCase(),
      size: 100,
      isValidStrings: isValid,
      parseResult: isValid ? { data: { key: 'value' }, duplicateCount: 0, duplicateKeys: [] } : undefined
    })

    it('should validate good folder structure', () => {
      const files = [
        createFolderFile('en.strings', 'en'),
        createFolderFile('th.strings', 'th'),
        createFolderFile('km.strings', 'km')
      ]

      const validation = validateFolderStructure(files)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(0)
    })

    it('should warn about duplicate language codes', () => {
      const files = [
        createFolderFile('en.strings', 'en'),
        createFolderFile('Localizable_en.strings', 'en'),
        createFolderFile('th.strings', 'th')
      ]

      const validation = validateFolderStructure(files)

      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toContain("Multiple files detected for language 'en' - data will be merged")
    })

    it('should warn about invalid files', () => {
      const files = [
        createFolderFile('en.strings', 'en'),
        createFolderFile('invalid.strings', 'invalid', false)
      ]

      const validation = validateFolderStructure(files)

      expect(validation.isValid).toBe(true) // Still valid because one file is good
      expect(validation.warnings).toContain('1 files could not be parsed')
    })

    it('should be invalid if no valid files', () => {
      const files = [
        createFolderFile('invalid1.strings', 'invalid1', false),
        createFolderFile('invalid2.strings', 'invalid2', false)
      ]

      const validation = validateFolderStructure(files)

      expect(validation.isValid).toBe(false)
    })

    it('should suggest improvements', () => {
      const files = [
        createFolderFile('en.strings', 'en')
      ]

      const validation = validateFolderStructure(files)

      expect(validation.suggestions).toContain('Consider adding more language files for better multi-language support')
    })
  })

  describe('generateProjectName', () => {
    const createFolderFile = (name: string, isValid: boolean = true): FolderFile => ({
      file: createMockFile('', name, 'text/plain'),
      name,
      languageCode: 'en',
      languageName: 'English',
      size: 100,
      isValidStrings: isValid
    })

    it('should extract project name from common prefix', () => {
      const files = [
        createFolderFile('MyApp_en.strings'),
        createFolderFile('MyApp_th.strings'),
        createFolderFile('MyApp_km.strings')
      ]

      const name = generateProjectName(files)
      expect(name).toBe('MyApp - Multi-Language')
    })

    it('should handle Localizable prefix', () => {
      const files = [
        createFolderFile('Localizable.strings'),
        createFolderFile('Localizable_th.strings')
      ]

      const name = generateProjectName(files)
      expect(name).toBe('Localizable - Multi-Language')
    })

    it('should fallback to language count', () => {
      const files = [
        createFolderFile('en.strings'),
        createFolderFile('th.strings'),
        createFolderFile('km.strings')
      ]

      const name = generateProjectName(files)
      expect(name).toBe('Project (1 languages)') // Only one unique language code 'en'
    })

    it('should handle no valid files', () => {
      const files = [
        createFolderFile('invalid.strings', false)
      ]

      const name = generateProjectName(files)
      expect(name).toBe('Imported Project')
    })

    it('should handle empty array', () => {
      const name = generateProjectName([])
      expect(name).toBe('Imported Project')
    })
  })

  describe('getAllKeys', () => {
    it('should get all unique keys across languages', () => {
      const languages = [
        { 
          code: 'en', 
          name: 'English', 
          data: { key1: 'value1', key2: 'value2' } as Record<string, string>, 
          hasFile: true,
          fileType: 'strings' as const
        },
        { 
          code: 'th', 
          name: 'Thai', 
          data: { key2: 'value2', key3: 'value3' } as Record<string, string>, 
          hasFile: true,
          fileType: 'strings' as const
        }
      ]

      const keys = getAllKeys(languages)
      expect(keys).toEqual(['key1', 'key2', 'key3'])
    })

    it('should return sorted keys', () => {
      const languages = [
        { 
          code: 'en', 
          name: 'English', 
          data: { zebra: 'z', apple: 'a', banana: 'b' } as Record<string, string>, 
          hasFile: true,
          fileType: 'strings' as const
        }
      ]

      const keys = getAllKeys(languages)
      expect(keys).toEqual(['apple', 'banana', 'zebra'])
    })

    it('should handle empty languages', () => {
      const keys = getAllKeys([])
      expect(keys).toEqual([])
    })

    it('should handle languages with no data', () => {
      const languages = [
        { code: 'en', name: 'English', data: {} as Record<string, string>, hasFile: true, fileType: 'strings' as const }
      ]

      const keys = getAllKeys(languages)
      expect(keys).toEqual([])
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete folder import workflow', async () => {
      const createFile = (name: string, content: string) => {
        return new MockFile(content, name, 'text/plain') as unknown as File
      }

      const files = [
        createFile('MyApp_en.strings', '"welcome" = "Welcome";\n"goodbye" = "Goodbye";'),
        createFile('MyApp_th.strings', '"welcome" = "ยินดีต้อนรับ";\n"goodbye" = "ลาก่อน";'),
        createFile('MyApp_km.strings', '"welcome" = "សូមស្វាគមន៍";\n"error" = "កំហុស";'),
        createFile('readme.txt', 'This is a readme file') // Should be ignored
      ]

      const result = await processFolderFiles(files)
      const validation = validateFolderStructure(result.files)
      const projectName = generateProjectName(result.files)
      const allKeys = getAllKeys(result.languages)

      // Verify processing results
      expect(result.files).toHaveLength(3) // Only .strings files
      expect(result.languages).toHaveLength(3) // en, th, km
      expect(result.keyCount).toBe(3) // welcome, goodbye, error
      expect(result.hasErrors).toBe(false)

      // Verify validation
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(0)

      // Verify project name generation
      expect(projectName).toBe('MyApp - Multi-Language')

      // Verify all keys extraction
      expect(allKeys).toEqual(['error', 'goodbye', 'welcome'])

      // Verify language data
      const enLang = result.languages.find(lang => lang.code === 'en')
      const thLang = result.languages.find(lang => lang.code === 'th')
      const kmLang = result.languages.find(lang => lang.code === 'km')

      expect(enLang?.data).toEqual({ welcome: 'Welcome', goodbye: 'Goodbye' })
      expect(thLang?.data).toEqual({ welcome: 'ยินดีต้อนรับ', goodbye: 'ลาก่อน' })
      expect(kmLang?.data).toEqual({ welcome: 'សូមស្វាគមន៍', error: 'កំហុស' })
    })

    it('should handle edge cases gracefully', async () => {
      const createFile = (name: string, content: string) => {
        return new MockFile(content, name, 'text/plain') as unknown as File
      }

      const files = [
        createFile('empty.strings', ''), // Empty file
        createFile('duplicates.strings', '"key" = "value1";\n"key" = "value2";'), // Duplicates
        createFile('special_chars.strings', '"unicode_key" = "🌟 Special ñoñó 中文";'), // Special chars
        createFile('invalid_syntax.strings', 'not valid .strings format'), // Invalid syntax
        createFile('UPPERCASE.STRINGS', '"test" = "Test";') // Case sensitivity
      ]

      const result = await processFolderFiles(files)
      
      expect(result.files.length).toBeGreaterThan(0)
      expect(result.hasErrors).toBe(true) // Due to invalid syntax file
      expect(result.totalDuplicates).toBe(1) // From duplicates.strings
      
      // Should still have some valid languages
      const validLanguages = result.languages.filter(lang => Object.keys(lang.data).length > 0)
      expect(validLanguages.length).toBeGreaterThan(0)
    })
  })
})
import { describe, it, expect } from 'vitest'
import { 
  extractLanguageCode, 
  isStringsFile, 
  validateFolderStructure,
  generateProjectName,
  getAllKeys,
  type FolderFile 
} from '../utils/folderProcessor'

describe('Folder Processor - Basic Tests', () => {
  
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
      const validFile = new File(['content'], 'test.strings', { type: 'text/plain' })
      expect(isStringsFile(validFile)).toBe(true)
    })

    it('should identify .strings files with empty type', () => {
      const validFile = new File(['content'], 'test.strings', { type: '' })
      expect(isStringsFile(validFile)).toBe(true)
    })

    it('should reject non-.strings files', () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      expect(isStringsFile(invalidFile)).toBe(false)
      
      const xmlFile = new File(['content'], 'strings.xml', { type: 'text/xml' })
      expect(isStringsFile(xmlFile)).toBe(false)
    })

    it('should be case insensitive', () => {
      const upperCaseFile = new File(['content'], 'TEST.STRINGS', { type: 'text/plain' })
      expect(isStringsFile(upperCaseFile)).toBe(true)
    })
  })

  describe('validateFolderStructure', () => {
    const createFolderFile = (name: string, languageCode: string, isValid: boolean = true): FolderFile => ({
      file: new File([''], name, { type: 'text/plain' }),
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
    const createFolderFile = (name: string, isValid: boolean = true): FolderFile => {
      const langInfo = extractLanguageCode(name)
      return {
        file: new File([''], name, { type: 'text/plain' }),
        name,
        languageCode: langInfo.code,
        languageName: langInfo.name,
        size: 100,
        isValidStrings: isValid
      }
    }

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
      expect(name).toBe('Project (3 languages)') // Three unique language codes: en, th, km
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
})
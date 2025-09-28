import { describe, it, expect } from 'vitest'
import { extractLanguageCode, isValidLanguageCode } from '../utils/folderProcessor'

describe('FolderProcessor - iOS Only Languages', () => {
  describe('extractLanguageCode', () => {
    it('should extract supported language codes correctly', () => {
      expect(extractLanguageCode('en.strings')).toBe('en')
      expect(extractLanguageCode('th.strings')).toBe('th')
      expect(extractLanguageCode('my.strings')).toBe('my')
      expect(extractLanguageCode('km.strings')).toBe('km')
    })

    it('should return null for unsupported languages', () => {
      expect(extractLanguageCode('zh.strings')).toBeNull()
      expect(extractLanguageCode('ja.strings')).toBeNull()
      expect(extractLanguageCode('ko.strings')).toBeNull()
      expect(extractLanguageCode('fr.strings')).toBeNull()
      expect(extractLanguageCode('de.strings')).toBeNull()
    })

    it('should handle various file naming patterns correctly', () => {
      // Supported patterns for supported languages
      expect(extractLanguageCode('Localizable_en.strings')).toBe('en')
      expect(extractLanguageCode('AppStrings_th.strings')).toBe('th')
      expect(extractLanguageCode('menu_my.strings')).toBe('my')
      expect(extractLanguageCode('error_km.strings')).toBe('km')

      // Should return null for unsupported languages even with valid patterns
      expect(extractLanguageCode('Localizable_zh.strings')).toBeNull()
      expect(extractLanguageCode('AppStrings_ja.strings')).toBeNull()
    })

    it('should return null for non-strings files', () => {
      expect(extractLanguageCode('en.xml')).toBeNull()
      expect(extractLanguageCode('th.json')).toBeNull() 
      expect(extractLanguageCode('my.txt')).toBeNull()
      expect(extractLanguageCode('km.plist')).toBeNull()
    })

    it('should return null for invalid filenames', () => {
      expect(extractLanguageCode('random.strings')).toBeNull()
      expect(extractLanguageCode('123.strings')).toBeNull()
      expect(extractLanguageCode('test.strings')).toBeNull()
      expect(extractLanguageCode('unknown_pattern.strings')).toBeNull()
    })
  })

  describe('isValidLanguageCode', () => {
    it('should validate only supported language codes', () => {
      // Supported languages
      expect(isValidLanguageCode('th')).toBe(true)
      expect(isValidLanguageCode('en')).toBe(true)
      expect(isValidLanguageCode('my')).toBe(true)
      expect(isValidLanguageCode('km')).toBe(true)

      // Unsupported languages
      expect(isValidLanguageCode('zh')).toBe(false)
      expect(isValidLanguageCode('ja')).toBe(false)
      expect(isValidLanguageCode('ko')).toBe(false)
      expect(isValidLanguageCode('fr')).toBe(false)
      expect(isValidLanguageCode('de')).toBe(false)
      expect(isValidLanguageCode('es')).toBe(false)
      expect(isValidLanguageCode('it')).toBe(false)
      expect(isValidLanguageCode('pt')).toBe(false)
      expect(isValidLanguageCode('ru')).toBe(false)
      expect(isValidLanguageCode('ar')).toBe(false)
    })

    it('should return false for invalid inputs', () => {
      expect(isValidLanguageCode('')).toBe(false)
      expect(isValidLanguageCode('invalid')).toBe(false)
      expect(isValidLanguageCode('123')).toBe(false)
      expect(isValidLanguageCode('unknown')).toBe(false)
    })
  })
})
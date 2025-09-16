import { describe, it, expect } from 'vitest'
import { groupFilesByLanguage } from '../utils/strings'

describe('File Grouping (iOS Only)', () => {
  describe('groupFilesByLanguage', () => {
    it('should group files by language code', () => {
      const files = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'th.strings', { type: 'text/plain' }),
        new File([''], 'fr.strings', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(3)
      
      const enGroup = groups.find(g => g.language === 'en')
      expect(enGroup).toBeDefined()
      expect(enGroup!.hasBothFiles).toBe(false)
      expect(enGroup!.primaryFile?.name).toBe('en.strings')

      const thGroup = groups.find(g => g.language === 'th')
      expect(thGroup).toBeDefined()
      expect(thGroup!.hasBothFiles).toBe(false)
      expect(thGroup!.primaryFile?.name).toBe('th.strings')

      const frGroup = groups.find(g => g.language === 'fr')
      expect(frGroup).toBeDefined()
      expect(frGroup!.hasBothFiles).toBe(false)
      expect(frGroup!.primaryFile?.name).toBe('fr.strings')
    })

    it('should handle invalid file names gracefully', () => {
      const files = [
        new File([''], 'invalid', { type: 'text/plain' }),
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'no-extension', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(1)
      expect(groups[0].language).toBe('en')
      expect(groups[0].primaryFile?.name).toBe('en.strings')
    })

    it('should handle multiple .strings files correctly', () => {
      const files = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'th.strings', { type: 'text/plain' }),
        new File([''], 'fr.strings', { type: 'text/plain' }),
        new File([''], 'de.strings', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(4)
      
      // Check that all groups have their .strings files
      groups.forEach(group => {
        expect(group.hasBothFiles).toBe(false)
        expect(group.primaryFile?.name).toBe(`${group.language}.strings`)
      })
    })

    it('should ignore non-.strings files', () => {
      const files = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'th.txt', { type: 'text/plain' }),
        new File([''], 'fr.xml', { type: 'text/plain' }),
        new File([''], 'de.json', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(1) // Only en.strings should be processed
      expect(groups[0].language).toBe('en')
      expect(groups[0].primaryFile?.name).toBe('en.strings')
    })
  })
})

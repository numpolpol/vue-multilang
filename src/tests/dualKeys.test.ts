import { describe, it, expect } from 'vitest'
import { groupFilesByLanguage } from '../utils/strings'

describe('Dual Key Support', () => {
  describe('groupFilesByLanguage', () => {
    it('should group files by language code', () => {
      const files = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'en.xml', { type: 'text/plain' }),
        new File([''], 'th.strings', { type: 'text/plain' }),
        new File([''], 'fr.xml', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(3)
      
      const enGroup = groups.find(g => g.language === 'en')
      expect(enGroup).toBeDefined()
      expect(enGroup!.hasBothFiles).toBe(true)
      expect(enGroup!.primaryFile?.name).toBe('en.strings')
      expect(enGroup!.secondaryFile?.name).toBe('en.xml')

      const thGroup = groups.find(g => g.language === 'th')
      expect(thGroup).toBeDefined()
      expect(thGroup!.hasBothFiles).toBe(false)
      expect(thGroup!.primaryFile?.name).toBe('th.strings')
      expect(thGroup!.secondaryFile).toBeUndefined()

      const frGroup = groups.find(g => g.language === 'fr')
      expect(frGroup).toBeDefined()
      expect(frGroup!.hasBothFiles).toBe(false)
      expect(frGroup!.primaryFile).toBeUndefined()
      expect(frGroup!.secondaryFile?.name).toBe('fr.xml')
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

    it('should correctly identify files with both .strings and .xml', () => {
      const files = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'fr.strings', { type: 'text/plain' }),
        new File([''], 'en.xml', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(2)
      
      const enGroup = groups.find(g => g.language === 'en')
      expect(enGroup!.hasBothFiles).toBe(true)
      
      const frGroup = groups.find(g => g.language === 'fr')
      expect(frGroup!.hasBothFiles).toBe(false)
    })

    it('should handle multiple languages correctly', () => {
      const files = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'en.xml', { type: 'text/plain' }),
        new File([''], 'th.strings', { type: 'text/plain' }),
        new File([''], 'th.xml', { type: 'text/plain' }),
        new File([''], 'fr.strings', { type: 'text/plain' }),
        new File([''], 'de.xml', { type: 'text/plain' })
      ]

      const groups = groupFilesByLanguage(files)

      expect(groups).toHaveLength(4)
      
      // Check that languages with both files are marked correctly
      const bothFilesGroups = groups.filter(g => g.hasBothFiles)
      expect(bothFilesGroups).toHaveLength(2) // en and th
      expect(bothFilesGroups.map(g => g.language).sort()).toEqual(['en', 'th'])
      
      // Check that languages with only one file are marked correctly
      const singleFileGroups = groups.filter(g => !g.hasBothFiles)
      expect(singleFileGroups).toHaveLength(2) // fr and de
      expect(singleFileGroups.map(g => g.language).sort()).toEqual(['de', 'fr'])
    })
  })
})

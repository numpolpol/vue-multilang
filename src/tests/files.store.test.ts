import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFilesStore } from '../stores/files'

describe('FilesStore - iOS Language Columns', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Language Column Management', () => {
    it('should initialize with 4 supported languages', () => {
      const store = useFilesStore()
      
      expect(store.languages).toHaveLength(4)
      expect(store.languages.map(l => l.code)).toEqual(['th', 'en', 'my', 'km'])
    })

    it('should add a key to all language columns', () => {
      const store = useFilesStore()
      
      // Set up some initial data
      store.languages[0].data = { 'existing_key': 'ค่าเดิม' }
      store.languages[1].data = { 'existing_key': 'Old Value' }
      store.languages[2].data = { 'existing_key': 'ပုံေဟာင်းတန်ဖိုး' }
      store.languages[3].data = { 'existing_key': 'តម្លៃចាស់' }
      
      const result = store.addKey('new_key', 'Default')
      
      expect(result).toBe(true)
      expect(store.languages[0].data['new_key']).toBe('Default')
      expect(store.languages[1].data['new_key']).toBe('Default')
      expect(store.languages[2].data['new_key']).toBe('Default')
      expect(store.languages[3].data['new_key']).toBe('Default')
    })

    it('should get all keys from language data', () => {
      const store = useFilesStore()
      
      // Clear all existing data first
      store.languages.forEach(lang => lang.data = {})
      
      store.languages[0].data = { 'key1': 'value1', 'key2': 'value2' }
      store.languages[1].data = { 'key1': 'value1', 'key3': 'value3' }
      
      const allKeys = store.allKeysFromLanguages
      
      expect(allKeys).toEqual(['key1', 'key2', 'key3'])
    })

    it('should detect when languages have files', () => {
      const store = useFilesStore()
      
      expect(store.hasLanguageFiles).toBe(false)
      
      store.languages[0].hasFile = true
      
      expect(store.hasLanguageFiles).toBe(true)
    })

    it('should update key values correctly', () => {
      const store = useFilesStore()
      
      store.languages[0].data = { 'test_key': 'old_value' }
      
      store.updateKeyValue('th', 'test_key', 'new_value')
      
      expect(store.languages[0].data['test_key']).toBe('new_value')
    })

    it('should delete key from all languages', () => {
      const store = useFilesStore()
      
      // Set up data
      store.languages[0].data = { 'key1': 'value1', 'key2': 'value2' }
      store.languages[1].data = { 'key1': 'value1', 'key2': 'value2' }
      
      store.deleteKeyFromAllLanguages('key1')
      
      expect(store.languages[0].data).toEqual({ 'key2': 'value2' })
      expect(store.languages[1].data).toEqual({ 'key2': 'value2' })
    })
  })

  describe('Project Management', () => {
    it('should save project with language structure', () => {
      const store = useFilesStore()
      
      // Set up languages with data
      store.languages[0].data = { 'hello': 'สวัสดี' }
      store.languages[0].hasFile = true
      store.languages[1].data = { 'hello': 'Hello' }
      store.languages[1].hasFile = true
      
      const project = store.saveProject('Test Project')
      
      expect(project.name).toBe('Test Project')
      expect(project.languages).toHaveLength(4) // All 4 supported languages
      expect(project.languages[0]).toHaveProperty('code', 'th')
      expect(project.languages[0]).toHaveProperty('data', { 'hello': 'สวัสดี' })
    })

    it('should load project and restore language structure', () => {
      const store = useFilesStore()
      
      const mockProject = {
        id: '123',
        name: 'Test Project',
        languages: [
          { code: 'th', name: 'Thai', data: { 'hello': 'สวัสดี' }, hasFile: true, fileType: 'strings' as const },
          { code: 'en', name: 'English', data: { 'hello': 'Hello' }, hasFile: true, fileType: 'strings' as const }
        ],
        lastModified: Date.now(),
        createdAt: Date.now()
      }
      
      store.loadProject(mockProject)
      
      expect(store.currentProject).toStrictEqual(mockProject)
      expect(store.languages[0].data).toEqual({ 'hello': 'สวัสดี' })
      expect(store.languages[1].data).toEqual({ 'hello': 'Hello' })
    })
  })

  describe('Changes Tracking', () => {
    it('should detect changes after modification', () => {
      const store = useFilesStore()
      
      // Set up initial state
      store.languages[0].data = { 'key1': 'original' }
      store.snapshotOriginalState()
      
      expect(store.hasChanges).toBe(false)
      
      // Make a change
      store.languages[0].data['key1'] = 'modified'
      
      expect(store.hasChanges).toBe(true)
    })

    it('should identify changed keys', () => {
      const store = useFilesStore()
      
      // Set up initial state
      store.languages[0].data = { 'key1': 'original', 'key2': 'unchanged' }
      store.snapshotOriginalState()
      
      // Make changes
      store.languages[0].data['key1'] = 'modified'
      store.languages[0].data['key3'] = 'new'
      
      const changedKeys = store.changedKeys
      
      expect(changedKeys).toContain('key1')
      expect(changedKeys).toContain('key3')
      expect(changedKeys).not.toContain('key2')
    })
  })
})
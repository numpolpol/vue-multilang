import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFilesStore } from '../stores/files'

describe('FilesStore - Add Key Functionality', () => {
  beforeEach(() => {
    // Create a fresh pinia instance and make it active so it's automatically picked up by any useStore() call without having to pass it to it
    setActivePinia(createPinia())
  })

  describe('addKey', () => {
    it('should add a new key to all language files', () => {
      const store = useFilesStore()
      
      // Setup mock data
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'es.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'existing_key': 'Hello' },
        { 'existing_key': 'Hola' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      // Test adding a new key
      const result = store.addKey('new_key', 'Default Value')
      
      expect(result).toBe(true)
      expect(store.stringsData[0]['new_key']).toBe('Default Value')
      expect(store.stringsData[1]['new_key']).toBe('Default Value')
      expect(store.originalData[0]['new_key']).toBe('Default Value')
      expect(store.originalData[1]['new_key']).toBe('Default Value')
    })

    it('should add a new key with empty default value when no default provided', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'existing_key': 'Hello' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      const result = store.addKey('empty_key')
      
      expect(result).toBe(true)
      expect(store.stringsData[0]['empty_key']).toBe('')
    })

    it('should return false when trying to add a duplicate key', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'existing_key': 'Hello' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      // Try to add a key that already exists
      const result = store.addKey('existing_key', 'New Value')
      
      expect(result).toBe(false)
      // Original value should remain unchanged
      expect(store.stringsData[0]['existing_key']).toBe('Hello')
    })

    it('should update allKeys getter after adding a new key', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'key1': 'Value1', 'key2': 'Value2' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      expect(store.allKeys).toEqual(['key1', 'key2'])
      
      store.addKey('key3', 'Value3')
      
      expect(store.allKeys).toEqual(['key1', 'key2', 'key3'])
    })

    it('should handle empty data gracefully', () => {
      const store = useFilesStore()
      
      // Test with no files or data
      const result = store.addKey('test_key', 'test_value')
      
      expect(result).toBe(true) // Should still return true as no duplicate exists
    })
  })

  describe('removeKey', () => {
    it('should remove a key from all language files', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'es.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'key1': 'Hello', 'key2': 'World' },
        { 'key1': 'Hola', 'key2': 'Mundo' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      store.removeKey('key1')
      
      expect(store.stringsData[0]).toEqual({ 'key2': 'World' })
      expect(store.stringsData[1]).toEqual({ 'key2': 'Mundo' })
      expect(store.originalData[0]).toEqual({ 'key2': 'World' })
      expect(store.originalData[1]).toEqual({ 'key2': 'Mundo' })
    })

    it('should update allKeys getter after removing a key', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'key1': 'Value1', 'key2': 'Value2', 'key3': 'Value3' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      expect(store.allKeys).toEqual(['key1', 'key2', 'key3'])
      
      store.removeKey('key2')
      
      expect(store.allKeys).toEqual(['key1', 'key3'])
    })

    it('should handle removing non-existent key gracefully', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'key1': 'Value1' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      // Should not throw error
      store.removeKey('non_existent_key')
      
      expect(store.stringsData[0]).toEqual({ 'key1': 'Value1' })
    })
  })

  describe('updateValue', () => {
    it('should update a value for a specific file and key', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'es.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'greeting': 'Hello' },
        { 'greeting': 'Hola' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      store.updateValue(0, 'greeting', 'Hi there')
      
      expect(store.stringsData[0]['greeting']).toBe('Hi there')
      expect(store.stringsData[1]['greeting']).toBe('Hola') // Should remain unchanged
    })

    it('should handle invalid file index gracefully', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'greeting': 'Hello' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      // Should not throw error for invalid index
      store.updateValue(5, 'greeting', 'New Value')
      
      expect(store.stringsData[0]['greeting']).toBe('Hello') // Should remain unchanged
    })
  })

  describe('allKeys getter', () => {
    it('should return all unique keys from all language files', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' }),
        new File([''], 'es.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData: Record<string, string>[] = [
        { 'key1': 'Hello', 'key2': 'World' },
        { 'key1': 'Hola', 'key3': 'Mundo' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      const allKeys = store.allKeys
      expect(allKeys).toEqual(['key1', 'key2', 'key3'])
    })

    it('should return empty array when no data', () => {
      const store = useFilesStore()
      
      expect(store.allKeys).toEqual([])
    })

    it('should return sorted keys', () => {
      const store = useFilesStore()
      
      const mockFiles = [
        new File([''], 'en.strings', { type: 'text/plain' })
      ]
      
      const mockStringsData = [
        { 'zebra': 'Z', 'alpha': 'A', 'beta': 'B' }
      ]
      
      store.setFiles(mockFiles)
      store.setStringsData(mockStringsData)
      
      expect(store.allKeys).toEqual(['alpha', 'beta', 'zebra'])
    })
  })
})

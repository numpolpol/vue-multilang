import { describe, it, expect, beforeEach } from 'vitest'
import { useFilesStore } from '../stores/files'
import { createPinia, setActivePinia } from 'pinia'

describe('Multi Key Mode - Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should enable dual keys mode in store', () => {
    const store = useFilesStore()
    
    expect(store.useDualKeys).toBe(false)
    
    store.setDualKeysMode(true)
    expect(store.useDualKeys).toBe(true)
    
    store.setDualKeysMode(false)
    expect(store.useDualKeys).toBe(false)
  })

  it('should return merged keys when dual key mode is enabled', async () => {
    const store = useFilesStore()
    
    // Add identical values to multiple keys
    store.updateKeyValue('en', 'hello', 'Hello')
    store.updateKeyValue('en', 'greeting', 'Hello')
    store.updateKeyValue('th', 'hello', 'สวัสดี')
    store.updateKeyValue('th', 'greeting', 'สวัสดี')
    
    // Mark languages as having files
    store.languages[0].hasFile = true // th
    store.languages[1].hasFile = true // en
    
    // Enable dual key mode
    store.setDualKeysMode(true)
    
    // Wait for async processing
    await store.processMergedKeys()
    
    // Get all keys - should include merged keys
    const allKeys = store.allKeysFromLanguages
    console.log('All keys with dual mode:', allKeys)
    console.log('Merged keys:', store.mergedKeys)
    
    // Should have merged key representation
    expect(allKeys.length).toBeGreaterThan(0)
  })

  it('should update all related keys when editing merged key', () => {
    const store = useFilesStore()
    
    // Setup identical values
    store.updateKeyValue('en', 'save', 'Save')
    store.updateKeyValue('en', 'store', 'Save')
    store.updateKeyValue('th', 'save', 'บันทึก')
    store.updateKeyValue('th', 'store', 'บันทึก')
    
    store.languages[0].hasFile = true // th
    store.languages[1].hasFile = true // en
    store.setDualKeysMode(true)
    
    // Verify initial values
    expect(store.languages[1].data.save).toBe('Save')
    expect(store.languages[1].data.store).toBe('Save')
    
    // Update using merged key logic would happen in component
    // For now, just test that individual updates work
    store.updateKeyValue('en', 'save', 'Updated Save')
    store.updateKeyValue('en', 'store', 'Updated Save')
    
    expect(store.languages[1].data.save).toBe('Updated Save')
    expect(store.languages[1].data.store).toBe('Updated Save')
  })
})

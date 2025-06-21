import { describe, it, expect, beforeEach } from 'vitest'
import { useFilesStore } from '../stores/files'
import { createPinia, setActivePinia } from 'pinia'

describe('Multi Key Mode - Complete Integration Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should demonstrate complete multi-key workflow', async () => {
    const store = useFilesStore()
    
    console.log('=== Multi Key Mode Demo ===')
    
    // Step 1: Add data with some identical values
    console.log('1. Adding identical values for multiple keys...')
    
    // Thai translations
    store.updateKeyValue('th', 'hello', 'สวัสดี')
    store.updateKeyValue('th', 'greeting', 'สวัสดี')  // Same as hello
    store.updateKeyValue('th', 'hi', 'สวัสดี')        // Same as hello
    store.updateKeyValue('th', 'welcome', 'ยินดีต้อนรับ')
    store.updateKeyValue('th', 'save', 'บันทึก')
    store.updateKeyValue('th', 'store', 'บันทึก')    // Same as save
    
    // English translations
    store.updateKeyValue('en', 'hello', 'Hello')
    store.updateKeyValue('en', 'greeting', 'Hello')  // Same as hello
    store.updateKeyValue('en', 'hi', 'Hello')        // Same as hello
    store.updateKeyValue('en', 'welcome', 'Welcome')
    store.updateKeyValue('en', 'save', 'Save')
    store.updateKeyValue('en', 'store', 'Save')      // Same as save
    
    // Mark languages as having files
    store.languages[0].hasFile = true // th
    store.languages[1].hasFile = true // en
    
    console.log('2. Normal mode keys:')
    console.log('Thai keys:', Object.keys(store.languages[0].data))
    console.log('English keys:', Object.keys(store.languages[1].data))
    
    // Step 2: Enable Multi Key Mode
    console.log('3. Enabling Multi Key Mode...')
    store.setDualKeysMode(true)
    await store.processMergedKeys()
    
    console.log('4. Merged keys:', store.mergedKeys)
    
    // Should have merged keys for identical values
    expect(store.mergedKeys.length).toBeGreaterThan(0)
    expect(store.mergedKeys.some(key => key.includes(' + '))).toBe(true)
    
    // Step 3: Verify specific merging
    const expectedMergedKeys = [
      'hello + greeting + hi',  // These 3 keys have identical values
      'save + store',           // These 2 keys have identical values
      'welcome'                 // This key is unique
    ]
    
    console.log('5. Expected merged patterns:')
    expectedMergedKeys.forEach(pattern => {
      console.log(`   - ${pattern}`)
    })
    
    // Check if we have the right number of groups
    const mergedGroups = store.mergedKeys.filter(key => key.includes(' + '))
    const singleKeys = store.mergedKeys.filter(key => !key.includes(' + '))
    
    console.log('6. Analysis:')
    console.log(`   - Merged groups: ${mergedGroups.length}`)
    console.log(`   - Single keys: ${singleKeys.length}`)
    console.log(`   - Total keys shown: ${store.mergedKeys.length}`)
    console.log(`   - Original keys: 6`)
    
    // Should have fewer displayed keys than original due to merging
    expect(store.mergedKeys.length).toBeLessThan(6)
    
    // Step 4: Disable Multi Key Mode
    console.log('7. Disabling Multi Key Mode...')
    store.setDualKeysMode(false)
    
    console.log('8. Back to normal mode keys:', store.allKeysFromLanguages)
    expect(store.allKeysFromLanguages.length).toBe(6) // All original keys
    
    console.log('=== Demo Complete ===')
  })
  
  it('should handle key updates in multi-key mode', async () => {
    const store = useFilesStore()
    
    // Setup identical values
    store.updateKeyValue('en', 'ok', 'OK')
    store.updateKeyValue('en', 'confirm', 'OK')
    store.updateKeyValue('th', 'ok', 'ตกลง')
    store.updateKeyValue('th', 'confirm', 'ตกลง')
    
    store.languages[0].hasFile = true
    store.languages[1].hasFile = true
    
    // Enable multi-key mode
    store.setDualKeysMode(true)
    await store.processMergedKeys()
    
    // Should have merged key
    expect(store.mergedKeys).toContain('ok + confirm')
    
    // When updating in multi-key mode, the components should handle
    // updating all related keys. Here we simulate that behavior:
    const relatedKeys = ['ok', 'confirm']
    
    // Update all related keys in English
    relatedKeys.forEach(key => {
      store.updateKeyValue('en', key, 'Okay')
    })
    
    // Verify all keys are updated
    expect(store.languages[1].data.ok).toBe('Okay')
    expect(store.languages[1].data.confirm).toBe('Okay')
    
    // Reprocess to see if they still merge with new values
    await store.processMergedKeys()
    expect(store.mergedKeys).toContain('ok + confirm')
  })
})

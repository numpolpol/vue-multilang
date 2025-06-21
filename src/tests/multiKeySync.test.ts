import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useFilesStore } from '../stores/files'
import JsonTable from '../components/JsonTable.vue'

describe('Multi Key Mode - Synchronized Editing', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should update all merged keys when editing a multi-key row', async () => {
    const store = useFilesStore()
    
    // Setup test data with identical values
    store.updateKeyValue('en', 'hello', 'Hello')
    store.updateKeyValue('en', 'greeting', 'Hello')
    store.updateKeyValue('en', 'welcome', 'Hello')
    
    store.updateKeyValue('th', 'hello', 'สวัสดี')
    store.updateKeyValue('th', 'greeting', 'สวัสดี')
    store.updateKeyValue('th', 'welcome', 'สวัสดี')
    
    // Enable dual keys mode
    store.useDualKeys = true
    
    const wrapper = mount(JsonTable, {
      props: {
        data: store.stringsData,
        files: store.files,
        dualKeysMode: true
      }
    })
    
    // Verify that multi-key rows are created
    const multiKeyInputs = wrapper.findAll('input[value="Hello"]')
    expect(multiKeyInputs.length).toBeGreaterThan(0)
    
    // Simulate editing a multi-key row
    const firstInput = multiKeyInputs[0]
    await firstInput.setValue('Hi there')
    
    // Verify all related keys are updated
    expect(store.languages[1].data.hello).toBe('Hi there') // English
    expect(store.languages[1].data.greeting).toBe('Hi there')
    expect(store.languages[1].data.welcome).toBe('Hi there')
  })

  it('should handle paste operation for multi-key rows', async () => {
    const store = useFilesStore()
    
    // Setup identical values for merging
    store.updateKeyValue('en', 'btn_ok', 'OK')
    store.updateKeyValue('en', 'btn_confirm', 'OK')
    store.updateKeyValue('th', 'btn_ok', 'ตกลง')
    store.updateKeyValue('th', 'btn_confirm', 'ตกลง')
    
    store.useDualKeys = true
    
    const wrapper = mount(JsonTable, {
      props: {
        data: store.stringsData,
        files: store.files,
        dualKeysMode: true
      }
    })
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        readText: () => Promise.resolve('Okay\tตกลง')
      }
    })
    
    // Find and click paste button for multi-key row
    const pasteButtons = wrapper.findAll('button')
    const pasteButton = pasteButtons.find(btn => btn.text().includes('Paste'))
    
    if (pasteButton) {
      await pasteButton.trigger('click')
      
      // Verify all merged keys are updated
      expect(store.languages[1].data.btn_ok).toBe('Okay') // English
      expect(store.languages[1].data.btn_confirm).toBe('Okay')
      expect(store.languages[0].data.btn_ok).toBe('ตกลง') // Thai
      expect(store.languages[0].data.btn_confirm).toBe('ตกลง')
    }
  })

  it('should display merged key names correctly', () => {
    const store = useFilesStore()
    
    // Setup data for merging
    store.updateKeyValue('en', 'save', 'Save')
    store.updateKeyValue('en', 'store', 'Save')
    store.updateKeyValue('en', 'keep', 'Save')
    
    store.useDualKeys = true
    
    const wrapper = mount(JsonTable, {
      props: {
        data: store.stringsData,
        files: store.files,
        dualKeysMode: true
      }
    })
    
    // Check if merged key display shows primary + secondary keys
    const keyDisplay = wrapper.find('.text-sm.font-medium')
    expect(keyDisplay.exists()).toBe(true)
    
    const secondaryDisplay = wrapper.find('.text-xs.text-secondary')
    if (secondaryDisplay.exists()) {
      expect(secondaryDisplay.text()).toContain('+')
    }
    
    const badge = wrapper.find('.badge.badge-accent')
    if (badge.exists()) {
      expect(badge.text()).toBe('multi-key')
    }
  })

  it('should maintain individual key behavior when not merged', async () => {
    const store = useFilesStore()
    
    // Setup data without identical values
    store.updateKeyValue('en', 'hello', 'Hello')
    store.updateKeyValue('en', 'goodbye', 'Goodbye')
    store.updateKeyValue('th', 'hello', 'สวัสดี')
    store.updateKeyValue('th', 'goodbye', 'ลาก่อน')
    
    store.useDualKeys = true
    
    const wrapper = mount(JsonTable, {
      props: {
        data: store.stringsData,
        files: store.files,
        dualKeysMode: true
      }
    })
    
    // Find input for 'hello' key
    const inputs = wrapper.findAll('input')
    const helloInput = inputs.find(input => 
      (input.element as HTMLInputElement).value === 'Hello'
    )
    
    if (helloInput) {
      await helloInput.setValue('Hi')
      
      // Verify only the specific key is updated
      expect(store.languages[1].data.hello).toBe('Hi')
      expect(store.languages[1].data.goodbye).toBe('Goodbye') // Should remain unchanged
    }
  })
})

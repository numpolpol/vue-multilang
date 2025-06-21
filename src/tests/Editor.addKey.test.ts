import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Editor from '../views/Editor.vue'
import { useFilesStore } from '../stores/files'

// Mock Vue Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null), // Return null instead of 'light' to avoid JSON parse issues
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Editor - Add Key Modal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('opens add key modal when showAddKeyModal is called', async () => {
    const store = useFilesStore()
    
    // Setup minimal store data to prevent redirect
    store.setFiles([new File([''], 'en.strings', { type: 'text/plain' })])
    store.setStringsData([{ 'test': 'value' }])
    
    const wrapper = mount(Editor)
    
    // Get the modal element
    const modal = wrapper.find('#add_key_modal')
    expect(modal.exists()).toBe(true)
    
    // Check that modal contains expected elements
    expect(modal.text()).toContain('Add New Key')
    expect(modal.find('input[placeholder*="welcome_message"]').exists()).toBe(true)
    expect(modal.find('input[placeholder*="Default text"]').exists()).toBe(true)
  })

  it('shows error when trying to add duplicate key', async () => {
    const store = useFilesStore()
    
    // Setup store with existing data
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
    
    const wrapper = mount(Editor)
    const vm = wrapper.vm as any
    
    // Set duplicate key name
    vm.newKeyName = 'existing_key'
    vm.newKeyDefaultValue = 'New Value'
    
    // Call addNewKey function
    vm.addNewKey()
    
    // Check that error is shown
    expect(vm.addKeyError).toContain('Key already exists')
  })

  it('successfully adds new key when valid data provided', async () => {
    const store = useFilesStore()
    
    // Setup store with existing data
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
    
    const wrapper = mount(Editor)
    const vm = wrapper.vm as any
    
    // Set new key data
    vm.newKeyName = 'new_key'
    vm.newKeyDefaultValue = 'Default Value'
    
    // Call addNewKey function
    vm.addNewKey()
    
    // Check that key was added to store
    expect(store.stringsData[0]['new_key']).toBe('Default Value')
    expect(store.stringsData[1]['new_key']).toBe('Default Value')
    
    // Check that error is cleared
    expect(vm.addKeyError).toBe('')
  })

  it('shows error when trying to add empty key name', async () => {
    const store = useFilesStore()
    
    // Setup minimal store data
    store.setFiles([new File([''], 'en.strings', { type: 'text/plain' })])
    store.setStringsData([{ 'test': 'value' }])
    
    const wrapper = mount(Editor)
    const vm = wrapper.vm as any
    
    // Set empty key name
    vm.newKeyName = ''
    vm.newKeyDefaultValue = 'Some Value'
    
    // Call addNewKey function
    vm.addNewKey()
    
    // Check that error is shown
    expect(vm.addKeyError).toContain('Key Name is required')
  })

  it('adds key with empty default value when no default provided', async () => {
    const store = useFilesStore()
    
    // Setup store with existing data
    const mockFiles = [
      new File([''], 'en.strings', { type: 'text/plain' })
    ]
    
    const mockStringsData = [
      { 'existing_key': 'Hello' }
    ]
    
    store.setFiles(mockFiles)
    store.setStringsData(mockStringsData)
    
    const wrapper = mount(Editor)
    const vm = wrapper.vm as any
    
    // Set new key data without default value
    vm.newKeyName = 'new_key'
    vm.newKeyDefaultValue = ''
    
    // Call addNewKey function
    vm.addNewKey()
    
    // Check that key was added with empty value
    expect(store.stringsData[0]['new_key']).toBe('')
  })

  it('clears form when showAddKeyModal is called', async () => {
    const store = useFilesStore()
    
    // Setup minimal store data
    store.setFiles([new File([''], 'en.strings', { type: 'text/plain' })])
    store.setStringsData([{ 'test': 'value' }])
    
    const wrapper = mount(Editor)
    const vm = wrapper.vm as any
    
    // Set some initial values
    vm.newKeyName = 'some_key'
    vm.newKeyDefaultValue = 'some_value'
    vm.addKeyError = 'some error'
    
    // Call showAddKeyModal
    vm.showAddKeyModal()
    
    // Check that values are cleared
    expect(vm.newKeyName).toBe('')
    expect(vm.newKeyDefaultValue).toBe('')
    expect(vm.addKeyError).toBe('')
  })

  it('handles modal dialog elements correctly', async () => {
    const store = useFilesStore()
    
    // Setup minimal store data
    store.setFiles([new File([''], 'en.strings', { type: 'text/plain' })])
    store.setStringsData([{ 'test': 'value' }])
    
    // Mock DOM methods
    const mockShowModal = vi.fn()
    const mockClose = vi.fn()
    
    const mockModal = {
      showModal: mockShowModal,
      close: mockClose
    }
    
    // Mock getElementById
    vi.spyOn(document, 'getElementById').mockReturnValue(mockModal as any)
    
    const wrapper = mount(Editor)
    const vm = wrapper.vm as any
    
    // Test showAddKeyModal
    vm.showAddKeyModal()
    expect(mockShowModal).toHaveBeenCalled()
    
    // Test closeAddKeyModal
    vm.closeAddKeyModal()
    expect(mockClose).toHaveBeenCalled()
  })
})

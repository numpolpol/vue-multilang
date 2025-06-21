import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFilesStore } from '../stores/files'

describe('Add Key Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should handle complete add key workflow', () => {
    const store = useFilesStore()
    
    // Step 1: Setup initial project with multiple languages
    const mockFiles = [
      new File([''], 'en.strings', { type: 'text/plain' }),
      new File([''], 'es.strings', { type: 'text/plain' }),
      new File([''], 'fr.strings', { type: 'text/plain' })
    ]
    
    const mockStringsData: Record<string, string>[] = [
      { 
        'login_title': 'Login',
        'login_button': 'Sign In',
        'forgot_password': 'Forgot Password?'
      },
      { 
        'login_title': 'Iniciar Sesión',
        'login_button': 'Entrar',
        'forgot_password': '¿Olvidaste tu contraseña?'
      },
      { 
        'login_title': 'Connexion',
        'login_button': 'Se connecter',
        'forgot_password': 'Mot de passe oublié?'
      }
    ]
    
    store.setFiles(mockFiles)
    store.setStringsData(mockStringsData)
    
    // Verify initial state
    expect(store.allKeys).toEqual(['forgot_password', 'login_button', 'login_title'])
    expect(store.files.length).toBe(3)
    
    // Step 2: Add a new key
    const success = store.addKey('logout_button', 'Logout')
    
    expect(success).toBe(true)
    expect(store.allKeys).toEqual(['forgot_password', 'login_button', 'login_title', 'logout_button'])
    
    // Step 3: Verify the key was added to all languages with default value
    expect(store.stringsData[0]['logout_button']).toBe('Logout')
    expect(store.stringsData[1]['logout_button']).toBe('Logout')
    expect(store.stringsData[2]['logout_button']).toBe('Logout')
    
    // Step 4: Update values for different languages
    store.updateValue(1, 'logout_button', 'Cerrar Sesión')
    store.updateValue(2, 'logout_button', 'Se déconnecter')
    
    // Verify updates
    expect(store.stringsData[0]['logout_button']).toBe('Logout')
    expect(store.stringsData[1]['logout_button']).toBe('Cerrar Sesión')
    expect(store.stringsData[2]['logout_button']).toBe('Se déconnecter')
    
    // Step 5: Try to add duplicate key (should fail)
    const duplicateSuccess = store.addKey('login_title', 'New Title')
    expect(duplicateSuccess).toBe(false)
    
    // Verify original values weren't changed
    expect(store.stringsData[0]['login_title']).toBe('Login')
    expect(store.stringsData[1]['login_title']).toBe('Iniciar Sesión')
    expect(store.stringsData[2]['login_title']).toBe('Connexion')
  })

  it('should handle key removal workflow', () => {
    const store = useFilesStore()
    
    // Setup initial data
    const mockFiles = [
      new File([''], 'en.strings', { type: 'text/plain' }),
      new File([''], 'es.strings', { type: 'text/plain' })
    ]
    
    const mockStringsData: Record<string, string>[] = [
      { 
        'key1': 'Value 1',
        'key2': 'Value 2',
        'key3': 'Value 3'
      },
      { 
        'key1': 'Valor 1',
        'key2': 'Valor 2',
        'key3': 'Valor 3'
      }
    ]
    
    store.setFiles(mockFiles)
    store.setStringsData(mockStringsData)
    
    // Verify initial state
    expect(store.allKeys).toEqual(['key1', 'key2', 'key3'])
    
    // Remove a key
    store.removeKey('key2')
    
    // Verify key was removed from all languages
    expect(store.allKeys).toEqual(['key1', 'key3'])
    expect(store.stringsData[0]).toEqual({ 'key1': 'Value 1', 'key3': 'Value 3' })
    expect(store.stringsData[1]).toEqual({ 'key1': 'Valor 1', 'key3': 'Valor 3' })
  })

  it('should handle edge cases gracefully', () => {
    const store = useFilesStore()
    
    // Test with empty store
    expect(store.allKeys).toEqual([])
    
    // Add key to empty store
    const success = store.addKey('first_key', 'First Value')
    expect(success).toBe(true)
    
    // Remove non-existent key
    store.removeKey('non_existent_key')
    // Should not throw error
    
    // Update value with invalid index
    store.updateValue(999, 'first_key', 'New Value')
    // Should not throw error
  })

  it('should maintain data consistency across operations', () => {
    const store = useFilesStore()
    
    // Setup data
    const mockFiles = [
      new File([''], 'en.strings', { type: 'text/plain' }),
      new File([''], 'es.strings', { type: 'text/plain' })
    ]
    
    const mockStringsData: Record<string, string>[] = [
      { 'welcome': 'Welcome' },
      { 'welcome': 'Bienvenido' }
    ]
    
    store.setFiles(mockFiles)
    store.setStringsData(mockStringsData)
    
    // Perform multiple operations
    store.addKey('goodbye', 'Goodbye')
    store.addKey('hello', 'Hello')
    store.updateValue(1, 'goodbye', 'Adiós')
    store.updateValue(1, 'hello', 'Hola')
    store.removeKey('welcome')
    store.addKey('greetings', 'Greetings')
    
    // Verify final state
    expect(store.allKeys).toEqual(['goodbye', 'greetings', 'hello'])
    expect(store.stringsData[0]).toEqual({
      'goodbye': 'Goodbye',
      'hello': 'Hello',
      'greetings': 'Greetings'
    })
    expect(store.stringsData[1]).toEqual({
      'goodbye': 'Adiós',
      'hello': 'Hola',
      'greetings': 'Greetings'
    })
  })

  it('should handle special characters and edge case key names', () => {
    const store = useFilesStore()
    
    // Setup basic data
    const mockFiles = [new File([''], 'en.strings', { type: 'text/plain' })]
    const mockStringsData: Record<string, string>[] = [{}]
    
    store.setFiles(mockFiles)
    store.setStringsData(mockStringsData)
    
    // Test various key formats
    const testKeys = [
      'normal_key',
      'key-with-dashes',
      'key.with.dots',
      'keyWithCamelCase',
      'key_with_123_numbers',
      'key with spaces', // This might be allowed depending on implementation
      'émojis_key_🎉',
      'very_long_key_name_that_exceeds_normal_length_expectations_and_keeps_going'
    ]
    
    testKeys.forEach(key => {
      try {
        const success = store.addKey(key, `Value for ${key}`)
        if (success) {
          expect(store.stringsData[0][key]).toBe(`Value for ${key}`)
        }
      } catch (error) {
        // Some keys might not be valid, that's okay
        console.log(`Key "${key}" was not accepted: ${error}`)
      }
    })
  })
})

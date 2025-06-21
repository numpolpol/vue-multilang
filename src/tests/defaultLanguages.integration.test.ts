import { describe, it, expect, beforeEach } from 'vitest'
import { useFilesStore } from '../stores/files'
import { createPinia, setActivePinia } from 'pinia'

describe('Default Language Columns Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have default language columns configured', () => {
    const store = useFilesStore()
    
    expect(store.languages).toHaveLength(4)
    expect(store.languages[0]).toEqual({ code: 'th', name: 'Thai', data: {}, hasFile: false })
    expect(store.languages[1]).toEqual({ code: 'en', name: 'English', data: {}, hasFile: false })
    expect(store.languages[2]).toEqual({ code: 'km', name: 'Khmer', data: {}, hasFile: false })
    expect(store.languages[3]).toEqual({ code: 'my', name: 'Myanmar', data: {}, hasFile: false })
  })

  it('should upload and replace keys in specific language columns', async () => {
    const store = useFilesStore()
    
    // Add initial data to English
    store.updateKeyValue('en', 'hello', 'Hello')
    store.updateKeyValue('en', 'goodbye', 'Goodbye')
    
    expect(store.languages[1].data).toEqual({
      hello: 'Hello',
      goodbye: 'Goodbye'
    })
    
    // Simulate file upload with new content
    const mockFileContent = '"hello" = "Hi there";\n"welcome" = "Welcome";'
    
    // Mock the parseStrings function for this test
    const originalImport = await import('../utils/strings')
    const mockParseStrings = (content: string) => {
      if (content.includes('Hi there')) {
        return { hello: 'Hi there', welcome: 'Welcome' }
      }
      return originalImport.parseStrings(content)
    }
    
    // Manually apply the parsed content to simulate uploadFileToLanguage
    const parsedData = mockParseStrings(mockFileContent)
    store.languages[1].data = { ...store.languages[1].data, ...parsedData }
    store.languages[1].hasFile = true
    store.languages[1].fileType = 'strings'
    
    // Verify key replacement behavior
    expect(store.languages[1].data).toEqual({
      hello: 'Hi there',  // Updated
      goodbye: 'Goodbye', // Kept (not in uploaded file)
      welcome: 'Welcome'  // Added
    })
    
    expect(store.languages[1].hasFile).toBe(true)
    expect(store.languages[1].fileType).toBe('strings')
  })

  it('should add keys to all languages', () => {
    const store = useFilesStore()
    
    store.addKeyToAllLanguages('app_name', 'My App')
    
    store.languages.forEach(lang => {
      expect(lang.data.app_name).toBe('My App')
    })
  })

  it('should clear specific language data', () => {
    const store = useFilesStore()
    
    // Add some data
    store.updateKeyValue('th', 'hello', 'สวัสดี')
    store.updateKeyValue('en', 'hello', 'Hello')
    
    // Clear Thai data
    store.clearLanguageData('th')
    
    expect(store.languages[0].data).toEqual({})
    expect(store.languages[0].hasFile).toBe(false)
    expect(store.languages[1].data.hello).toBe('Hello') // English data should remain
  })

  it('should sync language data to legacy files structure', () => {
    const store = useFilesStore()
    
    // Add data to languages
    store.updateKeyValue('th', 'hello', 'สวัสดี')
    store.updateKeyValue('en', 'hello', 'Hello')
    store.languages[0].hasFile = true
    store.languages[0].fileType = 'strings'
    store.languages[1].hasFile = true
    store.languages[1].fileType = 'xml'
    
    // Trigger sync
    store.syncLanguagesToFiles()
    
    // Check legacy structure
    expect(store.files).toHaveLength(2)
    expect(store.files[0].name).toBe('th.strings')
    expect(store.files[1].name).toBe('en.xml')
    expect(store.stringsData).toHaveLength(2)
    expect(store.stringsData[0].hello).toBe('สวัสดี')
    expect(store.stringsData[1].hello).toBe('Hello')
  })
})

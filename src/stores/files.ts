import { defineStore } from 'pinia'

export interface LanguageColumn {
  code: string
  name: string
  data: Record<string, string>
  hasFile: boolean
  fileType?: 'strings' // Only support .strings files
  originalStructure?: Array<{ type: 'comment' | 'key' | 'blank', content: string, key?: string, value?: string, inlineComment?: string }> // Preserve original file structure
  originalContent?: string // Preserve original file content
}

export interface StringsFile {
  file: File
  data: Record<string, string>
}

export interface Project {
  id: string
  name: string
  languages: Array<{
    name: string
    data: Record<string, string>
  }> | LanguageColumn[] // Support both legacy and new structure
  lastModified: number
  createdAt: number
}

// Type guard to check if language is LanguageColumn format
function isLanguageColumn(lang: any): lang is LanguageColumn {
  return 'code' in lang && 'data' in lang
}

// Type guard to check if language is legacy format
function isLegacyLanguage(lang: any): lang is { name: string; data: Record<string, string> } {
  return 'name' in lang && 'data' in lang && !('code' in lang)
}

// Supported languages only (removed Android/other platform languages)
const SUPPORTED_LANGUAGES: LanguageColumn[] = [
  { code: 'th', name: 'ไทย (Thai)', data: {}, hasFile: false },
  { code: 'en', name: 'English', data: {}, hasFile: false },
  { code: 'my', name: 'မြန်မာ (Myanmar)', data: {}, hasFile: false },
  { code: 'km', name: 'ខ្មែរ (Khmer)', data: {}, hasFile: false }
]

export const useFilesStore = defineStore('files', {
  state: () => ({
    // New language-column based structure (iOS .strings only)
    languages: [...SUPPORTED_LANGUAGES] as LanguageColumn[],
    
    // Changes tracking for new structure
    originalLanguages: [] as LanguageColumn[], // Store original state when project is loaded
    
    // Legacy structure (keep for compatibility)
    files: [] as File[],
    stringsData: [] as Record<string, string>[],
    originalData: [] as Record<string, string>[],
    currentProject: null as Project | null,
  }),
  
  getters: {
    hasFiles: (state) => state.files.length > 0,
    allKeys: (state) => {
      const keySet = new Set<string>()
      state.stringsData.forEach(obj => 
        Object.keys(obj).forEach(k => keySet.add(k))
      )
      return Array.from(keySet).sort()
    },
    
    // Keys from new language-column structure (iOS only)
    visibleKeys: (state) => {
      // Simple mode - get all keys from language data (iOS only)
      const keySet = new Set<string>()
      state.languages.forEach(lang => 
        Object.keys(lang.data).forEach(key => keySet.add(key))
      )
      return Array.from(keySet).sort()
    },
    
    // Simple language data - no merging needed
    languageData: (state) => {
      return state.languages
    },

    // Changes tracking getters
    hasChanges: (state) => {
      if (state.originalLanguages.length === 0) return false
      
      // Deep compare languages with original
      return JSON.stringify(state.languages.map(l => ({ code: l.code, data: l.data }))) !== 
             JSON.stringify(state.originalLanguages.map(l => ({ code: l.code, data: l.data })))
    },

    changedKeys: (state) => {
      if (state.originalLanguages.length === 0) return []
      
      const changed: string[] = []
      const allKeys = new Set<string>()
      
      // Get all keys from both current and original
      state.languages.forEach(lang => Object.keys(lang.data).forEach(k => allKeys.add(k)))
      state.originalLanguages.forEach(lang => Object.keys(lang.data).forEach(k => allKeys.add(k)))
      
      // Check each key for changes
      allKeys.forEach(key => {
        const currentValues = state.languages.map(lang => lang.data[key] || '')
        const originalValues = state.originalLanguages.map(lang => lang.data[key] || '')
        
        if (JSON.stringify(currentValues) !== JSON.stringify(originalValues)) {
          changed.push(key)
        }
      })
      
      return changed.sort()
    },

    hasLanguageFiles: (state) => state.languages.some(lang => lang.hasFile),
    
    allKeysFromLanguages: (state) => {
      const keySet = new Set<string>()
      state.languages.forEach(language => {
        Object.keys(language.data).forEach(key => keySet.add(key))
      })
      return Array.from(keySet).sort()
    }
  },

  actions: {
    // iOS .strings file upload only
    async uploadFileToLanguage(languageCode: string, file: File) {
      const { parseStrings, parseStringsWithStructure } = await import('../utils/strings')
      const { useNotifications } = await import('../composables/useNotifications')
      const { warning, info } = useNotifications()
      
      const content = await this.readFileContent(file)
      
      let data: Record<string, string>
      let parsedFile: any = null
      let duplicateCount = 0
      
      try {
        // Only support .strings files - use enhanced parsing to preserve structure
        parsedFile = parseStringsWithStructure(content)
        
        // Also get duplicate info by using the regular parseStrings with details
        const parseResult = parseStrings(content, true)
        data = parseResult.data
        duplicateCount = parseResult.duplicateCount
        
      } catch (error) {
        warning('Failed to parse file', error instanceof Error ? error.message : 'Unknown error')
        return
      }

      // Find and update the language
      const language = this.languages.find(lang => lang.code === languageCode)
      if (!language) {
        warning('Language not found', `Language code: ${languageCode}`)
        return
      }

      // Update language data (replace existing keys, keep others)
      language.data = { ...language.data, ...data }
      language.hasFile = true
      language.fileType = 'strings'
      
      // Store structure if available
      if (parsedFile) {
        language.originalStructure = parsedFile.structure
        language.originalContent = parsedFile.originalContent
      }

      // Show notification
      const keyCount = Object.keys(data).length
      if (duplicateCount > 0) {
        warning(`${duplicateCount} duplicate keys`, 'Latest values kept')
      }
      
      info(`${language.name} updated`, `${keyCount} keys loaded`)
      
      // Sync to legacy structure for compatibility
      this.syncLanguagesToFiles()
      
      // Snapshot original state if this is the first file upload
      if (this.originalLanguages.length === 0) {
        this.snapshotOriginalState()
      }
    },
    
    syncLanguagesToFiles() {
      // Sync language-column structure to legacy files structure
      this.files = []
      this.stringsData = []
      
      this.languages.forEach(lang => {
        if (lang.hasFile) {
          // Create a mock file for compatibility - only .strings files supported
          const mockFile = new File([''], `${lang.code}.strings`)
          this.files.push(mockFile)
          this.stringsData.push({ ...lang.data })
        }
      })
      
      this.originalData = this.stringsData.map(data => ({ ...data }))
    },
    
    clearLanguageData(languageCode: string) {
      const language = this.languages.find(lang => lang.code === languageCode)
      if (language) {
        language.data = {}
        language.hasFile = false
        language.fileType = undefined
        language.originalStructure = undefined
        language.originalContent = undefined
        
        // Sync to legacy structure
        this.syncLanguagesToFiles()
      }
    },
    
    addKeyToAllLanguages(key: string, defaultValue: string = '') {
      // Add key to all languages with default or empty value
      this.languages.forEach(lang => {
        if (!lang.data.hasOwnProperty(key)) {
          lang.data[key] = defaultValue
        }
      })
      
      // Sync to legacy structure
      this.syncLanguagesToFiles()
    },
    
    deleteKeyFromAllLanguages(key: string) {
      // Remove key from all languages
      this.languages.forEach(lang => {
        delete lang.data[key]
      })
      
      // Sync to legacy structure
      this.syncLanguagesToFiles()
    },

    updateKeyWithFirstValueForAllLanguages(key: string) {
      // Find first non-empty value
      let firstValue = ''
      for (const lang of this.languages) {
        if (lang.data[key] && lang.data[key].trim()) {
          firstValue = lang.data[key]
          break
        }
      }
      
      // Update all languages with this value
      if (firstValue) {
        this.languages.forEach(lang => {
          lang.data[key] = firstValue
        })
        
        // Sync to legacy structure
        this.syncLanguagesToFiles()
      }
    },

    // Rename/edit a key across all languages
    renameKey(oldKey: string, newKey: string): boolean {
      if (oldKey === newKey) return true
      
      // Check if new key already exists
      const hasNewKey = this.languages.some(lang => lang.data.hasOwnProperty(newKey))
      if (hasNewKey) {
        return false // Key already exists
      }
      
      // Rename key in all languages
      this.languages.forEach(lang => {
        if (lang.data.hasOwnProperty(oldKey)) {
          lang.data[newKey] = lang.data[oldKey]
          delete lang.data[oldKey]
        }
      })
      
      // Sync to legacy structure
      this.syncLanguagesToFiles()
      return true
    },
    
    addLanguage(language: LanguageColumn) {
      this.languages.push(language)
      this.syncLanguagesToFiles()
    },
    
    addFile(file: File, data: Record<string, string>) {
      this.files.push(file)
      this.stringsData.push(data)
      this.originalData.push({ ...data })
    },
    
    createDefaultLanguage() {
      if (this.languages.length === 0) {
        // Reset to supported languages
        this.languages = [...SUPPORTED_LANGUAGES].map(lang => ({ ...lang }))
        console.log('Reset to default supported languages (iOS only)')
      }
    },
    
    updateKeyValue(languageCode: string, key: string, value: string) {
      const language = this.languages.find(lang => lang.code === languageCode)
      if (language) {
        language.data[key] = value
        
        // Also update legacy structure if it exists
        const languageIndex = this.languages.findIndex(lang => lang.code === languageCode)
        if (languageIndex >= 0 && this.stringsData[languageIndex]) {
          this.stringsData[languageIndex][key] = value
        }
      }
    },

    // iOS-only mode - no dual keys needed
    
    readFileContent(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
        reader.readAsText(file)
      })
    },

    // Project management
    getCurrentProject(): Project | null {
      return this.currentProject
    },

    updateCurrentProject() {
      if (this.currentProject) {
        this.currentProject.lastModified = Date.now()
        
        // Update languages in project - preserve full structure for comments
        this.currentProject.languages = this.languages.map(lang => ({
          code: lang.code,
          name: lang.name,
          data: { ...lang.data },
          hasFile: lang.hasFile,
          fileType: lang.fileType,
          originalStructure: lang.originalStructure ? [...lang.originalStructure] : undefined,
          originalContent: lang.originalContent
        }))
      }
    },

    saveProject(name: string): Project {
      const project: Project = {
        id: Date.now().toString(),
        name: name,
        languages: this.languages.map(lang => ({
          code: lang.code,
          name: lang.name,
          data: { ...lang.data },
          hasFile: lang.hasFile,
          fileType: lang.fileType,
          originalStructure: lang.originalStructure ? [...lang.originalStructure] : undefined,
          originalContent: lang.originalContent
        })),
        lastModified: Date.now(),
        createdAt: Date.now()
      }

      this.currentProject = project
      return project
    },

    saveProjectToFile() {
      if (!this.currentProject) return
      
      this.updateCurrentProject()
      
      const projectData = JSON.stringify(this.currentProject, null, 2)
      const blob = new Blob([projectData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.currentProject.name}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    loadProject(project: Project) {
      this.currentProject = project
      this.languages = [...SUPPORTED_LANGUAGES].map(defaultLang => ({ ...defaultLang }))
      
      // Load data from project
      if (Array.isArray(project.languages)) {
        project.languages.forEach(projectLang => {
          let code: string
          
          // Handle both old format (legacy) and new format (LanguageColumn)
          if (isLanguageColumn(projectLang)) {
            // New format - use code directly
            code = projectLang.code
            const targetLang = this.languages.find(l => l.code === code)
            if (targetLang) {
              targetLang.data = { ...projectLang.data }
              targetLang.hasFile = projectLang.hasFile
              targetLang.fileType = projectLang.fileType
              targetLang.name = projectLang.name
              
              // Restore structure and content if available (for comment preservation)
              if (projectLang.originalStructure) {
                targetLang.originalStructure = [...projectLang.originalStructure]
              }
              if (projectLang.originalContent) {
                targetLang.originalContent = projectLang.originalContent
              }
            }
          } else if (isLegacyLanguage(projectLang)) {
            // Legacy format - convert name to code
            const langCode = projectLang.name.toLowerCase().replace(/\.strings$/, '')
            code = langCode === 'english' ? 'en' : 
                   langCode === 'thai' ? 'th' :
                   langCode === 'khmer' ? 'km' :
                   langCode === 'myanmar' ? 'my' : 
                   langCode
            
            const targetLang = this.languages.find(l => l.code === code)
            if (targetLang) {
              targetLang.data = { ...projectLang.data }
              targetLang.hasFile = true
              targetLang.fileType = 'strings'
            }
          } else {
            console.warn('Invalid language format in project:', projectLang)
          }
        })
      }
      
      // Sync language-column structure to legacy structure for compatibility
      this.syncLanguagesToFiles()
      
      // Snapshot original state for changes tracking
      this.snapshotOriginalState()
      
      console.log('Loaded project:', project.name, 'Languages:', this.languages)
    },

    reset() {
      this.files = []
      this.stringsData = []
      this.originalData = []
      this.currentProject = null
      
      // Reset languages to default supported languages
      this.languages = [...SUPPORTED_LANGUAGES].map(lang => ({
        ...lang,
        data: {},
        hasFile: false,
        fileType: undefined
      }))
    },

    removeLanguageColumn(languageCode: string) {
      this.languages = this.languages.filter(lang => lang.code !== languageCode)
      this.originalLanguages = this.originalLanguages.filter(lang => lang.code !== languageCode)
      this.syncLanguagesToFiles()
    },

    reorderLanguageColumns(fromIndex: number, toIndex: number) {
      const languages = [...this.languages]
      const [movedItem] = languages.splice(fromIndex, 1)
      languages.splice(toIndex, 0, movedItem)
      this.languages = languages
      this.syncLanguagesToFiles()
    },

    updateProjectName(name: string) {
      if (this.currentProject) {
        this.currentProject.name = name
      }
    },

    setCurrentProject(project: Project) {
      this.currentProject = project
      this.languages = project.languages?.map(lang => ({
        code: lang.name.toLowerCase().replace(/\.strings$/, ''),
        name: lang.name,
        data: { ...lang.data },
        hasFile: true,
        fileType: 'strings' as const
      })) || []
      this.originalLanguages = JSON.parse(JSON.stringify(this.languages))
      this.syncLanguagesToFiles()
    },

    addKey(key: string, defaultValue: string = ''): boolean {
      // Add key to all language columns
      this.languages.forEach(language => {
        if (!language.data[key]) {
          language.data[key] = defaultValue
        }
      })
      this.originalLanguages.forEach(language => {
        if (!language.data[key]) {
          language.data[key] = defaultValue
        }
      })
      this.syncLanguagesToFiles()
      return true
    },

    // Language column management actions
    addLanguageColumn(languageCode: string, languageName: string) {
      // Only allow supported languages
      if (!SUPPORTED_LANGUAGES.find(sl => sl.code === languageCode)) {
        console.warn(`Language ${languageCode} is not supported. Supported: ${SUPPORTED_LANGUAGES.map(l => l.code).join(', ')}`)
        return
      }

      // Check if language already exists
      const exists = this.languages.find(lang => lang.code === languageCode)
      if (exists) {
        console.warn(`Language ${languageCode} already exists`)
        return
      }
      
      // Get all existing keys from other languages to initialize the new language
      const existingKeys = new Set<string>()
      this.languages.forEach(lang => 
        Object.keys(lang.data).forEach(k => existingKeys.add(k))
      )
      
      // Create data object with empty values for all existing keys
      const initialData: Record<string, string> = {}
      existingKeys.forEach(key => {
        initialData[key] = '' // Empty string for new language
      })
      
      this.languages.push({
        code: languageCode,
        name: languageName,
        data: initialData,
        hasFile: false
      })
      
      console.log(`Added language column: ${languageName} (${languageCode}) with ${existingKeys.size} keys`)
    },

    // Create new project (for folder import)
    createNewProject(projectName: string) {
      // Clear existing data
      this.files = []
      this.stringsData = []
      this.originalData = []
      
      // Set project info
      this.currentProject = {
        id: Date.now().toString(),
        name: projectName,
        languages: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }
      
      // Reset to default supported languages with empty data
      this.languages = [...SUPPORTED_LANGUAGES].map(lang => ({
        ...lang,
        data: {},
        hasFile: false
      }))
    },

    // Changes tracking actions
    snapshotOriginalState() {
      // Deep clone current languages state as original
      this.originalLanguages = JSON.parse(JSON.stringify(this.languages))
    },

    resetToOriginalState() {
      // Reset to original state
      if (this.originalLanguages.length > 0) {
        this.languages = JSON.parse(JSON.stringify(this.originalLanguages))
        this.syncLanguagesToFiles() // Update legacy structure
      }
    },

    getKeyChangeDetails(key: string) {
      if (this.originalLanguages.length === 0) return null
      
      const changes: Array<{
        languageCode: string,
        languageName: string,
        status: 'new' | 'modified' | 'deleted',
        oldValue?: string,
        newValue?: string
      }> = []
      
      this.languages.forEach(language => {
        const currentValue = language.data[key] || ''
        const originalLang = this.originalLanguages.find(orig => orig.code === language.code)
        const originalValue = originalLang?.data[key] || ''
        
        if (currentValue !== originalValue) {
          changes.push({
            languageCode: language.code,
            languageName: language.name,
            status: originalValue ? 'modified' : 'new',
            oldValue: originalValue,
            newValue: currentValue
          })
        }
      })
      
      return changes.length > 0 ? changes : null
    }
  }
})
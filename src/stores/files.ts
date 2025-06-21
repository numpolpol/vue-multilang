import { defineStore } from 'pinia'
import type { FileGroup } from '../utils/strings'

export interface LanguageColumn {
  code: string
  name: string
  data: Record<string, string>
  hasFile: boolean
  fileType?: 'strings' | 'xml'
}

export interface StringsFile {
  file: File
  data: Record<string, string>
}

export interface PreviewImage {
  name: string
  url: string
  data: string // base64 data for serialization
}

export interface Project {
  id: string
  name: string
  languages: Array<{
    name: string
    data: Record<string, string>
  }>
  previewImages?: Record<string, PreviewImage[]>
  lastModified: number
  createdAt: number
}

// Default language columns
const DEFAULT_LANGUAGES: LanguageColumn[] = [
  { code: 'th', name: 'Thai', data: {}, hasFile: false },
  { code: 'en', name: 'English', data: {}, hasFile: false },
  { code: 'km', name: 'Khmer', data: {}, hasFile: false },
  { code: 'my', name: 'Myanmar', data: {}, hasFile: false }
]

export const useFilesStore = defineStore('files', {
  state: () => ({
    // New language-column based structure
    languages: [...DEFAULT_LANGUAGES] as LanguageColumn[],
    
    // Legacy structure (keep for compatibility)
    files: [] as File[],
    stringsData: [] as Record<string, string>[],
    originalData: [] as Record<string, string>[],
    currentProject: null as Project | null,
    previewImages: {} as Record<string, PreviewImage[]>,
    fileGroups: [] as FileGroup[], // Track file groups for dual key support
    useDualKeys: false, // Flag to indicate if dual key merging is active
    
    // Multi-key mode state
    mergedKeys: [] as string[],
    mergedData: [] as Record<string, string>[]
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
    
    // New getters for language-column structure
    allKeysFromLanguages: (state) => {
      const hasLanguageFiles = state.languages.some(lang => lang.hasFile)
      
      if (state.useDualKeys && hasLanguageFiles) {
        // For dual key mode, we need to process in an action instead of getter
        // because getters should be synchronous
        return state.mergedKeys || []
      }
      
      // Normal mode without merging
      const keySet = new Set<string>()
      state.languages.forEach(lang => 
        Object.keys(lang.data).forEach(k => keySet.add(k))
      )
      return Array.from(keySet).sort()
    },
    
    // Get merged data for dual key mode
    mergedLanguageData: (state) => {
      return state.mergedData || state.languages
        .filter(lang => lang.hasFile)
        .map(lang => lang.data)
    },
    
    hasLanguageFiles: (state) => state.languages.some(lang => lang.hasFile)
  },
  
  actions: {
    // New actions for language-column structure
    async uploadFileToLanguage(languageCode: string, file: File, fileType: 'strings' | 'xml') {
      const { parseStrings } = await import('../utils/strings')
      const content = await this.readFileContent(file)
      const data = parseStrings(content)
      
      const langIndex = this.languages.findIndex(lang => lang.code === languageCode)
      if (langIndex !== -1) {
        // Merge new data with existing data (replace keys that exist)
        this.languages[langIndex].data = { ...this.languages[langIndex].data, ...data }
        this.languages[langIndex].hasFile = true
        this.languages[langIndex].fileType = fileType
        
        // Update legacy structure for compatibility
        this.syncLanguagesToFiles()
      }
    },
    
    syncLanguagesToFiles() {
      // Sync language-column structure to legacy files structure
      this.files = []
      this.stringsData = []
      
      this.languages.forEach(lang => {
        if (lang.hasFile) {
          // Create a mock file for compatibility
          const mockFile = new File([''], `${lang.code}.${lang.fileType || 'strings'}`)
          this.files.push(mockFile)
          this.stringsData.push({ ...lang.data })
        }
      })
      
      this.originalData = this.stringsData.map(data => ({ ...data }))
      
      // Reprocess merged keys if dual key mode is enabled
      if (this.useDualKeys) {
        this.processMergedKeys()
      }
    },
    
    clearLanguageData(languageCode: string) {
      const langIndex = this.languages.findIndex(lang => lang.code === languageCode)
      if (langIndex !== -1) {
        this.languages[langIndex].data = {}
        this.languages[langIndex].hasFile = false
        this.languages[langIndex].fileType = undefined
        this.syncLanguagesToFiles()
      }
    },
    
    addKeyToAllLanguages(key: string, defaultValue: string = '') {
      this.languages.forEach(lang => {
        if (!lang.data[key]) {
          lang.data[key] = defaultValue
        }
      })
      this.syncLanguagesToFiles()
    },
    
    updateKeyValue(languageCode: string, key: string, value: string) {
      const langIndex = this.languages.findIndex(lang => lang.code === languageCode)
      if (langIndex !== -1) {
        this.languages[langIndex].data[key] = value
        this.syncLanguagesToFiles()
      }
    },
    
    // Toggle dual keys mode
    setDualKeysMode(enabled: boolean) {
      this.useDualKeys = enabled
      if (enabled) {
        this.processMergedKeys()
      } else {
        this.mergedKeys = []
        this.mergedData = []
      }
    },
    
    // Process merged keys for dual key mode
    async processMergedKeys() {
      const hasLanguageFiles = this.languages.some(lang => lang.hasFile)
      
      if (!this.useDualKeys || !hasLanguageFiles) {
        this.mergedKeys = []
        this.mergedData = []
        return
      }
      
      try {
        const { findMergeableKeys, applyKeyMerging } = await import('../utils/strings')
        const languageData = this.languages
          .filter(lang => lang.hasFile)
          .map(lang => lang.data)
        
        if (languageData.length > 0) {
          const keyMappings = findMergeableKeys(languageData)
          const mockFiles = this.languages
            .filter(lang => lang.hasFile)
            .map(lang => new File([''], `${lang.code}.${lang.fileType || 'strings'}`))
          
          const { data: mergedData } = applyKeyMerging(mockFiles, languageData, keyMappings)
          
          // Update state
          this.mergedData = mergedData
          
          const keySet = new Set<string>()
          mergedData.forEach((obj: Record<string, string>) => 
            Object.keys(obj).forEach(k => keySet.add(k))
          )
          this.mergedKeys = Array.from(keySet).sort()
        }
      } catch (error) {
        console.error('Failed to process merged keys:', error)
        this.mergedKeys = []
        this.mergedData = []
      }
    },
    
    // Helper function
    async readFileContent(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsText(file)
      })
    },

    setFiles(files: File[]) {
      this.files = files
    },
    
    setStringsData(data: Record<string, string>[]) {
      this.stringsData = data
      // Store original data for change tracking
      this.originalData = data.map(obj => ({ ...obj }))
    },

    setCurrentProject(project: Project) {
      this.currentProject = project
    },

    updateCurrentProject() {
      if (this.currentProject) {
        this.currentProject.lastModified = Date.now()
        
        // Update project languages with current data
        this.currentProject.languages = this.files.map((file, index) => ({
          name: file.name.replace(/\.(strings|xml)$/, ''),
          data: this.stringsData[index] || {}
        }))
        
        // Update preview images
        this.currentProject.previewImages = { ...this.previewImages }
      }
    },

    saveProjectToLocalStorage() {
      if (!this.currentProject) return false
      
      try {
        this.updateCurrentProject()
        
        // Get existing projects
        const existingProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]')
        
        // Update or add current project
        const projectIndex = existingProjects.findIndex((p: Project) => p.id === this.currentProject!.id)
        if (projectIndex >= 0) {
          existingProjects[projectIndex] = this.currentProject
        } else {
          existingProjects.push(this.currentProject)
        }
        
        // Save to localStorage
        localStorage.setItem('savedProjects', JSON.stringify(existingProjects))
        return true
      } catch (error) {
        console.error('Failed to save project to localStorage:', error)
        return false
      }
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
    
    setFileGroups(groups: FileGroup[]) {
      this.fileGroups = groups
      this.useDualKeys = groups.some(group => group.hasBothFiles)
    },

    setUseDualKeys(useDualKeys: boolean) {
      this.useDualKeys = useDualKeys
    },

    updateValue(fileIndex: number, key: string, value: string) {
      if (this.stringsData[fileIndex]) {
        this.stringsData[fileIndex][key] = value
      }
    },
    
    addKey(key: string, defaultValue: string = '') {
      // Check if key already exists
      if (this.allKeys.includes(key)) {
        return false // Key already exists
      }
      
      // Add key to all language files with default value
      this.stringsData.forEach((data) => {
        if (data) {
          data[key] = defaultValue
        }
      })
      
      // Also add to original data for change tracking
      this.originalData.forEach((data) => {
        if (data) {
          data[key] = defaultValue
        }
      })
      
      return true // Success
    },
    
    removeKey(key: string) {
      // Remove key from all language files
      this.stringsData.forEach((data) => {
        if (data && key in data) {
          delete data[key]
        }
      })
      
      // Also remove from original data
      this.originalData.forEach((data) => {
        if (data && key in data) {
          delete data[key]
        }
      })
    },
    
    isValueChanged(fileIndex: number, key: string): boolean {
      const current = this.stringsData[fileIndex]?.[key] ?? ''
      const original = this.originalData[fileIndex]?.[key] ?? ''
      return current !== original
    },
    
    getChangedKeys(): string[] {
      const changedKeys = new Set<string>()
      
      this.stringsData.forEach((fileData, fileIndex) => {
        Object.keys(fileData).forEach(key => {
          if (this.isValueChanged(fileIndex, key)) {
            changedKeys.add(key)
          }
        })
      })
      
      return Array.from(changedKeys)
    },
    
    reset() {
      this.files = []
      this.stringsData = []
      this.originalData = []
      this.currentProject = null
      this.previewImages = {}
    },

    // Preview Images Actions
    setPreviewImages(images: Record<string, PreviewImage[]>) {
      this.previewImages = images
    },

    addPreviewImages(prefix: string, images: PreviewImage[]) {
      if (!this.previewImages[prefix]) {
        this.previewImages[prefix] = []
      }
      this.previewImages[prefix].push(...images)
    },

    removePreviewImage(prefix: string, index: number) {
      if (this.previewImages[prefix]) {
        this.previewImages[prefix].splice(index, 1)
        if (this.previewImages[prefix].length === 0) {
          delete this.previewImages[prefix]
        }
      }
    }
  }
})

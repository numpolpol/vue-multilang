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

export interface KeyAnnotation {
  keyName: string
  x: number // X position as percentage (0-100)
  y: number // Y Position as percentage (0-100)
  number: number // Display number (1, 2, 3, etc.)
}

export interface PreviewImage {
  name: string
  url: string
  data: string // base64 data for serialization
  keyAnnotations?: KeyAnnotation[] // Key positions on the image
}

export interface ProjectVersion {
  id: string
  name: string
  description?: string
  timestamp: number
  languages: LanguageColumn[]
  previewImages?: Record<string, PreviewImage[]>
  createdBy?: string
}

export interface Project {
  id: string
  name: string
  languages: Array<{
    name: string
    data: Record<string, string>
  }> | LanguageColumn[] // Support both legacy and new structure
  previewImages?: Record<string, PreviewImage[]>
  lastModified: number
  createdAt: number
  versions?: ProjectVersion[] // Array of project versions
  currentVersion?: string // ID of current version
}

// Default language columns
const DEFAULT_LANGUAGES: LanguageColumn[] = [
  { code: 'th', name: 'Thai', data: {}, hasFile: false },
  { code: 'en', name: 'English', data: {}, hasFile: false },
  { code: 'km', name: 'Khmer', data: {}, hasFile: false },
  { code: 'my', name: 'Myanmar', data: {}, hasFile: false }
]

export interface DiffEntry {
  key: string
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  languageCode: string
  beforeValue?: string
  afterValue?: string
}

export interface VersionDiff {
  beforeVersion: ProjectVersion
  afterVersion: ProjectVersion
  changes: DiffEntry[]
  summary: {
    added: number
    removed: number
    modified: number
    unchanged: number
  }
}

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
      // Ensure we have at least one language
      if (this.languages.length === 0) {
        console.warn('No languages available to add key to')
        return
      }
      
      this.languages.forEach(lang => {
        if (!lang.data[key]) {
          lang.data[key] = defaultValue
        }
      })
      this.syncLanguagesToFiles()
      
      console.log('Added key to all languages:', key, 'Languages count:', this.languages.length)
    },
    
    deleteKeyFromAllLanguages(key: string) {
      // Remove the key from all languages
      this.languages.forEach(lang => {
        if (lang.data[key] !== undefined) {
          delete lang.data[key]
        }
      })
      this.syncLanguagesToFiles()
      
      console.log('Deleted key from all languages:', key)
    },
    
    // Rename/edit a key across all languages
    renameKey(oldKey: string, newKey: string): boolean {
      // Validate new key
      if (!newKey || newKey.trim() === '' || newKey === oldKey) {
        return false
      }
      
      // Check if new key already exists
      const allKeys = this.allKeysFromLanguages
      if (allKeys.includes(newKey)) {
        return false
      }
      
      // Rename the key in all languages
      this.languages.forEach(language => {
        if (language.data && language.data[oldKey] !== undefined) {
          language.data[newKey] = language.data[oldKey]
          delete language.data[oldKey]
        }
      })
      
      this.syncLanguagesToFiles()
      console.log('Renamed key:', oldKey, '->', newKey)
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
        // Create default English language with a mock file
        const defaultContent = '// Default English strings file created automatically\n'
        const mockFile = new File([defaultContent], 'en.strings', { type: 'text/plain' })
        
        // Add to new language structure
        this.addLanguage({
          code: 'en',
          name: 'English',
          data: {},
          hasFile: true,
          fileType: 'strings'
        })
        
        // Add to legacy files structure for compatibility
        this.addFile(mockFile, {})
        
        // Update current project if it exists
        if (this.currentProject) {
          this.currentProject.languages = [...this.languages]
          this.updateCurrentProject()
        }
        
        console.log('Created default English language with strings file')
      }
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
        
        // Update project languages with current data from language-column structure
        if (this.hasLanguageFiles) {
          // Use the new language-column structure if available
          this.currentProject.languages = this.languages
            .filter(lang => lang.hasFile)
            .map(lang => ({
              name: lang.code,
              data: { ...lang.data }
            }))
        } else {
          // Fallback to legacy structure
          this.currentProject.languages = this.files.map((file, index) => ({
            name: file.name.replace(/\.(strings|xml)$/, ''),
            data: this.stringsData[index] || {}
          }))
        }
        
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
    
    // Version Management Methods
    createVersion(name: string, description?: string): boolean {
      if (!this.currentProject) return false
      
      try {
        this.updateCurrentProject()
        
        const versionId = `v${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newVersion: ProjectVersion = {
          id: versionId,
          name,
          description,
          timestamp: Date.now(),
          languages: this.languages.map(lang => ({
            code: lang.code,
            name: lang.name,
            data: { ...lang.data },
            hasFile: lang.hasFile,
            fileType: lang.fileType
          })),
          previewImages: this.previewImages ? JSON.parse(JSON.stringify(this.previewImages)) : undefined
        }
        
        // Initialize versions array if it doesn't exist
        if (!this.currentProject.versions) {
          this.currentProject.versions = []
        }
        
        // Add new version
        this.currentProject.versions.push(newVersion)
        this.currentProject.currentVersion = versionId
        this.currentProject.lastModified = Date.now()
        
        // Save to localStorage
        this.saveProjectToLocalStorage()
        
        return true
      } catch (error) {
        console.error('Failed to create version:', error)
        return false
      }
    },

    loadVersion(versionId: string): boolean {
      if (!this.currentProject?.versions) return false
      
      const version = this.currentProject.versions.find(v => v.id === versionId)
      if (!version) return false
      
      try {
        // Load version data into current state
        this.languages = version.languages.map(lang => ({ ...lang }))
        
        // Load preview images
        if (version.previewImages) {
          this.previewImages = JSON.parse(JSON.stringify(version.previewImages))
        } else {
          this.previewImages = {}
        }
        
        // Sync language-column structure to legacy structure for compatibility
        this.syncLanguagesToFiles()
        
        // Update current version
        this.currentProject.currentVersion = versionId
        
        return true
      } catch (error) {
        console.error('Failed to load version:', error)
        return false
      }
    },

    deleteVersion(versionId: string): boolean {
      if (!this.currentProject?.versions) return false
      
      const versionIndex = this.currentProject.versions.findIndex(v => v.id === versionId)
      if (versionIndex === -1) return false
      
      try {
        // Remove version
        this.currentProject.versions.splice(versionIndex, 1)
        
        // If this was the current version, clear current version
        if (this.currentProject.currentVersion === versionId) {
          this.currentProject.currentVersion = undefined
        }
        
        // Save changes
        this.saveProjectToLocalStorage()
        
        return true
      } catch (error) {
        console.error('Failed to delete version:', error)
        return false
      }
    },

    compareVersions(beforeVersionId: string, afterVersionId: string): VersionDiff | null {
      if (!this.currentProject?.versions) return null
      
      const beforeVersion = this.currentProject.versions.find(v => v.id === beforeVersionId)
      const afterVersion = this.currentProject.versions.find(v => v.id === afterVersionId)
      
      if (!beforeVersion || !afterVersion) return null
      
      const changes: DiffEntry[] = []
      const summary = { added: 0, removed: 0, modified: 0, unchanged: 0 }
      
      // Get all unique keys from both versions
      const allKeys = new Set<string>()
      const allLanguages = new Set<string>()
      
      beforeVersion.languages.forEach(lang => {
        allLanguages.add(lang.code)
        Object.keys(lang.data).forEach(key => allKeys.add(key))
      })
      
      afterVersion.languages.forEach(lang => {
        allLanguages.add(lang.code)
        Object.keys(lang.data).forEach(key => allKeys.add(key))
      })
      
      // Compare each key in each language
      allLanguages.forEach(langCode => {
        const beforeLang = beforeVersion.languages.find(l => l.code === langCode)
        const afterLang = afterVersion.languages.find(l => l.code === langCode)
        
        allKeys.forEach(key => {
          const beforeValue = beforeLang?.data[key]
          const afterValue = afterLang?.data[key]
          
          let type: DiffEntry['type'] = 'unchanged'
          
          if (beforeValue === undefined && afterValue !== undefined) {
            type = 'added'
            summary.added++
          } else if (beforeValue !== undefined && afterValue === undefined) {
            type = 'removed'
            summary.removed++
          } else if (beforeValue !== afterValue) {
            type = 'modified'
            summary.modified++
          } else {
            type = 'unchanged'
            summary.unchanged++
          }
          
          // Only add to changes if it's not unchanged
          if (type !== 'unchanged') {
            changes.push({
              key,
              type,
              languageCode: langCode,
              beforeValue,
              afterValue
            })
          }
        })
      })
      
      return {
        beforeVersion,
        afterVersion,
        changes,
        summary
      }
    },

    getVersions(): ProjectVersion[] {
      return this.currentProject?.versions || []
    },

    getCurrentVersionId(): string | undefined {
      return this.currentProject?.currentVersion
    },
    
    reset() {
      this.files = []
      this.stringsData = []
      this.originalData = []
      this.currentProject = null
      this.previewImages = {}
      
      // Reset languages to default state
      this.languages = [...DEFAULT_LANGUAGES].map(lang => ({
        ...lang,
        data: {},
        hasFile: false,
        fileType: undefined
      }))
      
      // Reset dual key mode state
      this.useDualKeys = false
      this.mergedKeys = []
      this.mergedData = []
      this.fileGroups = []
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
    },

    saveImageKeyAnnotations(prefix: string, imageIndex: number, annotations: KeyAnnotation[]) {
      if (this.previewImages[prefix] && this.previewImages[prefix][imageIndex]) {
        this.previewImages[prefix][imageIndex].keyAnnotations = [...annotations]
      }
    },

    loadProject(project: Project) {
      // Set the current project
      this.currentProject = project
      
      // Clear existing data
      this.files = []
      this.stringsData = []
      
      // Clear languages first
      this.languages = []
      
      // Load project data into language-column structure
      project.languages.forEach((projectLang) => {        
        // Check if it's new LanguageColumn structure or legacy structure
        if ('code' in projectLang && 'hasFile' in projectLang) {
          // New LanguageColumn structure
          const langCol = projectLang as LanguageColumn
          this.languages.push({
            code: langCol.code,
            name: langCol.name,
            data: { ...langCol.data },
            hasFile: langCol.hasFile,
            fileType: langCol.fileType
          })
        } else {
          // Legacy structure - convert to new structure
          const langCode = projectLang.name.toLowerCase().replace(/\.(strings|xml)$/, '')
          const code = langCode === 'english' ? 'en' : 
                      langCode === 'thai' ? 'th' :
                      langCode === 'khmer' ? 'km' :
                      langCode === 'myanmar' ? 'my' : 
                      langCode
          
          this.languages.push({
            code: code,
            name: projectLang.name,
            data: { ...projectLang.data },
            hasFile: true,
            fileType: 'strings'
          })
        }
      })
      
      // Load preview images if available
      if (project.previewImages) {
        this.previewImages = { ...project.previewImages }
      }
      
      // Sync language-column structure to legacy structure for compatibility
      this.syncLanguagesToFiles()
      
      console.log('Loaded project:', project.name, 'Languages:', this.languages)
    },

    // Legacy method for backward compatibility
    addKey(key: string, defaultValue: string = ''): boolean {
      try {
        // Check if key already exists
        const keyExists = this.stringsData.some(data => data.hasOwnProperty(key))
        if (keyExists) {
          return false
        }

        // Add to stringsData (legacy structure)
        this.stringsData.forEach(data => {
          data[key] = defaultValue
        })
        
        // Add to originalData
        this.originalData.forEach(data => {
          data[key] = defaultValue
        })
        
        return true
      } catch (error) {
        console.error('Failed to add key:', error)
        return false
      }
    },

    // Remove a key from all language files
    removeKey(key: string): boolean {
      try {
        // Remove from stringsData
        this.stringsData.forEach(data => {
          delete data[key]
        })
        
        // Remove from originalData
        this.originalData.forEach(data => {
          delete data[key]
        })

        // Remove from languages data structure
        this.languages.forEach(lang => {
          delete lang.data[key]
        })
        
        return true
      } catch (error) {
        console.error('Failed to remove key:', error)
        return false
      }
    },

    // Update a value for a specific file and key
    updateValue(fileIndex: number, key: string, value: string): boolean {
      try {
        // Validate file index
        if (fileIndex < 0 || fileIndex >= this.stringsData.length) {
          return false
        }

        // Update stringsData
        this.stringsData[fileIndex][key] = value

        // Update languages data structure if it exists
        if (fileIndex < this.languages.length) {
          this.languages[fileIndex].data[key] = value
        }
        
        return true
      } catch (error) {
        console.error('Failed to update value:', error)
        return false
      }
    },

    // Legacy method alias for backward compatibility
    setUseDualKeys(enabled: boolean) {
      this.setDualKeysMode(enabled)
    },
  }
})

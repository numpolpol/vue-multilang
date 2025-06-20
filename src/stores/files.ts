import { defineStore } from 'pinia'

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
  }>
  lastModified: number
  createdAt: number
}

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
    stringsData: [] as Record<string, string>[],
    originalData: [] as Record<string, string>[],
    currentProject: null as Project | null
  }),
  
  getters: {
    hasFiles: (state) => state.files.length > 0,
    allKeys: (state) => {
      const keySet = new Set<string>()
      state.stringsData.forEach(obj => 
        Object.keys(obj).forEach(k => keySet.add(k))
      )
      return Array.from(keySet).sort()
    }
  },
  
  actions: {
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
    
    updateValue(fileIndex: number, key: string, value: string) {
      if (this.stringsData[fileIndex]) {
        this.stringsData[fileIndex][key] = value
      }
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
    }
  }
})

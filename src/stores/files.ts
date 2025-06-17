import { defineStore } from 'pinia'

export interface StringsFile {
  file: File
  data: Record<string, string>
}

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
    stringsData: [] as Record<string, string>[],
    originalData: [] as Record<string, string>[]
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
    }
  }
})

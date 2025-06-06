import { defineStore } from 'pinia'

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
    stringsData: [] as Record<string, string>[]
  }),
  actions: {
    setFiles(files: File[]) {
      this.files = files
    },
    setStringsData(data: Record<string, string>[]) {
      this.stringsData = data
    }
  }
})

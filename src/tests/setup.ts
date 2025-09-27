import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  })
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock DOM APIs
global.HTMLDialogElement = class HTMLDialogElement extends HTMLElement {
  open = false
  returnValue = ''
  
  showModal() {
    this.open = true
  }
  
  close() {
    this.open = false
  }
} as any

// Mock window.alert
global.alert = vi.fn()

// Mock window.confirm
global.confirm = vi.fn(() => true)

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock FileReader
global.FileReader = class FileReader extends EventTarget {
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null
  readyState: number = 0
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  
  readAsDataURL(file: File) {
    this.result = 'data:image/png;base64,mockData'
    setTimeout(() => {
      const event = new Event('load') as any
      if (this.onload) {
        this.onload(event)
      }
      this.dispatchEvent(event)
    }, 0)
  }
  
  readAsText(file: File) {
    // If it's a MockFile, get the actual content
    if (file && typeof (file as any).content === 'string') {
      this.result = (file as any).content
    } else {
      this.result = 'mock text'
    }
    setTimeout(() => {
      const event = new Event('load') as any
      if (this.onload) {
        this.onload(event)
      }
      this.dispatchEvent(event)
    }, 0)
  }
} as any

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: vi.fn(() => Promise.resolve('mock clipboard text'))
  }
})

<template>
  <div class="drawer h-screen">
    <input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <!-- Drawer side -->
    <div class="drawer-side z-40">
      <label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="menu p-4 w-80 min-h-full bg-base-200">
        <!-- Theme & Controls -->
        <div class="space-y-4">
          <!-- App Title -->
          <div class="text-xl font-bold">iOS/Android Editor</div>

          <!-- Theme -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Theme</span>
            </label>
            <select v-model="theme" class="select select-bordered w-full" @change="updateTheme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="zimablue">Zima Blue</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Page content -->
    <div class="drawer-content">
      <!-- Navbar -->
      <div class="navbar bg-base-100 shadow-lg rounded-box mb-6">
        <div class="navbar-start">
          <label for="drawer" class="btn btn-square btn-ghost drawer-button lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
          <h1 class="text-2xl font-bold ml-2">Vue Multi Language Editor</h1>
        </div>
      </div>

      <div class="p-4">
        <!-- Project Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Create New Project -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Project
              </h2>
              <p class="text-base-content/70">Start a new multi-language editing project with default languages</p>
              
              <div class="card-actions justify-end mt-4">
                <button 
                  class="btn btn-primary" 
                  @click="createNewProject"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>

          <!-- Create from Snippet -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create from Snippet
              </h2>
              <p class="text-base-content/70">Paste iOS .strings, Android XML, or TSV data to create a project</p>
              
              <div class="card-actions justify-end mt-4">
                <button 
                  class="btn btn-accent" 
                  @click="showSnippetModal"
                >
                  Create from Code
                </button>
              </div>
            </div>
          </div>

          <!-- Create from Keys -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-info">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Create from Keys
              </h2>
              <p class="text-base-content/70">Paste a list of keys to create a project</p>
              
              <div class="card-actions justify-end mt-4">
                <button 
                  class="btn btn-info" 
                  @click="showKeysModal"
                >
                  Create from Keys
                </button>
              </div>
            </div>
          </div>

          <!-- Load Project -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Load Project
              </h2>
              <p class="text-base-content/70">Continue working on an existing project</p>
              
              <div class="space-y-3 mt-4">
                <!-- Load from File -->
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text">Load from File</span>
                  </label>
                  <input 
                    type="file" 
                    accept=".json" 
                    class="file-input file-input-bordered w-full"
                    @change="loadProjectFromFile"
                  />
                </div>
                
                <!-- Load from Local Storage -->
                <div class="divider">OR</div>
                <div class="text-sm text-base-content/70 mb-2">
                  Saved projects are shown below
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Projects -->
        <div v-if="savedProjects.length > 0" class="mt-8">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h3 class="card-title">Saved Projects</h3>
              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Languages</th>
                      <th>Images</th>
                      <th>Last Modified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(project, index) in sortedSavedProjects" :key="project.id">
                      <td class="font-medium">{{ project.name }}</td>
                      <td>{{ project.languages.length }} languages</td>
                      <td>{{ getImageCount(project) }} images</td>
                      <td>{{ formatDate(project.lastModified) }}</td>
                      <td>
                        <div class="flex gap-2">
                          <button 
                            class="btn btn-sm btn-primary" 
                            @click="loadProject(project)"
                          >
                            Load
                          </button>
                          <button 
                            class="btn btn-sm btn-error" 
                            @click="deleteProject(index)"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- No Saved Projects -->
        <div v-else-if="savedProjects.length === 0" class="mt-8">
          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>No saved projects found. Create a new project to get started!</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-8">
          <div class="alert alert-info shadow-lg">
            <div class="flex flex-col">
              <div class="font-bold mb-2">How to use:</div>
              <ol class="list-decimal list-inside space-y-2">
                <li><span class="font-semibold">Create Project:</span> Click "Create Project" to start a new multi-language editing session with default languages (Thai, English, Myanmar, Khmer). You can rename the project later in the editor.</li>
                <li><span class="font-semibold">Create from Snippet:</span> Paste iOS .strings, Android XML, or TSV data to create a project. TSV format supports 1-4 language values per key in order (Thai, English, Myanmar, Khmer).</li>
                <li><span class="font-semibold">Create from Keys:</span> Paste a list of translation keys to create a project with all 4 languages and empty values ready for translation.</li>
                <li><span class="font-semibold">Load Project:</span> Load from a saved file or select from your saved projects in local storage.</li>
                <li><span class="font-semibold">Save Work:</span> Save your project to local storage or download as a file to continue later.</li>
                <li><span class="font-semibold">Export:</span> Export your translations to iOS .strings or Android XML format.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Snippet Modal -->
  <dialog id="snippet_modal" class="modal">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-lg">Create Project from Code Snippet</h3>
      <p class="py-2 text-sm text-base-content/70">Paste your iOS .strings, Android XML, or TSV data below</p>
      
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Code Snippet (iOS .strings / Android XML / TSV)</span>
        </label>
        <textarea 
          v-model="snippetCode"
          class="textarea textarea-bordered h-64 font-mono text-sm" 
          placeholder='iOS .strings format:
"register_foreigner_title" = "TODO";
"register_foreigner_subtitle" = "Please fill in your details below.";

Android XML format:
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="register_foreigner_title">TODO</string>
    <string name="register_foreigner_subtitle">Please fill in your details below.</string>
</resources>

TSV format (key + 1-4 language values in order: th, en, km, my):
key_1	value_th_1
key_2	value_th_2	value_en_2
key_3	value_th_3	value_en_3	value_km_3
key_4	value_th_4	value_en_4	value_km_4	value_my_4'
        ></textarea>
        <label class="label">
          <span class="label-text-alt">{{ snippetFormatInfo }}</span>
        </label>
      </div>
      
      <div class="modal-action">
        <button class="btn" @click="closeSnippetModal">Cancel</button>
        <button 
          class="btn btn-primary" 
          :disabled="!snippetCode.trim() || parsedKeysCount === 0"
          @click="showLanguageConfirmModal"
        >
          Continue
        </button>
      </div>
    </div>
  </dialog>

  <!-- Language Confirmation Modal -->
  <dialog id="language_confirm_modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Confirm Language</h3>
      <p class="py-2">What language are these strings in?</p>
      
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Language</span>
        </label>
        <select v-model="selectedLanguage" class="select select-bordered w-full">
          <option value="th">Thai (ไทย)</option>
          <option value="en">English</option>
          <option value="km">Khmer (ខ្មែរ)</option>
          <option value="my">Myanmar (မြန်မာ)</option>
        </select>
      </div>
      <div class="modal-action">
        <button class="btn" @click="closeLanguageConfirmModal">Back</button>
        <button 
          class="btn btn-primary" 
          @click="createProjectFromSnippet"
        >
          Create Project
        </button>
      </div>
    </div>
  </dialog>

  <!-- Keys Modal -->
  <dialog id="keys_modal" class="modal">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-lg">Create Project from Keys List</h3>
      <p class="py-2 text-sm text-base-content/70">Paste or type your keys below (one per line or comma-separated)</p>
      
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Keys List</span>
        </label>
        <textarea 
          v-model="keysList"
          class="textarea textarea-bordered h-64 font-mono text-sm" 
          placeholder="login_title
login_username_placeholder
login_password_placeholder
login_button_text
register_title

Or comma-separated:
login_title, login_username, login_password, register_title"
        ></textarea>
        <label class="label">
          <span class="label-text-alt">{{ keysListCount }} valid keys detected</span>
        </label>
      </div>
      
      <div class="alert alert-info mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="font-bold">Keys Format:</div>
          <div class="text-sm">Keys must contain only letters, numbers, and underscores. They must start with a letter or underscore.</div>
        </div>
      </div>
      
      <div class="modal-action">
        <button class="btn" @click="closeKeysModal">Cancel</button>
        <button 
          class="btn btn-info" 
          :disabled="!keysList.trim() || keysListCount === 0"
          @click="createProjectFromKeys"
        >
          Create Project ({{ keysListCount }} keys)
        </button>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore, type Project, type LanguageColumn } from '../stores/files'
import { parseStrings, parseTSVMultiLanguage, isTSVFormat } from '../utils/strings'

const router = useRouter()
const filesStore = useFilesStore()
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)

// Project management
const savedProjects = ref<Project[]>([])

// Snippet functionality
const snippetCode = ref('')
const selectedLanguage = ref('th') // Default to Thai

// Keys functionality
const keysList = ref('')

// Computed property to analyze snippet format and keys
const snippetFormatInfo = computed(() => {
  if (!snippetCode.value.trim()) return '0 keys detected'
  
  try {
    // Check if it's TSV format first
    if (isTSVFormat(snippetCode.value)) {
      const tsvData = parseTSVMultiLanguage(snippetCode.value)
      const keyCount = Object.keys(tsvData.th).length
      
      // Count how many languages have data
      let langCounts = {
        th: Object.values(tsvData.th).filter(v => v.trim()).length,
        en: Object.values(tsvData.en).filter(v => v.trim()).length,
        km: Object.values(tsvData.km).filter(v => v.trim()).length,
        my: Object.values(tsvData.my).filter(v => v.trim()).length
      }
      
      let langInfo = []
      if (langCounts.th > 0) langInfo.push(`th:${langCounts.th}`)
      if (langCounts.en > 0) langInfo.push(`en:${langCounts.en}`)
      if (langCounts.km > 0) langInfo.push(`km:${langCounts.km}`)
      if (langCounts.my > 0) langInfo.push(`my:${langCounts.my}`)
      
      return `TSV format detected - ${keyCount} keys (${langInfo.join(', ')})`
    }
    
    // Otherwise try regular parsing (iOS strings or Android XML)
    const parsed = parseStrings(snippetCode.value)
    const keyCount = Object.keys(parsed).length
    
    if (snippetCode.value.trim().startsWith('<?xml')) {
      return `Android XML format detected - ${keyCount} keys`
    } else {
      return `iOS .strings format detected - ${keyCount} keys`
    }
  } catch {
    return 'Invalid format'
  }
})

// For backward compatibility with continue button
const parsedKeysCount = computed(() => {
  if (!snippetCode.value.trim()) return 0
  
  try {
    if (isTSVFormat(snippetCode.value)) {
      const tsvData = parseTSVMultiLanguage(snippetCode.value)
      return Object.keys(tsvData.th).length
    }
    
    const parsed = parseStrings(snippetCode.value)
    return Object.keys(parsed).length
  } catch {
    return 0
  }
})

// Computed property to count keys from keys list
const keysListCount = computed(() => {
  if (!keysList.value.trim()) return 0
  const keys = keysList.value
    .split(/[\n,]/)
    .map(key => key.trim())
    .filter(key => key.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key))
  return keys.length
})

// Computed property to sort saved projects by lastModified (newest first)
const sortedSavedProjects = computed(() => {
  return [...savedProjects.value].sort((a, b) => b.lastModified - a.lastModified)
})

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  loadSavedProjects()
})

function updateTheme(event: Event) {
  const newTheme = (event.target as HTMLSelectElement).value
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
}

function loadSavedProjects() {
  try {
    const saved = localStorage.getItem('savedProjects')
    if (saved) {
      savedProjects.value = JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load saved projects:', error)
    savedProjects.value = []
  }
}

function createNewProject() {
  const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Create all 4 default languages with common keys in order: th, en, my, km
  const initialLanguages: LanguageColumn[] = [
    {
      code: 'th',
      name: 'Thai',
      data: {
        'common_welcome': 'ยินดีต้อนรับ',
        'common_ok': 'ตกลง',
        'common_cancel': 'ยกเลิก'
      },
      hasFile: true,
      fileType: 'strings'
    },
    {
      code: 'en',
      name: 'English', 
      data: {
        'common_welcome': 'Welcome',
        'common_ok': 'OK',
        'common_cancel': 'Cancel'
      },
      hasFile: true,
      fileType: 'strings'
    },
    {
      code: 'my',
      name: 'Myanmar',
      data: {
        'common_welcome': 'ကြိုဆိုပါတယ်',
        'common_ok': 'OK',
        'common_cancel': 'ပယ်ဖျက်'
      },
      hasFile: true,
      fileType: 'strings'
    },
    {
      code: 'km',
      name: 'Khmer',
      data: {
        'common_welcome': 'សូមស្វាគមន៍',
        'common_ok': 'យល់ព្រម',
        'common_cancel': 'បោះបង់'
      },
      hasFile: true,
      fileType: 'strings'
    }
  ]
  
  // Create new project with all 4 languages and initial keys
  const newProject: Project = {
    id: projectId,
    name: 'Untitled',
    languages: initialLanguages,
    lastModified: Date.now(),
    createdAt: Date.now()
  }
  
  // Load the project into store (this will sync languages to store properly)
  filesStore.loadProject(newProject)
  
  // Navigate to editor
  router.push('/editor')
}

function loadProject(project: Project) {
  // Use the store's loadProject method which properly syncs both structures
  filesStore.loadProject(project)
  
  // Navigate to editor
  router.push('/editor')
}

function deleteProject(index: number) {
  // Find the project by ID since we're using sorted array
  const project = sortedSavedProjects.value[index]
  if (!project) return
  
  if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
    // Find the original index in the unsorted array
    const originalIndex = savedProjects.value.findIndex(p => p.id === project.id)
    if (originalIndex !== -1) {
      savedProjects.value.splice(originalIndex, 1)
      localStorage.setItem('savedProjects', JSON.stringify(savedProjects.value))
    }
  }
}

function loadProjectFromFile(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const file = input.files[0]
  const reader = new FileReader()
  
  reader.onload = () => {
    try {
      const projectData = JSON.parse(reader.result as string)
      
      // Validate project structure
      if (projectData.id && projectData.name && projectData.languages) {
        loadProject(projectData)
      } else {
        alert('Invalid project file format!')
      }
    } catch (error) {
      console.error('Failed to parse project file:', error)
      alert('Failed to load project file!')
    }
  }
  
  reader.readAsText(file)
  
  // Clear the input
  input.value = ''
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function getImageCount(project: Project): number {
  if (!project.previewImages) return 0
  return Object.keys(project.previewImages).reduce((total, key) => 
    total + (project.previewImages![key]?.length || 0), 0
  )
}

// Snippet modal functions
function showSnippetModal() {
  // Reset snippet form
  snippetCode.value = ''
  selectedLanguage.value = 'th'
  
  const modal = document.getElementById('snippet_modal') as HTMLDialogElement
  modal.showModal()
}

function closeSnippetModal() {
  const modal = document.getElementById('snippet_modal') as HTMLDialogElement
  modal.close()
}

function showLanguageConfirmModal() {
  if (!snippetCode.value.trim() || parsedKeysCount.value === 0) return
  
  // If it's TSV format, skip language confirmation and create project directly
  if (isTSVFormat(snippetCode.value)) {
    createProjectFromSnippet()
    return
  }
  
  // For other formats, show language confirmation modal
  const snippetModal = document.getElementById('snippet_modal') as HTMLDialogElement
  snippetModal.close()
  
  const languageModal = document.getElementById('language_confirm_modal') as HTMLDialogElement
  languageModal.showModal()
}

function closeLanguageConfirmModal() {
  const languageModal = document.getElementById('language_confirm_modal') as HTMLDialogElement
  languageModal.close()
  
  // Reopen snippet modal
  const snippetModal = document.getElementById('snippet_modal') as HTMLDialogElement
  snippetModal.showModal()
}

function createProjectFromSnippet() {
  try {
    // Check if it's TSV format first
    if (isTSVFormat(snippetCode.value)) {
      // Parse TSV data which already contains all 4 languages
      const tsvData = parseTSVMultiLanguage(snippetCode.value)
      
      if (Object.keys(tsvData.th).length === 0) {
        alert('No valid TSV data found in the snippet!')
        return
      }
      
      // Create project with all 4 languages from TSV data
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const initialLanguages: LanguageColumn[] = [
        {
          code: 'th',
          name: 'Thai',
          data: { ...tsvData.th },
          hasFile: true,
          fileType: 'strings'
        },
        {
          code: 'en',
          name: 'English',
          data: { ...tsvData.en },
          hasFile: true,
          fileType: 'strings'
        },
        {
          code: 'km',
          name: 'Khmer',
          data: { ...tsvData.km },
          hasFile: true,
          fileType: 'strings'
        },
        {
          code: 'my',
          name: 'Myanmar',
          data: { ...tsvData.my },
          hasFile: true,
          fileType: 'strings'
        }
      ]
      
      const newProject: Project = {
        id: projectId,
        name: 'Untitled',
        languages: initialLanguages,
        lastModified: Date.now(),
        createdAt: Date.now()
      }
      
      // Load the project
      filesStore.loadProject(newProject)
      
      // Close modals and navigate
      const snippetModal = document.getElementById('snippet_modal') as HTMLDialogElement
      snippetModal.close()
      router.push('/editor')
      return
    }
    
    // Handle iOS .strings or Android XML format (single language)
    const parsedData = parseStrings(snippetCode.value)
    
    if (Object.keys(parsedData).length === 0) {
      alert('No valid .strings or XML data found in the snippet!')
      return
    }
    
    // Use the selected language
    const langCode = selectedLanguage.value
    
    // Create project with all 4 languages
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create all 4 languages with empty data initially
    const emptyData: Record<string, string> = {}
    Object.keys(parsedData).forEach(key => {
      emptyData[key] = ''
    })
    
    const initialLanguages: LanguageColumn[] = [
      {
        code: 'th',
        name: 'Thai',
        data: langCode === 'th' ? { ...parsedData } : { ...emptyData },
        hasFile: true,
        fileType: 'strings'
      },
      {
        code: 'en',
        name: 'English',
        data: langCode === 'en' ? { ...parsedData } : { ...emptyData },
        hasFile: true,
        fileType: 'strings'
      },
      {
        code: 'km',
        name: 'Khmer',
        data: langCode === 'km' ? { ...parsedData } : { ...emptyData },
        hasFile: true,
        fileType: 'strings'
      },
      {
        code: 'my',
        name: 'Myanmar',
        data: langCode === 'my' ? { ...parsedData } : { ...emptyData },
        hasFile: true,
        fileType: 'strings'
      }
    ]
    
    const newProject: Project = {
      id: projectId,
      name: 'Untitled',
      languages: initialLanguages,
      lastModified: Date.now(),
      createdAt: Date.now()
    }
    
    // Load the project
    filesStore.loadProject(newProject)
    
    // Close modal
    const languageModal = document.getElementById('language_confirm_modal') as HTMLDialogElement
    languageModal.close()
    
    // Navigate to editor
    router.push('/editor')
    
  } catch (error) {
    console.error('Failed to parse snippet code:', error)
    alert('Failed to parse snippet code. Please check the format.')
  }
}

// Keys modal functions
function showKeysModal() {
  // Reset keys form
  keysList.value = ''
  
  const modal = document.getElementById('keys_modal') as HTMLDialogElement
  modal.showModal()
}

function closeKeysModal() {
  const modal = document.getElementById('keys_modal') as HTMLDialogElement
  modal.close()
}

function createProjectFromKeys() {
  try {
    // Parse keys from input
    const keys = keysList.value
      .split(/[\n,]/)
      .map(key => key.trim())
      .filter(key => key.length > 0 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key))
    
    if (keys.length === 0) {
      alert('No valid keys found!')
      return
    }
    
    // Create project with all 4 languages and the specified keys
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create data object with all keys having empty values
    const keysData: Record<string, string> = {}
    keys.forEach(key => {
      keysData[key] = ''
    })
    
    const initialLanguages: LanguageColumn[] = [
      {
        code: 'th',
        name: 'Thai',
        data: { ...keysData },
        hasFile: true,
        fileType: 'strings'
      },
      {
        code: 'en',
        name: 'English',
        data: { ...keysData },
        hasFile: true,
        fileType: 'strings'
      },
      {
        code: 'km',
        name: 'Khmer',
        data: { ...keysData },
        hasFile: true,
        fileType: 'strings'
      },
      {
        code: 'my',
        name: 'Myanmar',
        data: { ...keysData },
        hasFile: true,
        fileType: 'strings'
      }
    ]
    
    const newProject: Project = {
      id: projectId,
      name: 'Untitled',
      languages: initialLanguages,
      lastModified: Date.now(),
      createdAt: Date.now()
    }
    
    // Load the project
    filesStore.loadProject(newProject)
    
    // Close modal
    const modal = document.getElementById('keys_modal') as HTMLDialogElement
    modal.close()
    
    // Navigate to editor
    router.push('/editor')
    
  } catch (error) {
    console.error('Failed to create project from keys:', error)
    alert('Failed to create project from keys. Please check the format.')
  }
}
</script>

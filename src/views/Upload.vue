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
          <h1 class="text-2xl font-bold ml-2">Project Manager</h1>
        </div>
      </div>

      <div class="p-4">
        <!-- Project Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Create New Project -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Project
              </h2>
              <p class="text-base-content/70">Start a new multi-language editing project</p>
              
              <div class="form-control w-full mt-4">
                <label class="label">
                  <span class="label-text">Project Name</span>
                </label>
                <input 
                  v-model="newProjectName" 
                  type="text" 
                  placeholder="Enter project name..." 
                  class="input input-bordered w-full"
                  @keyup.enter="createNewProject"
                />
              </div>
              
              <div class="card-actions justify-end mt-4">
                <button 
                  class="btn btn-primary" 
                  :disabled="!newProjectName.trim()"
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
              <p class="text-base-content/70">Paste iOS .strings code to create a project</p>
              
              <div class="form-control w-full mt-4">
                <label class="label">
                  <span class="label-text">Project Name</span>
                </label>
                <input 
                  v-model="snippetProjectName" 
                  type="text" 
                  placeholder="Enter project name..." 
                  class="input input-bordered w-full"
                />
              </div>
              
              <div class="card-actions justify-end mt-4">
                <button 
                  class="btn btn-accent" 
                  :disabled="!snippetProjectName.trim()"
                  @click="showSnippetModal"
                >
                  Create from Code
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
                <button 
                  class="btn btn-outline btn-secondary w-full" 
                  @click="showSavedProjects"
                >
                  Load from Saved Projects
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Projects -->
        <div v-if="showSaved && savedProjects.length > 0" class="mt-8">
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
                    <tr v-for="(project, index) in savedProjects" :key="project.id">
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
        <div v-else-if="showSaved && savedProjects.length === 0" class="mt-8">
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
                <li><span class="font-semibold">Create Project:</span> Enter a project name and click "Create Project" to start a new multi-language editing session.</li>
                <li><span class="font-semibold">Load Project:</span> Load from a saved file or select from your saved projects in local storage.</li>
                <li><span class="font-semibold">Add Languages:</span> In the editor, you can add language columns and upload files for each language.</li>
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
      <h3 class="font-bold text-lg">Create Project from iOS .strings Code</h3>
      <p class="py-2 text-sm text-base-content/70">Paste your iOS .strings code below</p>
      
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">iOS .strings Code</span>
        </label>
        <textarea 
          v-model="snippetCode"
          class="textarea textarea-bordered h-64 font-mono text-sm" 
          placeholder='"register_foreigner_title" = "TODO";
"register_foreigner_subtitle" = "Please fill in your details below.";
"register_foreigner_passport_label" = "Passport Number";
"register_foreigner_nationality_label" = "Nationality";'
        ></textarea>
        <label class="label">
          <span class="label-text-alt">{{ parsedKeysCount }} keys detected</span>
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
          <option value="en">English</option>
          <option value="th">Thai</option>
          <option value="km">Khmer</option>
          <option value="my">Myanmar</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
          <option value="vi">Vietnamese</option>
          <option value="id">Indonesian</option>
          <option value="ms">Malay</option>
          <option value="tl">Filipino</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div v-if="selectedLanguage === 'other'" class="form-control w-full mt-2">
        <label class="label">
          <span class="label-text">Custom Language Code</span>
        </label>
        <input 
          v-model="customLanguageCode"
          type="text" 
          placeholder="e.g., fr, de, es" 
          class="input input-bordered w-full"
        />
      </div>
      
      <div class="modal-action">
        <button class="btn" @click="closeLanguageConfirmModal">Back</button>
        <button 
          class="btn btn-primary" 
          :disabled="selectedLanguage === 'other' && !customLanguageCode.trim()"
          @click="createProjectFromSnippet"
        >
          Create Project
        </button>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore, type Project } from '../stores/files'
import { parseStrings } from '../utils/strings'

const router = useRouter()
const filesStore = useFilesStore()
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)

// Project management
const newProjectName = ref('')
const savedProjects = ref<Project[]>([])
const showSaved = ref(false)

// Snippet functionality
const snippetProjectName = ref('')
const snippetCode = ref('')
const selectedLanguage = ref('en')
const customLanguageCode = ref('')

// Computed property to count parsed keys
const parsedKeysCount = computed(() => {
  if (!snippetCode.value.trim()) return 0
  try {
    const parsed = parseStrings(snippetCode.value)
    return Object.keys(parsed).length
  } catch {
    return 0
  }
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
  if (!newProjectName.value.trim()) return
  
  const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Create new project with empty state
  const newProject: Project = {
    id: projectId,
    name: newProjectName.value.trim(),
    languages: [],
    lastModified: Date.now(),
    createdAt: Date.now()
  }
  
  // Set current project in store
  filesStore.setCurrentProject(newProject)
  
  // Navigate to editor
  router.push('/editor')
}

function showSavedProjects() {
  loadSavedProjects()
  showSaved.value = true
}

function loadProject(project: Project) {
  // Use the store's loadProject method which properly syncs both structures
  filesStore.loadProject(project)
  
  // Navigate to editor
  router.push('/editor')
}

function deleteProject(index: number) {
  const project = savedProjects.value[index]
  if (!project) return
  
  if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
    savedProjects.value.splice(index, 1)
    localStorage.setItem('savedProjects', JSON.stringify(savedProjects.value))
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
  if (!snippetProjectName.value.trim()) return
  
  // Reset snippet form
  snippetCode.value = ''
  selectedLanguage.value = 'en'
  customLanguageCode.value = ''
  
  const modal = document.getElementById('snippet_modal') as HTMLDialogElement
  modal.showModal()
}

function closeSnippetModal() {
  const modal = document.getElementById('snippet_modal') as HTMLDialogElement
  modal.close()
}

function showLanguageConfirmModal() {
  if (!snippetCode.value.trim() || parsedKeysCount.value === 0) return
  
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
    // Parse the snippet code
    const parsedData = parseStrings(snippetCode.value)
    
    if (Object.keys(parsedData).length === 0) {
      alert('No valid .strings data found in the snippet!')
      return
    }
    
    // Determine language code
    const langCode = selectedLanguage.value === 'other' 
      ? customLanguageCode.value.trim()
      : selectedLanguage.value
    
    if (!langCode) {
      alert('Please specify a language code!')
      return
    }
    
    // Create project
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newProject: Project = {
      id: projectId,
      name: snippetProjectName.value.trim(),
      languages: [{
        name: langCode,
        data: parsedData
      }],
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
    console.error('Failed to parse .strings code:', error)
    alert('Failed to parse .strings code. Please check the format.')
  }
}
</script>

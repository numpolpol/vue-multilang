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
          <div class="text-xl font-bold">iOS String Editor</div>

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

          <!-- Import Folder -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Import Folder
              </h2>
              <p class="text-base-content/70">Import a folder containing multiple .strings files</p>
              
              <div class="card-actions justify-end mt-4">
                <button 
                  class="btn btn-accent" 
                  @click="openFolderImport"
                >
                  Import Folder
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Folder Import Modal -->
        <dialog ref="folderImportModal" class="modal">
          <div class="modal-box max-w-4xl">
            <h3 class="font-bold text-lg mb-4">Import Folder with .strings Files</h3>
            <FolderUploader />
            <div class="modal-action">
              <button class="btn" @click="closeFolderImport">Close</button>
            </div>
          </div>
        </dialog>

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
                      <th>Last Modified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(project, index) in sortedSavedProjects" :key="project.id">
                      <td class="font-medium">{{ project.name }}</td>
                      <td>{{ project.languages.length }} languages</td>
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
                <li><span class="font-semibold">Load Project:</span> Load from a saved file or select from your saved projects in local storage.</li>
                <li><span class="font-semibold">Save Work:</span> Save your project to local storage or download as a file to continue later.</li>
                <li><span class="font-semibold">Export:</span> Export your translations to iOS .strings format.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore, type Project, type LanguageColumn } from '../stores/files'
import FolderUploader from '../components/FolderUploader.vue'

const router = useRouter()
const filesStore = useFilesStore()
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)

// Project management
const savedProjects = ref<Project[]>([])

// Folder import modal
const folderImportModal = ref<HTMLDialogElement>()

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

function openFolderImport() {
  folderImportModal.value?.showModal()
}

function closeFolderImport() {
  folderImportModal.value?.close()
}
</script>

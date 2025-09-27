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



        <!-- Instructions -->
        <div class="mt-8">
          <div class="alert alert-info shadow-lg">
            <div class="flex flex-col">
              <div class="font-bold mb-2">How to use:</div>
              <ol class="list-decimal list-inside space-y-2">
                <li><span class="font-semibold">Create Project:</span> Click "Create Project" to start a new multi-language editing session with default languages (Thai, English, Myanmar, Khmer). You can rename the project later in the editor.</li>
                <li><span class="font-semibold">Load Project:</span> Load from a saved JSON project file using the file input above.</li>
                <li><span class="font-semibold">Save Work:</span> In the editor, click "Save Project" to download your project as a JSON file.</li>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore, type Project, type LanguageColumn } from '../stores/files'
import FolderUploader from '../components/FolderUploader.vue'

const router = useRouter()
const filesStore = useFilesStore()
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)

// Project management


// Folder import modal
const folderImportModal = ref<HTMLDialogElement>()




onMounted(() => {
  // Initialize theme
})

function updateTheme(event: Event) {
  const newTheme = (event.target as HTMLSelectElement).value
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
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
        // Set the project in the store
        filesStore.setCurrentProject(projectData)
        
        // Load the project data
        filesStore.loadProject(projectData)
        
        // Navigate to editor
        router.push('/editor')
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

function openFolderImport() {
  folderImportModal.value?.showModal()
}

function closeFolderImport() {
  folderImportModal.value?.close()
}
</script>

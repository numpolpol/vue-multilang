<![CDATA[<template>]]>
  &lt;div class="drawer lg:drawer-open h-screen"&gt;
    &lt;input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" /&gt;
    
    &lt;!-- Drawer side --&gt;
    &lt;div class="drawer-side z-40"&gt;
      &lt;label for="drawer" aria-label="close sidebar" class="drawer-overlay"&gt;&lt;/label&gt;
      &lt;div class="menu p-4 w-80 min-h-full bg-base-200"&gt;
        &lt;!-- Theme & Controls --&gt;
        &lt;div class="space-y-4"&gt;
          &lt;!-- App Title --&gt;
          &lt;div class="text-xl font-bold"&gt;iOS/Android Editor&lt;/div&gt;

          &lt;!-- Theme --&gt;
          &lt;div class="form-control w-full"&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text font-semibold"&gt;Theme&lt;/span&gt;
            &lt;/label&gt;
            &lt;select v-model="theme" class="select select-bordered w-full" @change="updateTheme"&gt;
              &lt;option value="light"&gt;Light&lt;/option&gt;
              &lt;option value="dark"&gt;Dark&lt;/option&gt;
              &lt;option value="forest"&gt;Forest&lt;/option&gt;
              &lt;option value="zimablue"&gt;Zima Blue&lt;/option&gt;
            &lt;/select&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;!-- Page content --&gt;
    &lt;div class="drawer-content"&gt;
      &lt;!-- Navbar --&gt;
      &lt;div class="navbar bg-base-100 shadow-lg rounded-box mb-6"&gt;
        &lt;div class="navbar-start"&gt;
          &lt;label for="drawer" class="btn btn-square btn-ghost drawer-button lg:hidden"&gt;
            &lt;svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"&gt;
              &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"&gt;&lt;/path&gt;
            &lt;/svg&gt;
          &lt;/label&gt;
          &lt;h1 class="text-2xl font-bold ml-2"&gt;iOS/Android Multi-file Editor&lt;/h1&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div class="p-4"&gt;
        &lt;div class="alert alert-info shadow-lg mb-6"&gt;
          &lt;div class="flex flex-col"&gt;
            &lt;div class="font-bold mb-2"&gt;How to use:&lt;/div&gt;
            &lt;ol class="list-decimal list-inside space-y-2"&gt;
              &lt;li&gt;&lt;span class="font-semibold"&gt;Choose Files:&lt;/span&gt; Select multiple iOS &lt;span class="font-semibold"&gt;.strings&lt;/span&gt; or Android &lt;span class="font-semibold"&gt;string.xml&lt;/span&gt; files (one per language, same keys).&lt;/li&gt;
              &lt;li&gt;&lt;span class="font-semibold"&gt;Ready:&lt;/span&gt; Click &lt;span class="font-semibold"&gt;Ready&lt;/span&gt; to load and edit all keys/values side-by-side.&lt;/li&gt;
              &lt;li&gt;&lt;span class="font-semibold"&gt;View:&lt;/span&gt; Use &lt;span class="font-semibold"&gt;See All&lt;/span&gt;/&lt;span class="font-semibold"&gt;Paging&lt;/span&gt; to switch key views.&lt;/li&gt;
              &lt;li&gt;&lt;span class="font-semibold"&gt;Edit:&lt;/span&gt; Edit values directly or use &lt;span class="font-semibold"&gt;Paste&lt;/span&gt; per row for quick input.&lt;/li&gt;
              &lt;li&gt;&lt;span class="font-semibold"&gt;Export:&lt;/span&gt; Use floating buttons to export all, changed, or keep order.&lt;/li&gt;
              &lt;li&gt;&lt;span class="font-semibold"&gt;Back:&lt;/span&gt; Use the floating &lt;span class="font-semibold"&gt;Back&lt;/span&gt; button to restart.&lt;/li&gt;
            &lt;/ol&gt;
            &lt;div class="mt-4 text-sm"&gt;
              &lt;span class="font-bold"&gt;Tips:&lt;/span&gt; All processing is local. Key column scrolls if long. Use the same keys in all files. Supports both iOS and Android formats.
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div class="card bg-base-100 shadow-xl p-6"&gt;
          &lt;div class="form-control w-full"&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text font-semibold"&gt;Select Files&lt;/span&gt;
            &lt;/label&gt;
            &lt;input type="file" multiple accept=".strings,.xml" class="file-input file-input-bordered w-full" @change="onFilesSelected" /&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text-alt"&gt;Select multiple .strings or .xml files&lt;/span&gt;
            &lt;/label&gt;
          &lt;/div&gt;
          
          &lt;div v-if="files.length > 0" class="mt-4"&gt;
            &lt;div class="font-semibold mb-2"&gt;Selected Files:&lt;/div&gt;
            &lt;div class="bg-base-200 rounded-lg p-3"&gt;
              &lt;ul class="list-disc list-inside space-y-1"&gt;
                &lt;li v-for="file in files" :key="file.name" class="text-sm"&gt;
                  {{ file.name }}
                &lt;/li&gt;
              &lt;/ul&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div class="mt-6 flex justify-end"&gt;
            &lt;button class="btn btn-primary" :disabled="files.length === 0" @click="startEditing"&gt;
              Start Editing
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script lang="ts" setup&gt;
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import { parseStrings } from '../utils/strings'

const router = useRouter()
const filesStore = useFilesStore()
const files = ref&lt;File[]&gt;([])
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)

function updateTheme(event: Event) {
  const newTheme = (event.target as HTMLSelectElement).value
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  files.value = Array.from(input.files)
  filesStore.setFiles(files.value)
  // Parse .strings files
  const readers = files.value.map(
    (file) =&gt;
      new Promise&lt;Record&lt;string, string&gt;&gt;((resolve) =&gt; {
        const reader = new FileReader()
        reader.onload = () =&gt; {
          try {
            resolve(parseStrings(reader.result as string))
          } catch {
            resolve({})
          }
        }
        reader.readAsText(file)
      })
  )
  Promise.all(readers).then((parsed) =&gt; {
    filesStore.setStringsData(parsed)
  })
}

function startEditing() {
  router.push('/editor')
}
&lt;/script&gt;

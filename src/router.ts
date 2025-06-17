import { createRouter, createWebHistory } from 'vue-router'
import Upload from './views/Upload.vue'
import Editor from './views/Editor.vue'

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: Upload
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

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
  },
  // Catch-all route for GitHub Pages
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

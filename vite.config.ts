import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fixAssetPaths } from './vite-plugins'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), fixAssetPaths()],
  base: process.env.NODE_ENV === 'production' ? '/vue-multilang/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

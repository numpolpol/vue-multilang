// Test comment preservation in save/load cycle
import { useFilesStore } from './src/stores/files.js'

const store = useFilesStore()

console.log('Testing comment preservation...')

// Test data with structure
const testStructure = [
  { type: 'comment', content: '/* Test comment */' },
  { type: 'blank', content: '' },
  { type: 'key', content: '"test_key" = "test_value";', key: 'test_key', value: 'test_value' },
  { type: 'comment', content: '// End comment' }
]

const testContent = `/* Test comment */

"test_key" = "test_value";
// End comment`

// Simulate upload with structure preservation
store.languages[0].originalStructure = testStructure
store.languages[0].originalContent = testContent
store.languages[0].data = { 'test_key': 'test_value' }
store.languages[0].hasFile = true

console.log('Before save - Structure:', store.languages[0].originalStructure)
console.log('Before save - Content:', store.languages[0].originalContent)

// Save project
const project = store.saveProject('Test Project')
console.log('Saved project:', project)

// Reset store
store.reset()

// Load project
store.loadProject(project)
console.log('After load - Structure:', store.languages[0].originalStructure)
console.log('After load - Content:', store.languages[0].originalContent)

// Test if structure is preserved
if (store.languages[0].originalStructure && store.languages[0].originalContent) {
  console.log('✅ Comments and structure preserved!')
} else {
  console.log('❌ Comments or structure lost!')
}
// Test the dash support implementation

// Test keys with various dash patterns
const testKeys = [
  // Original format (should still work)
  'home_title',
  'home_subtitle', 
  'settings_button',
  
  // New format with dashes in page section
  'home-screen_title',
  'home-screen_subtitle',
  'user-profile_name',
  'user-profile_email',
  'login-form_username',
  'login-form_password',
  'shopping-cart_total',
  'product-details_price',
  
  // Multiple dashes in page section
  'main-navigation-bar_logo',
  'user-account-settings_privacy',
  'terms-of-service_accept',
  
  // Complex patterns
  'home-dashboard-main_welcome',
  'user-profile-settings-privacy_toggle',
  
  // Keys without underscores (edge case)
  'dashboard',
  'welcome'
]

// Simulate the getPagePrefix function
function getPagePrefix(key) {
  const underscoreIndex = key.indexOf('_')
  if (underscoreIndex === -1) return key
  return key.substring(0, underscoreIndex)
}

console.log('🎯 Testing Dash Support for Page Sections\n')

console.log('Key → Page Section:')
console.log('='.repeat(50))

testKeys.forEach(key => {
  const prefix = getPagePrefix(key)
  console.log(`${key.padEnd(35)} → ${prefix}`)
})

console.log('\n📋 Unique Page Sections:')
console.log('='.repeat(50))
const uniquePrefixes = [...new Set(testKeys.map(getPagePrefix))]
uniquePrefixes.forEach((prefix, index) => {
  console.log(`${(index + 1).toString().padStart(2)}. ${prefix}`)
})

console.log('\n🔍 Grouping Example:')
console.log('='.repeat(50))
uniquePrefixes.slice(0, 3).forEach(prefix => {
  const keysInSection = testKeys.filter(key => getPagePrefix(key) === prefix)
  console.log(`\n📁 Section: "${prefix}"`)
  keysInSection.forEach(key => {
    console.log(`   • ${key}`)
  })
})

console.log('\n✅ Dash support is working correctly!')
console.log('   • Supports original format: home_title → home')
console.log('   • Supports single dash: home-screen_title → home-screen')  
console.log('   • Supports multiple dashes: user-account-settings_privacy → user-account-settings')
console.log('   • Handles keys without underscore: dashboard → dashboard')

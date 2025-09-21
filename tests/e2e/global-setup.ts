/**
 * Playwright Global Setup
 * Sets environment variables for testing to disable external API calls and exit prevention
 */

async function globalSetup() {
  // Set environment variables for testing
  process.env.NEXT_PUBLIC_DISABLE_NEWS = 'true'
  process.env.NEXT_PUBLIC_DISABLE_EXIT_GUARD = 'true'
  
  console.log('🧪 Test environment configured:')
  console.log('  - News fetching disabled (prevents CORS errors)')
  console.log('  - Exit prevention disabled (allows test automation)')
}

export default globalSetup

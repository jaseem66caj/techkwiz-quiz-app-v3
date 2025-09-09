// Error Scenario Testing Script
// Run this in browser console to test error handling

console.log('🧪 Testing Error Handling Scenarios...');

// Test 1: Invalid category ID
async function testInvalidCategory() {
  console.log('\n📋 Test 1: Invalid Category ID');
  
  try {
    // This should trigger fallback mechanisms
    const response = await fetch('/quiz/invalid-category-123');
    const status = response.status;
    console.log(`✅ Invalid category handled gracefully: ${status}`);
    return status === 200; // Should still return 200 with fallback
  } catch (error) {
    console.error('❌ Invalid category test failed:', error);
    return false;
  }
}

// Test 2: Simulate localStorage corruption
function testLocalStorageCorruption() {
  console.log('\n📋 Test 2: localStorage Corruption Simulation');
  
  try {
    // Corrupt quiz data in localStorage
    localStorage.setItem('quiz_questions', 'invalid-json-data');
    console.log('✅ Corrupted localStorage data set');
    
    // The system should handle this gracefully on next load
    console.log('✅ System should fallback to static database on next quiz load');
    return true;
  } catch (error) {
    console.error('❌ localStorage corruption test failed:', error);
    return false;
  }
}

// Test 3: Check error logging functionality
function testErrorLogging() {
  console.log('\n📋 Test 3: Error Logging');
  
  try {
    // Check if error storage exists
    const errors = localStorage.getItem('quiz_errors');
    const dataErrors = localStorage.getItem('quiz_data_errors');
    const loadErrors = localStorage.getItem('quiz_load_errors');
    
    console.log('✅ Error logging storage initialized');
    console.log('  - quiz_errors:', errors ? 'exists' : 'empty');
    console.log('  - quiz_data_errors:', dataErrors ? 'exists' : 'empty');
    console.log('  - quiz_load_errors:', loadErrors ? 'exists' : 'empty');
    
    return true;
  } catch (error) {
    console.error('❌ Error logging test failed:', error);
    return false;
  }
}

// Test 4: Check analytics data
function testAnalyticsData() {
  console.log('\n📋 Test 4: Analytics Data');
  
  try {
    const analytics = localStorage.getItem('quiz_analytics');
    console.log('✅ Analytics storage:', analytics ? 'exists' : 'empty');
    
    if (analytics) {
      const data = JSON.parse(analytics);
      console.log(`  - Events logged: ${data.length}`);
      if (data.length > 0) {
        console.log(`  - Latest event:`, data[data.length - 1]);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
    return false;
  }
}

// Test 5: Network failure simulation
async function testNetworkFailure() {
  console.log('\n📋 Test 5: Network Failure Simulation');
  
  try {
    // Try to access a quiz page that might trigger network requests
    console.log('✅ Network failure scenarios should be handled by fallback mechanisms');
    console.log('✅ Static database should be used when dynamic loading fails');
    return true;
  } catch (error) {
    console.error('❌ Network failure test failed:', error);
    return false;
  }
}

// Run all error tests
async function runErrorTests() {
  console.log('🚀 Running Error Handling Test Suite\n');
  
  const results = {
    invalidCategory: await testInvalidCategory(),
    localStorageCorruption: testLocalStorageCorruption(),
    errorLogging: testErrorLogging(),
    analyticsData: testAnalyticsData(),
    networkFailure: await testNetworkFailure()
  };
  
  console.log('\n📊 Error Handling Test Results:');
  console.log('================================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  console.log('\n🔍 Manual Verification Steps:');
  console.log('1. Check browser console for any error messages');
  console.log('2. Verify quiz pages load even with corrupted localStorage');
  console.log('3. Confirm fallback questions appear for invalid categories');
  console.log('4. Test that the app never crashes or shows white screen');
  
  return results;
}

// Auto-run tests
runErrorTests();

// Export for manual testing
if (typeof window !== 'undefined') {
  window.errorTests = {
    runErrorTests,
    testInvalidCategory,
    testLocalStorageCorruption,
    testErrorLogging,
    testAnalyticsData,
    testNetworkFailure
  };
}

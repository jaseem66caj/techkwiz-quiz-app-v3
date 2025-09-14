/**
 * Script to clear browser data (localStorage, sessionStorage, cookies)
 * 
 * This script should be run in the browser console or included in a page
 * to clear all client-side storage and cookies.
 */

(function clearBrowserData() {
  console.log('🧹 Clearing browser data...');
  
  // Clear localStorage
  try {
    localStorage.clear();
    console.log('✅ LocalStorage cleared');
  } catch (error) {
    console.error('❌ Failed to clear LocalStorage:', error.message);
  }
  
  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared');
  } catch (error) {
    console.error('❌ Failed to clear SessionStorage:', error.message);
  }
  
  // Clear cookies
  try {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    }
    console.log('✅ Cookies cleared');
  } catch (error) {
    console.error('❌ Failed to clear cookies:', error.message);
  }
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
      console.log('✅ Caches cleared');
    }).catch(error => {
      console.error('❌ Failed to clear caches:', error.message);
    });
  }
  
  // Clear service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
      console.log('✅ Service workers unregistered');
    }).catch(error => {
      console.error('❌ Failed to unregister service workers:', error.message);
    });
  }
  
  console.log('🎉 Browser data clearing complete!');
  console.log('🔄 Please refresh the page to see changes');
})();
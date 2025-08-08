/**
 * API utilities for TechKwiz frontend
 * Handles backend URL detection and API calls with proper error handling
 */

/**
 * Get the correct backend URL based on environment
 */
export function getBackendUrl(): string {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
  }
  
  // Auto-detect based on current window location
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname
    const currentProtocol = window.location.protocol
    
    // If running on external domain, try to use the same domain with different port
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      // For external deployments, backend should be on the same domain or use proxy
      return `${currentProtocol}//${currentHost}/api`
    }
  }
  
  // Fallback to localhost for development
  return 'http://localhost:8001'
}

/**
 * Make API request with proper error handling and timeout
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const backendUrl = getBackendUrl()
  const url = endpoint.startsWith('http') ? endpoint : `${backendUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  }
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
  
  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    console.log(`✅ API Success: ${options.method || 'GET'} ${url}`)
    return response
  } catch (error) {
    console.error(`❌ API Request Failed: ${url}`, error)
    throw error
  }
}

/**
 * Make API request and return JSON with error handling
 */
export async function apiRequestJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await apiRequest(endpoint, options)
  return response.json()
}
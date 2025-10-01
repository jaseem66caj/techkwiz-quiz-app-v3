// ===================================================================
// TechKwiz Shared Storage Utilities
// ===================================================================
// This file contains shared utility functions for safe localStorage operations
// to prevent duplicate implementations across data manager classes.

/**
 * Safely get an item from localStorage with error handling
 * @param key - The key to retrieve from localStorage
 * @returns The stored value or null if not found or error occurs
 */
const resolveStorage = (): Storage | null => {
  if (typeof globalThis !== 'undefined') {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    if (storage) {
      return storage;
    }
  }

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }

  return null;
};

export function safeGetItem(key: string): string | null {
  const storage = resolveStorage();
  if (!storage) {
    return null;
  }

  try {
    // Attempt to retrieve item from localStorage
    return storage.getItem(key);
  } catch (error) {
    // Log error and return null if operation fails
    console.error(`Error reading from localStorage key ${key}:`, error);
    return null;
  }
}

/**
 * Safely set an item in localStorage with error handling
 * @param key - The key to store the value under
 * @param value - The value to store
 * @returns Boolean indicating success or failure
 */
export function safeSetItem(key: string, value: string): boolean {
  const storage = resolveStorage();
  if (!storage) {
    return false;
  }

  try {
    // Attempt to save item to localStorage
    storage.setItem(key, value);
    return true;
  } catch (error) {
    // Log error and handle storage quota exceeded error
    console.error(`Error writing to localStorage key ${key}:`, error);
    if (error instanceof DOMException && error.code === 22) {
      // Storage quota exceeded - this should be handled by the calling function
      console.warn('Storage quota exceeded for key:', key);
    }
    return false;
  }
}

/**
 * Safely remove an item from localStorage with error handling
 * @param key - The key to remove from localStorage
 * @returns Boolean indicating success or failure
 */
export function safeRemoveItem(key: string): boolean {
  const storage = resolveStorage();
  if (!storage) {
    return false;
  }

  try {
    // Attempt to remove item from localStorage
    storage.removeItem(key);
    return true;
  } catch (error) {
    // Log error and return false if operation fails
    console.error(`Error removing item from localStorage key ${key}:`, error);
    return false;
  }
}

/**
 * Safely parse JSON data from localStorage
 * @param key - The key to retrieve and parse
 * @param defaultValue - Default value to return if parsing fails
 * @returns Parsed data or default value
 */
export function safeParseJSON<T>(key: string, defaultValue: T): T {
  try {
    const data = safeGetItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Safely stringify and store JSON data to localStorage
 * @param key - The key to store the data under
 * @param value - The value to stringify and store
 * @returns Boolean indicating success or failure
 */
export function safeStringifyJSON(key: string, value: any): boolean {
  try {
    const stringValue = JSON.stringify(value);
    return safeSetItem(key, stringValue);
  } catch (error) {
    console.error(`Error stringifying JSON for localStorage key ${key}:`, error);
    return false;
  }
}

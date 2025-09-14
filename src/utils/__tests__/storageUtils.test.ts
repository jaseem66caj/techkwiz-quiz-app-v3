import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeParseJSON,
  safeStringifyJSON,
} from '../storageUtils';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

describe('storageUtils', () => {
  beforeEach(() => {
    // Clear mocks and reset localStorage
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Mock localStorage globally if window is defined
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
    }
  });

  describe('safeGetItem', () => {
    it('should return null when localStorage is not available (server-side)', () => {
      // Mock server-side environment by temporarily removing window
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const result = safeGetItem('test-key');
      expect(result).toBeNull();

      // Restore window
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    });

    it('should return item from localStorage when available', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        mockLocalStorage.getItem.mockReturnValue('test-value');

        const result = safeGetItem('test-key');
        expect(result).toBe('test-value');
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
      }
    });

    it('should return null and log error when localStorage throws', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockLocalStorage.getItem.mockImplementation(() => {
          throw new Error('Storage error');
        });

        const result = safeGetItem('test-key');
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error reading from localStorage key test-key:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('safeSetItem', () => {
    it('should return false when localStorage is not available (server-side)', () => {
      // Mock server-side environment by temporarily removing window
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const result = safeSetItem('test-key', 'test-value');
      expect(result).toBe(false);

      // Restore window
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    });

    it('should set item in localStorage and return true when successful', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const result = safeSetItem('test-key', 'test-value');
        expect(result).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
      }
    });

    it('should return false and log error when localStorage throws', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        mockLocalStorage.setItem.mockImplementation(() => {
          const error = new DOMException('Storage quota exceeded', 'QuotaExceededError');
          Object.defineProperty(error, 'code', {
            value: 22,
            writable: false,
            configurable: true,
          });
          throw error;
        });

        const result = safeSetItem('test-key', 'test-value');
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error writing to localStorage key test-key:',
          expect.any(Error)
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith('Storage quota exceeded for key:', 'test-key');

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
      }
    });
  });

  describe('safeRemoveItem', () => {
    it('should return false when localStorage is not available (server-side)', () => {
      // Mock server-side environment by temporarily removing window
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const result = safeRemoveItem('test-key');
      expect(result).toBe(false);

      // Restore window
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    });

    it('should remove item from localStorage and return true when successful', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const result = safeRemoveItem('test-key');
        expect(result).toBe(true);
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
      }
    });

    it('should return false and log error when localStorage throws', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockLocalStorage.removeItem.mockImplementation(() => {
          throw new Error('Storage error');
        });

        const result = safeRemoveItem('test-key');
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error removing item from localStorage key test-key:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('safeParseJSON', () => {
    it('should return parsed JSON when valid data exists', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        mockLocalStorage.getItem.mockReturnValue('{"test": "value"}');

        const result = safeParseJSON('test-key', { default: true });
        expect(result).toEqual({ test: 'value' });
      }
    });

    it('should return default value when no data exists', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        mockLocalStorage.getItem.mockReturnValue(null);

        const result = safeParseJSON('test-key', { default: true });
        expect(result).toEqual({ default: true });
      }
    });

    it('should return default value and log error when JSON parsing fails', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockLocalStorage.getItem.mockReturnValue('invalid-json');

        const result = safeParseJSON('test-key', { default: true });
        expect(result).toEqual({ default: true });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error parsing JSON from localStorage key test-key:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('safeStringifyJSON', () => {
    it('should stringify and store JSON data successfully', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const testData = { test: 'value' };
        const result = safeStringifyJSON('test-key', testData);

        expect(result).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '{"test":"value"}');
      }
    });

    it('should return false and log error when JSON stringifying fails', () => {
      // Only run this test in browser environment
      if (typeof window !== 'undefined') {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const circular: any = { test: 'value' };
        circular.self = circular; // Create circular reference

        const result = safeStringifyJSON('test-key', circular);
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error stringifying JSON for localStorage key test-key:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      }
    });
  });
});

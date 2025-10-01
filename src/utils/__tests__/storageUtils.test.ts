import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from '@jest/globals';
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeParseJSON,
  safeStringifyJSON,
} from '../storageUtils';

let store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: jest.fn((key: string) => store[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value;
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
  key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
} as unknown as Storage & {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  key: jest.Mock;
};

const resetLocalStorageMock = () => {
  store = {};
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.getItem.mockImplementation((key: string) => store[key] ?? null);
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
    store[key] = value;
  });
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.removeItem.mockImplementation((key: string) => {
    delete store[key];
  });
  mockLocalStorage.clear.mockClear();
  mockLocalStorage.clear.mockImplementation(() => {
    store = {};
  });
  mockLocalStorage.key.mockClear();
  mockLocalStorage.key.mockImplementation((index: number) => Object.keys(store)[index] ?? null);
};

let originalLocalStorageDescriptor: PropertyDescriptor | undefined;

beforeAll(() => {
  originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
});

afterAll(() => {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(globalThis, 'localStorage', originalLocalStorageDescriptor);
  } else {
    // Ensure we clean up any test-created property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).localStorage;
  }
});

describe('storageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetLocalStorageMock();

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    if (originalLocalStorageDescriptor) {
      Object.defineProperty(globalThis, 'localStorage', originalLocalStorageDescriptor);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
  });

  describe('safeGetItem', () => {
    it('should return null when localStorage is not available (server-side)', () => {
      const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = safeGetItem('test-key');
      expect(result).toBeNull();

      if (previousDescriptor) {
        Object.defineProperty(globalThis, 'localStorage', previousDescriptor);
      }
    });

    it('should return item from localStorage when available', () => {
      mockLocalStorage.getItem.mockReturnValue('test-value');

      const result = safeGetItem('test-key');
      expect(result).toBe('test-value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null and log error when localStorage throws', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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
    });
  });

  describe('safeSetItem', () => {
    it('should return false when localStorage is not available (server-side)', () => {
      const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = safeSetItem('test-key', 'test-value');
      expect(result).toBe(false);

      if (previousDescriptor) {
        Object.defineProperty(globalThis, 'localStorage', previousDescriptor);
      }
    });

    it('should set item in localStorage and return true when successful', () => {
      const result = safeSetItem('test-key', 'test-value');
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should return false and log error when localStorage throws', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

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
    });
  });

  describe('safeRemoveItem', () => {
    it('should return false when localStorage is not available (server-side)', () => {
      const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const result = safeRemoveItem('test-key');
      expect(result).toBe(false);

      if (previousDescriptor) {
        Object.defineProperty(globalThis, 'localStorage', previousDescriptor);
      }
    });

    it('should remove item from localStorage and return true when successful', () => {
      const result = safeRemoveItem('test-key');
      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should return false and log error when localStorage throws', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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
    });
  });

  describe('safeParseJSON', () => {
    it('should return parsed JSON when valid data exists', () => {
      mockLocalStorage.getItem.mockReturnValue('{"test":"value"}');

      const result = safeParseJSON('test-key', { default: true });
      expect(result).toEqual({ test: 'value' });
    });

    it('should return default value when no data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = safeParseJSON('test-key', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('should return default value and log error when JSON parsing fails', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = safeParseJSON('test-key', { default: true });
      expect(result).toEqual({ default: true });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing JSON from localStorage key test-key:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('safeStringifyJSON', () => {
    it('should stringify and store JSON data successfully', () => {
      const testData = { test: 'value' };
      const result = safeStringifyJSON('test-key', testData);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '{"test":"value"}');
    });

    it('should return false and log error when JSON stringifying fails', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const circularReference: Record<string, unknown> = {};
      circularReference.self = circularReference;

      const result = safeStringifyJSON('test-key', circularReference);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error stringifying JSON for localStorage key test-key:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

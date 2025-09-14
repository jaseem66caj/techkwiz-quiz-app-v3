import { registerServiceWorker, unregisterServiceWorker } from '../serviceWorkerRegistration';

describe('serviceWorkerRegistration', () => {
  const mockServiceWorker = {
    register: jest.fn(() => Promise.resolve({})),
    ready: Promise.resolve({
      unregister: jest.fn(),
    }),
  };

  const mockNavigator = {
    serviceWorker: mockServiceWorker,
  } as unknown as Navigator;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('registerServiceWorker', () => {
    it('should not throw an error when called', () => {
      // Mock window and navigator
      Object.defineProperty(global, 'window', {
        value: {
          addEventListener: jest.fn(),
          navigator: mockNavigator,
        },
        writable: true,
      });

      expect(() => {
        registerServiceWorker();
      }).not.toThrow();
    });

    it('should not throw an error when service worker is not supported', () => {
      // Mock window without service worker support
      Object.defineProperty(global, 'window', {
        value: {
          addEventListener: jest.fn(),
          navigator: {},
        },
        writable: true,
      });

      expect(() => {
        registerServiceWorker();
      }).not.toThrow();
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should not throw when service worker is supported', () => {
      // Mock window and navigator
      Object.defineProperty(global, 'window', {
        value: {
          navigator: mockNavigator,
        },
        writable: true,
      });

      expect(() => {
        unregisterServiceWorker();
      }).not.toThrow();
    });

    it('should not throw when service worker is not supported', () => {
      // Mock window without service worker support
      Object.defineProperty(global, 'window', {
        value: {
          navigator: {},
        },
        writable: true,
      });

      expect(() => {
        unregisterServiceWorker();
      }).not.toThrow();
    });
  });
});

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
import { registerServiceWorker, unregisterServiceWorker } from '../serviceWorkerRegistration';

const mockServiceWorker = {
  register: jest.fn(() => Promise.resolve({ scope: '/sw' } as ServiceWorkerRegistration)),
  ready: Promise.resolve({
    unregister: jest.fn(),
  } as ServiceWorkerRegistration),
};

let originalNavigatorDescriptor: PropertyDescriptor | undefined;

beforeAll(() => {
  originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
});

afterAll(() => {
  if (originalNavigatorDescriptor) {
    Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor);
  }
});

describe('serviceWorkerRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalNavigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor);
    }
  });

  describe('registerServiceWorker', () => {
    it('should not throw an error when called', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { serviceWorker: mockServiceWorker } as Navigator,
        configurable: true,
      });

      const addEventListenerSpy = jest
        .spyOn(window, 'addEventListener')
        .mockImplementation((_event, handler: EventListenerOrEventListenerObject) => {
          if (typeof handler === 'function') {
            handler(new Event('load'));
          }
        });

      expect(() => registerServiceWorker()).not.toThrow();

      addEventListenerSpy.mockRestore();
    });

    it('should not throw an error when service worker is not supported', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {} as Navigator,
        configurable: true,
      });

      const addEventListenerSpy = jest
        .spyOn(window, 'addEventListener')
        .mockImplementation((_event, handler: EventListenerOrEventListenerObject) => {
          if (typeof handler === 'function') {
            handler(new Event('load'));
          }
        });

      expect(() => registerServiceWorker()).not.toThrow();

      addEventListenerSpy.mockRestore();
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should not throw when service worker is supported', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { serviceWorker: mockServiceWorker } as Navigator,
        configurable: true,
      });

      expect(() => unregisterServiceWorker()).not.toThrow();
    });

    it('should not throw when service worker is not supported', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {} as Navigator,
        configurable: true,
      });

      expect(() => unregisterServiceWorker()).not.toThrow();
    });
  });
});

/**
 * Service Worker Registration Utility
 * Registers the service worker for PWA functionality
 */

interface ServiceWorkerRegistrationOptions {
  onSuccess?: (_registration: ServiceWorkerRegistration) => void;
  onUpdate?: (_registration: ServiceWorkerRegistration) => void;
}

export function registerServiceWorker(config?: ServiceWorkerRegistrationOptions): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.info('Service Worker registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the updated precached content has been fetched,
                  // but the previous service worker will still serve the older content
                  // until all client tabs are closed.
                  console.info(
                    'New content is available and will be used when all tabs for this page are closed.'
                  );

                  // Execute callback
                  if (config && config.onUpdate) {
                    config.onUpdate(registration);
                  }
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a "Content is cached for offline use." message.
                  console.info('Content is cached for offline use.');

                  // Execute callback
                  if (config && config.onSuccess) {
                    config.onSuccess(registration);
                  }
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
    });
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

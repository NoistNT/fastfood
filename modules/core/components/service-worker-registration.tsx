'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker
          .register('/sw.js')
          .then(function (registration) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Service Worker registered successfully:', registration.scope);
            }

            // Check for updates
            registration.addEventListener('updatefound', function () {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', function () {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    if (process.env.NODE_ENV === 'development') {
                      console.log('New service worker version available');
                    }
                    // You could show a notification to the user here
                  }
                });
              }
            });
          })
          .catch(function (error) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Service Worker registration failed:', error);
            }
          });
      });
    }
  }, []);

  return null;
}

// // public/service-worker.js

// self.addEventListener('push', function (event) {
//     const data = event.data?.json() || {};
//     const options = {
//       body: data.body || 'תוכן ברירת מחדל להתראה.',
//       icon: '/images/logo.png' || data.icon,
//       tag: data.tag || 'test-notification',
//       renotify: data.renotify || true,
//     };
  
//     event.waitUntil(
//       self.registration.showNotification(data.title || 'התראה חדשה', options)
//     );
//   });

  


self.addEventListener('push', function (event) {
    const data = event.data?.json() || {};
    const options = {
      body: data.body || 'You have a new notification.',
      icon: data.icon || '/images/logo.png',
      tag: data.tag || 'notification',
      renotify: true,
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title || 'New Notification', options)
    );
  });
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('dynamic-cache').then((cache) => cache.addAll(['/notifications']))
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== 'dynamic-cache')
            .map((name) => caches.delete(name))
        );
      })
    );
  });
  
// public/service-worker.js

self.addEventListener('push', function (event) {
    const data = event.data?.json() || {};
    const options = {
      body: data.body || 'תוכן ברירת מחדל להתראה.',
      icon: '/images/logo.png' || data.icon,
      tag: data.tag || 'test-notification',
      renotify: data.renotify || true,
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title || 'התראה חדשה', options)
    );
  });
  
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging.js');

// Initialize Firebase (using environment variables)
const firebaseConfig = {
  apiKey: 'AIzaSyCa_KmQ9sMv9uUTTScgrKzMx5QZj1ceOko',
  authDomain: 'wesocialjobs.firebaseapp.com',
  projectId: 'wesocialjobs',
  storageBucket: 'wesocialjobs.appspot.com',
  messagingSenderId: '689261640578',
  appId: '689261640578:web:814bf878e70a88bdb2ad9b',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '../images/logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging.js');

// Initialize Firebase (using environment variables)
const firebaseConfig = {
  apiKey: self.env.REACT_APP_API_KEY,
  authDomain: self.env.REACT_APP_AUTH_DOMAIN,
  projectId: self.env.REACT_APP_PROJECT_ID,
  storageBucket: self.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: self.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: self.env.REACT_APP_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

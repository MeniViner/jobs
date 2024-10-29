import { messaging } from 'services/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { collection, doc, setDoc, getFirestore } from 'firebase/firestore';
const db = getFirestore(); 

export const requestNotificationPermission = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_VAPID_KEY,
      });
      if (token) {
        console.log('FCM Token:', token);
        await saveFCMToken(userId, token); // שמירת הטוקן למשתמש ב-Firestore
        return token;
      } else { console.warn('Failed to get FCM token.'); }
    } else { console.warn('Notification permission denied.'); }
  } catch (error) { console.error('Error getting FCM token:', error); }
};

export const listenToForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Foreground notification received:', payload);
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/firebase-logo.png',
    });
  });
};

const saveFCMToken = async (userId, token) => {
  try {
    const userRef = doc(collection(db, 'users'), userId);
    await setDoc(userRef, { fcmTokens: [token] }, { merge: true }); // שמירה במערך
    console.log('FCM Token saved for user:', userId);
  } catch (error) { console.error('Error saving FCM token:', error); }
};

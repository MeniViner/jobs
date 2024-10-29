import React, { useState } from 'react';

const NotificationTestPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const canSendNotifications = () => {
    const permission = Notification.permission;
    console.log('Notification permission:', permission);
    return permission === 'granted';
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      if (permission === 'granted') {
        alert('התראות הופעלו בהצלחה!');
      } else {
        alert('המשתמש לא אישר התראות.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendNotification = () => {
    if (canSendNotifications()) {
      console.log('Sending notification:', { title, body });
      new Notification(title, {
        body: body,
        icon: '/images/logo.png', // ודא שהנתיב תקין
      });
    } else {
      console.warn('Notifications are not allowed.');
      alert('התראות לא מאושרות על ידי המשתמש.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>בדיקת שליחת התראות</h2>
      <button onClick={requestNotificationPermission}>
        בקש הרשאת התראות
      </button>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="כותרת"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        <textarea
          placeholder="תוכן ההתראה"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        ></textarea>
        <button onClick={sendNotification}>שלח התראה</button>
      </div>
    </div>
  );
};

export default NotificationTestPage;

import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Snackbar, Alert, Box } from '@mui/material';
import { ArrowLeftIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationTestPage = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  // Check if notifications can be sent
  const canSendNotifications = () => {
    const permission = Notification.permission;
    console.log('Notification permission status:', permission);
    return permission === 'granted';
  };

  // Request notification permission from the user
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      if (permission === 'granted') {
        setSnackbar({
          open: true,
          message: 'התראות הופעלו בהצלחה!',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'המשתמש לא אישר התראות.',
          severity: 'warning',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בהפעלת התראות.',
        severity: 'error',
      });
    }
  };

  // Send the notification using Service Worker
  const sendNotification = async () => {
    try {
      if (canSendNotifications()) {
        console.log('Sending notification:', { title, body });

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);

        // Send notification through Service Worker
        registration.showNotification(title || 'התראה חדשה', {
          body: body || 'תוכן ברירת מחדל להתראה.',
          icon: '/images/logo.png',
          tag: 'test-notification',
          renotify: true,
        });

        setSnackbar({
          open: true,
          message: 'התראה נשלחה בהצלחה!',
          severity: 'success',
        });
      } else {
        console.warn('Notifications are not allowed.');
        setSnackbar({
          open: true,
          message: 'התראות אינן מאושרות על ידי המשתמש.',
          severity: 'warning',
        });
      }
    } catch (error) {
      console.error('Notification error:', error);
      setErrorMessage(`שגיאה: ${error.message || 'שגיאה לא ידועה.'}`);
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה בשליחת ההתראה.',
        severity: 'error',
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          בדיקת שליחת התראות
        </Typography>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowLeftIcon />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={requestNotificationPermission}>
          בקש הרשאת התראות
        </Button>

        <TextField
          label="כותרת ההתראה"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="תוכן ההתראה"
          variant="outlined"
          multiline
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
        />

        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={sendNotification}>
            שלח התראה
          </Button>

          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationTestPage;

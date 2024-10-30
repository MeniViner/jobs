import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, FormControlLabel, Switch, Box, Button, Snackbar, Alert, 
} from '@mui/material';
import {
 ArrowLeftIcon
} from 'lucide-react';  
import { useNavigate } from 'react-router-dom';


export default function NotificationSettings() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('');
  const [waitingForPermission, setWaitingForPermission] = useState(false); // מצב המתנה לאישור
  const navigate = useNavigate();


  // טעינת ההעדפה הקודמת מ-LocalStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('notifications-enabled');
    setIsNotificationsEnabled(savedPreference === 'true');
  }, []);

  // טיפול בלחיצה על המתג
  const handleToggleNotifications = async () => {
    if (!isNotificationsEnabled) {
      // אם ההתראות כבויות, נבקש הרשאה מהמשתמש
      setWaitingForPermission(true); // מצב המתנה לאישור
      await requestNotificationPermission();
    } else {
      // אם ההתראות מופעלות ונכבה אותן
      setIsNotificationsEnabled(false);
      localStorage.setItem('notifications-enabled', 'false');
      setNotificationStatus('התראות כבויות.');
      setSnackbarOpen(true);
    }
  };

  // בקשת הרשאה להתראות מהדפדפן
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setIsNotificationsEnabled(true); // הפעלת ההתראות רק לאחר קבלת הרשאה
      localStorage.setItem('notifications-enabled', 'true');
      setNotificationStatus('התראות הופעלו בהצלחה!');
    } else {
      setNotificationStatus('הרשאה להתראות נדחתה.');
    }
    setWaitingForPermission(false); // הסרת מצב ההמתנה
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h4" gutterBottom>
                הגדרות התראות
            </Typography>

            <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate(-1)} 
                sx={{ mr: 1 }}
            >
                <ArrowLeftIcon />
            </Button>
        </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isNotificationsEnabled}
              onChange={handleToggleNotifications}
              disabled={waitingForPermission} // מניעת לחיצה נוספת בזמן המתנה לאישור
              color="primary"
            />
          }
          label={isNotificationsEnabled ? 'התראות דפדפן מופעלות' : 'התראות דפדפן מכובוץ'}
        />
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleToggleNotifications}
        disabled={waitingForPermission} // מניעת לחיצה נוספת בזמן המתנה לאישור
      >
        {isNotificationsEnabled ? 'כבה התראות' : 'הפעל התראות'}
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
          {notificationStatus}
        </Alert>
      </Snackbar>
    </Container>
  );
}

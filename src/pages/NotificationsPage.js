import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  Container, Typography, Box, IconButton, Snackbar, Alert, CircularProgress, Paper, ListItem, ListItemText
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SwipeableList, SwipeableListItem } from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

const NotificationsPage = () => {
  const auth = getAuth();
  const db = getFirestore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user is logged in.');
      return;
    }

    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notificationsList);
        setLoading(false);
      },
      (err) => {
        setError('Error loading notifications.');
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, [db, auth.currentUser]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);  // Deletes the notification from the collection
      setSnackbar({ open: true, message: 'Notification removed', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error removing notification', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography variant="body1" align="center">
          No notifications available.
        </Typography>
      ) : (
        <SwipeableList>
          {notifications.map((notification) => (
            <SwipeableListItem
              key={notification.id}
              swipeRight={{
                content: (
                  <Box
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      alignItems: 'center', 
                      pr: 2, 
                      bgcolor: 'error.main', 
                      color: 'white', 
                      height: '100%' 
                    }}
                  >
                    <DeleteIcon /> Delete
                  </Box>
                ),
                action: () => handleDeleteNotification(notification.id),
              }}
            >
              <ListItem component={Paper} sx={{ mb: 2, borderRadius: 2 }}>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
                />
              </ListItem>
            </SwipeableListItem>
          ))}
        </SwipeableList>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationsPage;

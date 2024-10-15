import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, doc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  Container, Typography, Box, IconButton, Snackbar, Alert, CircularProgress, Paper, ListItem, ListItemText,
  Button, Grid
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, History as HistoryIcon } from '@mui/icons-material';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import NoNotificationsImage from '../images/completed.svg';


const NotificationsPage = () => {
  const auth = getAuth();
  const db = getFirestore();
  const [notifications, setNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError('No user is logged in.');
      setLoading(false);
      return;
    }

    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('isHistory', '==', false));
    const historyQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('isHistory', '==', true));

    const unsubscribeNotifications = onSnapshot(
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

    const unsubscribeHistory = onSnapshot(
      historyQuery,
      (snapshot) => {
        const historyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistoryNotifications(historyList);
      },
      (err) => {
        console.error('Error loading history:', err);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeHistory();
    };
  }, [db, auth.currentUser]);

  const handleMoveToHistory = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isHistory: true });
      setSnackbar({ open: true, message: 'Notification moved to history', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error moving notification to history', severity: 'error' });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting notification', severity: 'error' });
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const batch = db.batch();
      notifications.forEach((notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { isHistory: true });
      });
      await batch.commit();
      setSnackbar({ open: true, message: 'All notifications moved to history', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error clearing notifications', severity: 'error' });
    }
  };

  const handleDeleteAllHistory = async () => {
    try {
      const batch = db.batch();
      historyNotifications.forEach((notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      setSnackbar({ open: true, message: 'All history deleted', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting history', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderNotificationList = (notificationList, isHistory = false) => (
    <SwipeableList threshold={0.5}>
      {notificationList.map((notification) => (
        <SwipeableListItem
          key={notification.id}
          swipeLeft={{
            content: (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                pl: 2, 
                bgcolor: 'primary.main', 
                color: 'white', 
                height: '100%' 
              }}>
                <HistoryIcon /> Move to History
              </Box>
            ),
            action: () => handleMoveToHistory(notification.id),
          }}
          swipeRight={{
            content: (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                pr: 2, 
                bgcolor: 'error.main', 
                color: 'white', 
                height: '100%' 
              }}>
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
            {isHistory && (
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNotification(notification.id)}>
                <DeleteIcon />
              </IconButton>
            )}
          </ListItem>
        </SwipeableListItem>
      ))}
    </SwipeableList>
  );

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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setShowHistory(!showHistory)}
            startIcon={<HistoryIcon />}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
          {showHistory && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                History
              </Typography>
              {historyNotifications.length === 0 ? (
                <Typography variant="body2">No history available.</Typography>
              ) : (
                <>
                  {renderNotificationList(historyNotifications, true)}
                  <Button 
                    variant="contained" 
                    color="error" 
                    fullWidth 
                    onClick={handleDeleteAllHistory}
                    sx={{ mt: 2 }}
                  >
                    Delete All History
                  </Button>
                </>
              )}
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h5" align="center" gutterBottom>
            Notifications
          </Typography>
          {notifications.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
              <img src={NoNotificationsImage} alt="No notifications" style={{ width: 200, height: 200 }} />
              <Typography variant="h6" align="center" mt={2}>
                No notifications available
              </Typography>
              <Typography variant="body1" align="center" mt={1}>
                You will see your notifications here when they arrive.
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                You can always review your past notifications in{' '}
                <Button color="primary" onClick={() => setShowHistory(!showHistory)}>
                  See history
                </Button>
              </Typography>
            </Box>
          ) : (
            <>
              {renderNotificationList(notifications)}
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleClearAllNotifications}
                sx={{ mt: 2 }}
              >
                Clear All Notifications
              </Button>
            </>
          )}
        </Grid>
      </Grid>
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
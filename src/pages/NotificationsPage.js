import React, { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, doc, deleteDoc, onSnapshot, updateDoc, writeBatch, getDoc, 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext'; // Import the AuthContext
import { 
  Container, Typography, Box, IconButton, Snackbar, Alert, CircularProgress, Paper, ListItem,
  ListItemText, Button, Grid
} from '@mui/material';
import { Delete as DeleteIcon, History as HistoryIcon, Archive as ArchiveIcon } from '@mui/icons-material';
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
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from AuthContext

  // useEffect(() => {
  //   const user = auth.currentUser;
  //   if (!user) {
  //     setError('No user is logged in.');
  //     setLoading(false);
  //     return;
  //   }
  
  //   const notificationsQuery = query(
  //     collection(db, 'notifications'),
  //     where('userId', '==', user.uid),
  //     where('isHistory', '==', false)
  //   );
  
  //   const historyQuery = query(
  //     collection(db, 'notifications'),
  //     where('userId', '==', user.uid),
  //     where('isHistory', '==', true)
  //   );
    
  //   const unsubscribeNotifications = onSnapshot(
  //     notificationsQuery,
  //     async (snapshot) => {
  //       console.log('Snapshot docs:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  //       const notificationsPromises = snapshot.docs.map(async (docSnapshot) => {
  //         const notificationData = docSnapshot.data();
  //         if (notificationData.broadcastId) {
  //           const broadcastDoc = await getDoc(doc(db, 'broadcasts', notificationData.broadcastId));
  //           return { id: docSnapshot.id, ...notificationData, ...broadcastDoc.data() };
  //         }
  //         return { id: docSnapshot.id, ...notificationData };
  //       });
  //       const notificationsList = await Promise.all(notificationsPromises);
  //       setNotifications(notificationsList);
  //       setLoading(false);
  //     },
  //     (err) => {
        
  //       setError('Error loading notifications.');
  //       setLoading(false);
  //     }
  //   );
  
  //   const unsubscribeHistory = onSnapshot(
  //     historyQuery,
  //     async (snapshot) => {
  //       const historyPromises = snapshot.docs.map(async (docSnapshot) => {
  //         const notificationData = docSnapshot.data();
  //         if (notificationData.broadcastId) {
  //           const broadcastDoc = await getDoc(doc(db, 'broadcasts', notificationData.broadcastId));
  //           return { id: docSnapshot.id, ...notificationData, ...broadcastDoc.data() };
  //         }
  //         return { id: docSnapshot.id, ...notificationData };
  //       });
  //       const historyList = await Promise.all(historyPromises);
  //       setHistoryNotifications(historyList);
  //     },
  //     (err) => {
  //       console.error('Error loading history:', err);
  //     }
  //   );
  
  //   return () => {
  //     unsubscribeNotifications();
  //     unsubscribeHistory();
  //   };
  // }, [db, auth.currentUser]);
  
  useEffect(() => {
    if (authLoading) return; // Wait for authentication to complete

    if (!user) {
      setError('No user is logged in.');
      setLoading(false);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isHistory', '==', false)
    );

    const historyQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isHistory', '==', true)
    );

    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      async (snapshot) => {
        const notificationsPromises = snapshot.docs.map(async (docSnapshot) => {
          const notificationData = docSnapshot.data();
          if (notificationData.broadcastId) {
            const broadcastDoc = await getDoc(doc(db, 'broadcasts', notificationData.broadcastId));
            return { id: docSnapshot.id, ...notificationData, ...broadcastDoc.data() };
          }
          return { id: docSnapshot.id, ...notificationData };
        });
        const notificationsList = await Promise.all(notificationsPromises);
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
      async (snapshot) => {
        const historyPromises = snapshot.docs.map(async (docSnapshot) => {
          const notificationData = docSnapshot.data();
          if (notificationData.broadcastId) {
            const broadcastDoc = await getDoc(doc(db, 'broadcasts', notificationData.broadcastId));
            return { id: docSnapshot.id, ...notificationData, ...broadcastDoc.data() };
          }
          return { id: docSnapshot.id, ...notificationData };
        });
        const historyList = await Promise.all(historyPromises);
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
  }, [db, user, authLoading]);

  if (authLoading || loading) {
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

  
  const handleMoveToHistory = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { 
        isHistory: true,
        userId: auth.currentUser.uid 
      });
      setSnackbar({ open: true, message: 'ההודעה הועברה להיסטוריה', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'שגיאה בהעברת ההתראה להיסטוריה', severity: 'error' });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      setSnackbar({ open: true, message: 'ההתראה נמחקה', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'שגיאה במחיקת ההתראה', severity: 'error' });
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        if (notification.isBroadcast) {
          batch.update(notificationRef, { 
            isHistory: true,
            userId: auth.currentUser.uid 
          });
        } else {
          batch.update(notificationRef, { isHistory: true });
        }
      });
      await batch.commit();
      setSnackbar({ open: true, message: 'All notifications moved to history', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error clearing notifications', severity: 'error' });
      console.log('Error clearing notifications', error)
    }
  };

  const handleDeleteAllHistory = async () => {
    try {
      const batch = writeBatch(db);
      historyNotifications.forEach((notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      setSnackbar({ open: true, message: 'All history deleted', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting history', severity: 'error' });
      console.log('Error deleting history\n', error)
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderNotificationList = (notificationList, isHistory = false) => (
    <SwipeableList threshold={0.1}>
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
                <ArchiveIcon /> Move to History
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
              primary={
                notification.isBroadcast 
                  ? `Broadcast: ${notification.content}`
                  : notification.message || notification.content
              }
              secondary={
                <>
                  {new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
                  {notification.jobTitle && ` - Job: ${notification.jobTitle}`}
                </>
              }
            />
            {!isHistory && (
              <IconButton edge="end" aria-label="move to history" onClick={() => handleMoveToHistory(notification.id)}>
                <ArchiveIcon />
              </IconButton>
            )}
          </ListItem>
        </SwipeableListItem>
      ))}
    </SwipeableList>
  );

  // if (loading) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Container>
  //       <Typography color="error" align="center">{error}</Typography>
  //     </Container>
  //   );
  // }

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
            {showHistory ? 'הצג היסטוריה' : 'הסתר היסטוריה'}
          </Button>
          {showHistory && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
              היסטוריית ההתראות
              </Typography>
              {historyNotifications.length === 0 ? (
                <Typography variant="body2">אין היסטוריה זמינה.</Typography>
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
                    מחיקת כל ההתראות 
                  </Button>
                </>
              )}
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h5" align="center" gutterBottom>
            התראות
          </Typography>
          <Typography variant="body2">החלק ימינה על הודעה להעברה לארכיון ושמאלה למחיקה </Typography>
          {notifications.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
              <img src={NoNotificationsImage} alt="No notifications" style={{ width: 200, height: 200 }} />
              <Typography variant="h6" align="center" mt={2}>
              אין התראות חדשות
              </Typography>
              <Typography variant="body1" align="center" mt={1}>
              כל ההתראות שלך טופלו בהצלחה. נעדכן אותך כשיגיעו עדכונים חדשים.
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
                Move All to History
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
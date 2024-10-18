import React, { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, doc, deleteDoc, onSnapshot, updateDoc, writeBatch, getDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, Typography, Box, Snackbar, Alert, CircularProgress, Paper, ListItem,
  ListItemText, Button, IconButton, Grid, 
} from '@mui/material';
import { 
  Delete as DeleteIcon, History as HistoryIcon, Archive as ArchiveIcon,
  Campaign as BroadcastIcon, Notifications as SystemIcon,
} from '@mui/icons-material';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import NoNotificationsImage from '../images/completed.svg';


const NotificationsPage = () => {
  const db = getFirestore();
  const [notifications, setNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showHistory, setShowHistory] = useState(false);
  const { user, loading: authLoading } = useAuth(); 


  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
  
    if (!user) {
      setError('No user is logged in.');
      setLoading(false);
      return;
    }
  
    const fetchNotifications = async () => {
      try {
        // Query all notifications for the user, regardless of type
        const allNotificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid)
        );
  
        const unsubscribeAll = onSnapshot(allNotificationsQuery, async (snapshot) => {
          const notificationsList = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
              const notification = { id: docSnapshot.id, ...docSnapshot.data() };
  
              if (notification.broadcastId) {
                const broadcastRef = doc(db, 'broadcasts', notification.broadcastId);
                const broadcastDoc = await getDoc(broadcastRef);
  
                if (broadcastDoc.exists()) {
                  notification.content = broadcastDoc.data().content;
                } else {
                  notification.content = 'Broadcast message not found.';
                }
              } else if (notification.type === 'application_submitted' || notification.message) {
                // Handle system notifications
                notification.content = notification.message || 'System notification';
              } else {
                console.log('Unknown notification type:', notification); // Debug log
              }
  
              return notification;
            })
          );
          // console.log('All fetched notifications:', notificationsList); // Debug log
  
          // Sort notifications
          notificationsList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
  
          // Separate active and history notifications
          const activeNotifications = notificationsList.filter(n => !n.isHistory);
          const historyNotifications = notificationsList.filter(n => n.isHistory);
    
          setNotifications(activeNotifications);
          setHistoryNotifications(historyNotifications);
        });
  
        setLoading(false);
  
        return () => unsubscribeAll();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Error loading notifications.');
        setLoading(false);
      }
    };
  
    fetchNotifications();
  }, [db, user, authLoading]);  
  
  const handleMoveToHistory = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationSnapshot = await getDoc(notificationRef);
  
      if (notificationSnapshot.exists()) {
        const notificationData = notificationSnapshot.data();
        
        // Update the notification in Firestore to mark it as history
        await updateDoc(notificationRef, { isHistory: true });
  
        let historyNotification = {
          id: notificationId,
          ...notificationData,
          isHistory: true
        };
  
        // If it's a broadcast notification, include the content
        if (notificationData.broadcastId) {
          const broadcastRef = doc(db, 'broadcasts', notificationData.broadcastId);
          const broadcastDoc = await getDoc(broadcastRef);
          
          if (broadcastDoc.exists()) {
            historyNotification.content = broadcastDoc.data().content;
          } else {
            historyNotification.content = 'Broadcast message not found.';
          }
        }
  
        // Update local state
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );
        setHistoryNotifications((prev) => {
          // Check if the notification is already in history
          const exists = prev.some(notification => notification.id === notificationId);
          if (exists) {
            return prev; // Don't add if it already exists
          }
          return [...prev, historyNotification];
        });
  
        setSnackbar({ open: true, message: 'ההודעה הועברה להיסטוריה', severity: 'success' });
      } else {
        throw new Error('Notification not found');
      }
    } catch (error) {
      console.error('Error moving to history:', error);
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
        batch.update(notificationRef, { isHistory: true });
      });
  
      await batch.commit();
  
      // Clear the active notifications from the state
      setNotifications([]);
      setSnackbar({ open: true, message: 'All notifications moved to history', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error clearing notifications', severity: 'error' });
      console.log('Error clearing notifications', error);
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

  const renderNotificationList = (notificationList, isHistory = false) => {
    const formatDate = (timestamp) => {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };
  
    let lastDate = ''; // Track the last rendered date
  
    return (
      <SwipeableList threshold={0.9} fullSwipe>
        {notificationList.map((notification) => {
          const notificationDate = formatDate(notification.timestamp);
  
          // Check if we need to show a new date divider
          const showDateDivider = notificationDate !== lastDate;
          lastDate = notificationDate; // Update last rendered date
  
          return (
            <React.Fragment key={notification.id}>
              {showDateDivider && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: 'gray',
                    fontWeight: 'bold',
                    marginBottom: 1,
                    marginTop: 2,
                  }}
                >
                  {notificationDate}
                </Typography>
              )}
  
              <SwipeableListItem
                swipeLeft={
                  isHistory
                    ? null
                    : {
                        content: (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                              bgcolor: 'primary.main',
                              color: 'white',
                              height: '100%',
                              width: '100%',
                              pl: 2,
                            }}
                          >
                            <ArchiveIcon sx={{ mr: 1 }} />
                            העבר לארכיון
                          </Box>
                        ),
                        action: () => handleMoveToHistory(notification.id),
                      }
                }
                swipeRight={{
                  content: (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        bgcolor: 'error.main',
                        color: 'white',
                        height: '100%',
                        width: '100%',
                        pr: 2,
                      }}
                    >
                      מחיקה
                      <DeleteIcon sx={{ ml: 1 }} />
                    </Box>
                  ),
                  action: () => handleDeleteNotification(notification.id),
                }}
              >
                <ListItem
                  component={Paper}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between', // Align content horizontally
                    alignItems: 'center', // Ensure vertical alignment
                    p: 2,
                    pb: 0,
                    position: 'relative',
                  }}
                >
                    {/* Left Section: Type Header with Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      position: 'absolute',
                      top: 8,
                      left: 16,
                      fontSize: '0.75rem',
                      color: 'gray',
                    }}
                  >
                    {notification.broadcastId ? (
                      <>
                        <BroadcastIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">Broadcast</Typography>
                      </>
                    ) : (
                      <>
                        <SystemIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">System Notification</Typography>
                      </>
                    )}
                  </Box>

                  {/* Notification Content */}
                  <ListItemText
                    primary={notification.content || notification.message || 'No Content Available'}
                    secondary={
                      notification.timestamp
                      ? new Date(notification.timestamp.seconds * 1000).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                        : 'Invalid Date'
                    }
                    // sx={{ mt: 2 }}
                    sx={{ flexGrow: 1, marginRight: 1, marginTop: 2 }} // Make the text take available space
                  />
  
                  {/* Archive/Delete Button Section */}
                  <Box sx={{ display: 'flex', gap: 1 }}> {/* Align buttons horizontally */}
                  {!isHistory ? (
                    <IconButton
                      edge="end"
                      aria-label="archive"
                      onClick={() => handleMoveToHistory(notification.id)}
                    >
                      <ArchiveIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  </Box>
                </ListItem>
              </SwipeableListItem>
            </React.Fragment>
          );
        })}
      </SwipeableList>
    );
  };
  
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
            {showHistory ? 'הסתר היסטוריה' : 'הצג היסטוריה'}
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
              <Typography variant="body2">החלק שמאלה על הודעה להעברה לארכיון וימינה למחיקה </Typography>
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



export const useNotificationCount = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const db = getFirestore();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isHistory', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setNotificationCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [db, user, authLoading]);

  return notificationCount;
};

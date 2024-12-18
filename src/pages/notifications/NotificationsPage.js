import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFirestore, collection, query, where, doc, deleteDoc, onSnapshot, updateDoc, writeBatch, getDoc
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container, Typography, Box, Snackbar, Alert, CircularProgress, Paper,
  ListItem, ListItemText, Button, IconButton, Grid, Avatar, Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon, History as HistoryIcon, Archive as ArchiveIcon, ArrowBack as ArrowBackIcon,
  Campaign as BroadcastIcon, Notifications as SystemIcon, Info as InfoIcon, Settings as SettingsIcon,
  SwipeLeft as SwipeLeftIcon, SwipeRight as SwipeRightIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import NoNotificationsImage from '../../images/completed.svg';



// Check if the user allowed notifications
const canSendNotifications = () => Notification.permission === 'granted';

// // Send browser notifications if allowed
// const sendBrowserNotification = async (title, body) => {
//   try {
//     const registration = await navigator.serviceWorker.ready;
//     registration.showNotification(title, {
//       body,
//       icon: '/images/logo.png',
//       tag: 'notification',
//       renotify: true,
//     });
//   } catch (error) {
//     console.error('Notification error:', error);
//   }
// };



export default function NotificationsPage() {
  const db = getFirestore();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showHistory, setShowHistory] = useState(false);
  const [isBannerVisible, setBannerVisible] = useState(true);

    // Track sent notifications to avoid duplicate alerts
    const [sentNotifications, setSentNotifications] = useState(() =>
      JSON.parse(sessionStorage.getItem('sentNotifications')) || []
    );

  useEffect(() => {
    const bannerClosed = localStorage.getItem('notificationBannerClosed');
    if (bannerClosed === 'true') {
      setBannerVisible(false);
    }
  }, []);

  // useEffect(() => {
  //   if (authLoading) return;

  //   if (!user) {
  //     setLoading(false);
  //     navigate('/login');
  //     return;
  //   }

  //   const fetchNotifications = async () => {
  //     try {
  //       const allNotificationsQuery = query(
  //         collection(db, 'notifications'),
  //         where('userId', '==', user.uid)
  //       );

  //       const unsubscribeAll = onSnapshot(allNotificationsQuery, async (snapshot) => {
  //         const notificationsList = await Promise.all(
  //           snapshot.docs.map(async (docSnapshot) => {
  //             const notification = { id: docSnapshot.id, ...docSnapshot.data() };

  //             if (notification.broadcastId) {
  //               const broadcastRef = doc(db, 'broadcasts', notification.broadcastId);
  //               const broadcastDoc = await getDoc(broadcastRef);

  //               if (broadcastDoc.exists()) {
  //                 notification.content = broadcastDoc.data().content;
  //               } else {
  //                 notification.content = 'הודעת ברודקאסט לא נמצאה.';
  //               }
  //             } else if (notification.type === 'application_submitted' || notification.message) {
  //               notification.content = notification.message || 'התראת מערכת';
  //             }
              
  //             return notification;
  //           })
  //         );

  //         notificationsList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

  //         const activeNotifications = notificationsList.filter((n) => !n.isHistory);
  //         const historyNotifications = notificationsList.filter((n) => n.isHistory);

  //         setNotifications(activeNotifications);
  //         setHistoryNotifications(historyNotifications);
  //       });

  //       setLoading(false);

  //       return () => unsubscribeAll();
  //     } catch (error) {
  //       console.error('Error fetching notifications:', error);
  //       setError('שגיאה בטעינת ההתראות.');
  //       setLoading(false);
  //     }
  //   };

  //   fetchNotifications();
  // }, [db, user, authLoading, navigate]);
  
  let x =5;

  // useEffect(() => {
  //   if (authLoading) return;
  
  //   if (!user) {
  //     setLoading(false);
  //     navigate('/login');
  //     return;
  //   }
  
  //   const fetchNotifications = async () => {
  //     try {
  //       const allNotificationsQuery = query(
  //         collection(db, 'notifications'),
  //         where('userId', '==', user.uid)
  //       );
  
  //       const unsubscribeAll = onSnapshot(allNotificationsQuery, async (snapshot) => {
  //         const notificationsList = await Promise.all(
  //           snapshot.docs.map(async (docSnapshot) => {
  //             const notification = { id: docSnapshot.id, ...docSnapshot.data() };
  
  //             if (notification.broadcastId) {
  //               const broadcastRef = doc(db, 'broadcasts', notification.broadcastId);
  //               const broadcastDoc = await getDoc(broadcastRef);
  
  //               if (broadcastDoc.exists()) {
  //                 notification.content = broadcastDoc.data().content;
  //               } else {
  //                 notification.content = 'הודעת ברודקאסט לא נמצאה.';
  //               }
  //             } else if (notification.type === 'application_submitted' || notification.message) {
  //               notification.content = notification.message || 'התראת מערכת';
  //             }
  
  //             // Send notification only if not already sent
  //             if (!notification.isHistory && !sentNotifications.includes(notification.id)) {
  //               sendBrowserNotification('New Notification', notification.content);
  //               setSentNotifications((prev) => {
  //                 const updatedSent = [...prev, notification.id];
  //                 sessionStorage.setItem('sentNotifications', JSON.stringify(updatedSent));
  //                 return updatedSent;
  //               });
  //             }

  //             return notification;
  //           })
  //         );
  
  //         notificationsList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
  
  //         const activeNotifications = notificationsList.filter((n) => !n.isHistory);
  //         const historyNotifications = notificationsList.filter((n) => n.isHistory);
  
  //         setNotifications(activeNotifications);
  //         setHistoryNotifications(historyNotifications);
  //       });
  
  //       setLoading(false);
  //       return () => unsubscribeAll();
  //     } catch (error) {
  //       console.error('Error fetching notifications:', error);
  //       setError('שגיאה בטעינת ההתראות.');
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchNotifications();
  // }, [db, user, authLoading, navigate, sentNotifications]);

  let xs =5;
  
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
          const notificationsList = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
              const notification = { id: docSnapshot.id, ...docSnapshot.data() };

              if (notification.broadcastId) {
                const broadcastRef = doc(db, 'broadcasts', notification.broadcastId);
                const broadcastDoc = await getDoc(broadcastRef);
                notification.content = broadcastDoc.exists()
                  ? broadcastDoc.data().content
                  : 'הודעת ברודקאסט לא נמצאה.';
              } else {
                notification.content = notification.message || 'התראת מערכת';
              }

              // Send notification only if not already sent
              if (!notification.isHistory && !sentNotifications.includes(notification.id)) {
                // sendBrowserNotification('New Notification', notification.content);
                setSentNotifications((prev) => {
                  const updatedSent = [...prev, notification.id];
                  sessionStorage.setItem('sentNotifications', JSON.stringify(updatedSent));
                  return updatedSent;
                });
              }

              return notification;
            })
          );

          notificationsList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

          setNotifications(notificationsList.filter((n) => !n.isHistory));
          setHistoryNotifications(notificationsList.filter((n) => n.isHistory));
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('שגיאה בטעינת ההתראות.');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [db, user, authLoading, navigate, sentNotifications]);

  let m =5;

  // useEffect(() => {
  //   if (authLoading) return;
  
  //   if (!user) {
  //     setLoading(false);
  //     navigate('/login');
  //     return;
  //   }
  
  //   const notificationsQuery = query(
  //     collection(db, 'notifications'),
  //     where('userId', '==', user.uid)
  //   );
  
  //   const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
  //     snapshot.docs.forEach((docSnapshot) => {
  //       const notification = { id: docSnapshot.id, ...docSnapshot.data() };
  
  //       if (!notification.isHistory && !sentNotifications.includes(notification.id)) {
  //         sendBrowserNotification(
  //           'New Notification',
  //           notification.content || 'You have a new message.'
  //         );
  
  //         setSentNotifications((prev) => {
  //           const updated = [...prev, notification.id];
  //           sessionStorage.setItem('sentNotifications', JSON.stringify(updated));
  //           return updated;
  //         });
  //       }
  //     });
  
  //     setNotifications(snapshot.docs.map((doc) => doc.data()));
  //   });
  
  //   return () => unsubscribe();
  // }, [db, user, authLoading, navigate, sentNotifications]);
  

  const handleMoveToHistory = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isHistory: true });
      setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
      setSnackbar({ open: true, message: 'ההתראה הועברה לארכיון', severity: 'success' });
    } catch (error) {
      console.error('Error moving to history:', error);
      setSnackbar({ open: true, message: 'שגיאה בהעברת ההתראה לארכיון', severity: 'error' });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      if (showHistory) {
        setHistoryNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } else {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
      setSnackbar({ open: true, message: 'ההתראה נמחקה', severity: 'success' });
    } catch (error) {
      console.error('Error deleting notification:', error);
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

      setNotifications([]);
      setSnackbar({ open: true, message: 'כל ההתראות הועברו לארכיון', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'שגיאה בהעברת ההתראות לארכיון', severity: 'error' });
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
      setHistoryNotifications([]);
      setSnackbar({ open: true, message: 'כל ההיסטוריה נמחקה', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'שגיאה במחיקת ההיסטוריה', severity: 'error' });
      console.log('Error deleting history\n', error);
    }
  };

  const handleCloseBanner = () => {
    localStorage.setItem('notificationBannerClosed', 'true');
    setBannerVisible(false);
  };


  const renderNotificationList = (notificationList, isHistory = false) => {
    const formatDate = (timestamp) => {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString('he-IL', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    let lastDate = '';

    return (
      <SwipeableList threshold={0.5}>
        {notificationList.map((notification) => {
          const notificationDate = formatDate(notification.timestamp);
          const showDateDivider = notificationDate !== lastDate;
          lastDate = notificationDate;

          return (
            <React.Fragment key={notification.id}>
              {showDateDivider && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: 'gray',
                    fontWeight: 'bold',
                    marginBottom: 2,
                    marginTop: 4,
                  }}
                >
                  {notificationDate}
                </Typography>
              )}

              <SwipeableListItem
                swipeLeft={{
                  content: (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        bgcolor: 'error.main',
                        color: 'white',
                        height: '100%',
                        width: '100%',
                        pl: 2,
                      }}
                    >
                      <DeleteIcon sx={{ mr: 1 }} />
                      מחיקה
                    </Box>
                  ),
                  action: () => handleDeleteNotification(notification.id),
                }}
                swipeRight={
                  isHistory
                    ? null
                    : {
                        content: (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                              bgcolor: 'primary.main',
                              color: 'white',
                              height: '100%',
                              width: '100%',
                              pr: 2,
                            }}
                          >
                            העבר לארכיון
                            <ArchiveIcon sx={{ ml: 1 }} />
                          </Box>
                        ),
                        action: () => handleMoveToHistory(notification.id),
                      }
                }
              >
                <ListItem
                  component={Paper}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: notification.broadcastId ? 'primary.main' : 'secondary.main',
                      mr: 2,
                    }}
                  >
                    {notification.broadcastId ? (
                      <BroadcastIcon sx={{ transform: 'rotateY(180deg)' }} />
                    ) : (
                      <InfoIcon />
                    )}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {notification.content || notification.message || 'אין תוכן זמין'}
                      </Typography>
                    }
                    secondary={
                      notification.timestamp
                        ? new Date(notification.timestamp.seconds * 1000).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'תאריך לא זמין'
                    }
                  />
                  {!isHistory && (
                    <IconButton onClick={() => handleMoveToHistory(notification.id)}>
                      <ArchiveIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDeleteNotification(notification.id)}>
                    <DeleteIcon />
                  </IconButton>
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => navigate('/notification-settings')}>
              <SettingsIcon />
            </IconButton>
            {/* test
            <IconButton onClick={() => navigate('/notification-test')}>
              <SettingsIcon />
            </IconButton> */}

            <Button
              variant="text"
              onClick={() => setShowHistory(!showHistory)}
              sx={{ color: 'primary.main', textTransform: 'none', fontWeight: 'bold' }}
              startIcon={showHistory ? <ArrowBackIcon /> : <HistoryIcon />}
            >
              {showHistory ? 'חזרה להתראות' : 'ארכיון ההודעות'}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {notifications.length === 0 && !showHistory ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="50vh"
            >
              <img
                src={NoNotificationsImage}
                alt="No notifications"
                style={{ width: '60%', maxWidth: 300, marginBottom: 20 }}
              />
              <Typography variant="h6" align="center" gutterBottom>
                {showHistory ? 'אין היסטוריה זמינה' : 'אין התראות חדשות'}
              </Typography>
              <Typography variant="body1" align="center">
                {showHistory
                  ? 'לא נמצאו התראות בהיסטוריה.'
                  : 'כל ההתראות שלך טופלו בהצלחה. נעדכן אותך כשיגיעו עדכונים חדשים.'}
              </Typography>
            </Box>
          ) : (
            <>
              {isBannerVisible && (
                <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: 'info.light' }}>
                  <Box display="flex" alignItems="center">
                    <Box display="flex" alignItems="center" flexGrow={1}>
                      <SwipeLeftIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.contrastText' }}>
                        החלק שמאלה למחיקה
                      </Typography>
                      <SwipeRightIcon sx={{ mx: 1, fontSize: '1rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.contrastText' }}>
                        וימינה לשמירה בארכיון
                      </Typography>
                    </Box>
                    <IconButton onClick={handleCloseBanner}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Paper>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                {showHistory ? (
                  <Tooltip title="מחק את כל ההיסטוריה">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteAllHistory}
                      startIcon={<DeleteIcon />}
                      sx={{ borderRadius: 20, px: 3 }}
                    >
                      מחק את כל ההיסטוריה
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip title="העבר את כל ההתראות לארכיון">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleClearAllNotifications}
                      startIcon={<ArchiveIcon />}
                      sx={{ borderRadius: 20, px: 3 }}
                    >
                      העבר הכל לארכיון
                    </Button>
                  </Tooltip>
                )}
              </Box>
              {renderNotificationList(showHistory ? historyNotifications : notifications, showHistory)}
            </>
          )}
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

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
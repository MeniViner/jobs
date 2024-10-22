import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Grid,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  History as HistoryIcon,
  Archive as ArchiveIcon,
  Campaign as BroadcastIcon,
  Notifications as SystemIcon,
  Info as InfoIcon,
  SwipeLeft as SwipeLeftIcon,
  SwipeRight as SwipeRightIcon,
} from '@mui/icons-material';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import NoNotificationsImage from '../images/completed.svg';

export default function NotificationsPage() {
  const db = getFirestore();
  const [notifications, setNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showHistory, setShowHistory] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
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
                  notification.content = 'הודעת ברודקאסט לא נמצאה.';
                }
              } else if (notification.type === 'application_submitted' || notification.message) {
                notification.content = notification.message || 'התראת מערכת';
              }

              return notification;
            })
          );

          notificationsList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

          const activeNotifications = notificationsList.filter((n) => !n.isHistory);
          const historyNotifications = notificationsList.filter((n) => n.isHistory);

          setNotifications(activeNotifications);
          setHistoryNotifications(historyNotifications);
        });

        setLoading(false);

        return () => unsubscribeAll();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('שגיאה בטעינת ההתראות.');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [db, user, authLoading, navigate]);

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
          <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box display="flex" justifyContent="stretch" alignItems="stretch" height={60}>
              <Button
                variant={!showHistory ? "contained" : "text"}
                onClick={() => setShowHistory(false)}
                sx={{
                  flex: 1,
                  height: '100%',
                  borderRadius: 0,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: !showHistory ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                startIcon={<SystemIcon />}
              >
                התראות
              </Button>
              <Button
                variant={showHistory ? "contained" : "text"}
                onClick={() => setShowHistory(true)}
                sx={{
                  flex: 1,
                  height: '100%',
                  borderRadius: 0,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: showHistory ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                startIcon={<HistoryIcon />}
              >
                אריכיון
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          {!showHistory ? (
            notifications.length === 0 ? (
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
                  אין התראות חדשות
                </Typography>
                <Typography variant="body1" align="center">
                  כל ההתראות שלך טופלו בהצלחה. נעדכן אותך כשיגיעו עדכונים חדשים.
                </Typography>
              </Box>
            ) : (
              <>
                <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: 'info.light' }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <SwipeLeftIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.contrastText' }}>
                      החלק שמאלה למחיקה
                    </Typography>
                    <SwipeRightIcon sx={{ mx: 1, fontSize: '1rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.contrastText' }}>
                      החלק ימינה לארכיון
                    </Typography>
                  </Box>
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
                </Box>
                {renderNotificationList(notifications)}
              </>
            )
          ) : historyNotifications.length === 0 ? (
            <Typography variant="body2" align="center">אין היסטוריה זמינה.</Typography>
          ) : (
            <>
              <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: 'info.light' }}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <SwipeLeftIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'info.contrastText' }}>
                    החלק שמאלה למחיקה
                  </Typography>
                </Box>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
              </Box>
              {renderNotificationList(historyNotifications, true)}
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
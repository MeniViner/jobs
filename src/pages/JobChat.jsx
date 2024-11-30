// JobChat.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, TextField, IconButton, AppBar,
  Toolbar, Divider, Badge, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Menu, MenuItem, Snackbar, Alert, Button, useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon, ArrowBack as ArrowBackIcon, MoreVert as MoreVertIcon,
  Work as WorkIcon, Delete as DeleteIcon, Chat as ChatIcon, ExitToApp as ExitToAppIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  collection, query, where, onSnapshot, serverTimestamp, orderBy,
  getDocs, updateDoc, deleteDoc, doc, addDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function JobChat() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEmployerView, setIsEmployerView] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setIsEmployerView(!!user.isEmployer);
    }
  }, [user]);

  useEffect(() => {
    if (isEmployerView === null) return;

    const fetchData = async () => {
      setLoading(true);
      if (isEmployerView) {
        const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
        const unsubscribe = onSnapshot(jobsQuery, async (snapshot) => {
          const jobsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            applicantCount: 0,
            unreadCount: 0,
            lastMessageTimestamp: null
          }));

          for (let job of jobsList) {
            const chatsQuery = query(collection(db, 'jobChats'), where('jobId', '==', job.id));
            const chatsSnapshot = await getDocs(chatsQuery);
            job.applicantCount = chatsSnapshot.size;

            let unreadCount = 0;
            let lastMessageTimestamp = null;
            for (let chatDoc of chatsSnapshot.docs) {
              const messagesQuery = query(
                collection(db, 'jobChats', chatDoc.id, 'messages'),
                where('recipientId', '==', user.uid),
                where('read', '==', false)
              );
              const messagesSnapshot = await getDocs(messagesQuery);
              unreadCount += messagesSnapshot.size;

              if (chatDoc.data().timestamp && (!lastMessageTimestamp || chatDoc.data().timestamp.toDate() > lastMessageTimestamp)) {
                lastMessageTimestamp = chatDoc.data().timestamp.toDate();
              }
            }
            job.unreadCount = unreadCount;
            job.lastMessageTimestamp = lastMessageTimestamp;
          }

          jobsList.sort((a, b) => {
            if (a.lastMessageTimestamp && b.lastMessageTimestamp) {
              return b.lastMessageTimestamp - a.lastMessageTimestamp;
            }
            return 0;
          });

          setJobs(jobsList);
          setLoading(false);

          if (jobId) {
            const selectedJob = jobsList.find(job => job.id === jobId);
            if (selectedJob) {
              setSelectedJob(selectedJob);
              fetchChatsForJob(selectedJob.id);
            }
          }
        });
        return () => unsubscribe();
      } else {
        const chatsQuery = query(collection(db, 'jobChats'), where('applicantId', '==', user.uid));
        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          const chatsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            unreadCount: 0
          }));

          for (let chat of chatsList) {
            const messagesQuery = query(
              collection(db, 'jobChats', chat.id, 'messages'),
              where('recipientId', '==', user.uid),
              where('read', '==', false)
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            chat.unreadCount = messagesSnapshot.size;
          }

          chatsList.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp.toDate() - a.timestamp.toDate();
            }
            return 0;
          });

          setChats(chatsList);
          setLoading(false);

          if (jobId) {
            const selectedChat = chatsList.find(chat => chat.jobId === jobId);
            if (selectedChat) {
              setSelectedChat(selectedChat);
              fetchMessages(selectedChat.id);
            }
          }
        });
        return () => unsubscribe();
      }
    };

    fetchData();
  }, [user, jobId, isEmployerView]);

  const fetchChatsForJob = async (jobId) => {
    const chatsQuery = query(
      collection(db, 'jobChats'),
      where('jobId', '==', jobId)
    );
    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      let chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        unreadCount: 0
      }));

      for (let chat of chatList) {
        const messagesQuery = query(
          collection(db, 'jobChats', chat.id, 'messages'),
          where('recipientId', '==', user.uid),
          where('read', '==', false)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        chat.unreadCount = messagesSnapshot.size;
      }

      chatList.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.toDate() - a.timestamp.toDate();
        }
        return 0;
      });

      setChats(chatList);
    });

    return () => unsubscribe();
  };

  const fetchMessages = async (chatId) => {
    const messagesQuery = query(
      collection(db, 'jobChats', chatId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messageList);
      scrollToBottom();
    });

    return () => unsubscribe();
  };

  const markMessagesAsRead = async (chatId) => {
    const messagesQuery = query(
      collection(db, 'jobChats', chatId, 'messages'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const updatePromises = messagesSnapshot.docs.map(doc =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);

    setChats(prevChats => {
      const updatedChats = prevChats.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      );
      return updatedChats;
    });

    if (isEmployerView) {
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id === selectedJob.id) {
            return { ...job, unreadCount: job.unreadCount - messagesSnapshot.size };
          }
          return job;
        });
      });
    }
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setSelectedChat(null);
    fetchChatsForJob(job.id);
  };

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat.id);
    await markMessagesAsRead(chat.id);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;

    const recipientId = selectedChat.applicantId === user.uid ? selectedChat.employerId : selectedChat.applicantId;

    const messageData = {
      text: newMessage,
      senderId: user.uid,
      recipientId: recipientId,
      senderName: user.name || 'Anonymous',
      timestamp: serverTimestamp(),
      read: false
    };

    await addDoc(collection(db, 'jobChats', selectedChat.id, 'messages'), messageData);

    const chatRef = doc(db, 'jobChats', selectedChat.id);
    await updateDoc(chatRef, { timestamp: serverTimestamp() });

    if (isEmployerView) {
      const jobRef = doc(db, 'jobs', selectedChat.jobId);
      await updateDoc(jobRef, { lastMessageTimestamp: serverTimestamp() });

      setJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job =>
          job.id === selectedChat.jobId ? { ...job, lastMessageTimestamp: new Date() } : job
        );
        return updatedJobs.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
      });
    }

    setNewMessage('');
    scrollToBottom();

    setChats(prevChats => {
      const updatedChats = prevChats.map(chat =>
        chat.id === selectedChat.id ? { ...chat, timestamp: new Date() } : chat
      );
      return updatedChats.sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      const messagesQuery = query(collection(db, 'jobChats', chatToDelete.id, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'jobChats', chatToDelete.id));

      setChats(chats.filter(chat => chat.id !== chatToDelete.id));
      if (selectedChat && selectedChat.id === chatToDelete.id) {
        setSelectedChat(null);
        setMessages([]);
      }
      setChatToDelete(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה במחיקת השיחה',
        severity: 'warning',
      });
    }
  };

  const handleDeleteJobChat = async (job) => {
    try {
      const chatsQuery = query(collection(db, 'jobChats'), where('jobId', '==', job.id));
      const chatsSnapshot = await getDocs(chatsQuery);

      for (let chatDoc of chatsSnapshot.docs) {
        const messagesQuery = query(collection(db, 'jobChats', chatDoc.id, 'messages'));
        const messagesSnapshot = await getDocs(messagesQuery);
        const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        await deleteDoc(chatDoc.ref);
      }

      setJobs(jobs.filter(j => j.id !== job.id));
      if (selectedJob && selectedJob.id === job.id) {
        setSelectedJob(null);
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting job chat:", error);
      setSnackbar({
        open: true,
        message: 'אירעה שגיאה במחיקת שיחות העבודה',
        severity: 'warning',
      });
    }
  };

  const handleExitChat = () => {
    setSelectedChat(null);
    setMessages([]);
    if (isEmployerView) {
      setSelectedJob(null);
    }
  };

  // רכיב ChatListItem
  const ChatListItem = ({ chat }) => {
    const [anchorElChat, setAnchorElChat] = useState(null);

    const profileName = isEmployerView ? chat.applicantName : chat.employerName;
    const profileId = isEmployerView ? chat.applicantId : chat.employerId;
    const profilePhotoURL = isEmployerView ? chat.applicantPhotoURL : chat.employerPhotoURL;

    return (
      <ListItem
        button
        onClick={() => handleChatSelect(chat)}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:last-child': { borderBottom: 'none' },
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ListItemAvatar>
          <Link to={`/user/${profileId}`} style={{ textDecoration: 'none' }}>
          <Avatar
            src={user.profileURL || user.photoURL || '/placeholder.svg'}
            alt={user.name || 'User'}
            sx={{ width: 32, height: 32 }}
          />
          </Link>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Link to={`/user/${profileId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {profileName}
            </Link>
          }
          secondary={
            <Link to={`/user/${profileId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {profileName}
            </Link>
          }
          primaryTypographyProps={{ fontWeight: 'medium' }}
        />
        {chat.unreadCount > 0 && (
          <Badge badgeContent={chat.unreadCount} color="error" sx={{ mr: 1 }}>
            <ChatIcon color="action" />
          </Badge>
        )}
        <IconButton
          edge="end"
          aria-label="more"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorElChat(e.currentTarget);
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorElChat}
          open={Boolean(anchorElChat)}
          onClose={() => {
            setAnchorElChat(null);
          }}
        >
          <MenuItem
            onClick={() => {
              setChatToDelete(chat);
              setOpenDeleteDialog(true);
              setAnchorElChat(null);
            }}
          >
            מחק שיחה
          </MenuItem>
        </Menu>
      </ListItem>
    );
  };

  // רכיב JobListItem
  const JobListItem = ({ job }) => {
    const [anchorElJob, setAnchorElJob] = useState(null);

    return (
      <ListItem
        button
        onClick={() => handleJobSelect(job)}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:last-child': { borderBottom: 'none' },
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <WorkIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Link to={`/job/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              {job.title}
            </Link>
          }
          secondary={`${job.applicantCount} מועמדים`}
          primaryTypographyProps={{ fontWeight: 'medium' }}
        />
        {job.unreadCount > 0 && (
          <Badge badgeContent={job.unreadCount} color="error" sx={{ mr: 1 }}>
            <ChatIcon color="action" />
          </Badge>
        )}
        <IconButton
          edge="end"
          aria-label="more"
          onClick={(e) => {
            e.stopPropagation();
            setAnchorElJob(e.currentTarget);
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorElJob}
          open={Boolean(anchorElJob)}
          onClose={() => {
            setAnchorElJob(null);
          }}
        >
          <MenuItem
            onClick={() => {
              handleDeleteJobChat(job);
              setAnchorElJob(null);
            }}
          >
            מחק שיחות עבודה
          </MenuItem>
        </Menu>
      </ListItem>
    );
  };

  const renderChatList = () => (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {chats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
    </List>
  );

  const renderJobList = () => (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {jobs.map((job) => (
        <JobListItem key={job.id} job={job} />
      ))}
    </List>
  );

  const renderMessages = () => (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
        bgcolor: 'background.default',
        backgroundImage: 'url(/chat-background.png)',
        backgroundSize: 'cover',
      }}
      ref={chatContainerRef}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.senderId === user.uid ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Box
            sx={{
              maxWidth: '70%',
              p: 1.5,
              borderRadius: 2,
              bgcolor: message.senderId === user.uid ? 'primary.main' : 'grey.200',
              color: message.senderId === user.uid ? 'primary.contrastText' : 'text.primary',
              boxShadow: 1,
            }}
          >
            <Typography variant="body1">{message.text}</Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
              {message.timestamp?.toDate().toLocaleString()}
            </Typography>
          </Box>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar position="fixed" color="inherit" elevation={1}>
        <Toolbar>
          {(selectedJob || selectedChat) && (
            <IconButton edge="start" color="inherit" onClick={() => {
              if (selectedChat) {
                handleExitChat();
              } else {
                setSelectedJob(null);
              }
            }} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedChat ? (isEmployerView ? selectedChat.applicantName : selectedChat.employerName) : (isEmployerView ? 'הודעות מעסיק' : 'הודעות עובד')}
          </Typography>
          {selectedChat && (
            <Button
              color="inherit"
              startIcon={<ExitToAppIcon />}
              onClick={handleExitChat}
            >
              יציאה מהצ'אט
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />

      {/* Content */}
      <Box sx={{ display: 'flex', height: `calc(100% - ${isMobile ? '56px' : '64px'})`, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Sidebar */}
        {(!selectedChat || isMobile) && (
          <Box sx={{ width: isMobile ? '100%' : 300, borderRight: isMobile ? 'none' : '1px solid', borderColor: 'divider', overflowY: 'auto' }}>
            {isEmployerView ? (
              selectedJob ? (
                <Box>
                  <Typography variant="h6" sx={{ p: 2 }}>
                    {selectedJob.title}
                  </Typography>
                  <Divider />
                  {renderChatList()}
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ p: 2 }}>
                    המשרות שלך
                  </Typography>
                  <Divider />
                  {renderJobList()}
                </Box>
              )
            ) : (
              <Box>
                <Typography variant="h6" sx={{ p: 2 }}>
                  השיחות שלך
                </Typography>
                <Divider />
                {renderChatList()}
              </Box>
            )}
          </Box>
        )}

        {/* Chat Area */}
        {selectedChat && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {renderMessages()}

            {/* Message Input */}
            <Box sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
            }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="הקלד הודעה..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                sx={{ mr: 1 }}
              />
              <IconButton color="primary" onClick={handleSendMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Delete Chat Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"מחיקת שיחה"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            האם אתה בטוח שברצונך למחוק את השיחה הזו? פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>ביטול</Button>
          <Button onClick={handleDeleteChat} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

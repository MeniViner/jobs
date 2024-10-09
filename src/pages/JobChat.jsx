import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  TextField, 
  Button,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Chat as ChatIcon, Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function JobChat() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEmployerView, setIsEmployerView] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const { jobId } = useParams();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => { 
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sortChats = (a, b) => {
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    const aTime = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
    const bTime = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
    return bTime - aTime;
  };

  useEffect(() => {
    if (!user) return;

    const fetchJobsAndChats = async () => {
      setLoading(true);
      if (isEmployerView) {
        const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), applicantCount: 0, unreadCount: 0, lastMessageTimestamp: null }));

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

        if (jobId) {
          const selectedJob = jobsList.find(job => job.id === jobId);
          if (selectedJob) {
            setSelectedJob(selectedJob);
            fetchChatsForJob(selectedJob.id);
          }
        }
      } else {
        const chatsQuery = query(collection(db, 'jobChats'), where('applicantId', '==', user.uid));
        const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
          let chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), unreadCount: 0 }));

          for (let chat of chatList) {
            const messagesQuery = query(
              collection(db, 'jobChats', chat.id, 'messages'),
              where('recipientId', '==', user.uid),
              where('read', '==', false)
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            chat.unreadCount = messagesSnapshot.size;
          }

          chatList.sort(sortChats);

          setChats(chatList);
          setLoading(false);

          if (jobId) {
            const selectedChat = chatList.find(chat => chat.jobId === jobId);
            if (selectedChat) {
              setSelectedChat(selectedChat);
              fetchMessages(selectedChat.id);
              scrollToBottom();
            }
          }
        });

        return () => unsubscribe();
      }
      setLoading(false);
    };

    fetchJobsAndChats();
  }, [user, jobId, isEmployerView]);

  const fetchChatsForJob = async (jobId) => {
    const chatsQuery = query(
      collection(db, 'jobChats'),
      where('jobId', '==', jobId)
    );
    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      let chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), unreadCount: 0 }));

      for (let chat of chatList) {
        const messagesQuery = query(
          collection(db, 'jobChats', chat.id, 'messages'),
          where('recipientId', '==', user.uid),
          where('read', '==', false)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        chat.unreadCount = messagesSnapshot.size;
      }

      chatList.sort(sortChats);

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
      return updatedChats.sort(sortChats);
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

  const handleJobClick = (job) => {
    setSelectedJob(job);
    fetchChatsForJob(job.id);
    setSelectedChat(null);
    setMessages([]);
  };

  const handleChatClick = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat.id);
    await markMessagesAsRead(chat.id);
    scrollToBottom();
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;

    const recipientId = selectedChat.applicantId === user.uid ? selectedChat.employerId : selectedChat.applicantId;

    const messageData = {
      text: newMessage,
      senderId: user.uid,
      recipientId: recipientId,
      senderName: user.displayName || 'Anonymous',
      timestamp: serverTimestamp(),
      read: false
    };

    await addDoc(collection(db, 'jobChats', selectedChat.id, 'messages'), messageData);

    // Update chat timestamp
    const chatRef = doc(db, 'jobChats', selectedChat.id);
    await updateDoc(chatRef, { timestamp: serverTimestamp() });

    // Update job's last message timestamp
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

    // Reorder chats without increasing unread count for the sender
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => 
        chat.id === selectedChat.id ? { ...chat, timestamp: new Date() } : chat
      );
      return updatedChats.sort(sortChats);
    });
  };

  const handleNewChat = async (job) => {
    const newChat = {
      jobId: job.id,
      jobTitle: job.title,
      applicantId: user.uid,
      applicantName: user.displayName || 'Anonymous',
      employerId: job.employerId,
      employerName: job.employerName || 'Anonymous',
      timestamp: serverTimestamp()
    };

    const chatRef = await addDoc(collection(db, 'jobChats'), newChat);
    setSelectedChat({ id: chatRef.id, ...newChat });
    navigate(`/job-chat/${job.id}`);
  };

  const toggleView = () => {
    setIsEmployerView(!isEmployerView);
    setSelectedJob(null);
    setSelectedChat(null);
    setMessages([]);
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
      alert('אירעה שגיאה במחיקת השיחה');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <FormControlLabel
        control={<Switch checked={isEmployerView} onChange={toggleView} />}
        label={isEmployerView ? "תצוגת מעסיק" : "תצוגת עובד"}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Paper elevation={3} sx={{ width: '30%', mr: 2, overflow: 'auto' }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            {isEmployerView ? 'עבודות' : 'צ\'אטים'}
          </Typography>
          <List>
            {isEmployerView
              ? jobs.map((job) => (
                  <ListItem 
                    button 
                    key={job.id} 
                    onClick={() => handleJobClick(job)}
                    selected={selectedJob && selectedJob.id === job.id}
                  >
                    <ListItemText 
                      primary={job.title} 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" component="span">
                            {job.applicantCount} מועמדים
                          </Typography>
                        </Box>
                      } 
                    />
                    {job.unreadCount > 0 && (
                      <Badge badgeContent={job.unreadCount} color="primary">
                        <ChatIcon />
                      </Badge>
                    )}
                  </ListItem>
                ))
              : chats.map((chat) => (
                  <ListItem 
                    button 
                    key={chat.id} 
                    onClick={() => handleChatClick(chat)}
                    selected={selectedChat && selectedChat.id === chat.id}
                  >
                    <ListItemText 
                      primary={chat.jobTitle} 
                      secondary={chat.employerName} 
                    />
                    {chat.unreadCount > 0 && (
                      <Badge badgeContent={chat.unreadCount} color="primary">
                        <ChatIcon />
                      </Badge>
                    )}
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(chat);
                        
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))
            }
          </List>
        </Paper>
        <Paper elevation={3} sx={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
          {isEmployerView && selectedJob && !selectedChat ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">{selectedJob.title}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {selectedJob.applicantCount} מועמדים
              </Typography>
              <List>
                {chats.map((chat) => (
                  <ListItem 
                    button 
                    key={chat.id} 
                    onClick={() => handleChatClick(chat)}
                  >
                    <Avatar sx={{ mr: 2 }}>{chat.applicantName && chat.applicantName[0]}</Avatar>
                    <ListItemText 
                      primary={chat.applicantName} 
                      secondary={`הודעות חדשות: ${chat.unreadCount}`} 
                    />
                    {chat.unreadCount > 0 && (
                      <Badge badgeContent={chat.unreadCount} color="primary">
                        <ChatIcon />
                      </Badge>
                    )}
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(chat);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : selectedChat ? (
            <>
              <Typography variant="h6" sx={{ p: 2 }}>
                {selectedChat.jobTitle} - {isEmployerView ? selectedChat.applicantName : selectedChat.employerName}
              </Typography>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '500px', p: 2, display: 'flex', flexDirection: 'column' }}>
                {messages.map((message) => (
                  <Box 
                    key={message.id} 
                    sx={{ 
                      mb: 1, 
                      alignSelf: message.senderId === user.uid ? 'flex-end' : 'flex-start',
                      maxWidth: '70%'
                    }}
                  >
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 1, 
                        backgroundColor: message.senderId === user.uid ? 'primary.main' : 'grey.300',
                        color: message.senderId === user.uid ? 'white' : 'black',
                        borderRadius: message.senderId === user.uid ? '20px 20px 0 20px' : '20px 20px 20px 0'
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>
                      <Typography variant="caption" display="block" color={message.senderId === user.uid ? 'white' : 'text.secondary'}>
                        {message.senderName} - {message.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="הקלד הודעה..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleSendMessage} 
                    endIcon={<SendIcon />}
                  >
                    שלח
                  </Button>
                </Box>
              </Box>
            </>
          ) : !isEmployerView ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">בחר צ'אט או התחל צ'אט חדש</Typography>
              <List>
                {jobs.map((job) => (
                  <ListItem 
                    button 
                    key={job.id} 
                    onClick={() => handleNewChat(job)}
                  >
                    <ListItemText primary={job.title} secondary={`מעסיק: ${job.employerName}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ p: 2 }}>
              בחר עבודה מהרשימה כדי לראות את הצ'אטים הקשורים
            </Typography>
          )}
        </Paper>
      </Box>
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
    </Box>
  );
}
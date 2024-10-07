import React, { useState, useEffect, useContext } from 'react';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Box, 
  TextField, 
  Button,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  Chip
} from '@mui/material';
import { Chat as ChatIcon, Send as SendIcon, Person as PersonIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs } from 'firebase/firestore';
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
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchJobsAndChats = async () => {
      setLoading(true);
      if (isEmployerView) {
        const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), applicantCount: 0 }));
        
        for (let job of jobsList) {
          const chatsQuery = query(collection(db, 'jobChats'), where('jobId', '==', job.id));
          const chatsSnapshot = await getDocs(chatsQuery);
          job.applicantCount = chatsSnapshot.size;
        }
        
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
        const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
          const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setChats(chatList);
          setLoading(false);

          if (jobId) {
            const selectedChat = chatList.find(chat => chat.jobId === jobId);
            if (selectedChat) {
              setSelectedChat(selectedChat);
              fetchMessages(selectedChat.id);
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
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    });

    return () => unsubscribe();
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    fetchChatsForJob(job.id);
    setSelectedChat(null);
    setMessages([]);
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;

    await addDoc(collection(db, 'jobChats', selectedChat.id, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      timestamp: serverTimestamp()
    });

    setNewMessage('');
  };

  const handleNewChat = async (job) => {
    const newChat = {
      jobId: job.id,
      jobTitle: job.title,
      applicantId: user.uid,
      applicantName: user.displayName || 'Anonymous',
      employerId: job.employerId,
      employerName: job.employerName || 'Anonymous',
      createdAt: serverTimestamp()
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

  const getUnreadMessagesCount = (chat) => {
    if (!chat || !messages) return 0;
    return messages.filter(message => message.senderId !== user.uid && !message.read).length;
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
                          <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" component="span">
                            {job.applicantCount} מועמדים
                          </Typography>
                        </Box>
                      } 
                    />
                    <Chip label={job.applicantCount} color="primary" size="small" />
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
                      secondary={isEmployerView ? chat.applicantName : chat.employerName} 
                    />
                    <Badge badgeContent={getUnreadMessagesCount(chat)} color="primary">
                      <ChatIcon />
                    </Badge>
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
                      secondary={`הודעות חדשות: ${getUnreadMessagesCount(chat)}`} 
                    />
                    <Badge badgeContent={getUnreadMessagesCount(chat)} color="primary">
                      <ChatIcon />
                    </Badge>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : selectedChat ? (
            <>
              <Typography variant="h6" sx={{ p: 2 }}>
                {selectedChat.jobTitle} - {isEmployerView ? selectedChat.applicantName : selectedChat.employerName}
              </Typography>
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
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
                        {message.senderName} - {message.timestamp?.toDate().toLocaleString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
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
    </Box>
  );
}
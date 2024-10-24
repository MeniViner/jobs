// FeedbackManager.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Typography, Paper, Stack, Avatar, CircularProgress, Button 
} from '@mui/material';
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Component to Send Feedback
export const SendFeedback = () => {
  const [message, setMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, 'feedback'), {
        message,
        userId: user?.uid || 'אנונימי',
        timestamp: serverTimestamp(),
        isArchived: false,
      });
      setMessage('');
      setFeedbackSent(true);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        שתף אותנו במה שיש לך לומר
      </Typography>
      <TextField
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        placeholder="כתוב כאן את המשוב שלך..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
        disabled={!message.trim()}
      >
        שלח משוב
      </Button>
      {feedbackSent && (
        <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
          תודה על המשוב! הודעתך נשלחה בהצלחה.
        </Typography>
      )}
    </Box>
  );
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('he-IL', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,  // 24-hour format
  }).format(date);
};

// Component to Manage Feedbacks in Admin Panel
export const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        const feedbackSnapshot = await getDocs(feedbackQuery);

        const feedbackList = await Promise.all(
          feedbackSnapshot.docs.map(async (doc) => {
            const feedbackData = doc.data();
            const userData = await fetchUserData(feedbackData.userId);

            // Convert Firestore Timestamp to JS Date
            const timestamp = feedbackData.timestamp?.toDate
            ? feedbackData.timestamp.toDate()
            : new Date(feedbackData.timestamp);

            return {
              id: doc.id,
              ...feedbackData,
              timestamp,  // Store the converted timestamp
              user: userData,
            };
          })
        );

        setFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async (userId) => {
      if (!userId || userId === 'אנונימי') {
        return { name: 'משתמש אנונימי', profileURL: '/placeholder.svg' };
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          return {
            name: userData.name || 'משתמש ללא שם',
            profileURL: userData.profileURL || userData.photoURL ,
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      return { name: 'משתמש לא ידוע', profileURL: '/placeholder.svg' };
    };

    fetchFeedbacks();
  }, [db]);

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const moveToArchive = async (id) => {
    try {
      const feedbackRef = doc(db, 'feedback', id);
      await updateDoc(feedbackRef, { isArchived: true });
      setFeedbacks(feedbacks.map((fb) => fb.id === id ? { ...fb, isArchived: true } : fb));
    } catch (error) {
      console.error('Error moving to archive:', error);
    }
  };
  
  const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };  

  const FeedbackItem = ({ feedback, onArchive, onDelete }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar src={feedback.user.profileURL} alt={feedback.user.name} sx={{ width: 50, height: 50 }} />
      <Box>
        <Typography variant="h6">{feedback.user.name}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          onClick={() => navigate(`/user/${feedback.userId}`)}
          sx={{ cursor: 'pointer' }}
        >
          הצג פרופיל
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(feedback.timestamp)}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {feedback.message}
        </Typography>
      </Box>
      {!feedback.isArchived && (
        <Button variant="outlined" color="primary" onClick={onArchive}>
          העבר לארכיון
        </Button>
      )}
      <Button variant="outlined" color="error" onClick={onDelete}>
        מחק
      </Button>
    </Paper>
  );
  
  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        משוב משתמשים
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="חפש לפי משתמש או תוכן ההודעה..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Stack spacing={2}>
        {filteredFeedbacks
          .filter((feedback) => !feedback.isArchived)
          .map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              onArchive={() => moveToArchive(feedback.id)}
              onDelete={() => deleteFeedback(feedback.id)}
            />
          ))}

        <Typography variant="h6" sx={{ mt: 4 }}>
          הודעות בארכיון
        </Typography>
        {filteredFeedbacks
          .filter((feedback) => feedback.isArchived)
          .map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              feedback={feedback}
              onDelete={() => deleteFeedback(feedback.id)}
            />
          ))}
      </Stack>

    </Box>
  );
};

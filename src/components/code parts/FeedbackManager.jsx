// FeedbackManager.js
import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Typography, Paper, Stack, Avatar, CircularProgress, Button 
} from '@mui/material';
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc 
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

// Component to Manage Feedbacks in Admin Panel
export const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        const feedbackSnapshot = await getDocs(feedbackQuery);

        const feedbackList = await Promise.all(
          feedbackSnapshot.docs.map(async (doc) => {
            const feedbackData = doc.data();
            const userData = await fetchUserData(feedbackData.userId);
            return {
              id: doc.id,
              ...feedbackData,
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
            profileURL: userData.pictureURL || userData.profileURL,
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
        {filteredFeedbacks.map((feedback) => (
          <Paper key={feedback.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={feedback.user.pictureURL || feedback.user.profileURL}
              alt={feedback.user.name}
              sx={{ width: 50, height: 50 }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {feedback.user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(feedback.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {feedback.message}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

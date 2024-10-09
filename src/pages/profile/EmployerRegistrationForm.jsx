import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, Container, Paper, 
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase'; // Import Firebase config

export default function EmployerRegistrationForm() {
  const navigate = useNavigate();
  const [employerDetails, setEmployerDetails] = useState({
    companyName: '',
    companyDescription: '',
    businessType: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isLoading, setIsLoading] = useState(true);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    const checkExistingRequest = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().pendingEmployer) {
          setHasPendingRequest(true);
        }
      }
      setIsLoading(false);
    };

    checkExistingRequest();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      setSnackbar({ open: true, message: 'User not authenticated', severity: 'error' });
      return;
    }

    try {
      await setDoc(doc(db, 'employers', user.uid), {
        ...employerDetails,
        userId: user.uid,
        createdAt: new Date(),
        status: 'pending'
      });

      // Update user document to indicate pending employer status
      await setDoc(doc(db, 'users', user.uid), { pendingEmployer: true }, { merge: true });

      setSnackbar({ open: true, message: 'Registration submitted successfully', severity: 'success' });
      setHasPendingRequest(true);
    } catch (error) {
      console.error("Error submitting employer registration: ", error);
      setSnackbar({ open: true, message: 'Error submitting registration', severity: 'error' });
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            חזרה
          </Button>
          <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
            הרשמה כמעסיק
          </Typography>
        </Box>

        {hasPendingRequest ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              בקשתך להירשם כמעסיק ממתינה לאישור. אנא המתן לתשובה.
            </Alert>
            <Typography variant="body1" sx={{ mt: 2 }}>
              תודה על הגשת הבקשה. צוות שלנו יבדוק אותה בהקדם האפשרי.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/account')}
              sx={{ mt: 3 }}
            >
              חזרה לדף החשבון
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="שם חברה"
              name="companyName"
              value={employerDetails.companyName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="סוג עסק"
              name="businessType"
              value={employerDetails.businessType}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="תיאור חברה"
              name="companyDescription"
              value={employerDetails.companyDescription}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 4 }}
            >
              שלח בקשת רישום
            </Button>
          </form>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
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
    businessType: '',
    description: '',
    email: '',
    phone: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isLoading, setIsLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      setIsLoading(true);
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.isEmployer) {
              navigate('/account');
            } else if (userData.employerRequestStatus === 'pending') {
              setUserStatus('pending');
            } else {
              setUserStatus('eligible');
            }
          } else {
            setUserStatus('eligible');
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setSnackbar({ open: true, message: 'Error checking user status', severity: 'error' });
        }
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    };

    checkUserStatus();
  }, [navigate]);

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

    setIsLoading(true);
    try {
      await setDoc(doc(db, 'employers', user.uid), {
        ...employerDetails,
        userId: user.uid,
        createdAt: new Date(),
        status: 'pending',
        approved: false
      });

      // Update user document to indicate pending employer status
      // await setDoc(doc(db, 'users', user.uid), { employerRequestStatus: 'pending' }, { merge: true });
      await setDoc(doc(db, 'users', user.uid), { employerRequestStatus: 'pending', pendingEmployer: true }, { merge: true });


      setSnackbar({ open: true, message: 'הרישום נשלח בהצלחה', severity: 'success' });
      setUserStatus('pending');
    } catch (error) {
      console.error("Error submitting employer registration: ", error);
      setSnackbar({ open: true, message: 'Error submitting registration', severity: 'error' });
    }
    setIsLoading(false);
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

        {userStatus === 'pending' ? (
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
              name="description"
              value={employerDetails.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="אימייל"
              name="email"
              type="email"
              value={employerDetails.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="טלפון"
              name="phone"
              value={employerDetails.phone}
              onChange={handleInputChange}
              margin="normal"
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Container, Typography, Grid, Button, Card, CardContent, CardActions, CircularProgress, Box } from '@mui/material';
import { Business, Category, Description, Email, Phone } from '@mui/icons-material';

export default function EmployerApprovalRequests() {
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const fetchPendingEmployers = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(collection(db, 'users'), where('pendingEmployer', '==', true));
        const querySnapshot = await getDocs(q);
        const employers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingEmployers(employers);
      } catch (error) {
        console.error('Error fetching pending employers:', error);
        setError('שגיאה בטעינת בקשות מעסיקים');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEmployers();
  }, []);

  const handleApproval = async (employerId, approved) => {
    try {
      const userRef = doc(db, 'users', employerId);
      const updates = {
        isEmployer: approved,
        pendingEmployer: false,
        role: approved ? 'employer' : 'user'
      };
      await updateDoc(userRef, updates);
      setPendingEmployers(prevState => prevState.filter(employer => employer.id !== employerId));
      alert(approved ? 'המעסיק אושר בהצלחה' : 'בקשת המעסיק נדחתה');
    } catch (error) {
      console.error('Error updating employer status:', error);
      alert('שגיאה בעדכון סטטוס המעסיק');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" align="center">{error}</Typography>;
  }

  if (pendingEmployers.length === 0) {
    return <Typography variant="body1" align="center">אין בקשות מעסיקים ממתינות לאישור</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom align="center">
        בקשות מעסיקים ממתינות לאישור
      </Typography>
      <Grid container spacing={3}>
        {pendingEmployers.map(employer => (
          <Grid item xs={12} key={employer.id}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {employer.employerDetails.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                  סוג עסק: {employer.employerDetails.businessType}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                  תיאור: {employer.employerDetails.companyDescription}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                  אימייל: {employer.employerDetails.contactEmail}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  טלפון: {employer.employerDetails.contactPhone}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  onClick={() => handleApproval(employer.id, true)}
                  variant="contained"
                  color="success"
                >
                  אישור
                </Button>
                <Button 
                  onClick={() => handleApproval(employer.id, false)}
                  variant="contained"
                  color="error"
                >
                  דחייה
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
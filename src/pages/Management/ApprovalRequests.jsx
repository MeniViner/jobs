import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { Container, Typography, Grid, Button, Card, CardContent, CardActions, CircularProgress, Box, Tabs, Tab, Badge } from '@mui/material';
import { Business, Category, Description, Email, Phone, Person, Delete } from '@mui/icons-material';

export default function ApprovalRequests() {
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const employerQuery = query(collection(db, 'users'), where('pendingEmployer', '==', true));
        const deletionQuery = query(collection(db, 'users'), where('pendingDeletion', '==', true));
        
        const [employerSnapshot, deletionSnapshot] = await Promise.all([
          getDocs(employerQuery),
          getDocs(deletionQuery)
        ]);

        const employers = employerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const deletions = deletionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setPendingEmployers(employers);
        setPendingDeletions(deletions);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setError('שגיאה בטעינת בקשות');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApproval = async (userId, approved, isEmployerRequest) => {
    try {
      const userRef = doc(db, 'users', userId);
      if (isEmployerRequest) {
        const updates = {
          isEmployer: approved,
          pendingEmployer: false,
          role: approved ? 'employer' : 'user'
        };
        await updateDoc(userRef, updates);
        setPendingEmployers(prevState => prevState.filter(employer => employer.id !== userId));
        alert(approved ? 'המעסיק אושר בהצלחה' : 'בקשת המעסיק נדחתה');
      } else {
        if (approved) {
          // Delete user from Firebase Authentication
          const user = auth.currentUser;
          if (user) {
            await deleteUser(user);
          }
          // Delete user document from Firestore
          await deleteDoc(userRef);
          setPendingDeletions(prevState => prevState.filter(user => user.id !== userId));
          alert('החשבון נמחק בהצלחה');
        } else {
          await updateDoc(userRef, { pendingDeletion: false });
          setPendingDeletions(prevState => prevState.filter(user => user.id !== userId));
          alert('בקשת מחיקת החשבון נדחתה');
        }
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('שגיאה בעדכון סטטוס הבקשה');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom align="center">
        בקשות ממתינות לאישור
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab 
          label={
            <Badge badgeContent={pendingEmployers.length} color="primary" max={99}>
              בקשות מעסיקים
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={pendingDeletions.length} color="error" max={99}>
              בקשות מחיקת חשבון
            </Badge>
          } 
        />
      </Tabs>
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {pendingEmployers.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">אין בקשות מעסיקים ממתינות לאישור</Typography>
            </Grid>
          ) : (
            pendingEmployers.map(employer => (
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
                      onClick={() => handleApproval(employer.id, true, true)}
                      variant="contained"
                      color="success"
                    >
                      אישור
                    </Button>
                    <Button 
                      onClick={() => handleApproval(employer.id, false, true)}
                      variant="contained"
                      color="error"
                    >
                      דחייה
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {pendingDeletions.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">אין בקשות מחיקת חשבון ממתינות לאישור</Typography>
            </Grid>
          ) : (
            pendingDeletions.map(user => (
              <Grid item xs={12} 
              key={user.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {user.displayName || user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                      אימייל: {user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <Delete sx={{ mr: 1, verticalAlign: 'middle' }} />
                      סיבת המחיקה: {user.deletionReason}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      onClick={() => handleApproval(user.id, true, false)}
                      variant="contained"
                      color="error"
                    >
                      אישור מחיקה
                    </Button>
                    <Button 
                      onClick={() => handleApproval(user.id, false, false)}
                      variant="contained"
                      color="primary"
                    >
                      דחיית בקשת מחיקה
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}
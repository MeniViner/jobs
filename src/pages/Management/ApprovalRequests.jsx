import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, doc, updateDoc, deleteDoc, getDoc, onSnapshot  } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { 
  Container, Typography, Grid, Button, Card, CardContent, CardActions, CircularProgress,
  Box, Tabs, Tab, Badge, Snackbar, Alert 
} from '@mui/material';
import { Business, Category, Description, Email, Phone, Person, Delete } from '@mui/icons-material';

export default function ApprovalRequests({ onCountUpdate }) {
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    setLoading(true);
    setError('');

    const employerQuery = query(collection(db, 'employerRequests'), where('status', '==', 'pending'));
    const deletionQuery = query(collection(db, 'users'), where('pendingDeletion', '==', true));

    const unsubscribeEmployers = onSnapshot(employerQuery, 
      (snapshot) => {
        const employers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingEmployers(employers);
        updateTotalCount(employers.length, pendingDeletions.length);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching employer requests:', err);
        setError('שגיאה בטעינת בקשות מעסיקים');
        setLoading(false);
      }
    );

    const unsubscribeDeletions = onSnapshot(deletionQuery,
      (snapshot) => {
        const deletions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingDeletions(deletions);
        updateTotalCount(pendingEmployers.length, deletions.length);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching deletion requests:', err);
        setError('שגיאה בטעינת בקשות מחיקה');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeEmployers();
      unsubscribeDeletions();
    };
  }, [db, onCountUpdate]);

  const updateTotalCount = (employersCount, deletionsCount) => {
    const totalCount = employersCount + deletionsCount;
    onCountUpdate(totalCount);
  };

  
  const handleApproval = async (userId, approved, isEmployerRequest) => {
    try {
      if (isEmployerRequest) {
        const employerRequestRef = doc(db, 'employerRequests', userId);
        const userRef = doc(db, 'users', userId);
        
        if (approved) {
          await updateDoc(employerRequestRef, { status: 'approved', approved: true });
          await updateDoc(userRef, {
            isEmployer: true,
            employerRequestStatus: 'approved',
            role: 'employer'
          });
        } else {
          await updateDoc(employerRequestRef, { status: 'rejected', approved: false });
          await updateDoc(userRef, { employerRequestStatus: 'rejected' });
        }
        
        setPendingEmployers(prevState => prevState.filter(employer => employer.id !== userId));
        setSnackbar({ open: true, message: approved ? 'המעסיק אושר בהצלחה' : 'בקשת המעסיק נדחתה', severity: approved ? 'success' : 'info' });
      } else {
        if (approved) {
          // Delete user from Firebase Authentication
          try {
            const userToDelete = await auth.getUser(userId);
            await auth.deleteUser(userId);
          } catch (error) {
            console.error('Error deleting user from Authentication:', error);
          }
          
          // Delete user document from Firestore
          await deleteDoc(doc(db, 'users', userId));
          
          // Delete from employers collection if exists
          const employerDoc = await getDoc(doc(db, 'employers', userId));
          if (employerDoc.exists()) {
            await deleteDoc(doc(db, 'employers', userId));
          }
          
          setPendingDeletions(prevState => prevState.filter(user => user.id !== userId));
          alert('החשבון נמחק בהצלחה');
        } else {
          await updateDoc(doc(db, 'users', userId), { pendingDeletion: false });
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
                      {employer.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                      סוג עסק: {employer.businessType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                      תיאור: {employer.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                      אימייל: {employer.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                      טלפון: {employer.phone}
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
              <Grid item xs={12} key={user.id}>
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
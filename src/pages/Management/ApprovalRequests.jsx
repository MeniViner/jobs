import React, { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, doc, addDoc, updateDoc, getDocs, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { 
  Container, Typography, Grid, Button, Card, CardContent, CardActions, CircularProgress, Box,
  Tabs, Tab, Badge, Snackbar, Alert, TextField, InputAdornment
} from '@mui/material';
import { 
  Search, Business, Category, Description, Email, Phone, Person, Delete 
} from '@mui/icons-material';

export default function ApprovalRequests({ onCountUpdate }) {
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [filteredDeletions, setFilteredDeletions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [processing, setProcessing] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    setLoading(true);
    setError('');

    const employerQuery = query(collection(db, 'employers'), where('status', '==', 'pending'));
    const deletionQuery = query(collection(db, 'users'), where('pendingDeletion', '==', true));

    const unsubscribeEmployers = onSnapshot(
      employerQuery,
      (snapshot) => {
        const employers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPendingEmployers(employers);
        setFilteredEmployers(employers);
        updateTotalCount(employers.length, pendingDeletions.length);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching employer requests:', err);
        setError('שגיאה בטעינת בקשות מעסיקים');
        setLoading(false);
      }
    );

    const unsubscribeDeletions = onSnapshot(
      deletionQuery,
      (snapshot) => {
        const deletions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPendingDeletions(deletions);
        setFilteredDeletions(deletions);
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

  const reFetchPendingEmployers = async () => {
    const employerQuery = query(collection(db, 'employers'), where('status', '==', 'pending'));
    const snapshot = await getDocs(employerQuery);
    const employers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPendingEmployers(employers);
  };

  const updateTotalCount = (employersCount, deletionsCount) => {
    const totalCount = employersCount + deletionsCount;
    onCountUpdate(totalCount);
  };

  const handleApproval = async (userId, approved) => {
    try {
      setProcessing(true);
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      const employerRef = doc(db, 'employers', userId);

      const updates = {
        isEmployer: approved,
        role: approved ? 'employer' : 'user',
        pendingEmployer: false,
        employerRequestStatus: approved ? 'approved' : 'rejected',
      };

      const employerUpdates = {
        approved: approved,
        status: approved ? 'approved' : 'rejected',
      };

      await updateDoc(userRef, updates);
      await updateDoc(employerRef, employerUpdates);

      await reFetchPendingEmployers();

      const notificationMessage = approved
        ? 'Your request to become an employer was approved!'
        : 'Your request to become an employer was rejected.';

      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        message: notificationMessage,
        status: 'new',
        isGlobal: false,
        isHistory: false,
        type: 'EmployerRequest',
        timestamp: serverTimestamp(),
      });

      console.log('Notification sent to user:', userId);

      setSnackbar({
        open: true,
        message: approved ? 'המעסיק אושר בהצלחה' : 'בקשת המעסיק נדחתה',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בעדכון סטטוס',
        severity: 'error',
      });
      console.error('Error approving/rejecting employer:', error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const filteredEmployers = pendingEmployers.filter(employer =>
      employer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    );
    const filteredDeletions = pendingDeletions.filter(user =>
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
    setFilteredEmployers(filteredEmployers);
    setFilteredDeletions(filteredDeletions);
  }, [searchTerm, pendingEmployers, pendingDeletions]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setProcessing(false);
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

      <TextField
        fullWidth
        variant="outlined"
        placeholder="חיפוש לפי שם או אימייל"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label={<Badge badgeContent={pendingEmployers.length} color="primary" max={99}>בקשות מעסיקים</Badge>} />
        <Tab label={<Badge badgeContent={pendingDeletions.length} color="error" max={99}>בקשות מחיקת חשבון</Badge>} />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          {filteredEmployers.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                אין בקשות מעסיקים ממתינות לאישור
              </Typography>
            </Grid>
          ) : (
            filteredEmployers.map((employer) => (
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
                      תיאו��: {employer.description}
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
                    <Button onClick={() => handleApproval(employer.id, true)} variant="contained" color="success" disabled={processing}>
                      אישור
                    </Button>
                    <Button onClick={() => handleApproval(employer.id, false)} variant="contained" color="error" disabled={processing}>
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
          {filteredDeletions.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                אין בקשות מחיקת חשבון ממתינות לאישור
              </Typography>
            </Grid>
          ) : (
            filteredDeletions.map((user) => (
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
                    <Button onClick={() => handleApproval(user.id, true)} variant="contained" color="error" disabled={processing}>
                      אישור מחיקה
                    </Button>
                    <Button onClick={() => handleApproval(user.id, false)} variant="contained" color="primary" disabled={processing}>
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
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
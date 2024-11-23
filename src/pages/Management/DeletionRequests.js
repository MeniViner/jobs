import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Person, Email, Delete } from '@mui/icons-material';

export default function DeletionRequests({ onCountUpdate }) {
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [filteredDeletions, setFilteredDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [processing, setProcessing] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    setLoading(true);

    const deletionQuery = query(collection(db, 'users'), where('pendingDeletion', '==', true));
    const unsubscribeDeletions = onSnapshot(
      deletionQuery,
      (snapshot) => {
        const deletions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPendingDeletions(deletions);
        setFilteredDeletions(deletions);
        if (typeof onCountUpdate === 'function') {
          onCountUpdate(deletions.length);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching deletion requests:', err);
        setLoading(false);
      }
    );

    return () => unsubscribeDeletions();
  }, [db, onCountUpdate]);


  const handleApproval = async (userId, approved) => {
    if (!approved) {
      // Handle rejection logic
      try {
        setProcessing(true);
  
        // Use getDoc for a single document reference
        const userDocRef = doc(db, 'users', userId);
        const userDocSnapshot = await getDoc(userDocRef); // Correct function
  
        // Check if the document exists before updating
        if (!userDocSnapshot.exists()) {
          throw new Error('User document does not exist.');
        }
  
        await updateDoc(userDocRef, {
          pendingDeletion: false,
          deletionStatus: 'rejected',
        });
  
        // Update the state to remove the denied request
        setPendingDeletions((prev) => prev.filter((user) => user.id !== userId));
        setFilteredDeletions((prev) => prev.filter((user) => user.id !== userId));
  
        setSnackbar({
          open: true,
          message: 'בקשת המחיקה נדחתה',
          severity: 'info',
        });

        // Send notification to user about denial
        await setDoc(doc(collection(db, 'notifications')), {
          userId,
          message: 'בקשת המחיקה שלך נדחתה',
          type: 'DeletionRequest',
          status: 'new',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error rejecting deletion request:', error);
        setSnackbar({
          open: true,
          message: 'שגיאה בדחיית בקשת המחיקה',
          severity: 'error',
        });
      } finally {
        setProcessing(false);
      }
      return;
    }
    

    try {
      setProcessing(true);

      const collectionsToCheck = [
        { name: 'employers', field: 'userId' },
        { name: 'feedback', field: 'userId' },
        { name: 'jobChats', field: 'applicantId' }, // Add 'employerId' if needed
        { name: 'jobs', field: 'postedBy' },
        { name: 'notifications', field: 'userId' },
        { name: 'ratings', field: 'ratedUser' }, // Add 'ratedBy' if needed
      ];

      const archivedData = {};
      const batch = writeBatch(db);

      for (const collectionInfo of collectionsToCheck) {
        const { name, field } = collectionInfo;
        const q = query(collection(db, name), where(field, '==', userId));
        const querySnapshot = await getDocs(q);

        archivedData[name] = [];

        querySnapshot.forEach((docSnapshot) => {
          archivedData[name].push({ id: docSnapshot.id, ...docSnapshot.data() });
          batch.delete(doc(db, name, docSnapshot.id)); // Add to batch deletion
        });
      }

      // Commit all batched deletions
      await batch.commit();

      // Archive data to 'archivedUsers' collection
      const archiveRef = doc(collection(db, 'archivedUsers'), userId);
      await setDoc(archiveRef, {
        userId,
        deletedAt: new Date(),
        archivedData,
      });

      // Update user deletion status
      await updateDoc(doc(db, 'users', userId), {
        pendingDeletion: false,
        deletionStatus: 'approved',
      });

      setSnackbar({
        open: true,
        message: 'בקשת המחיקה אושרה וכל הנתונים הועברו לארכיון',
        severity: 'success',
      });

      // Send notification to user about approval
      await setDoc(doc(collection(db, 'notifications')), {
        userId,
        message: 'בקשת המחיקה שלך אושרה - חשבונך וכל הנתונים שלך יימחקו ',
        type: 'DeletionRequest',
        status: 'new',
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error approving and archiving user data:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בטיפול בבקשת המחיקה',
        severity: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <>
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
                  <Button
                    onClick={() => handleApproval(user.id, true)}
                    variant="contained"
                    color="error"
                    disabled={processing}
                  >
                    אישור מחיקה
                  </Button>
                  <Button
                    onClick={() => handleApproval(user.id, false)}
                    variant="contained"
                    color="primary"
                    disabled={processing}
                  >
                    דחיית בקשת מחיקה
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

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
    </>
  );
}

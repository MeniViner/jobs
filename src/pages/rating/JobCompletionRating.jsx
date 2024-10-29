import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Snackbar, Alert, FormControlLabel, Checkbox, Paper, Avatar, Grid, CircularProgress
} from '@mui/material';
import { 
  doc, getDoc, addDoc, collection, query, where, getDocs, runTransaction, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext'; // Ensure this is imported
import { RatingInput } from './RatingSystem';

const JobCompletionRating = ({ open, onClose, jobId, jobTitle, onComplete }) => {
  const [workers, setWorkers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [noShows, setNoShows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRatings, setSubmittedRatings] = useState({});
  const [loading, setLoading] = useState(true);  // New loading state
  const [error, setError] = useState(null);
  const { user } = useAuth(); 


  useEffect(() => {
    if (open && jobId) fetchWorkers();
  }, [open, jobId]);

  const fetchWorkers = async () => {
    setLoading(true);  // Start loading
    try {
      const applicantsQuery = query(
        collection(db, 'jobs', jobId, 'applicants'),
        where('hired', '==', true)
      );
      const snapshot = await getDocs(applicantsQuery);
  
      const workersData = await Promise.all(
        snapshot.docs.map(async (applicantDoc) => {
          const applicantData = applicantDoc.data();
          const userRef = doc(db, 'users', applicantData.applicantId);
          const userDoc = await getDoc(userRef);
    
          const userData = userDoc.exists() ? userDoc.data() : {};
          const img = userData.photoURL || userData.profileURL || '/default-avatar.png';

          const hasRated = await checkIfRated(applicantData.applicantId);
  
          return { 
            id: applicantDoc.id, 
            name: userData.name || 'מועמד ללא שם', 
            img,
            hasRated,
            applicantId: applicantData.applicantId,
            ...applicantData 
          };
        })
      );
  
      setWorkers(workersData);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setError('Failed to load workers. Please try again.');
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const checkIfRated = async (workerId) => {
    if (!user) return false; 
    
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('ratedUser', '==', workerId),
      where('ratedBy', '==', user.uid),
      where('jobId', '==', jobId)  
    );
    const ratingsSnapshot = await getDocs(ratingsQuery);
    return !ratingsSnapshot.empty;
  };

  const handleRatingSubmitted = (workerId) => {
    setSubmittedRatings((prev) => ({
      ...prev,
      [workerId]: true,
    }));
  };
  

  const handleNoShowChange = (workerId) => {
    setNoShows((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    );
  };

  const handleRatingChange = (workerId, rating, review) => {
    setRatings((prev) => ({
      ...prev,
      [workerId]: { rating, review },
    }));
  };

  const handleSubmitRatings = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await runTransaction(db, async (transaction) => {
        await updateWorkers(transaction);
        await updateJobCompletion(transaction);
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error submitting ratings:', error);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateWorkers = async (transaction) => {
    for (const worker of workers) {
      if (ratings[worker.id]) await saveRating(worker);
      if (noShows.includes(worker.applicantId)) {
        await incrementNoShowCount(transaction, worker);
      } else {
        await incrementJobCount(transaction, worker); // Track worked jobs
      }
    }
  };

  const incrementJobCount = async (transaction, worker) => {
    const userRef = doc(db, 'users', worker.applicantId);
    const userDoc = await transaction.get(userRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const newJobsWorkedCount = (userData.jobsWorkedCount || 0) + 1;
      const updatedWorkedJobs = [...(userData.workedJobs || []), jobId];
  
      transaction.update(userRef, {
        jobsWorkedCount: newJobsWorkedCount,
        workedJobs: updatedWorkedJobs,
      });
    }
  };
  
  const incrementNoShowCount = async (transaction, worker) => {
    const userRef = doc(db, 'users', worker.applicantId);
    const userDoc = await transaction.get(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const newNoShowCount = (userData.noShows || 0) + 1;
      // עדכון מספר האזהרות למשתמש
      transaction.update(userRef, { noShows: newNoShowCount });

      // שליחת התראה למשתמש
      await sendWarningNotification(worker.applicantId, newNoShowCount);
    }
  };

  const sendWarningNotification = async (userId, warningCount) => {
    const notificationMessage = `שימו לב! סומנת כהבריז. זוהי אזהרה מספר ${warningCount}.`;
    
    await addDoc(collection(db, 'notifications'), {
      userId,
      message: notificationMessage,
      status: 'new',
      type: 'NoShowWarning',
      isGlobal: false,
      isHistory: false,
      timestamp: serverTimestamp(),
    });
  };

  const saveRating = async (worker) => {
    await addDoc(collection(db, 'ratings'), {
      jobId,
      workerId: worker.applicantId,
      rating: ratings[worker.id].rating,
      review: ratings[worker.id].review,
      timestamp: new Date(),
    });
  };

  const updateJobCompletion = async (transaction) => {
    const jobRef = doc(db, 'jobs', jobId);
    transaction.update(jobRef, {
      isCompleted: true,
      isPublic: false,
      isRated: true,
      noShows,
      completedAt: serverTimestamp(),
    });
  };

  const handleCloseError = () => setError(null);



  
  const renderWorkerRating = (worker) => (
    <RatingInput
      jobId={jobId}
      jobTitle={jobTitle}
      targetUserId={worker.applicantId}
      isEmployerRating={true}
      hasRated={worker.hasRated || submittedRatings[worker.id] || false}
      onRatingSubmitted={() => handleRatingSubmitted(worker.id)}
    />
  );  

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>דרג את העובדים</DialogTitle>
        <DialogContent>
          {loading ? (  // Show loading spinner
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : workers.length === 0 ? (  // No users found
            <Typography variant="body1" align="center">
              No users found.
            </Typography>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                אנא דרג את העובדים שהשתתפו בעבודה זו. דירוג זה יעזור לעובדים ולמעסיקים אחרים בעתיד.
              </Typography>
              <Grid container spacing={2}>
                {workers.map((worker) => (
                  <Grid item xs={12} sm={6} md={4} key={worker.id}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={worker.img} 
                          alt={worker.name} 
                          sx={{ width: 48, height: 48, mr: 2 }} 
                        />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {worker.name}
                        </Typography>
                      </Box>

                      {/* <RatingInput
                        jobId={jobId}  // Ensure jobId is passed here
                        jobTitle={jobTitle}
                        targetUserId={worker.applicantId}  // Ensure targetUserId is passed here
                        isEmployerRating={true}
                        onRatingChange={(rating, review) => handleRatingChange(worker.id, rating, review)}
                      /> */}

                      {renderWorkerRating(worker)}

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={noShows.includes(worker.applicantId)}
                            onChange={() => handleNoShowChange(worker.applicantId)}
                          />
                        }
                        label="סמן כהבריז"
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            ביטול
          </Button>
          <Button onClick={handleSubmitRatings} color="primary" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'מסיים...' : 'סיים עבודה זו'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {"error" + error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default JobCompletionRating;

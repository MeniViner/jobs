import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { doc, updateDoc, addDoc, collection, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../services/firebase';
import { RatingInput } from './RatingSystem';

interface Worker {
  id: string;
  name: string;
  applicantId: string;
}

interface JobCompletionRatingProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onComplete: () => void;
}

export default function JobCompletionRating({ open, onClose, jobId, onComplete }: JobCompletionRatingProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: { rating: number; review: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && jobId) {
      fetchWorkers();
    }
  }, [open, jobId]);

  const fetchWorkers = async () => {
    try {
      const applicantsQuery = query(collection(db, 'jobChats', jobId, 'applicants'), where('hired', '==', true));
      const applicantsSnapshot = await getDocs(applicantsQuery);
      const workersData = applicantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Worker));
      setWorkers(workersData);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setError('Failed to load workers. Please try again.');
    }
  };

  const handleRatingChange = (workerId: string, rating: number, review: string) => {
    setRatings(prev => ({
      ...prev,
      [workerId]: { rating, review },
    }));
  };

  const handleSubmitRatings = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await runTransaction(db, async (transaction) => {
        for (const worker of workers) {
          if (ratings[worker.id]) {
            const ratingRef = await addDoc(collection(db, 'ratings'), {
              jobId,
              workerId: worker.applicantId,
              rating: ratings[worker.id].rating,
              review: ratings[worker.id].review,
              timestamp: new Date(),
            });

            const userRef = doc(db, 'users', worker.applicantId);
            const userDoc = await transaction.get(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const currentRating = userData.rating || 0;
              const currentRatingCount = userData.ratingCount || 0;
              const newRatingCount = currentRatingCount + 1;
              const newRating = ((currentRating * currentRatingCount) + ratings[worker.id].rating) / newRatingCount;

              transaction.update(userRef, {
                rating: newRating,
                ratingCount: newRatingCount,
              });
            }
          }
        }

        const jobRef = doc(db, 'jobs', jobId);
        transaction.update(jobRef, {
          isCompleted: true,
          isPublic: false,
          isRated: true,
        });
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

  const handleSkipRating = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        isCompleted: true,
        isPublic: false,
        isRated: false,
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error marking job as completed:', error);
      setError('Failed to complete the job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>דרג את העובדים</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            אנא דרג את העובדים שהשתתפו בעבודה זו. דירוג זה יעזור לעובדים ולמעסיקים אחרים בעתיד.
          </Typography>
          {workers.map(worker => (
            <Box key={worker.id} my={2}>
              <Typography variant="h6">{worker.name}</Typography>
              <RatingInput
                onRatingChange={(rating, review) => handleRatingChange(worker.id, rating, review)}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkipRating} color="primary" disabled={isSubmitting}>
            דלג על הדירוג
          </Button>
          <Button onClick={handleSubmitRatings} color="primary" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'שולח...' : 'שלח דירוגים וסיים עבודה'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
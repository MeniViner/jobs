// src/components/EmployerRatingDialog.js

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Rating,
} from '@mui/material';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function EmployerRatingDialog({ job, onClose }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isOpen, setIsOpen] = useState(!!job);

  useEffect(() => {
    setIsOpen(!!job);
  }, [job]);

  const handleRatingSubmit = async () => {
    if (!job) return;

    // שמירת הדירוג במסד הנתונים
    await addDoc(collection(db, 'employerRatings'), {
      jobId: job.id,
      employerId: job.employerId,
      rating,
      review,
      createdAt: serverTimestamp(),
    });

    // סימון העבודה כמדורגת
    await updateDoc(doc(db, 'jobs', job.id), {
      isRated: true,
    });

    onClose(); // סגירת הדיאלוג לאחר השליחה
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>דרג את המעסיק</DialogTitle>
      <DialogContent>
        <DialogContentText>
          נא לדרג את המעסיק עבור העבודה "{job?.title}".
        </DialogContentText>
        <Rating
          value={rating}
          onChange={(event, newValue) => setRating(newValue)}
        />
        <TextField
          label="חוות דעת"
          fullWidth
          multiline
          minRows={3}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleRatingSubmit} color="primary" variant="contained">
          שלח דירוג
        </Button>
      </DialogActions>
    </Dialog>
  );
}

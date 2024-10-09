import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, TextField, Button, Card, CardContent, Avatar } from '@mui/material';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export const RatingInput = ({ jobId, targetUserId, isEmployerRating }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const { user } = useAuth();

  const handleSubmitRating = async () => {
    if (!user) {
      alert('You must be logged in to submit a rating.');
      return;
    }

    if (!rating) {
      alert('Please select a rating before submitting.');
      return;
    }

    try {
      await addDoc(collection(db, 'ratings'), {
        jobId,
        ratedBy: user.uid,
        ratedUser: targetUserId,
        rating,
        review,
        isEmployerRating,
        createdAt: new Date()
      });

      // Update the user's average rating
      const userRef = doc(db, 'users', targetUserId);
      const ratingsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', targetUserId));
      const ratingsSnapshot = await getDocs(ratingsQuery);

      let totalRating = 0;
      ratingsSnapshot.forEach(doc => {
        totalRating += doc.data().rating;
      });
      const averageRating = totalRating / ratingsSnapshot.size;

      await updateDoc(userRef, { averageRating });

      alert('Rating submitted successfully!');
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  return (
    <Box>
      <Typography component="legend">Rate this {isEmployerRating ? 'employee' : 'employer'}</Typography>
      <Rating
        name="rating"
        value={rating}
        onChange={(event, newValue) => {
          setRating(newValue);
        }}
      />
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Write your review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSubmitRating} disabled={!rating}>
        Submit Rating
      </Button>
    </Box>
  );
};

export const RatingDisplay = ({ userId }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);


  useEffect(() => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }
  
    const fetchRatings = async () => {
      try {
        const ratingsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', userId));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratingsData = ratingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRatings(ratingsData);
  
        if (ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, rating) => sum + rating.rating, 0);
          setAverageRating(totalRating / ratingsData.length);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };
  
    fetchRatings();
  }, [userId]);
  

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Ratings & Reviews</Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Rating value={averageRating} precision={0.5} readOnly />
        <Typography variant="body2" ml={1}>
          ({averageRating.toFixed(1)}) based on {ratings.length} reviews
        </Typography>
      </Box>
      {ratings.map((rating) => (
        <Card key={rating.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar src={rating.raterPhotoURL} />
              <Typography variant="subtitle1" ml={1}>{rating.raterName}</Typography>
            </Box>
            <Rating value={rating.rating} readOnly />
            <Typography variant="body2" mt={1}>{rating.review}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

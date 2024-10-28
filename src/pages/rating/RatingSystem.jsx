// src/components/rating/RatingSystem.js

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Rating, TextField, Button, Card, CardContent, Avatar 
} from '@mui/material';
import { 
  collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const AverageRating = ({ averageRating, ratingsCount }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Rating value={averageRating} precision={0.5} readOnly />
    <Typography variant="body2" ml={1}>
      ({averageRating.toFixed(1)}) based on {ratingsCount} reviews
    </Typography>
  </Box>
);

const ReviewCard = ({ rating }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar src={rating.raterProfile.photoURL} alt={rating.raterProfile.name} />
        <Typography variant="subtitle1" ml={1}>{rating.raterProfile.name}</Typography>
      </Box>
      <Rating value={rating.rating} readOnly />
      <Typography variant="body2" mt={1}>{rating.review}</Typography>
    </CardContent>
  </Card>
);

// export const RatingInput = ({ jobId, jobTitle, targetUserId, isEmployerRating, onRatingSubmitted }) => {
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState('');
//   const { user } = useAuth();

//   const handleSubmitRating = async () => {
//     if (!user) {
//       alert('You must be logged in to submit a rating.');
//       return;
//     }

//     if (!jobId || !targetUserId) {
//       console.error('Missing jobId or targetUserId.');
//       alert('Invalid job or user information. Please try again.');
//       return;
//     }

//     if (!rating) {
//       alert('Please select a rating before submitting.');
//       return;
//     }

//     try {
//       const newRating = {
//         jobId,
//         ratedBy: user.uid,
//         ratedUser: targetUserId,
//         rating,
//         review,
//         isEmployerRating,
//         createdAt: new Date(),
//       };

//       const docRef = await addDoc(collection(db, 'ratings'), newRating);

//       const userRef = doc(db, 'users', targetUserId);
//       const ratingsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', targetUserId));
//       const ratingsSnapshot = await getDocs(ratingsQuery);

//       let totalRating = 0;
//       ratingsSnapshot.forEach(doc => {
//         totalRating += doc.data().rating;
//       });

//       const averageRating = totalRating / ratingsSnapshot.size;
//       await updateDoc(userRef, { averageRating });

//       // Send a notification to the rated user
//       const notificationMessage = `המעסיק ${user.displayName || 'לא ידוע'} דירג אותך על העבודה ${jobTitle} !`;
//       await addDoc(collection(db, 'notifications'), {
//         userId: targetUserId,
//         message: notificationMessage,
//         status: 'new',
//         isGlobal: false,
//         isHistory: false,
//         type: 'RatingReceived',
//         timestamp: serverTimestamp(),
//       });

//       alert('Rating submitted successfully!');
//       setRating(0);
//       setReview('');

//       if (onRatingSubmitted) {
//         onRatingSubmitted({ id: docRef.id, ...newRating });
//       }
//     } catch (error) {
//       console.error('Error submitting rating:', error);
//       alert('Failed to submit rating. Please try again.');
//     }
//   };   

//   return (
//     <Box>
//       <Typography component="legend">Rate this {isEmployerRating ? 'employee' : 'employer'}</Typography>
//       <Rating
//         name="rating"
//         value={rating}
//         onChange={(event, newValue) => {
//           setRating(newValue);
//         }}
//       />
//       <TextField
//         fullWidth
//         multiline
//         rows={4}
//         variant="outlined"
//         label="Write your review"
//         value={review}
//         onChange={(e) => setReview(e.target.value)}
//         margin="normal"
//       />
//       <Button 
//         variant="contained" 
//         color="primary" 
//         onClick={handleSubmitRating} 
//         disabled={!rating || !jobId || !targetUserId}
//       >
//         Submit Rating
//       </Button>
//     </Box>
//   );
// };


export const RatingInput = ({
  jobId,
  jobTitle,
  targetUserId,
  isEmployerRating,
  hasRated,
  onRatingSubmitted,
}) => {
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
      const newRating = {
        jobId,
        ratedBy: user.uid,
        ratedUser: targetUserId,
        rating,
        review,
        isEmployerRating,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'ratings'), newRating);

      // Update the average rating for the user
      const userRef = doc(db, 'users', targetUserId);
      const ratingsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', targetUserId));
      const ratingsSnapshot = await getDocs(ratingsQuery);

      let totalRating = 0;
      ratingsSnapshot.forEach((doc) => {
        totalRating += doc.data().rating;
      });

      const averageRating = totalRating / ratingsSnapshot.size;
      await updateDoc(userRef, { averageRating });

      // Send a notification to the rated user
      const notificationMessage = `המעסיק ${user.displayName || 'לא ידוע'} דירג אותך על העבודה ${jobTitle} !`;
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        message: notificationMessage,
        status: 'new',
        type: 'RatingReceived',
        timestamp: serverTimestamp(),
      });

      alert('Rating submitted successfully!');
      setRating(0);
      setReview('');

      if (onRatingSubmitted) onRatingSubmitted();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  if (hasRated) {
    return <Typography>Thank you! Your rating has been submitted.</Typography>;
  }

  return (
    <Box>
      <Typography component="legend">Rate this {isEmployerRating ? 'employee' : 'employer'}</Typography>
      <Rating
        name="rating"
        value={rating}
        onChange={(event, newValue) => setRating(newValue)}
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
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSubmitRating} 
        disabled={!rating}
      >
        Submit Rating
      </Button>
    </Box>
  );
};


export const RatingDisplay = ({ userId, isEmployer, allowRating = true }) => {
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

        const raterIds = [...new Set(ratingsData.map(rating => rating.ratedBy))];
        const userProfiles = await Promise.all(raterIds.map(async (raterId) => {
          const userDocRef = doc(db, 'users', raterId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return { id: raterId, photoURL: userData.photoURL || '/placeholder.svg?height=40&width=40', name: userData.name || 'Unknown' };
          }
          return { id: raterId, photoURL: '/placeholder.svg?height=40&width=40', name: 'Unknown' };
        }));

        const userProfileMap = Object.fromEntries(userProfiles.map(user => [user.id, user]));

        const ratingsWithProfiles = ratingsData.map(rating => ({
          ...rating,
          raterProfile: userProfileMap[rating.ratedBy] || { name: 'Unknown', photoURL: '/placeholder.svg?height=40&width=40' }
        }));

        ratingsWithProfiles.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        setRatings(ratingsWithProfiles);
  
        if (ratingsWithProfiles.length > 0) {
          const totalRating = ratingsWithProfiles.reduce((sum, rating) => sum + rating.rating, 0);
          setAverageRating(totalRating / ratingsWithProfiles.length);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };
  
    fetchRatings();
  }, [userId]);

  const addNewRating = (newRating) => {
    setRatings(prevRatings => [newRating, ...prevRatings]);
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) + newRating.rating;
    setAverageRating(totalRating / (ratings.length + 1));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Ratings & Reviews</Typography>
      <AverageRating averageRating={averageRating} ratingsCount={ratings.length} />
      {ratings.map((rating) => (
        <ReviewCard key={rating.id} rating={rating} />
      ))}
    </Box>
  );
};

export const RatingCount = ({ userId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchRatingCount = async () => {
      if (!userId) return;

      try {
        const ratingsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', userId));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        setCount(ratingsSnapshot.size);
      } catch (error) {
        console.error("Error fetching rating count:", error);
      }
    };

    fetchRatingCount();
  }, [userId]);

  return (
    <Typography variant="body2">
      Total Ratings: {count}
    </Typography>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Avatar,
  Stack,
  Rating,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { collection, query, where, getDocs, orderBy, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from 'services/firebase';
import { useAuth } from 'contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Person, Delete, Star } from '@mui/icons-material';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    if (user?.uid) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'ratings'),
        where('ratedBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);

      if (reviewsSnapshot.empty) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const reviewsData = await Promise.all(
        reviewsSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const userDocRef = doc(db, 'users', data.ratedUser);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.exists() ? userDocSnap.data() : {};

          return {
            id: docSnap.id,
            ...data,
            ratedUserName: userData.name || 'משתמש לא ידוע',
            ratedUserPhoto: userData.photoURL || '/placeholder.svg?height=40&width=40',
            ratedUserId: data.ratedUser,
          };
        })
      );

      setReviews(reviewsData);
    } catch (error) {
      console.error("שגיאה בטעינת הביקורות:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (reviewToDelete) {
      try {
        await deleteDoc(doc(db, 'ratings', reviewToDelete.id));
        setReviews(reviews.filter((r) => r.id !== reviewToDelete.id));
        setSnackbar({ open: true, message: 'הביקורת נמחקה בהצלחה' });
      } catch (error) {
        setSnackbar({ open: true, message: 'אירעה שגיאה במחיקת הביקורת' });
      }
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress className="text-indigo-600" />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Box className="max-w-3xl mx-auto px-4 py-12">
        <Box className="flex items-center justify-between mb-8">
          <Typography className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            הביקורות שלי
          </Typography>
          <Box className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm">
            <Star className="text-yellow-400 w-5 h-5" />
            <Typography className="font-medium text-gray-700">
              {reviews.length} ביקורות
            </Typography>
          </Box>
        </Box>

        {reviews.length === 0 ? (
          <Box className="text-center py-32 bg-white rounded-3xl shadow-sm">
            <Typography className="text-xl text-gray-400 font-medium">
              טרם פרסמת ביקורות
            </Typography>
            <Typography className="text-gray-400 mt-2">
              הביקורות שתפרסם יופיעו כאן
            </Typography>
          </Box>
        ) : (
          <Stack spacing={4}>
            {reviews.map((review) => (
              <Box
                key={review.id}
                className="bg-white rounded-3xl p-1 transition-all duration-300 hover:shadow-lg"
              >
                <Box className="rounded-[22px] overflow-hidden">
                  {/* Header section with gradient background */}
                  <Box className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                    <Box className="flex items-start justify-between">
                      <Link 
                        to={`/user/${review.ratedUserId}`}
                        className="flex items-center gap-3 no-underline group"
                      >
                        <Avatar
                          src={review.ratedUserPhoto}
                          alt={review.ratedUserName}
                          className="w-14 h-14 ring-4 ring-white shadow-md transition-transform group-hover:scale-105"
                        />
                        <Box>
                          <Typography className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {review.ratedUserName}
                          </Typography>
                          <Typography className="text-sm text-gray-500">
                            {review.createdAt?.toDate().toLocaleDateString('he-IL')}
                          </Typography>
                        </Box>
                      </Link>
                      <Box className="flex flex-col items-end gap-1">
                        <Rating 
                          value={review.rating} 
                          readOnly 
                          size="large"
                          className="text-yellow-400"
                        />
                        <Typography className="text-sm font-medium text-gray-500">
                          {review.rating} מתוך 5
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Review content section with white background */}
                  <Box className="p-6 bg-white border-t border-gray-100">
                    <Typography className="text-gray-700 leading-relaxed text-lg">
                      {review.review}
                    </Typography>
                  </Box>

                  {/* Actions section */}
                  <Box className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 flex justify-end gap-3">
                    <Button
                      component={Link}
                      to={`/user/${review.ratedUserId}`}
                      startIcon={<Person />}
                      className="text-gray-600 hover:text-indigo-600 hover:bg-white transition-colors"
                    >
                      פרופיל
                    </Button>
                    <Button
                      startIcon={<Delete />}
                      onClick={() => handleDeleteReview(review)}
                      className="text-red-500 hover:bg-red-50 transition-colors"
                    >
                      מחק
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            className: "rounded-3xl overflow-hidden"
          }}
        >
          <DialogTitle className="text-right bg-gradient-to-r from-red-50 to-red-100 py-6">
            <Typography className="text-xl font-bold text-red-600">
              מחיקת ביקורת
            </Typography>
          </DialogTitle>
          <DialogContent className="py-6">
            <DialogContentText className="text-right text-gray-600">
              האם אתה בטוח שברצונך למחוק את הביקורת?
              <br />
              פעולה זו אינה ניתנת לביטול.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="p-4 bg-gray-50">
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              className="text-gray-600 hover:bg-white"
            >
              ביטול
            </Button>
            <Button 
              onClick={confirmDeleteReview}
              className="bg-red-500 text-white hover:bg-red-600 px-6"
            >
              מחק
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          ContentProps={{
            className: "bg-gray-900 rounded-full"
          }}
        />
      </Box>
    </Box>
  );
};

export default UserReviews;
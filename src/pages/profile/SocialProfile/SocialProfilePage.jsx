import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, CircularProgress
} from '@mui/material';
import {
  getFirestore, doc, getDoc, collection, query, where, getDocs
} from 'firebase/firestore';


// ייבוא דפי הקומפוננטה של פרופיל החברתי
import EmployerProfile from './components/SocailEmployer';
import EmployeeProfile from './components/SocailEmployee';


// הרכיב הראשי של דף הפרופיל
export default function UserProfilePage() {
  const { userId } = useParams();
  const db = getFirestore();
  const [profileData, setProfileData] = useState(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [jobsWorkedCount, setJobsWorkedCount] = useState(0);

  // משתנים חדשים לניהול הצגת הביקורות
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState('date_desc'); // ברירת מחדל: תאריך יורד

  // פונקציה למיון הביקורות
  const sortReviews = (reviews, option) => {
    const sortedReviews = [...reviews];
    if (option === 'date_desc') {
      sortedReviews.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    } else if (option === 'date_asc') {
      sortedReviews.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
    } else if (option === 'rating_desc') {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    } else if (option === 'rating_asc') {
      sortedReviews.sort((a, b) => a.rating - b.rating);
    }
    return sortedReviews;
  };

  // טעינת נתוני משתמש
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsEmployer(userData.isEmployer || false);
          setProfileData(userData);

          if (!userData.isEmployer) {
            const workedJobs = userData.workedJobs || [];
            setJobsWorkedCount(workedJobs.length);
          }

          const reviewsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', userId));
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const raterIds = [...new Set(reviewsData.map((review) => review.ratedBy))];

          const raterProfilesPromises = raterIds.map(async (raterId) => {
            const raterDocRef = doc(db, 'users', raterId);
            const raterDocSnap = await getDoc(raterDocRef);
            if (raterDocSnap.exists()) {
              const raterData = raterDocSnap.data();
              return {
                id: raterId,
                name: raterData.name || 'שם משתמש',
                photoURL: raterData.profileURL || raterData.photoURL,
              };
            } else {
              return {
                id: raterId,
                name: 'משתמש אנונימי',
                photoURL: '/placeholder.svg?height=40&width=40',
              };
            }
          });

          const raterProfiles = await Promise.all(raterProfilesPromises);
          const raterProfilesMap = raterProfiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});

          const reviewsWithProfiles = reviewsData.map((review) => ({
            ...review,
            raterProfile: raterProfilesMap[review.ratedBy] || {
              name: 'משתמש אנונימי',
              photoURL: '/placeholder.svg?height=40&width=40',
            },
          }));

          setReviews(sortReviews(reviewsWithProfiles, sortOption));
        } else {
          console.error('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [db, userId, sortOption]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">המשתמש לא נמצא</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 2 }}>
      {isEmployer ? (
        <EmployerProfile
          profileData={profileData}
          reviews={reviews}
          showAllReviews={showAllReviews}
          setShowAllReviews={setShowAllReviews}
          sortAnchorEl={sortAnchorEl}
          setSortAnchorEl={setSortAnchorEl}
          setSortOption={setSortOption}
          sortOption={sortOption}
        />
      ) : (
        <EmployeeProfile
          profileData={profileData}
          reviews={reviews}
          jobsWorkedCount={jobsWorkedCount}
          showAllReviews={showAllReviews}
          setShowAllReviews={setShowAllReviews}
          sortAnchorEl={sortAnchorEl}
          setSortAnchorEl={setSortAnchorEl}
          setSortOption={setSortOption}
          sortOption={sortOption}
        />
      )}
    </Box>
  );
}

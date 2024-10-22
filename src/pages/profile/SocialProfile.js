import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Typography, Avatar, Paper, Stack, Button, Chip, CircularProgress, Rating, IconButton, Divider
} from '@mui/material';
import {
  Verified, Language, LocationOn, Work, School, Email, Phone, Business, DirectionsCar
} from '@mui/icons-material';
import { 
  getFirestore, doc, getDoc, collection, query, where, getDocs 
} from 'firebase/firestore';
import { ContactIconsDisplay } from '../../components/code parts/ContactMethodsManager';


export default function UserProfilePage() {
  const { userId } = useParams();
  const db = getFirestore();
  const [profileData, setProfileData] = useState(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsEmployer(userData.isEmployer || false);
          setProfileData(userData);

          // Fetch reviews
          const reviewsQuery = query(collection(db, 'ratings'), where('ratedUser', '==', userId));
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Extract unique rater IDs
          const raterIds = [...new Set(reviewsData.map(review => review.ratedBy))];
          
          // Fetch rater profiles
          const raterProfilesPromises = raterIds.map(async (raterId) => {
            const raterDocRef = doc(db, 'users', raterId);
            const raterDocSnap = await getDoc(raterDocRef);
            if (raterDocSnap.exists()) {
              const raterData = raterDocSnap.data();
              return { id: raterId, name: raterData.name || 'שם משתמש', photoURL: raterData.profileURL || raterData.photoURL };
            } else {
              return { id: raterId, name: 'משתמש אנונימי', photoURL: '/placeholder.svg?height=40&width=40' };
            }
          });

          const raterProfiles = await Promise.all(raterProfilesPromises);
          const raterProfilesMap = raterProfiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});

          // Attach rater profiles to reviews
          const reviewsWithProfiles = reviewsData.map(review => ({
            ...review,
            raterProfile: raterProfilesMap[review.ratedBy] || { name: 'משתמש אנונימי', photoURL: '/placeholder.svg?height=40&width=40' }
          }));

          setReviews(reviewsWithProfiles);
        } else {
          console.error('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [db, userId]);

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
        <EmployerProfile profileData={profileData} reviews={reviews} />
      ) : (
        <EmployeeProfile profileData={profileData} reviews={reviews} />
      )}
    </Box>
  );
}

function ProfileHeader({ profileData, isEmployer, reviews }) {
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={profileData.profileURL || profileData.photoURL}
            sx={{ width: 120, height: 120, border: '4px solid white' }}
          />
          {profileData.isVerified && (
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                borderRadius: '50%',
              }}
            >
              <Verified sx={{ color: 'error.main' }} />
            </IconButton>
          )}
        </Box>
        <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
          {profileData.name || 'שם המשתמש'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {isEmployer ? (profileData.companyName || 'שם העסק') : (profileData.profession || 'מקצוע לא צוין')}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Rating
            value={averageRating}
            readOnly
            precision={0.1}
            sx={{
              '& .MuiRating-iconFilled': {
                color: 'gold',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            ({averageRating.toFixed(1)}) על פי {reviews.length} ביקורות
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

function EmployerProfile({ profileData, reviews }) {
  return (
    <Box>
      <ProfileHeader profileData={profileData} isEmployer={true} reviews={reviews} />

      <Stack spacing={2}>
        {profileData.businessType && (
          <InfoItem icon={<Business />} text={`סוג העסק: ${profileData.businessType}`} />
        )}
        {profileData.location && (
          <InfoItem icon={<LocationOn />} text={`מיקום העסק: ${profileData.location}`} />
        )}
        {profileData.email && (
          <InfoItem icon={<Email />} text={`אימייל: ${profileData.email}`} />
        )}
        {profileData.phone && (
          <InfoItem icon={<Phone />} text={`טלפון: ${profileData.phone}`} />
        )}

        {/* {profileData.contactMethods.length > 0 && 
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>
              דרכי יצירת קשר
            </Typography>
            <ContactIconsDisplay contactMethods={profileData.contactMethods || []} />
          </>
        } */}

        {Array.isArray(profileData.contactMethods) && profileData.contactMethods.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>
              דרכי יצירת קשר
            </Typography>
            <ContactIconsDisplay contactMethods={profileData.contactMethods} />
          </>
        )}
        
        {profileData.description && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3 }}>
              פירוט על החברה
            </Typography>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body1">{profileData.description}</Typography>
            </Paper>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          הביקורות של {profileData.name}
        </Typography>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            אין ביקורות להצגה.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function EmployeeProfile({ profileData, reviews }) {
  return (
    <Box>
      <ProfileHeader profileData={profileData} isEmployer={false} reviews={reviews} />

      <Stack spacing={2}>
        <InfoItem
          icon={<Work />}
          text={`מקצוע: ${profileData.profession || 'לא צוין'}`}
        />
        <InfoItem
          icon={<LocationOn />}
          text={`מקום מגורים: ${profileData.location || 'לא צוין'}`}
        />
        <InfoItem
          icon={<DirectionsCar />}
          text={`האם יש רכב: ${profileData.hasCar ? 'כן' : 'לא'}`}
        />
        <InfoItem
          icon={<Language />}
          text={`שפות: ${profileData.languages || 'לא צוין'}`}
        />
        <InfoItem
          icon={<School />}
          text={`השכלה: ${profileData.education || 'לא צוין'}`}
        />
        <InfoItem
          icon={<Email />}
          text={`אימייל: ${profileData.email || 'לא צוין'}`}
        />
        <InfoItem
          icon={<Phone />}
          text={`טלפון: ${profileData.phoneNumber || 'לא צוין'}`}
        />


        {profileData.skills && (
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              כישורים:
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {profileData.skills}
            </Typography>
          </Paper>
        )}

`       {Array.isArray(profileData.contactMethods) && profileData.contactMethods.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>
              דרכי יצירת קשר
            </Typography>
            <ContactIconsDisplay contactMethods={profileData.contactMethods} />
          </>
        )}
        
        {profileData.bio && (
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              אודות:
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {profileData.bio}
            </Typography>
          </Paper>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          הביקורות של {profileData.name}
        </Typography>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            אין ביקורות להצגה.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function ReviewCard({ review }) {
  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>"{review.review}"</Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
        <Avatar
          src={review.raterProfile?.profileURL || review.raterProfile?.photoURL}
          alt={review.raterProfile?.name || 'משתמש אנונימי'}
          sx={{ width: 40, height: 40 }}
        />
        <Box>
          <Typography variant="subtitle2">{review.raterProfile?.name || 'משתמש אנונימי'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {review.createdAt instanceof Date 
              ? review.createdAt.toLocaleDateString() 
              : review.createdAt?.toDate().toLocaleDateString() || ''}
          </Typography>
        </Box>
        <Rating
          value={review.rating}
          readOnly
          precision={0.5}
          sx={{
            ml: 'auto',
            '& .MuiRating-iconFilled': {
              color: 'gold',
            },
          }}
        />
      </Stack>
    </Paper>
  );
}

function InfoItem({ icon, text }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Chip
        icon={icon}
        label={text}
        variant="outlined"
        sx={{ width: '100%', justifyContent: 'flex-start' }}
      />
    </Stack>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Typography, Avatar, Paper, Stack, Button, Chip, CircularProgress, Rating, IconButton 
} from '@mui/material';
import {
  Verified, Language, LocationOn, Work, School, Email, Phone, Business
} from '@mui/icons-material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


export default function UserProfilePage() {
  const { userId } = useParams();
  const db = getFirestore();
  const [profileData, setProfileData] = useState(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
  
        const userDocSnap = await getDoc(userDocRef);
  
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
  
          // Check if the user has the 'isEmployer' field to determine if they're an employer
          const isEmployer = userData.isEmployer || false;
  
          setIsEmployer(isEmployer);
  
          setProfileData({
            ...userData,
          });
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
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
        <EmployerProfile profileData={profileData} />
      ) : (
        <EmployeeProfile profileData={profileData} />
      )}
    </Box>
  );
}


function EmployerProfile({ profileData }) {
  return (
    <Box>
      {/* גרסת המעסיק */}
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profileData.profileURL || '/placeholder.svg?height=120&width=120'}
              sx={{ width: 120, height: 120, border: '4px solid white' }}
            />
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
          </Box>
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
            {profileData.name || 'שם המשתמש'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {profileData.companyName || 'שם העסק'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Rating
              value={profileData.averageRating || 5}
              readOnly
              precision={0.1}
              sx={{
                '& .MuiRating-iconFilled': {
                  color: 'gold',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              ({profileData.totalReviews || '0'} ביקורות)
            </Typography>
          </Stack>
          {profileData.businessType && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {profileData.businessType}
            </Typography>
          )}
        </Box>
      </Paper>

      <Stack spacing={2} sx={{ mt: 3 }}>
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

        {/* כותרת "פירוט על החברה" */}
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

        {/* ביקורות */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3 }}>
          הביקורות של {profileData.name}
        </Typography>

        {profileData.reviews && profileData.reviews.length > 0 ? (
          profileData.reviews.slice(0, 1).map((review, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body1">"{review.text}"</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <Avatar
                  src={review.reviewerProfileURL || '/placeholder.svg?height=40&width=40'}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="subtitle2">{review.reviewerName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.date}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            אין ביקורות להצגה.
          </Typography>
        )}

        {profileData.reviews && profileData.reviews.length > 1 && (
          <Button variant="contained" fullWidth>
            הצגת ביקורות נוספות
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function EmployeeProfile({ profileData }) {
  return (
    <Box>
      {/* גרסת העובד */}
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={
                profileData.profileURL ||
                '/placeholder.svg?height=120&width=120'
              }
              sx={{ width: 120, height: 120, border: '4px solid white' }}
            />
            <Verified
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                color: 'error.main',
                bgcolor: 'background.paper',
                borderRadius: '50%',
              }}
            />
          </Box>
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
            {profileData.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {profileData.profession || 'מקצוע לא צוין'}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <Rating
              value={profileData.averageRating || 5}
              readOnly
              precision={0.1}
              sx={{
                '& .MuiRating-iconFilled': {
                  color: 'gold',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              ({profileData.totalReviews || '0'} ביקורות)
            </Typography>
          </Stack>
        </Box>
      </Paper>

      <Stack spacing={2} sx={{ mt: 3 }}>
        <InfoItem
          icon={<Work />}
          text={`מקצוע: ${profileData.profession || 'לא צוין'}`}
        />
        <InfoItem
          icon={<LocationOn />}
          text={`מקום מגורים: ${profileData.location || 'לא צוין'}`}
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
          text={`טלפון: ${profileData.phone || 'לא צוין'}`}
        />

        {/* כותרת "כישורים" בדיוק כמו ב"פירוט על החברה" */}
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


        {/* ביקורות */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3 }}>
          הביקורות של {profileData.name}
        </Typography>

        {profileData.reviews && profileData.reviews.length > 0 ? (
          profileData.reviews.slice(0, 1).map((review, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body1">"{review.text}"</Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Avatar
                  src={
                    review.reviewerProfileURL ||
                    '/placeholder.svg?height=40&width=40'
                  }
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="subtitle2">
                    {review.reviewerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.date}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            אין ביקורות להצגה.
          </Typography>
        )}

        {profileData.reviews && profileData.reviews.length > 1 && (
          <Button variant="contained" fullWidth>
            הצגת ביקורות נוספות
          </Button>
        )}
      </Stack>
    </Box>
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

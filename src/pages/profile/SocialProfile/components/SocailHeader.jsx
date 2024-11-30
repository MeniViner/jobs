import React from 'react';
import {
  Box, Typography, Avatar, Paper, Stack, Rating, IconButton
} from '@mui/material';
import { Verified, NewReleases, Star } from '@mui/icons-material';

export default function ProfileHeader({ profileData, isEmployer, reviews, jobsWorkedCount }) {
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;
  
    // useEffect(() => {
    //   if (averageRating !== null) {
    //     updateAverageRating(db, profileData.id, averageRating);
    //   }
    // }, [averageRating, profileData.id, db]);
  
    let workerStatusIcon;
    
    if (!isEmployer) {
      if (jobsWorkedCount >= 2) {
        workerStatusIcon = <Star sx={{ color: 'gold', fontSize: 40 }} />;
      } else {
        workerStatusIcon = <NewReleases sx={{ color: 'silver', fontSize: 40 }} />;
      }
    }
  
    return (
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profileData.profileURL || profileData.photoURL}
              alt={profileData.name || 'ano' }
              sx={{ width: 120, height: 120, border: '4px solid white' }}
            />
            {/* Worker status icon */}
            {workerStatusIcon && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  padding: '4px',
                }}
              >
                {workerStatusIcon}
              </Box>
            )}
            {profileData.isVerified && (
              <IconButton
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: -10,
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
            {isEmployer
              ? profileData.companyName || 'שם העסק'
              : profileData.profession || 'מקצוע לא צוין'}
          </Typography>
          {/* Display number of jobs worked */}
          {!isEmployer && (
            <Typography variant="subtitle2" color="text.secondary">
              מספר עבודות שבוצעו: {jobsWorkedCount}
            </Typography>
          )}
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
  
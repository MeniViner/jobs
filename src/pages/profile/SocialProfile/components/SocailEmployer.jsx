import React from 'react';
import {
  Box, Typography, Paper, Stack, Chip, IconButton, Divider, Button, Menu, MenuItem
} from '@mui/material';
import {
   LocationOn, Email, Phone, Business, Sort
} from '@mui/icons-material';
import { ContactIconsDisplay } from '../../../../components/code parts/ContactMethodsManager';

import ProfileHeader from './SocailHeader';
import ReviewCard from './SocialReviewCard';

export default function EmployerProfile({
    profileData,
    reviews,
    showAllReviews,
    setShowAllReviews,
    sortAnchorEl,
    setSortAnchorEl,
    setSortOption,
    sortOption,
  }) {
    const handleSortMenuOpen = (event) => {
      setSortAnchorEl(event.currentTarget);
    };
  
    const handleSortMenuClose = () => {
      setSortAnchorEl(null);
    };
  
    const handleSortOptionChange = (option) => {
      setSortOption(option);
      handleSortMenuClose();
    };
  
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
  
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              הביקורות של {profileData.name}
            </Typography>
            <IconButton onClick={handleSortMenuOpen}>
              <Sort />
            </IconButton>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortMenuClose}
            >
              <MenuItem onClick={() => handleSortOptionChange('date_desc')}>
                תאריך (מהחדש לישן)
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionChange('date_asc')}>
                תאריך (מהישן לחדש)
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionChange('rating_desc')}>
                דירוג (מהגבוה לנמוך)
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionChange('rating_asc')}>
                דירוג (מהנמוך לגבוה)
              </MenuItem>
            </Menu>
          </Box>
  
          {reviews.length > 0 ? (
            <>
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {reviews.length > 3 && (
                <Button onClick={() => setShowAllReviews(!showAllReviews)}>
                  {showAllReviews ? 'הצג פחות' : 'הצג עוד'}
                </Button>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              אין ביקורות להצגה.
            </Typography>
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

import React from 'react';
import {
  Box, Typography, Paper, Stack, Chip, IconButton, Divider, Button, Menu, MenuItem
} from '@mui/material';
import {
  Language, LocationOn, Work, School, Email, Phone, DirectionsCar, Sort
} from '@mui/icons-material';
import { ContactIconsDisplay } from '../../../../components/code parts/ContactMethodsManager';
import ProfileHeader from './SocailHeader';
import ReviewCard from './SocialReviewCard';


export default function EmployeeProfile({
    profileData,
    reviews,
    jobsWorkedCount,
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
        <ProfileHeader
          profileData={profileData}
          isEmployer={false}
          reviews={reviews}
          jobsWorkedCount={jobsWorkedCount}
        />
  
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
  
          {Array.isArray(profileData.contactMethods) && profileData.contactMethods.length > 0 && (
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

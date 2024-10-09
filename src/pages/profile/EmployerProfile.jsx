import React, { useState, useEffect } from 'react';
import { RatingDisplay } from '../rating/RatingSystem';
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';

const EmployerProfile = ({
  profileData,
  onUpdateProfile,
  onDeleteAccountRequest,
  handleSignOut,
  snackbar,
  setSnackbar,
}) => {
  const [editing, setEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [editedData, setEditedData] = useState(profileData);

  const calculateCompletionPercentage = (data) => {
    const fields = [
      'name',
      'email',
      'phone',
      'location',
      'employerDetails.companyName',
      'employerDetails.companyDescription',
      'employerDetails.businessType',
    ];
    const completedFields = fields.filter((field) => {
      const value = field.split('.').reduce((o, i) => o[i], data);
      return value && value.length > 0;
    });
    return (completedFields.length / fields.length) * 100;
  };

  useEffect(() => {
    if (profileData) {
      setCompletionPercentage(calculateCompletionPercentage(profileData));
      setEditedData(profileData);
    }
  }, [profileData]);

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setNewProfilePicture(e.target.files[0]);
      // כאן ניתן להוסיף פונקציה להעלאת התמונה לשרת ולעדכן את הפרופיל
    }
  };

  const handleSaveChanges = () => {
    onUpdateProfile(editedData);
    setEditing(false);
  };

  return (
    <Box sx={{ maxWidth: '100%', width: '100%', p: 2, bgcolor: '#f5f5f5' }}>
      <Card
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* חלק עליון עם תמונת רקע ופרופיל */}
        <Box
          sx={{
            height: 150,
            background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Avatar
            src={profileData.photoURL || '/placeholder.svg'}
            alt={profileData.name}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'absolute',
              bottom: '-60px',
            }}
          />
          {/* כפתור להעלאת תמונת פרופיל חדשה */}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="icon-button-file"
            type="file"
            onChange={handleProfilePictureChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              sx={{
                position: 'absolute',
                bottom: '-30px',
                right: '50%',
                transform: 'translateX(80px)',
                bgcolor: 'white',
                '&:hover': { bgcolor: '#f0f0f0' },
              }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </label>
        </Box>

        {/* הצגת דירוג */}
        <RatingDisplay userId={profileData.uid} isEmployer={true} />

        <CardContent sx={{ pt: 8, pb: 4, px: 3 }}>
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            {profileData.name || 'שם המעסיק'}
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
            {profileData.employerDetails?.companyName || 'הוסף שם חברה'}
          </Typography>

          {/* השלמת פרופיל */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              השלמת פרופיל
            </Typography>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 10,
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {Math.round(completionPercentage)}% הושלם
            </Typography>
          </Box>

          {/* פרטי התקשרות */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              פרטי התקשרות
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {profileData.location || 'הוסף מיקום'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {profileData.phone || 'הוסף מספר טלפון'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {profileData.email || 'הוסף כתובת אימייל'}
              </Typography>
            </Box>
          </Box>

          {/* פרטי חברה */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              פרטי חברה
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {profileData.employerDetails?.businessType || 'הוסף סוג עסק'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {profileData.employerDetails?.companyDescription ||
                'הוסף תיאור חברה כדי למשוך עובדים פוטנציאליים.'}
            </Typography>
          </Box>

          {/* כפתורי פעולה */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              color="primary"
              onClick={() => setEditing(true)}
              sx={{
                borderRadius: 20,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': { boxShadow: '0 6px 12px rgba(0,0,0,0.2)' },
              }}
            >
              ערוך פרופיל
            </Button>
            <Button
              startIcon={<ExitToAppIcon />}
              variant="outlined"
              color="error"
              onClick={handleSignOut}
              sx={{
                borderRadius: 20,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                '&:hover': { boxShadow: '0 6px 12px rgba(0,0,0,0.2)' },
              }}
            >
              התנתק
            </Button>
          </Box>

          {/* בקשת מחיקת חשבון */}
          <Box sx={{ mt: 4 }}>
            {profileData.pendingDeletion ? (
              <Typography
                variant="body1"
                align="center"
                sx={{
                  p: 2,
                  bgcolor: 'warning.light',
                  color: 'warning.contrastText',
                  borderRadius: 1,
                }}
              >
                בקשת מחיקת חשבון בהמתנה לאישור
              </Typography>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={onDeleteAccountRequest}
                fullWidth
                sx={{
                  borderRadius: 20,
                  mt: 2,
                }}
              >
                בקש מחיקת חשבון
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* דיאלוג עריכת פרופיל */}
      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>ערוך פרופיל</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="שם"
            name="name"
            value={editedData.name || ''}
            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מיקום"
            name="location"
            value={editedData.location || ''}
            onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מספר טלפון"
            name="phone"
            value={editedData.phone || ''}
            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="שם חברה"
            name="companyName"
            value={editedData.employerDetails?.companyName || ''}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                employerDetails: {
                  ...editedData.employerDetails,
                  companyName: e.target.value,
                },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="סוג עסק"
            name="businessType"
            value={editedData.employerDetails?.businessType || ''}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                employerDetails: {
                  ...editedData.employerDetails,
                  businessType: e.target.value,
                },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="תיאור חברה"
            name="companyDescription"
            value={editedData.employerDetails?.companyDescription || ''}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                employerDetails: {
                  ...editedData.employerDetails,
                  companyDescription: e.target.value,
                },
              })
            }
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>ביטול</Button>
          <Button onClick={handleSaveChanges} color="primary">
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar להצגת הודעות */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployerProfile;

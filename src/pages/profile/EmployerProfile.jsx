import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, LinearProgress, Card, CardContent,
  Snackbar, Alert, Grid, Paper
} from '@mui/material';
import {
  Edit as EditIcon, Business as BusinessIcon, LocationOn as LocationIcon, 
  Phone as PhoneIcon, Email as EmailIcon, ExitToApp as ExitToAppIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CloudinaryUpload from '../../components/CloudinaryUpload';
import { RatingDisplay } from '../rating/RatingSystem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/system';

const BannerBox = styled(Box)(({ theme, banner }) => ({
  height: banner ? 200 : 150,
  backgroundImage: banner
    ? `url(${encodeURI(banner)})`
    : 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    height: 150,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 140,
  height: 140,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[4],
  position: 'absolute',
  bottom: -70,
  [theme.breakpoints.down('sm')]: {
    width: 100,
    height: 100,
    bottom: -50,
  },
}));

const ActionButton = styled(Button)(({ theme, colorVariant }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 3),
  boxShadow: theme.shadows[2],
  textTransform: 'none',
  fontWeight: 'bold',
  ...(colorVariant === 'primary' && {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: theme.shadows[4],
    },
  }),
  ...(colorVariant === 'error' && {
    backgroundColor: theme.palette.error.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
      boxShadow: theme.shadows[4],
    },
  }),
}));

const EmployerProfile = ({ profileData, onDeleteAccountRequest, handleSignOut }) => {
  const [employerProfileData, setEmployerProfileData] = useState({});
  const [editing, setEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [editedData, setEditedData] = useState({});
  const [editName, setEditName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [photoURL, setPhotoURL] = useState(null); // State for photoURL 

  const auth = getAuth();
  const db = getFirestore();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Use onSnapshot for real-time updates from the 'employers' collection

  // Fetch employer profile fields from 'employers' collection
  useEffect(() => {
    const fetchEmployerData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'employers', user.uid);

        // Set up real-time listener using onSnapshot
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEmployerProfileData(data);
            setCompletionPercentage(calculateCompletionPercentage(data));
  
            // Initialize editedData with existing data from Firestore
            setEditedData({
              name: data.name || '',
              location: data.location || '',
              phone: data.phone || '',
              companyName: data.companyName || '',
              businessType: data.businessType || '',
              companyDescription: data.companyDescription || '',
            });
          }
        }, (error) => {
          console.error("Error fetching employer data:", error);
        });

        // Unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
      }
    };
  
    fetchEmployerData();
  }, [auth.currentUser, db]);  
    // Use onSnapshot for real-time updates from the 'users' collection
    useEffect(() => {
      const fetchUserImages = async () => {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
  
          // Set up real-time listener using onSnapshot
          const unsubscribe = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setNewProfilePicture(userData.profileURL); // Profile picture from 'users' collection
              setNewBannerImage(userData.bannerURL); // Banner image from 'users' collection
              setPhotoURL(userData.photoURL); 
              setEditName(userData.name); 
            }
          }, (error) => {
            console.error("Error fetching user images:", error);
          });
  
          // Unsubscribe from the listener when the component unmounts
          return () => unsubscribe();
        }
      };
  
      fetchUserImages();
    }, [auth.currentUser, db]);
  }, [auth.currentUser]);

  // Fetch profile picture and banner from 'users' collection
  useEffect(() => {
    const fetchUserImages = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setNewProfilePicture(userData.profileURL);
          setNewBannerImage(userData.bannerURL);
        }
      }
    };

    fetchUserImages();
  }, [auth.currentUser]);

  const calculateCompletionPercentage = (data) => {
    const fields = ['name', 'email', 'phone', 'location', 'companyName', 'companyDescription', 'businessType'];
    const completedFields = fields.filter(field => data[field] && data[field].length > 0);
    return (completedFields.length / fields.length) * 100;
  };  
  
  const handleSaveChanges = async () => {
    const user = auth.currentUser;
  
    if (user) {
      try {
        // Update the 'users' collection for name
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { name: editName });
  
        // Update the 'employers' collection for the rest of the fields
        const employerDocRef = doc(db, 'employers', user.uid);
        await updateDoc(employerDocRef, editedData);
  
        setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
        setEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        setSnackbar({ open: true, message: 'Error updating profile', severity: 'error' });
      }
    if (auth.currentUser) {
      const docRef = doc(db, 'employers', auth.currentUser.uid);
      await updateDoc(docRef, editedData);
      setEmployerProfileData(prev => ({ ...prev, ...editedData }));
      setEditing(false);
      setSnackbar({ open: true, message: 'הפרופיל עודכן בהצלחה', severity: 'success' });
    }
  };
  

  return (
    <Box sx={{ maxWidth: '100%', width: '100%', p: 2, bgcolor: '#f5f5f5' }}>
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <Box

          sx={{
            height: isMobile ? 150 : 200,
            backgroundImage: newBannerImage
            ? `url(${encodeURI(newBannerImage)})` 
            : employerProfileData.bannerURL
            ? `url(${employerProfileData.bannerURL})`
            : 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',

            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Avatar
            src={newProfilePicture || employerProfileData.profileURL || photoURL }
            alt={employerProfileData.name}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'absolute',
              bottom: '-60px',
            }}
          />
          <CloudinaryUpload setNewImage={setNewProfilePicture} />
          <CloudinaryUpload setNewImage={setNewBannerImage} banner={true} />
        </Box>

        <RatingDisplay userId={auth.currentUser?.uid} isEmployer={true} />

        <CardContent sx={{ pt: 8, pb: 4, px: 3 }}> 
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            {/* from users db */}
            {profileData.name || 'Employer Name'} 
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2, bgcolor: '#f0f2f5' }}>
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <BannerBox banner={newBannerImage || employerProfileData.bannerURL}>
          <StyledAvatar
            src={newProfilePicture || employerProfileData.profileURL || '/placeholder.svg'}
            alt={employerProfileData.name || 'שם המעסיק'}
          />
          <Box sx={{ position: 'absolute', top: 60, right: 16 }}>
            <CloudinaryUpload setNewImage={setNewBannerImage} banner={true} />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
            <CloudinaryUpload setNewImage={setNewProfilePicture} />
          </Box>
        </BannerBox>

        <Box sx={{ p: 3, pt: 10, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {profileData.name || 'שם המעסיק'}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {employerProfileData.companyName || 'שם החברה'}
          </Typography>

          <RatingDisplay userId={auth.currentUser?.uid} isEmployer={true} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              השלמת פרופיל
            </Typography>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: 'primary.main',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(completionPercentage)}% מושלם
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  פרטי קשר
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    {employerProfileData.location || 'הוסף מיקום'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    {employerProfileData.phone || 'הוסף מספר טלפון'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    {employerProfileData.email || 'הוסף כתובת אימייל'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  פרטי החברה
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    {employerProfileData.businessType || 'הוסף סוג עסק'}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {employerProfileData.companyDescription || 'הוסף תיאור חברה כדי למשוך מועמדים פוטנציאליים.'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
            <Grid item>
              <ActionButton
                startIcon={<EditIcon />}
                colorVariant="primary"
                onClick={() => setEditing(true)}
              >
                עריכת פרופיל
              </ActionButton>
            </Grid>
            <Grid item>
              <ActionButton
                startIcon={<ExitToAppIcon />}
                colorVariant="error"
                onClick={handleSignOut}
              >
                התנתקות
              </ActionButton>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {employerProfileData.pendingDeletion ? (
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  bgcolor: 'warning.light',
                  color: 'warning.dark',
                  borderRadius: 2,
                }}
              >
                בקשת מחיקת חשבון ממתינה לאישור
              </Typography>
            ) : (
              <ActionButton
                startIcon={<DeleteIcon />}
                colorVariant="error"
                onClick={onDeleteAccountRequest}
                fullWidth={isMobile}
                sx={{
                  maxWidth: isMobile ? '100%' : '300px',
                }}
              >
                בקשת מחיקת חשבון
              </ActionButton>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Dialog לעריכת פרופיל */}
      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>עריכת פרופיל</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={editName || ''}  // Controlled by editName
            onChange={(e) => setEditName(e.target.value)}  // Update editName only
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={editedData.location || ''}
            onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={editedData.phone || ''}
            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Company Name"
            name="companyName"
            value={editedData.companyName || ''}
            onChange={(e) => setEditedData({ ...editedData, companyName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Business Type"
            name="businessType"
            value={editedData.businessType || ''}
            onChange={(e) => setEditedData({ ...editedData, businessType: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Company Description"
            name="companyDescription"
            value={editedData.companyDescription || ''}
            onChange={(e) => setEditedData({ ...editedData, companyDescription: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם"
                name="name"
                value={editedData.name || employerProfileData.name || ''}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="מיקום"
                name="location"
                value={editedData.location || employerProfileData.location || ''}
                onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="מספר טלפון"
                name="phone"
                value={editedData.phone || employerProfileData.phone || ''}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                margin="normal"
                variant="outlined"
                type="tel"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם החברה"
                name="companyName"
                value={editedData.companyName || employerProfileData.companyName || ''}
                onChange={(e) => setEditedData({ ...editedData, companyName: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="סוג עסק"
                name="businessType"
                value={editedData.businessType || employerProfileData.businessType || ''}
                onChange={(e) => setEditedData({ ...editedData, businessType: e.target.value })}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור החברה"
                name="companyDescription"
                value={editedData.companyDescription || employerProfileData.companyDescription || ''}
                onChange={(e) => setEditedData({ ...editedData, companyDescription: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)} color="secondary">
            ביטול
          </Button>
          <Button onClick={handleSaveChanges} color="primary" variant="contained">
            שמירת שינויים
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar להודעות */}
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

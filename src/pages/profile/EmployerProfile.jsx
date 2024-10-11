import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, LinearProgress, Card, CardContent,
  Snackbar, Alert
} from '@mui/material';
import {
  Edit as EditIcon, Business as BusinessIcon, LocationOn as LocationIcon, 
  Phone as PhoneIcon, Email as EmailIcon, ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CloudinaryUpload from '../../components/CloudinaryUpload';  // Import the new CloudinaryUpload component
import { RatingDisplay } from '../rating/RatingSystem';

const EmployerProfile = ({ profileData, onDeleteAccountRequest, handleSignOut }) => {
  const [employerProfileData, setEmployerProfileData] = useState({});
  const [editing, setEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [editedData, setEditedData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const auth = getAuth();
  const db = getFirestore();

  // Fetch employer profile fields from 'employers' collection
  useEffect(() => {
    const fetchEmployerData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'employers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmployerProfileData(data);
          setCompletionPercentage(calculateCompletionPercentage(data));
        }
      }
    };

    fetchEmployerData();
  }, [auth.currentUser]);

  // Fetch profile picture and banner from 'users' collection
  useEffect(() => {
    const fetchUserImages = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Fetch from 'users' collection
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setNewProfilePicture(userData.profileURL); // Profile picture from 'users' collection
          setNewBannerImage(userData.bannerURL); // Banner image from 'users' collection
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
    if (auth.currentUser) {
      const docRef = doc(db, 'employers', auth.currentUser.uid);
      await updateDoc(docRef, editedData);
      setEmployerProfileData(editedData);
      setEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
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
            src={newProfilePicture || employerProfileData.profileURL || '/placeholder.svg'}
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
            {profileData.name || 'Employer Name'}
          </Typography>

          <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
            {employerProfileData.companyName || 'Add Company Name'}
          </Typography>


          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              Profile Completion
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
              {Math.round(completionPercentage)}% Completed
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {employerProfileData.location || 'Add Location'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {employerProfileData.phone || 'Add Phone Number'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {employerProfileData.email || 'Add Email Address'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Company Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                {employerProfileData.businessType || 'Add Business Type'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {employerProfileData.companyDescription || 'Add company description to attract potential employees.'}
            </Typography>
          </Box>

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
              Edit Profile
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
              Sign Out
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            {employerProfileData.pendingDeletion ? (
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
                Account deletion request pending approval
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
                Request Account Deletion
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={editedData.name || ''}
            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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
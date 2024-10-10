import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingDisplay } from '../rating/RatingSystem';
import { 
  Box, Typography, Button, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, LinearProgress, Card, CardContent, Paper, Tooltip, Snackbar, Alert 
} from '@mui/material';
import { 
  Edit as EditIcon, PhotoCamera as PhotoCameraIcon, Work as WorkIcon, School as SchoolIcon,
  Language as LanguageIcon, LocationOn as LocationIcon, Phone as PhoneIcon, Email as EmailIcon,
  Add as AddIcon, ExitToApp as ExitToAppIcon, ArrowUpward as ArrowUpwardIcon, Info as InfoIcon,
} from '@mui/icons-material';
import CloudinaryUpload from '../../components/CloudinaryUpload';  // Import the new CloudinaryUpload component
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import userProfilePic from '../../images/user.png'


const EmployeeProfile = ({
  profileData,
  onUpdateProfile,
  onDeleteAccountRequest,
  handleSignOut,
  snackbar,
  setSnackbar,
}) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [editedData, setEditedData] = useState(profileData);
  const auth = getAuth();
  const db = getFirestore();


  const calculateCompletionPercentage = (data) => {
    const fields = ['name', 'email', 'phone', 'location', 'skills', 'education', 'experience', 'languages', 'bio'];
    const completedFields = fields.filter(field => data[field] && data[field].length > 0);
    return (completedFields.length / fields.length) * 100;
  };

  useEffect(() => {
    if (profileData) {
      setCompletionPercentage(calculateCompletionPercentage(profileData));
      setEditedData(profileData);
    }
  }, [profileData]);

  useEffect(() => {
    const fetchUserImages = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Fetch from 'users' collection
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setNewProfilePicture(userData.photoURL); // Profile picture from 'users' collection
        }
      }
    };

    fetchUserImages();
  }, [auth.currentUser]);


  const handleSaveChanges = () => {
    onUpdateProfile(editedData);
    setEditing(false);
  };

  const handleUpgradeClick = () => {
    navigate('/employer-registration');
  };

  return (
    <Box sx={{ maxWidth: '100%', width: '100%', p: 2, bgcolor: '#f5f5f5' }}>
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
      <Box sx={{
          height: 150,
          background: 'linear-gradient(45deg, #ff4081 60%, #ffeb3b 90%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <Avatar
            src={newProfilePicture || profileData.photoURL || userProfilePic}
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
          <CloudinaryUpload setNewImage={setNewProfilePicture} />
        </Box>

        <RatingDisplay userId={profileData.uid} isEmployer={false} />

        <CardContent sx={{ pt: 8, pb: 4, px: 3 }}>
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            {profileData.name}
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
            מחפש עבודה
          </Typography>

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

          {profileData.pendingEmployer ? (
            <Paper 
              elevation={3}
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'info.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <InfoIcon color="info" />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="info.dark">
                  בקשת השדרוג בהמתנה
                </Typography>
                <Typography variant="body2" color="info.dark">
                  בקשתך לשדרג לחשבון מעסיק נמצאת כעת בבדיקה.
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Card sx={{ mt: 4, mb: 4, background: 'linear-gradient(to right, #2196f3, #673ab7)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                      הפוך למעסיק ופתח הזדמנויות חדשות!
                    </Typography>
                  </Box>
                  <ArrowUpwardIcon sx={{ color: 'white', fontSize: 48 }} />
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleUpgradeClick}
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: 'white',
                    color: '#2196f3',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                >
                  שדרג לפרופיל מעסיק
                </Button>
              </CardContent>
            </Card>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">אודותיי</Typography>
            <Typography variant="body1" color="text.secondary">
              {profileData.bio || 'הוסף תיאור קצר על עצמך'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, my: 2 }}>
            {profileData.skills.slice(0, 3).map((skill, index) => (
              <Chip key={index} label={skill} size="small" sx={{ bgcolor: '#e0e0e0' }} />
            ))}
            {profileData.skills.length > 3 && (
              <Chip label={`+${profileData.skills.length - 3}`} size="small" variant="outlined" />
            )}
            <Tooltip title="הוסף כישורים">
              <Chip 
                icon={<AddIcon />} 
                label="הוסף" 
                onClick={() => setEditing(true)} 
                sx={{ cursor: 'pointer' }} 
              />
            </Tooltip>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">פרטי התקשרות</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.location || 'הוסף מיקום'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.phoneNumber || 'הוסף מספר טלפון'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.email || 'הוסף כתובת אימייל'}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">פרטים מקצועיים</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.education || 'הוסף השכלה'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.experience || 'הוסף ניסיון עבודה'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.languages.join(', ') || 'הוסף שפות שאתה דובר'}</Typography>
            </Box>
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
              ערוך פרופיל
            </Button>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent:  'center' }}>
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
              התנתקות
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            {profileData.pendingDeletion ? (
              <Typography 
                variant="body1" 
                align="center" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'warning.light', 
                  color: 'warning.contrastText',
                  borderRadius: 1
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
              >
                בקש מחיקת חשבון
              </Button>
            )}
          </Box>

        </CardContent>
      </Card>

      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>ערוך פרופיל</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="שם"
            name="name"
            value={editedData.name}
            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מיקום"
            name="location"
            value={editedData.location}
            onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מספר טלפון"
            name="phone"
            value={editedData.phone}
            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="כישורים (מופרדים בפסיק)"
            name="skills"
            value={editedData.skills.join(', ')}
            onChange={(e) => setEditedData({ ...editedData, skills: e.target.value.split(',').map(skill => skill.trim()) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="השכלה"
            name="education"
            value={editedData.education}
            onChange={(e) => 
              setEditedData({ ...editedData, education: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="ניסיון עבודה"
            name="experience"
            value={editedData.experience}
            onChange={(e) =>
              setEditedData({ ...editedData, experience: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="שפות  (מופרדות בפסיק)"
            name="languages"
            value={editedData.languages.join(', ')}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                languages: e.target.value.split(',').map((lang) => lang.trim()),
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="אודותיי"
            name="bio"
            value={editedData.bio || ''}
            onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>ביטול</Button>
          <Button onClick={handleSaveChanges} color="primary">
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeProfile;

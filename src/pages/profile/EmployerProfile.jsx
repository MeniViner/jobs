import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, IconButton, List, ListItem, ListItemText, ListItemIcon, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Divider, LinearProgress,
  Menu, MenuItem, CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Notifications as NotificationsIcon, ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Edit as EditIcon, Star as StarIcon, Add as AddIcon, Delete as DeleteIcon, Security as SecurityIcon,
  Payment as PaymentIcon, Notifications as NotificationsSettingsIcon, Lock as PrivacyIcon,
  Settings as PreferencesIcon, Person as PersonIcon, PhotoCamera as PhotoCameraIcon, Business as BusinessIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { RatingDisplay } from '../rating/RatingSystem';
import { ContactMethodsManager } from '../../components/code parts/ContactMethodsManager';
import { SendFeedback } from '../../components/code parts/FeedbackManager';


export default function EmployerProfile({
  profileData,
  onUpdateProfile,
  handleSignOut,
  snackbar,
  setSnackbar,
  onDeleteAccountRequest,
  onSwitchToggle,
}) {
  const navigate = useNavigate();
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingBusinessInfo, setEditingBusinessInfo] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editedData, setEditedData] = useState(profileData);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [contactMethods, setContactMethods] = useState(profileData.contactMethods || []);

  // פונקציית CloudinaryUpload להעלאת תמונות
  const CloudinaryUpload = async (file, callback) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const optimizedImageUrl = data.secure_url;
      callback(optimizedImageUrl);
    } catch (error) {
      console.error('Error during image upload:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בהעלאת התמונה',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    setEditedData(profileData);
    setCompletionPercentage(calculateCompletionPercentage(profileData));
  }, [profileData]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const employerDocRef = doc(db, 'employers', user.uid);

        const [userDocSnap, employerDocSnap] = await Promise.all([
          getDoc(userDocRef),
          getDoc(employerDocRef),
        ]);

        if (userDocSnap.exists() && employerDocSnap.exists()) {
          const userData = userDocSnap.data();
          const employerData = employerDocSnap.data();
          setNewProfilePicture(userData.profileURL);
          setNewBannerImage(userData.bannerURL);
          setEditedData({
            ...userData,
            ...employerData,
            companyName: employerData.companyName || '',
            businessType: employerData.businessType || '',
            description: employerData.description || '',
            email: employerData.email || '',
            phone: employerData.phoneNumber  || '',
          });
          setCompletionPercentage(
            calculateCompletionPercentage({ ...userData, ...employerData })
          );
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser, db]);

  const calculateCompletionPercentage = (data) => {
    const fields = [
      'name',
      'email',
      'phone',
      'location',
      'companyName',
      'businessType',
      'companyDescription',
      'businessAddress',
      'businessPhone',
      'businessEmail',
      'website',
      'foundedYear',
      'numberOfEmployees',
    ];
    const completedFields = fields.filter(
      (field) => data[field] && data[field].length > 0
    );
    return (completedFields.length / fields.length) * 100;
  };

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field, value) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const collection = [
          'companyName',
          'businessType',
          'companyDescription',
          'businessAddress',
          'businessPhone',
          'businessEmail',
          'website',
          'foundedYear',
          'numberOfEmployees',
        ].includes(field)
          ? 'employers'
          : 'users';
        const docRef = doc(db, collection, user.uid);
        await updateDoc(docRef, { [field]: value });
        setEditedData({ ...editedData, [field]: value });
        setEditingField(null);
        onUpdateProfile({ ...editedData, [field]: value });
        setSnackbar({
          open: true,
          message: 'פרטים עודכנו בהצלחה',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating document: ', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בעדכון הפרטים',
        severity: 'error',
      });
    }
  };

  const handleProfilePictureChange = async (url) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { profileURL: url });
        setNewProfilePicture(url);
        onUpdateProfile({ ...editedData, profileURL: url });
        setSnackbar({
          open: true,
          message: 'תמונת הפרופיל עודכנה בהצלחה',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating profile picture: ', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בעדכון תמונת הפרופיל',
        severity: 'error',
      });
    }
  };

  // פונקציה למחיקת תמונת הפרופיל
  const handleDeleteProfilePicture = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { profileURL: null });
        setNewProfilePicture(null);
        onUpdateProfile({ ...editedData, profileURL: null });
        setSnackbar({
          open: true,
          message: 'תמונת הפרופיל נמחקה בהצלחה',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error deleting profile picture: ', error);
      setSnackbar({
        open: true,
        message: 'שגיאה במחיקת תמונת הפרופיל',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleCloseMenu();
    }
  };

  // פונקציות לתפריט
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const renderEditDialog = () => {
    if (!editingField) return null;

    return (
      <Dialog open={!!editingField} onClose={() => setEditingField(null)}>
        <DialogTitle>עריכת {getFieldLabel(editingField)}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline={['companyDescription', 'description'].includes(
              editingField
            )}
            rows={
              ['companyDescription', 'description'].includes(editingField)
                ? 4
                : 1
            }
            value={editedData[editingField] || ''}
            onChange={(e) =>
              setEditedData({ ...editedData, [editingField]: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingField(null)}>ביטול</Button>
          <Button onClick={() => handleSave(editingField, editedData[editingField])}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'name':
        return 'שם חוקי';
      case 'phone':
        return 'מספר טלפון';
      case 'email':
        return 'כתובת אימייל';
      case 'location':
        return 'מיקום';
      case 'companyName':
        return 'שם החברה';
      case 'businessType':
        return 'סוג העסק';
      case 'description':
        return 'תיאור החברה';
      case 'businessAddress':
        return 'כתובת העסק';
      case 'businessPhone':
        return 'טלפון העסק';
      case 'businessEmail':
        return 'אימייל העסק';
      case 'website':
        return 'אתר אינטרנט';
      case 'foundedYear':
        return 'שנת הקמה';
      case 'numberOfEmployees':
        return 'מספר עובדים';
      default:
        return '';
    }
  };

  const renderPersonalInfo = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          פרטים אישיים
        </Typography>
        <IconButton onClick={() => setEditingPersonalInfo(false)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <List>
        {['name', 'phone', 'email', 'location'].map((field) => (
          <ListItem key={field} divider>
            <ListItemText
              primary={getFieldLabel(field)}
              secondary={editedData[field] || 'לא סופק'}
            />
            <ListItemIcon>
              <IconButton edge="end" onClick={() => handleEdit(field)}>
                {editedData[field] ? <EditIcon /> : <AddIcon />}
              </IconButton>
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
      <ContactMethodsManager
        contactMethods={contactMethods}
        setContactMethods={setContactMethods}
      />
    </Box>
  );

  const renderBusinessInfo = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          פרטי העסק
        </Typography>
        <IconButton onClick={() => setEditingBusinessInfo(false)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <List>
        {[
          'companyName',
          'businessType',
          'description',
          'email',
          'phone',
          'businessAddress',
          'businessPhone',
          'businessEmail',
          'website',
          'foundedYear',
          'numberOfEmployees',
        ].map((field) => (
          <ListItem key={field} divider>
            <ListItemText
              primary={getFieldLabel(field)}
              secondary={editedData[field] || 'לא סופק'}
            />
            <ListItemIcon>
              <IconButton edge="end" onClick={() => handleEdit(field)}>
                {editedData[field] ? <EditIcon /> : <AddIcon />}
              </IconButton>
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderMainContent = () => (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            alt={profileData.name}
            src={
              newProfilePicture ||
              profileData.profileURL ||
              auth.currentUser?.photoURL ||
              '/placeholder.svg'
            }
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              bottom: -8,
              right: 4,
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={handleOpenMenu}
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
          {loading && (
            <CircularProgress
              size={64}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          )}
          {/* תפריט עם אפשרויות "החלף תמונה" ו"מחק תמונה" */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem
              onClick={() => {
                document.getElementById('profile-picture-upload').click();
                handleCloseMenu();
              }}
            >
              החלף תמונה
            </MenuItem>
            {newProfilePicture && (
              <MenuItem onClick={handleDeleteProfilePicture}>מחק תמונה</MenuItem>
            )}
          </Menu>
          <input
            id="profile-picture-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setLoading(true);
                const file = e.target.files[0];
                CloudinaryUpload(file, (url) => {
                  handleProfilePictureChange(url);
                  setLoading(false);
                });
              }
            }}
          />
        </Box>
        <Box>
          <Typography variant="h6">{profileData.name}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            onClick={() => {
              if (userId) {
                navigate(`/user/${userId}`);
              } else {
                setSnackbar({
                  open: true,
                  message: 'משתמש לא מחובר',
                  severity: 'error',
                });
              }
            }}
            sx={{ cursor: 'pointer' }}
          >
            הצג פרופיל
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          פרטי העסק
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => setEditingBusinessInfo(true)}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">
                {editedData.companyName || 'הוסף שם חברה'}
              </Typography>
            </Box>
            <ChevronLeftIcon />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {editedData.businessType || 'הוסף סוג עסק'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          השלמת פרופיל
        </Typography>
        <LinearProgress
          variant="determinate"
          value={completionPercentage}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {Math.round(completionPercentage)}% הושלם
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ p: 2 }}>
        הגדרות
      </Typography>

      <List>
        <ListItem button onClick={() => setEditingPersonalInfo(true)}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="מידע אישי" secondary={profileData.name} />
          <ChevronLeftIcon />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => setShowRating(!showRating)}>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="דירוגים" />
          <ChevronLeftIcon />
        </ListItem>
        {showRating && (
          <Box sx={{ pl: 4, pr: 2, py: 2 }}>
            <RatingDisplay userId={auth.currentUser?.uid} isEmployer={true} />
          </Box>
        )}
        <Divider />
        <ListItem button onClick={() => setShowSecurity(!showSecurity)}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="התחברות ואבטחה" />
          <ChevronLeftIcon />
        </ListItem>
        <Divider />
        {showSecurity && (
          <Box sx={{ pl: 4, pr: 2, py: 2 }}>
            {profileData.pendingDeletion ? (
              <Typography
                variant="body2"
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
                startIcon={<DeleteIcon />}
              >
                בקש מחיקת חשבון
              </Button>
            )}
          </Box>
        )}
        <ListItem button onClick={() => setShowFeedback(!showFeedback)}>
          <ListItemIcon><RateReviewIcon /></ListItemIcon>
          <ListItemText primary="משוב למפתחי האתר" />
          <ChevronLeftIcon />
        </ListItem>
        {showFeedback && (
          <Box sx={{ pl: 4, pr: 2, py: 2 }}>
            <SendFeedback />
          </Box>
        )}


        <Divider />
        {[
          { key: 'payments', icon: <PaymentIcon />, label: 'תשלומים ותשלומים למארחים' },
          { key: 'privacy', icon: <PrivacyIcon />, label: 'פרטיות ושיתוף' },
          { key: 'preferences', icon: <PreferencesIcon />, label: 'העדפות' },
        ].map((item) => (
          <React.Fragment key={item.key}>
            <ListItem button onClick={() => alert('באמצע פיתוח')}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              <ChevronLeftIcon />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={handleSignOut}
          sx={{ mb: 2 }}
        >
          התנתקות
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <Box
        sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
          פרופיל מעסיק
        </Typography>
      </Box>

      {editingPersonalInfo
        ? renderPersonalInfo()
        : editingBusinessInfo
        ? renderBusinessInfo()
        : renderMainContent()}

      {renderEditDialog()}

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
}

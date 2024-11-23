// EmployeeProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, IconButton, List, ListItem, ListItemText, ListItemIcon, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Divider, LinearProgress,
  Menu, MenuItem, CircularProgress, ListItemAvatar,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { RatingDisplay } from '../rating/RatingSystem';

import {
  ArrowBack as ArrowBackIcon, ChevronLeft as ChevronLeftIcon,
  Edit as EditIcon, Star as StarIcon, Add as AddIcon, Delete as DeleteIcon, Security as SecurityIcon,
  Payment as PaymentIcon, Notifications as NotificationsSettingsIcon,
  Settings as PreferencesIcon, Person as PersonIcon, PhotoCamera as PhotoCameraIcon, Home as HomeIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { SendFeedback } from '../../components/code parts/FeedbackManager';
import { ContactMethodsManager } from '../../components/code parts/ContactMethodsManager';
import { db } from '../../services/firebase';

export default function EmployeeProfile({
  profileData,
  onUpdateProfile,
  handleSignOut,
  snackbar,
  setSnackbar,
  onDeleteAccountRequest,
}) {
  const navigate = useNavigate();
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingRatings, setEditingRatings] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editedData, setEditedData] = useState(profileData);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employerRequestStatus, setEmployerRequestStatus] = useState(null);
  const [shouldScrollTop, setShouldScrollTop] = useState(false);
  const auth = getAuth();
  const [showRating, setShowRating] = useState(false);

  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [contactMethods, setContactMethods] = useState(profileData.contactMethods || []);
  const [ratings, setRatings] = useState([]);
  const [showSecurity, setShowSecurity] = useState(false); // השארתי את showSecurity אם אתה משתמש בו
  const db = getFirestore();

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
    if (shouldScrollTop) {
      window.scrollTo(0, 0);
      setShouldScrollTop(false);
    }
  }, [shouldScrollTop]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setNewProfilePicture(userData.profileURL);
          setEmployerRequestStatus(userData.employerRequestStatus || null);
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser, db]);

  useEffect(() => {
    if (editingRatings) {
      fetchRatings();
    }
  }, [editingRatings]);

  const fetchRatings = async () => {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('recipientId', '==', userId));
      const querySnapshot = await getDocs(q);
      const ratingsData = [];
      querySnapshot.forEach((doc) => {
        ratingsData.push({ id: doc.id, ...doc.data() });
      });
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const calculateCompletionPercentage = (data) => {
    const fields = [
      'name',
      'email',
      'phoneNumber',
      'location',
      'skills',
      'education',
      'experience',
      'languages',
      'profession',
      'bio',
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
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { [field]: value });
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

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEmployerRequest = async () => {
    navigate('/employer-registration');
  };

  const handleEditPersonalInfo = () => {
    setEditingPersonalInfo(true);
    setEditingRatings(false);
    setEditingFeedback(false);
    setShouldScrollTop(true);
  };

  const handleEditRatings = () => {
    setEditingRatings(true);
    setEditingPersonalInfo(false);
    setEditingFeedback(false);
    setShouldScrollTop(true);
  };

  const handleEditFeedback = () => {
    setEditingFeedback(true);
    setEditingPersonalInfo(false);
    setEditingRatings(false);
    setShouldScrollTop(true);
  };

  const renderEditDialog = () => {
    if (!editingField) return null;

    return (
      <Dialog open={!!editingField} onClose={() => setEditingField(null)}>
        <DialogTitle>עריכת {getFieldLabel(editingField)}</DialogTitle>
        <DialogContent>
          {editingField === 'hasCar' ? (
            <Box>
              <Button
                variant={editedData.hasCar ? 'contained' : 'outlined'}
                onClick={() => setEditedData({ ...editedData, hasCar: true })}
              >
                כן
              </Button>
              <Button
                variant={!editedData.hasCar ? 'contained' : 'outlined'}
                onClick={() => setEditedData({ ...editedData, hasCar: false })}
                sx={{ ml: 2 }}
              >
                לא
              </Button>
            </Box>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              multiline={['bio', 'skills', 'languages', 'profession'].includes(editingField)}
              rows={['bio'].includes(editingField) ? 4 : 1}
              value={editedData[editingField] || ''}
              onChange={(e) =>
                setEditedData({ ...editedData, [editingField]: e.target.value })
              }
            />
          )}
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
      case 'preferredName':
        return 'שם פרטי מועדף';
      case 'phoneNumber':
        return 'מספר טלפון';
      case 'email':
        return 'כתובת אימייל';
      case 'address':
        return 'כתובת';
      case 'emergencyContact':
        return 'איש קשר למקרה חירום';
      case 'location':
        return 'מיקום';
      case 'skills':
        return 'כישורים';
      case 'education':
        return 'השכלה';
      case 'experience':
        return 'ניסיון';
      case 'languages':
        return 'שפות';
      case 'profession':
        return 'מקצוע';
      case 'bio':
        return 'אודות';
      case 'hasCar':
        return 'האם יש רכב?';
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
          mb: 2,
        }}
      >
        <IconButton onClick={() => {
          setEditingPersonalInfo(false);
          setShouldScrollTop(true);
        }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'center' }}>
          פרטים אישיים
        </Typography>
        <Box width={48} />
      </Box>
      <List>
        {[
          'name',
          'preferredName',
          'phoneNumber',
          'email',
          'address',
          'emergencyContact',
          'location',
          'skills',
          'education',
          'experience',
          'languages',
          'profession',
          'bio',
          'hasCar',
        ].map((field) => (
          <ListItem key={field} divider>
            <ListItemText
              primary={getFieldLabel(field)}
              secondary={
                field === 'hasCar'
                  ? editedData[field] ? 'כן' : 'לא'
                  : editedData[field] || 'לא סופק'
              }
            />
            <IconButton edge="end" onClick={() => handleEdit(field)}>
              {editedData[field] !== undefined ? <EditIcon /> : <AddIcon />}
            </IconButton>
          </ListItem>
        ))}
      </List>
      <ContactMethodsManager
        contactMethods={contactMethods}
        setContactMethods={setContactMethods}
      />
    </Box>
  );

  const renderRatings = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={() => {
          setEditingRatings(false);
          setShouldScrollTop(true);
        }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'center' }}>
          דירוגים
        </Typography>
        <Box width={48} />
      </Box>
      {/* מציגים את הדירוגים ללא תנאי */}
      <Box sx={{ pl: 4, pr: 2, py: 2 }}>
        <RatingDisplay userId={auth.currentUser?.uid} isEmployer={false} />
      </Box>
    </Box>
  );
  
  

  const renderFeedback = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={() => {
          setEditingFeedback(false);
          setShouldScrollTop(true);
        }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'center' }}>
          משוב למפתחי האתר
        </Typography>
        <Box width={48} />
      </Box>
      <SendFeedback />
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
              auth.currentUser?.photoURL
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
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
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
          שדרג לפרופיל מעסיק
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={employerRequestStatus !== 'pending' ? handleEmployerRequest : null}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
            {employerRequestStatus === 'pending' ? (
              <Typography>בקשתך נשלחה לצוות ותאושר בקרוב</Typography>
            ) : employerRequestStatus === 'rejected' ? (
              <Typography>בקשתך נדחתה, ניתן לשלוח בקשה חדשה</Typography>
            ) : (
              <Typography>הפוך למעסיק ופתח הזדמנויות חדשות!</Typography>
            )}
          </Box>
          {employerRequestStatus !== 'pending' && <ChevronLeftIcon />}
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
        <ListItem button onClick={handleEditPersonalInfo}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="מידע אישי" secondary={profileData.name} />
          <ChevronLeftIcon />
        </ListItem>
        <Divider />
        <ListItem button onClick={handleEditRatings}>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="דירוגים" />
          <ChevronLeftIcon />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => navigate('/company-info')}>
          <ListItemIcon>
            <BusinessIcon />
          </ListItemIcon>
          <ListItemText primary="מידע ושיתוף" />
          <ChevronLeftIcon />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => setShowSecurity(!showSecurity)}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="התחברות ואבטחה" />
          <ChevronLeftIcon />
        </ListItem>
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
        <Divider />
        <ListItem button onClick={handleEditFeedback}>
          <ListItemIcon>
            <RateReviewIcon />
          </ListItemIcon>
          <ListItemText primary="משוב למפתחי האתר" />
          <ChevronLeftIcon />
        </ListItem>
        <Divider />
        {[
          { key: 'payments', icon: <PaymentIcon />, label: 'תשלומים (יגיע בקרוב)' },
          { key: 'notifications', icon: <NotificationsSettingsIcon />, label: 'התראות' },
          { key: 'preferences', icon: <PreferencesIcon />, label: 'העדפות' },
        ].map((item) => (
          <React.Fragment key={item.key}>
            <ListItem button onClick={() => alert('כרגע בפיתוח')}>
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
      {editingPersonalInfo
        ? renderPersonalInfo()
        : editingRatings
        ? renderRatings()
        : editingFeedback
        ? renderFeedback()
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

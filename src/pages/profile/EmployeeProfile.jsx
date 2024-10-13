import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Add as AddIcon,
  ExitToApp as ExitToAppIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Notifications as NotificationsSettingsIcon,
  Lock as PrivacyIcon,
  Settings as PreferencesIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { RatingDisplay } from '../rating/RatingSystem';
import CloudinaryUpload from '../../components/CloudinaryUpload';

export default function EmployeeProfile({ profileData, onUpdateProfile, handleSignOut, snackbar, setSnackbar, onDeleteAccountRequest }) {
  const navigate = useNavigate();
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editedData, setEditedData] = useState(profileData);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    setEditedData(profileData);
    setCompletionPercentage(calculateCompletionPercentage(profileData));
  }, [profileData]);

  useEffect(() => {
    const fetchUserImages = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setNewProfilePicture(userData.profileURL);
        }
      }
    };

    fetchUserImages();
  }, [auth.currentUser, db]);

  const calculateCompletionPercentage = (data) => {
    const fields = ['name', 'email', 'phone', 'location', 'skills', 'education', 'experience', 'languages', 'bio'];
    const completedFields = fields.filter(field => data[field] && data[field].length > 0);
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
        setSnackbar({ open: true, message: 'פרטים עודכנו בהצלחה', severity: 'success' });
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      setSnackbar({ open: true, message: 'שגיאה בעדכון הפרטים', severity: 'error' });
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
        setSnackbar({ open: true, message: 'תמונת הפרופיל עודכנה בהצלחה', severity: 'success' });
      }
    } catch (error) {
      console.error("Error updating profile picture: ", error);
      setSnackbar({ open: true, message: 'שגיאה בעדכון תמונת הפרופיל', severity: 'error' });
    }
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
            multiline={['bio', 'skills', 'languages'].includes(editingField)}
            rows={['bio'].includes(editingField) ? 4 : 1}
            value={editedData[editingField] || ''}
            onChange={(e) => setEditedData({ ...editedData, [editingField]: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingField(null)}>ביטול</Button>
          <Button onClick={() => handleSave(editingField, editedData[editingField])}>שמירה</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'name': return 'שם חוקי';
      case 'preferredName': return 'שם פרטי מועדף';
      case 'phone': return 'מספר טלפון';
      case 'email': return 'כתובת אימייל';
      case 'address': return 'כתובת';
      case 'emergencyContact': return 'איש קשר למקרה חירום';
      case 'location': return 'מיקום';
      case 'skills': return 'כישורים';
      case 'education': return 'השכלה';
      case 'experience': return 'ניסיון';
      case 'languages': return 'שפות';
      case 'bio': return 'אודות';
      default: return '';
    }
  };

  const renderPersonalInfo = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>פרטים אישיים</Typography>
        <IconButton onClick={() => setEditingPersonalInfo(false)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <List>
        {['name', 'preferredName', 'phone', 'email', 'address', 'emergencyContact', 'location', 'skills', 'education', 'experience', 'languages', 'bio'].map((field) => (
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
            src={newProfilePicture || profileData.photoURL || auth.currentUser?.photoURL || "/placeholder.svg"}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              bottom: -8,
              right: 8,
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={() => document.getElementById('profile-picture-upload').click()}
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
          <input
            id="profile-picture-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                CloudinaryUpload(file, handleProfilePictureChange);
              }
            }}
          />
        </Box>
        <Box>
          <Typography variant="h6">{profileData.name}</Typography>
          <Typography variant="body2" color="text.secondary" onClick={() => navigate('/profile/view')}>
            הצג פרופיל
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          שדרג לפרופיל מעסיק
        </Typography>
        <Box sx={{ 
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
        }} onClick={() => navigate('/employer-registration')}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
            <Typography>
              הפוך למעסיק ופתח הזדמנויות חדשות!
            </Typography>
          </Box>
          <ChevronRightIcon />
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>השלמת פרופיל</Typography>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ height: 10, borderRadius: 5 }} 
        />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {Math.round(completionPercentage)}% הושלם
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ p: 2 }}>הגדרות</Typography>

      <List>
        <ListItem button onClick={() => setEditingPersonalInfo(true)}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="מידע אישי" secondary={profileData.name} />
          <ChevronRightIcon />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => setShowRating(!showRating)}>
          <ListItemIcon>
            <StarIcon />
          </ListItemIcon>
          <ListItemText primary="דירוג" />
          <ChevronRightIcon />
        </ListItem>
        {showRating && (
          <Box sx={{ pl: 4, pr: 2, py: 2 }}>
            <RatingDisplay userId={auth.currentUser?.uid} isEmployer={false} />
          </Box>
        )}
        <Divider />
        <ListItem button onClick={() => setShowSecurity(!showSecurity)}>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="התחברות ואבטחה" />
          <ChevronRightIcon />
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
                startIcon={<DeleteIcon />}
              >
                בקש מחיקת חשבון
              </Button>
            )}
          </Box>
        )}
        <Divider />
        {[
          { key: 'payments', icon: <PaymentIcon />, label: 'תשלומים ותשלומים למארחים' },
          { key: 'notifications', icon: <NotificationsSettingsIcon />, label: 'התראות' },
          { key: 'privacy', icon: <PrivacyIcon />, label: 'פרטיות ושיתוף' },
          { key: 'preferences', icon: <PreferencesIcon />, label: 'העדפות' },
        ].map((item) => (
          <React.Fragment key={item.key}>
            <ListItem button onClick={() => alert('באמצע פיתוח')}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
              <ChevronRightIcon />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Button variant="outlined" color="primary" fullWidth onClick={handleSignOut} sx={{ mb: 2 }}>
          התנתקות
        </Button>
      </Box>
    </>
  );

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign:'left' }}>
          פרופיל
        </Typography>
      </Box>

      {editingPersonalInfo ? renderPersonalInfo() : renderMainContent()}

      {renderEditDialog()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-around',
        py: 1
      }}>
        <IconButton color="primary">
          <Avatar sx={{ width: 24, height: 24 }} />
        </IconButton>
        <IconButton>
          <NotificationsIcon />
        </IconButton>
        <IconButton>
          <img src="/placeholder.svg?height=24&width=24" alt="Trips" style={{ width: 24, height: 24 }} />
        </IconButton>
        <IconButton>
          <img src="/placeholder.svg?height=24&width=24" alt="Wishlist" style={{ width: 24, height: 24 }} />
        </IconButton>
        <IconButton>
          <img src="/placeholder.svg?height=24&width=24" alt="Search" style={{ width: 24, height: 24 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { getAuth, updateProfile, signOut } from 'firebase/auth';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../services/firebase';
// import { AuthContext } from '../contexts/AuthContext';
// import { useTranslation } from 'react-i18next';

// import { Box, Typography, Button, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, LinearProgress, Card, CardContent, Paper, Tooltip, Snackbar, Alert } from '@mui/material';
// import {
//   Edit as EditIcon,
//   PhotoCamera as PhotoCameraIcon,
//   Work as WorkIcon,
//   School as SchoolIcon,
//   Language as LanguageIcon,
//   LocationOn as LocationIcon,
//   Phone as PhoneIcon,
//   Email as EmailIcon,
//   Business as BusinessIcon,
//   Add as AddIcon,
//   ExitToApp as ExitToAppIcon,
//   ArrowUpward as ArrowUpwardIcon,
// } from '@mui/icons-material';
// import InfoIcon from '@mui/icons-material/Info';


// const UserProfile = ({ onUpdateProfile, onUpgradeToEmployer, onDeleteAccountRequest }) => {
//   const { t } = useTranslation();
//   const { user, setUser } = useContext(AuthContext);
//   const [editing, setEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [profileData, setProfileData] = useState(null);
//   const [newProfilePicture, setNewProfilePicture] = useState(null);
//   const [completionPercentage, setCompletionPercentage] = useState(0);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
//   const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
//   const [employerDetails, setEmployerDetails] = useState({
//     companyName: '',
//     companyDescription: '',
//     businessType: '',
//   });
//   const [upgradeRequestSent, setUpgradeRequestSent] = useState(false);
//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (auth.currentUser?.uid) {
//         const userDocRef = doc(db, 'users', auth.currentUser.uid);
//         const userDoc = await getDoc(userDocRef);
//         if (userDoc.exists()) {
//           const data = {
//             ...userDoc.data(),
//             photoURL: auth.currentUser.photoURL || userDoc.data().photoURL,
//             skills: userDoc.data().skills || [],
//             languages: userDoc.data().languages || [],
//             employerDetails: userDoc.data().employerDetails || {
//               companyName: '',
//               companyDescription: '',
//               businessType: '',
//             },
//           };
//           setProfileData(data);
//           calculateCompletionPercentage(data);
//         }
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [auth.currentUser]);

//   const calculateCompletionPercentage = (data) => {
//     const fields = ['name', 'email', 'phone', 'location', 'skills', 'education', 'experience', 'languages'];
//     const completedFields = fields.filter(field => data[field] && data[field].length > 0);
//     setCompletionPercentage((completedFields.length / fields.length) * 100);
//   };

//   const handleProfilePictureChange = (e) => {
//     if (e.target.files[0]) {
//       setNewProfilePicture(e.target.files[0]);
//     }
//   };

//   // const handleSubmit = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const userDocRef = doc(db, 'users', auth.currentUser.uid);
//   //     let updatedData = { ...profileData };

//   //     if (newProfilePicture) {
//   //       const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
//   //       await uploadBytes(storageRef, newProfilePicture);
//   //       const downloadURL = await getDownloadURL(storageRef);
//   //       updatedData.photoURL = downloadURL;
//   //       await updateProfile(auth.currentUser, { photoURL: downloadURL });
//   //     }

//   //     await updateDoc(userDocRef, updatedData);
//   //     setProfileData(updatedData);
//   //     setNewProfilePicture(null);
//   //     setEditing(false);
//   //     calculateCompletionPercentage(updatedData);
//   //     setSnackbar({
//   //       open: true,
//   //       message: t('Profile updated successfully'),
//   //       severity: 'success'
//   //     });
//   //   } catch (error) {
//   //     console.error("Error updating profile: ", error);
//   //     setSnackbar({
//   //       open: true,
//   //       message: t('Error updating profile'),
//   //       severity: 'error'
//   //     });
//   //   }
//   //   setLoading(false);
//   // };

//   const handleUpgradeToEmployer = async () => {
//     if (!user || !user.uid) {
//       console.error('User not found');
//       setSnackbar({
//         open: true,
//         message: t('Error: User not found'),
//         severity: 'error'
//       });
//       return;
//     }

//     try {
//       const userRef = doc(db, 'users', user.uid);
//       await updateDoc(userRef, { 
//         pendingEmployer: true,
//         employerDetails: employerDetails
//       });
//       setUser(prevUser => ({ 
//         ...prevUser, 
//         pendingEmployer: true,
//       }));
//       setUpgradeRequestSent(true);
//       setSnackbar({
//         open: true,
//         message: t('Your employer request has been submitted. Please wait for approval.'),
//         severity: 'success'
//       });
//       setUpgradeDialogOpen(false);
//     } catch (error) {
//       console.error('Error submitting employer request:', error);
//       setSnackbar({
//         open: true,
//         message: t('Error submitting employer request. Please try again.'),
//         severity: 'error'
//       });
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       navigate('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//       setSnackbar({
//         open: true,
//         message: t('Error signing out. Please try again.'),
//         severity: 'error'
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!profileData) {
//     return <Typography>No profile data available.</Typography>;
//   }

//   return (
//     <Box sx={{ maxWidth: '100%', width: '100%', p: 2, bgcolor: '#f5f5f5' }}>
//       <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
//         <Box sx={{ 
//           height: 150, 
//           background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
//           display: 'flex',
//           alignItems: 'flex-end',
//           justifyContent: 'center',
//           position: 'relative',
//         }}>
//           <Avatar
//             src={profileData.photoURL || '/placeholder.svg'}
//             alt={profileData.name}
//             sx={{ 
//               width: 120, 
//               height: 120, 
//               border: '4px solid white',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
//               position: 'absolute',
//               bottom: '-60px',
//             }}
//           />
//           <input
//             accept="image/*"
//             style={{ display: 'none' }}
//             id="icon-button-file"
//             type="file"
//             onChange={handleProfilePictureChange}
//           />
//           <label htmlFor="icon-button-file">
//             <IconButton 
//               color="primary" 
//               aria-label="upload picture" 
//               component="span"
//               sx={{ 
//                 position: 'absolute', 
//                 bottom: '-30px', 
//                 right: '50%', 
//                 transform: 'translateX(80px)',
//                 bgcolor: 'white',
//                 '&:hover': { bgcolor: '#f0f0f0' },
//               }}
//             >
//               <PhotoCameraIcon />
//             </IconButton>
//           </label>
//         </Box>
//         <CardContent sx={{ pt: 8, pb: 4, px: 3 }}>
//           <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
//             {profileData.name}
//           </Typography>
//           <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
//             {profileData.isEmployer ? profileData.employerDetails?.companyName : 'Job Seeker'}
//           </Typography>

//           <Box sx={{ mt: 2, mb: 3 }}>
//             <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
//               Profile Completion
//             </Typography>
//             <LinearProgress 
//               variant="determinate" 
//               value={completionPercentage} 
//               sx={{ 
//                 height: 10, 
//                 borderRadius: 5,
//                 '& .MuiLinearProgress-bar': {
//                   borderRadius: 5,
//                 },
//               }} 
//             />
//             <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
//               {Math.round(completionPercentage)}% Complete
//             </Typography>
//           </Box>

//           {!user.isEmployer && !user.pendingEmployer && (
//             <Card sx={{ mt: 4, mb: 4, background: 'linear-gradient(to right, #2196f3, #673ab7)' }}>
//               <CardContent sx={{ p: 3 }}>
//                 <Box display="flex" justifyContent="space-between" alignItems="center">
//                   <Box>
//                     <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
//                       {t('הפוך למעסיק ופתח הזדמנויות חדשות!')}
//                     </Typography>
//                   </Box>
//                   <ArrowUpwardIcon sx={{ color: 'white', fontSize: 48 }} />
//                 </Box>
//                 <Button
//                   variant="contained"
//                   size="large"
//                   onClick={onUpgradeToEmployer}
//                   fullWidth
//                   sx={{
//                     mt: 2,
//                     backgroundColor: 'white',
//                     color: '#2196f3',
//                     '&:hover': {
//                       backgroundColor: '#e3f2fd',
//                     },
//                   }}
//                 >
//                   {t('שדרג לפרופיל מעסיק')}
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//           {(profileData.pendingEmployer || upgradeRequestSent) && (
//             <Paper 
//               elevation={3}
//               sx={{
//                 mt: 2,
//                 p: 2,
//                 bgcolor: 'info.light',
//                 borderRadius: 2,
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 2,
//               }}
//             >
//               <InfoIcon color="info" />
//               <Box>
//                 <Typography variant="subtitle1" fontWeight="bold" color="info.dark">
//                   {t('בקשת השדרוג בהמתנה')}
//                 </Typography>
//                 <Typography variant="body2" color="info.dark">
//                   {t('בקשתך לשדרג לחשבון מעסיק נמצאת כעת בבדיקה.')}
//                 </Typography>
//               </Box>
//             </Paper>
//           )}

//           {!profileData.isEmployer && (
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, my: 2 }}>
//               {profileData.skills.slice(0, 3).map((skill, index) => (
//                 <Chip key={index} label={skill} size="small" sx={{ bgcolor: '#e0e0e0' }} />
//               ))}
//               {profileData.skills.length > 3 && (
//                 <Chip label={`+${profileData.skills.length - 3}`} size="small" variant="outlined" />
//               )}
//               <Tooltip title="Add Skills">
//                 <Chip 
//                   icon={<AddIcon />} 
//                   label="Add" 
//                   onClick={() => setEditing(true)} 
//                   sx={{ cursor: 'pointer' }} 
//                 />
//               </Tooltip>
//             </Box>
//           )}

//           <Box sx={{ mt: 4 }}>
//             <Typography variant="h6" gutterBottom fontWeight="bold">Contact Information</Typography>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
//               <Typography variant="body2">{profileData.location || 'Add your location'}</Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
//               <Typography variant="body2">{profileData.phone || 'Add your phone number'}</Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
//               <Typography variant="body2">{profileData.email || 'Add your email'}</Typography>
//             </Box>
//           </Box>

//           {profileData.isEmployer ? (
//             <Box sx={{ mt: 4 }}>
//               <Typography variant="h6" gutterBottom fontWeight="bold">Company Details</Typography>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                 <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="body2">{profileData.employerDetails?.businessType || 'Add business type'}</Typography>
//               </Box>
//               <Typography variant="body2" sx={{ mt: 2 }}>
//                 {profileData.employerDetails?.companyDescription || 'Add a company description to attract potential employees.'}
//               </Typography>
//             </Box>
//           ) : (
//             <Box sx={{ mt: 4 }}>
//               <Typography variant="h6" gutterBottom fontWeight="bold">Professional Information</Typography>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                 <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="body2">{profileData.education || 'Add your education'}</Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                 <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="body2">{profileData.experience || 'Add your work experience'}</Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                 <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="body2">{profileData.languages.join(', ') || 'Add languages you speak'}</Typography>
//               </Box>
//             </Box>
//           )}

//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               startIcon={<EditIcon />}
//               variant="contained"
//               color="primary"
//               onClick={() => setEditing(true)}
//               sx={{ 
//                 borderRadius: 20,
//                 boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
//                 '&:hover': { boxShadow: '0 6px 12px rgba(0,0,0,0.2)' },
//               }}
//             >
//               {t('Edit Profile')}
//             </Button>
//           </Box>

//           <Box sx={{ mt: 4, display: 'flex', justifyContent:  'center' }}>
//             <Button
//               startIcon={<ExitToAppIcon />}
//               variant="outlined"
//               color="error"
//               onClick={handleSignOut}
//               sx={{ 
//                 borderRadius: 20,
//                 boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
//                 '&:hover': { boxShadow: '0 6px 12px rgba(0,0,0,0.2)' },
//               }}
//             >
//               {t('Sign Out')}
//             </Button>
//           </Box>

//           <Box sx={{ mt: 4 }}>
//             {user.pendingDeletion ? (
//               <Typography 
//                 variant="body1" 
//                 align="center" 
//                 sx={{ 
//                   p: 2, 
//                   bgcolor: 'warning.light', 
//                   color: 'warning.contrastText',
//                   borderRadius: 1
//                 }}
//               >
//                 {t('Account deletion request pending approval')}
//               </Typography>
//             ) : (
//               <Button
//                 variant="contained"
//                 color="error"
//                 onClick={onDeleteAccountRequest}
//                 fullWidth
//               >
//                 {t('Request Account Deletion')}
//               </Button>
//             )}
//           </Box>

//         </CardContent>
//       </Card>

//       <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
//         <DialogTitle>{t('Edit Profile')}</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label={t('Name')}
//             name="name"
//             value={profileData.name}
//             onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
//             margin="normal"
//           />
//           <TextField
//             fullWidth
//             label={t('Location')}
//             name="location"
//             value={profileData.location}
//             onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
//             margin="normal"
//           />
//           <TextField
//             fullWidth
//             label={t('Phone')}
//             name="phone"
//             value={profileData.phone}
//             onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
//             margin="normal"
//           />
//           {!profileData.isEmployer && (
//             <>
//               <TextField
//                 fullWidth
//                 label={t('Skills (comma-separated)')}
//                 name="skills"
//                 value={profileData.skills.join(', ')}
//                 onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(skill => skill.trim()) })}
//                 margin="normal"
//               />
//               <TextField
//                 fullWidth
//                 label={t('Education')}
//                 name="education"
//                 value={profileData.education}
//                 onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
//                 margin="normal"
//               />
//               <TextField
//                 fullWidth
//                 label={t('Work Experience')}
//                 name="experience"
//                 value={profileData.experience}
//                 onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
//                 margin="normal"
//                 multiline
//                 rows={3}
//               />
//               <TextField
//                 fullWidth
//                 label={t('Languages (comma-separated)')}
//                 name="languages"
//                 value={profileData.languages.join(', ')}
//                 onChange={(e) => setProfileData({ ...profileData, languages: e.target.value.split(',').map(lang => lang.trim()) })}
//                 margin="normal"
//               />
//             </>
//           )}
//           {profileData.isEmployer && (
//             <>
//               <TextField
//                 fullWidth
//                 label={t('Company Name')}
//                 name="companyName"
//                 value={profileData.employerDetails?.companyName || ''}
//                 onChange={(e) => setProfileData({ 
//                   ...profileData, 
//                   employerDetails: { 
//                     ...profileData.employerDetails,
//                     companyName: e.target.value
//                   }
//                 })}
//                 margin="normal"
//               />
//               <TextField
//                 fullWidth
//                 label={t('Business Type')}
//                 name="businessType"
//                 value={profileData.employerDetails?.businessType || ''}
//                 onChange={(e) => setProfileData({ 
//                   ...profileData, 
//                   employerDetails: {
//                     ...profileData.employerDetails,
//                     businessType: e.target.value
//                   }
//                 })}
//                 margin="normal"
//               />
//               <TextField
//                 fullWidth
//                 label={t('Company Description')}
//                 name="companyDescription"
//                 value={profileData.employerDetails?.companyDescription || ''}
//                 onChange={(e) => setProfileData({ 
//                   ...profileData, 
//                   employerDetails: {
//                     ...profileData.employerDetails,
//                     companyDescription: e.target.value
//                   }
//                 })}
//                 margin="normal"
//                 multiline
//                 rows={3}
//               />
//             </>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setEditing(false)}>{t('Cancel')}</Button>
//           <Button onClick={() => onUpdateProfile(profileData)} color="primary">{t('Save Changes')}</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>{t('Upgrade to Employer')}</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label={t('Company Name')}
//             name="companyName"
//             value={employerDetails.companyName}
//             onChange={(e) => setEmployerDetails({ ...employerDetails, companyName: e.target.value })}
//             margin="normal"
//           />
//           <TextField
//             fullWidth
//             label={t('Business Type')}
//             name="businessType"
//             value={employerDetails.businessType}
//             onChange={(e) => setEmployerDetails({ ...employerDetails, businessType: e.target.value })}
//             margin="normal"
//           />
//           <TextField
//             fullWidth
//             label={t('Company Description')}
//             name="companyDescription"
//             value={employerDetails.companyDescription}
//             onChange={(e) => setEmployerDetails({ ...employerDetails, companyDescription: e.target.value })}
//             margin="normal"
//             multiline
//             rows={3}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setUpgradeDialogOpen(false)}>{t('Cancel')}</Button>
//           <Button onClick={handleUpgradeToEmployer} color="primary">{t('Submit Upgrade Request')}</Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default UserProfile;



















import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';

import { Box, Typography, Button, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, LinearProgress, Card, CardContent, Paper, Tooltip, Snackbar, Alert } from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  ExitToApp as ExitToAppIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';

const UserProfile = ({ onUpdateProfile, onUpgradeToEmployer, onDeleteAccountRequest }) => {
  const { user, setUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [employerDetails, setEmployerDetails] = useState({
    companyName: '',
    companyDescription: '',
    businessType: '',
  });
  const [upgradeRequestSent, setUpgradeRequestSent] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser?.uid) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = {
            ...userDoc.data(),
            photoURL: auth.currentUser.photoURL || userDoc.data().photoURL,
            skills: userDoc.data().skills || [],
            languages: userDoc.data().languages || [],
            employerDetails: userDoc.data().employerDetails || {
              companyName: '',
              companyDescription: '',
              businessType: '',
            },
          };
          setProfileData(data);
          calculateCompletionPercentage(data);
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  const calculateCompletionPercentage = (data) => {
    const fields = ['name', 'email', 'phone', 'location', 'skills', 'education', 'experience', 'languages'];
    const completedFields = fields.filter(field => data[field] && data[field].length > 0);
    setCompletionPercentage((completedFields.length / fields.length) * 100);
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setNewProfilePicture(e.target.files[0]);
    }
  };

  const handleUpgradeToEmployer = async () => {
    if (!user || !user.uid) {
      console.error('User not found');
      setSnackbar({
        open: true,
        message: 'שגיאה: המשתמש לא נמצא',
        severity: 'error'
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        pendingEmployer: true,
        employerDetails: employerDetails
      });
      setUser(prevUser => ({ 
        ...prevUser, 
        pendingEmployer: true,
      }));
      setUpgradeRequestSent(true);
      setSnackbar({
        open: true,
        message: 'הבקשה שלך לשדרוג לחשבון מעסיק נשלחה. אנא המתן לאישור.',
        severity: 'success'
      });
      setUpgradeDialogOpen(false);
    } catch (error) {
      console.error('Error submitting employer request:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בשליחת בקשת השדרוג. אנא נסה שוב.',
        severity: 'error'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בהתנתקות. אנא נסה שוב.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profileData) {
    return <Typography>אין נתוני פרופיל זמינים.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: '100%', width: '100%', p: 2, bgcolor: '#f5f5f5' }}>
      <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ 
          height: 150, 
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          position: 'relative',
        }}>
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
        <CardContent sx={{ pt: 8, pb: 4, px: 3 }}>
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            {profileData.name}
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
            {profileData.isEmployer ? profileData.employerDetails?.companyName : 'מחפש עבודה'}
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

          {!user.isEmployer && !user.pendingEmployer && (
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
                  onClick={onUpgradeToEmployer}
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
          {(profileData.pendingEmployer || upgradeRequestSent) && (
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
          )}

          {!profileData.isEmployer && (
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
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">פרטי התקשרות</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.location || 'הוסף מיקום'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.phone || 'הוסף מספר טלפון'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">{profileData.email || 'הוסף כתובת אימייל'}</Typography>
            </Box>
          </Box>

          {profileData.isEmployer ? (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">פרטי חברה</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">{profileData.employerDetails?.businessType || 'הוסף סוג עסק'}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {profileData.employerDetails?.companyDescription || 'הוסף תיאור חברה כדי למשוך עובדים פוטנציאליים.'}
              </Typography>
            </Box>
          ) : (
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
          )}

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
            {user.pendingDeletion ? (
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
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מיקום"
            name="location"
            value={profileData.location}
            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מספר טלפון"
            name="phone"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            margin="normal"
          />
          {!profileData.isEmployer && (
            <>
              <TextField
                fullWidth
                label="כישורים (מופרדים בפסיק)"
                name="skills"
                value={profileData.skills.join(', ')}
                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(skill => skill.trim()) })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="השכלה"
                name="education"
                value={profileData.education}
                onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="ניסיון עבודה"
                name="experience"
                value={profileData.experience}
                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="שפות (מופרדות בפסיק)"
                name="languages"
                value={profileData.languages.join(', ')}
                onChange={(e) => setProfileData({ ...profileData, languages: e.target.value.split(',').map(lang => lang.trim()) })}
                margin="normal"
              />
            </>
          )}
          {profileData.isEmployer && (
            <>
              <TextField
                fullWidth
                label="שם חברה"
                name="companyName"
                value={profileData.employerDetails?.companyName || ''}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  employerDetails: { 
                    ...profileData.employerDetails,
                    companyName: e.target.value
                  }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="סוג עסק"
                name="businessType"
                value={profileData.employerDetails?.businessType || ''}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  employerDetails: {
                    ...profileData.employerDetails,
                    businessType: e.target.value
                  }
                })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="תיאור חברה"
                name="companyDescription"
                value={profileData.employerDetails?.companyDescription || ''}
                onChange={(e) => setProfileData({ 
                  ...profileData, 
                  employerDetails: {
                    ...profileData.employerDetails,
                    companyDescription: e.target.value
                  }
                })}
                margin="normal"
                multiline
                rows={3}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)}>ביטול</Button>
          <Button onClick={() => onUpdateProfile(profileData)} color="primary">שמור שינויים</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>שדרוג למעסיק</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="שם חברה"
            name="companyName"
            value={employerDetails.companyName}
            onChange={(e) => setEmployerDetails({ ...employerDetails, companyName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="סוג עסק"
            name="businessType"
            value={employerDetails.businessType}
            onChange={(e) => setEmployerDetails({ ...employerDetails, businessType: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="תיאור חברה"
            name="companyDescription"
            value={employerDetails.companyDescription}
            onChange={(e) => setEmployerDetails({ ...employerDetails, companyDescription: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleUpgradeToEmployer} color="primary">שלח בקשת שדרוג</Button>
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

export default UserProfile;
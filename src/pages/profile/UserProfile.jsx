import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';

import { Box, Typography, CircularProgress, Snackbar, Switch } from '@mui/material';
import EmployeeProfile from './EmployeeProfile';
import EmployerProfile from './EmployerProfile';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEmployerView, setIsEmployerView] = useState(true); 
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser?.uid) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
          const data = {
            ...userDoc.data(),
            photoURL: auth.currentUser.photoURL || userDoc.data().photoURL ,
            skills: userDoc.data().skills || [],
            languages: userDoc.data().languages || [],
            pendingEmployer: userDoc.data().pendingEmployer || false,
            employerDetails: userDoc.data().employerDetails || {
              companyName: '',
              companyDescription: '',
              businessType: '',
            },
          };
          setProfileData(data);
        }
        setLoading(false);
      });
  
      return () => unsubscribe(); 
    } else {
      setLoading(false);
    }
  }, [auth.currentUser]);

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

  const onUpdateProfile = async (updatedData) => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, updatedData);
      setSnackbar({
        open: true,
        message: 'פרופיל עודכן בהצלחה.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בעדכון הפרופיל. אנא נסה שוב.',
        severity: 'error'
      });
    }
  };

  const onDeleteAccountRequest = async () => {
    // Implement the delete account request logic
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { pendingDeletion: true });
      setProfileData(prevData => ({ ...prevData, pendingDeletion: true }));
      setSnackbar({
        open: true,
        message: 'בקשת מחיקת חשבון נשלחה.',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בבקשת מחיקת החשבון. אנא נסה שוב.',
        severity: 'error'
      });
    }
  };

  const handleUpgradeToEmployer = async (employerDetails) => {
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
      setProfileData(prevData => ({ 
        ...prevData, 
        pendingEmployer: true,
        employerDetails: employerDetails,
      }));
      setSnackbar({
        open: true,
        message: 'הבקשה שלך לשדרוג לחשבון מעסיק נשלחה. אנא המתן לאישור.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting employer request:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בשליחת בקשת השדרוג. אנא נסה שוב.',
        severity: 'error'
      });
    }
  };

  const handleSwitchToggle = () => {
    setIsEmployerView(!isEmployerView);
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
    <Box>
      {/* <Switch 
        checked={isEmployerView} 
        onChange={handleSwitchToggle}
        inputProps={{ 'aria-label': 'Toggle between employer and employee views' }}
      /> */}
      {/* {profileData.isEmployer ? ( */}
      {isEmployerView ?  (
        <EmployerProfile
          profileData={profileData}
          onUpdateProfile={onUpdateProfile}
          onDeleteAccountRequest={onDeleteAccountRequest}
          handleSignOut={handleSignOut}
          snackbar={snackbar}
          setSnackbar={setSnackbar}
          onSwitchToggle={handleSwitchToggle} 
        />
      ) : (
        <EmployeeProfile
          profileData={profileData}
          onUpdateProfile={onUpdateProfile}
          onDeleteAccountRequest={onDeleteAccountRequest}
          handleSignOut={handleSignOut}
          handleUpgradeToEmployer={handleUpgradeToEmployer}
          snackbar={snackbar}
          setSnackbar={setSnackbar}
          onSwitchToggle={handleSwitchToggle} 
        />
      )}
    </Box>
  );
};

export default UserProfile;

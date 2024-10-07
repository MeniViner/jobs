import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import UserProfile from '../../components/UserProfile';
import EmployerRegistrationForm from '../../components/EmployerRegistrationForm';
import {
  Box,
  Button,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';

const AccountPage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUser(prevUser => ({ ...prevUser, ...userData }));
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user?.uid, setUser]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgradeToEmployer = () => {
    setShowEmployerForm(true);
  };

  const handleEmployerRegistrationSubmit = async (employerDetails) => {
    if (!user || !user.uid) {
      console.error('User not found');
      setSnackbar({
        open: true,
        message: t('Error: User not found'),
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
        employerDetails: employerDetails
      }));
      setShowEmployerForm(false);
      setSnackbar({
        open: true,
        message: t('Your employer request has been submitted. Please wait for approval.'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting employer request:', error);
      setSnackbar({
        open: true,
        message: t('Error submitting employer request. Please try again.'),
        severity: 'error'
      });
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    if (!user || !user.uid) {
      console.error('User not found');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updatedData);
      setUser(prevUser => ({ ...prevUser, ...updatedData }));
      setSnackbar({
        open: true,
        message: t('Profile updated successfully'),
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: t('Error updating profile'),
        severity: 'error'
      });
    }
  };

  if (loading) return <Box>Loading...</Box>;
  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {showEmployerForm ? (
        <EmployerRegistrationForm 
          onSubmit={handleEmployerRegistrationSubmit}
          onCancel={() => setShowEmployerForm(false)}
        />
      ) : (
        <>
          <UserProfile user={user} onUpdateProfile={handleUpdateProfile} />
          
          {!user.isEmployer && !user.pendingEmployer && (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpgradeToEmployer}
                fullWidth
              >
                {t('Upgrade to Employer')}
              </Button>
            </Box>
          )}
{/* 
          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" color="error" onClick={handleSignOut} fullWidth>
              {t('Sign Out')}
            </Button>
          </Box> */}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountPage;
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import UserProfile from './UserProfile';
import { 
  Container, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, Box, CircularProgress 
} from '@mui/material';

const AccountPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const { user, setUser } = useContext(AuthContext);
  const { user, setUser, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [employerDetails, setEmployerDetails] = useState({
    companyName: '',
    companyDescription: '',
    businessType: '',
  });
  // const [employerSwitchedOff, setEmployerSwitchedOff] = useState(
  //   user?.employerSwitchedOff || false
  // );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login'); 
    }
  }, [user, authLoading, navigate]);

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

  // useEffect(() => {
  //   if (user?.uid) {
  //     const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
  //       if (docSnapshot.exists()) {
  //         const userData = docSnapshot.data();
  //         setEmployerSwitchedOff(userData.employerSwitchedOff || false); // Update the switch state
  //       }
  //     });
  //     return () => unsubscribe();
  //   }
  // }, [user?.uid]);

  // const handleSwitchToggle = async () => {
  //   const newValue = !employerSwitchedOff;
  //   setEmployerSwitchedOff(newValue);
  //   try {
  //     await updateDoc(doc(db, 'users', user.uid), { employerSwitchedOff: newValue });
  //     setUser((prevUser) => ({ ...prevUser, employerSwitchedOff: newValue }));
  //   } catch (error) {
  //     console.error('Error toggling employer mode:', error);
  //   }
  // };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setSnackbar({
        open: true,
        message: t('Error signing out. Please try again.'),
        severity: 'error'
      });
    }
  };

  const handleUpgradeToEmployer = () => {
    setUpgradeDialogOpen(true);
  };

  const handleEmployerRegistrationSubmit = async () => {
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
      setUpgradeDialogOpen(false);
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
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
  };

  const handleDeleteAccountRequest = async () => {
    if (!user || !user.uid) {
      console.error('User not found');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pendingDeletion: true,
        deletionReason: deleteReason
      });
      setUser(prevUser => ({ ...prevUser, pendingDeletion: true }));
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: t('Your account deletion request has been submitted. Please wait for approval.'),
        severity: 'info'
      });
    } catch (error) {
      console.error('Error submitting account deletion request:', error);
      setSnackbar({
        open: true,
        message: t('Error submitting account deletion request. Please try again.'),
        severity: 'error'
      });
    }
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <UserProfile 
        user={user} 
        onUpdateProfile={handleUpdateProfile}
        onUpgradeToEmployer={handleUpgradeToEmployer}
        onDeleteAccountRequest={() => setDeleteDialogOpen(true)}
        onSignOut={handleSignOut}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('Request Account Deletion')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="deleteReason"
            label={t('Reason for deletion')}
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</Button>
          <Button onClick={handleDeleteAccountRequest} color="error">{t('Submit Request')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('Upgrade to Employer')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('Company Name')}
            name="companyName"
            value={employerDetails.companyName}
            onChange={(e) => setEmployerDetails({ ...employerDetails, companyName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('Business Type')}
            name="businessType"
            value={employerDetails.businessType}
            onChange={(e) => setEmployerDetails({ ...employerDetails, businessType: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('Company Description')}
            name="companyDescription"
            value={employerDetails.companyDescription}
            onChange={(e) => setEmployerDetails({ ...employerDetails, companyDescription: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>{t('Cancel')}</Button>
          <Button onClick={handleEmployerRegistrationSubmit} color="primary">{t('Submit Upgrade Request')}</Button>
        </DialogActions>
      </Dialog>

      {/* <FormControlLabel
        control={<Switch checked={!employerSwitchedOff} onChange={handleSwitchToggle} />}
        label="Switch to Employer Mode"
      /> */}

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

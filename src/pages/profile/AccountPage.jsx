import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Grid,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const AccountPage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = [
    { id: 'personal_info', label: t('Personal Information') },
    { id: 'login_security', label: t('Login & Security') },
    { id: 'payments_payouts', label: t('Payments and Payouts') },
    { id: 'accessibility', label: t('Accessibility') },
    { id: 'taxes', label: t('Taxes') },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            setUser({ id: authUser.uid, ...userDoc.data(), photoURL: authUser.photoURL });
          } else {
            console.error('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgradeToEmployer = () => {
    navigate('/employer-registration');
  };

  const handleUpdateUserInfo = async (updatedInfo) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), updatedInfo);
      setUser({ ...user, ...updatedInfo });
      setEditing(false);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return null;
  }

  const PersonalInformation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('Personal Information')}
      </Typography>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedInfo = Object.fromEntries(formData);
        handleUpdateUserInfo(updatedInfo);
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('Name')}
              name="name"
              defaultValue={user.name}
              required
              disabled={!editing}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('Email')}
              name="email"
              type="email"
              defaultValue={user.email}
              required
              disabled={!editing}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('Phone')}
              name="phone"
              type="tel"
              defaultValue={user.phone}
              disabled={!editing}
              variant="outlined"
            />
          </Grid>
        </Grid>
        {editing && (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            {t('Save Changes')}
          </Button>
        )}
      </form>
    </Box>
  );

  const LoginSecurity = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('Login & Security')}
      </Typography>
      <Typography variant="body1">
        {t('Change your password or set up two-factor authentication.')}
      </Typography>
      {/* Add more security settings here */}
    </Box>
  );

  const PaymentsPayouts = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('Payments and Payouts')}
      </Typography>
      <Typography variant="body1">
        {t('Manage your payment methods and payout preferences.')}
      </Typography>
      {/* Add payment and payout options here */}
    </Box>
  );

  const AccessibilitySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('Accessibility')}
      </Typography>
      <Typography variant="body1">
        {t('Adjust accessibility settings for a better experience.')}
      </Typography>
      {/* Add accessibility settings here */}
    </Box>
  );

  const TaxInformation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('Taxes')}
      </Typography>
      <Typography variant="body1">
        {t('Manage your tax information and documents.')}
      </Typography>
      {/* Add tax information management here */}
    </Box>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal_info':
        return <PersonalInformation />;
      case 'login_security':
        return <LoginSecurity />;
      case 'payments_payouts':
        return <PaymentsPayouts />;
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'taxes':
        return <TaxInformation />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', margin: '0 auto', padding: 2 }}>
      {isMobile && activeSection ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => setActiveSection(null)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {menuItems.find(item => item.id === activeSection)?.label}
            </Typography>
            {activeSection === 'personal_info' && (
              <IconButton 
                onClick={() => setEditing(!editing)} 
                sx={{ ml: 'auto', color: editing ? 'primary.main' : 'inherit' }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
          {renderActiveSection()}
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              component="img"
              src={user.photoURL}
              alt={user.name}
              sx={{ width: 80, height: 80, borderRadius: '50%', mr: 2 }}
            />
            <Box>
              <Typography variant="h5">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role === 'employer' ? t('Employer') : t('User')}
              </Typography>
            </Box>
          </Box>

          {user.role !== 'employer' && user.role !== 'pending_employer' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('Upgrade to Employer')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t('Post jobs and find the best candidates for your company.')}
              </Typography>
              <Button variant="contained" color="primary" onClick={handleUpgradeToEmployer} fullWidth>
                {t('Upgrade Now')}
              </Button>
            </Box>
          )}

          {user.role === 'pending_employer' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">
                {t('Your employer registration is pending approval.')}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  button
                  onClick={() => setActiveSection(item.id)}
                  sx={{ py: 2 }}
                >
                  <ListItemText primary={item.label} />
                  <ChevronRightIcon />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleSignOut} 
            fullWidth 
            sx={{ mt: 3 }}
          >
            {t('Sign Out')}
          </Button>
        </>
      )}
    </Box>
  );
};

export default AccountPage;

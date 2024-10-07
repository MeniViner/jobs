import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { EmployerDetails, EmployerUpgradeSection, PendingEmployerMessage } from '../../components/EmployerDetails';
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
  Container,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const AccountPage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [editing, setEditing] = useState(false);
  const [employerDetails, setEmployerDetails] = useState({
    companyName: '',
    companyDescription: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
  });
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

  if (user?.isEmployer) {
    menuItems.push({ id: 'employer_details', label: t('Employer Details') });
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({ ...user, ...userData });
            if (userData.isEmployer || userData.pendingEmployer) {
              setEmployerDetails(userData.employerDetails || {});
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user, setUser]);


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

  const handleUpdateEmployerDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { employerDetails });
      setUser({ ...user, employerDetails });
      setEditing(false);
    } catch (error) {
      console.error('Error updating employer details:', error);
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
      case 'employer_details':
        return (
          <EmployerDetails
            employerDetails={employerDetails}
            setEmployerDetails={setEmployerDetails}
            editing={editing}
            handleUpdateEmployerDetails={handleUpdateEmployerDetails}
          />
        );
      default:
        return null;
    }
  };

  const renderUserStatus = () => {
    if (user.isEmployer) {
      return t('Employer');
    } else if (user.pendingEmployer) {
      return t('Pending Employer Approval');
    } else {
      return t('User');
    }
  };

  const MobileView = () => (
    <Box sx={{ maxWidth: '100%', margin: '0 auto', padding: 2 }}>
      {activeSection ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => setActiveSection(null)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {menuItems.find(item => item.id === activeSection)?.label}
            </Typography>
            {(activeSection === 'personal_info' || activeSection === 'employer_details') && (
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
                {renderUserStatus()}
              </Typography>
            </Box>
          </Box>

          {!user.isEmployer && !user.pendingEmployer && (
            <EmployerUpgradeSection handleUpgradeToEmployer={handleUpgradeToEmployer} />
          )}

          {user.pendingEmployer && <PendingEmployerMessage />}

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

  const DesktopView = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={user.photoURL}
            alt={user.name}
            sx={{ width: theme.spacing(15), height: theme.spacing(15), borderRadius: '50%', mr: 3 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.isEmployer ? t('Employer') : user.pendingEmployer ? t('Pending Employer') : t('User')}
            </Typography>
          </Box>
          {(activeSection === 'personal_info' || activeSection === 'employer_details') && (
            <Button
              onClick={() => setEditing(!editing)}
              startIcon={<EditIcon />}
              variant={editing ? "contained" : "outlined"}
              color="primary"
            >
              {editing ? t('Cancel') : t('Edit')}
            </Button>
          )}
        </Box>

        {!user.isEmployer && !user.pendingEmployer && (
          <EmployerUpgradeSection handleUpgradeToEmployer={handleUpgradeToEmployer} />
        )}

        {user.pendingEmployer && <PendingEmployerMessage />}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  selected={activeSection === item.id}
                  sx={{ 
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={8}>
            {renderActiveSection()}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Button variant="outlined" color="error" onClick={handleSignOut}>
          {t('Sign Out')}
        </Button>
      </Paper>
    </Container>
  );

  return isMobile ? <MobileView /> : <DesktopView />;
};

export default AccountPage;

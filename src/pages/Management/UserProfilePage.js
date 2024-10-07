import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { User, Briefcase, MapPin, Calendar, Mail } from 'lucide-react';
import { Button, Avatar, Typography, Paper, Grid, Box, Chip, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser({ id: userId, ...userDoc.data() });
        } else {
          console.error('No user document found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography>{t('Loading...')}</Typography>
    </Box>;
  }

  if (!user) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography>{t('User not found')}</Typography>
    </Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={user.photoURL}
              alt={user.name}
              sx={{ width: 150, height: 150, marginBottom: 2 }}
            />
            <Typography variant="h5" gutterBottom>{user.name}</Typography>
            <Chip 
              icon={<Briefcase size={16} />} 
              label={user.isEmployer ? t('Employer') : t('Employee')} 
              color="primary" 
              variant="outlined" 
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" gutterBottom>{t('About Me')}</Typography>
            <Typography paragraph>{user.bio || t('No bio provided')}</Typography>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" mb={1}>
              <MapPin size={18} />
              <Typography sx={{ ml: 1 }}>{user.location || t('Location not specified')}</Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <Calendar size={18} />
              <Typography sx={{ ml: 1 }}>{t('Member since')} {new Date(user.createdAt?.toDate()).getFullYear()}</Typography>
            </Box>
            {user.isEmployer && (
              <Box display="flex" alignItems="center" mb={1}>
                <Briefcase size={18} />
                <Typography sx={{ ml: 1 }}>{user.companyName || t('Company not specified')}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              startIcon={<Mail />}
              component={Link}
              to={`/chat/${userId}`}
              fullWidth
            >
              {t('Contact')} {user.name}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {user.isEmployer && (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          <Typography variant="h6" gutterBottom>{t('Posted Jobs')}</Typography>
          {/* Here you would map through the user's posted jobs */}
          <Typography>{t('No jobs posted yet')}</Typography>
        </Paper>
      )}
      
      {!user.isEmployer && (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          <Typography variant="h6" gutterBottom>{t('Skills')}</Typography>
          {user.skills && user.skills.length > 0 ? (
            <Box>
              {user.skills.map((skill, index) => (
                <Chip key={index} label={skill} sx={{ margin: 0.5 }} />
              ))}
            </Box>
          ) : (
            <Typography>{t('No skills listed')}</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UserProfilePage;
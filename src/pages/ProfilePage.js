import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../services/firebase';
import { Typography, Avatar, Grid, Paper, CircularProgress, Alert } from '@mui/material';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("פרופיל לא נמצא.");
      }
    } catch (err) {
      console.error("Error fetching profile: ", err);
      setError("אירעה שגיאה בטעינת הפרופיל. אנא נסה שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        לא נמצא פרופיל עבור המזהה שסופק.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, margin: 'auto', maxWidth: 500, flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item>
          <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
            {profile.name ? profile.name[0].toUpperCase() : '?'}
          </Avatar>
        </Grid>
        <Grid item xs={12} sm container>
          <Grid item xs container direction="column" spacing={2}>
            <Grid item xs>
              <Typography gutterBottom variant="h4" component="div">
                {profile.name || 'ללא שם'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                אימייל: {profile.email || 'לא צוין'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                רמה: {profile.level || 'לא צוינה'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ניקוד: {profile.score || 'לא צוין'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfilePage;
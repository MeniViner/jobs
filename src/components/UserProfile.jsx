import React, { useContext, useEffect } from 'react';
import { Container, Typography, Paper, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';


function UserProfile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="h5" gutterBottom>
            אינך מחובר
          </Typography>
          <Button variant="contained" color="primary" onClick={handleLogin}>
            התחבר עם Google
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>
          פרופיל משתמש
        </Typography>
        <Avatar src={user.photoURL} alt={user.displayName} sx={{ width: 100, height: 100, mb: 2 }} />
        <Typography>שם: {user.displayName}</Typography>
        <Typography>אימייל: {user.email}</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout} style={{ marginTop: '20px' }}>
          התנתק
        </Button>
      </Paper>
    </Container>
  );
}

export default UserProfile;

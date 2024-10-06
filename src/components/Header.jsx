import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';

function Header() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          פלטפורמת עבודות מזדמנות
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">דף הבית</Button>
          <Button color="inherit" component={Link} to="/jobs">עבודות</Button>
          <Button color="inherit" component={Link} to="/post-job">פרסם עבודה</Button>
          {user ? (
              <Button color="inherit" component={Link} to="/account">חשבון</Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">התחבר</Button>
          )}
          <Button color="inherit" component={Link} to="/employer-profile">פרופיל מעסיק</Button>
          <Button color="inherit" component={Link} to="/admin/messages">ניהול הודעות</Button>
          <Button color="inherit" component={Link} to="/ManageUsers">ניהול משתמשים</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
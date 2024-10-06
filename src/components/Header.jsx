import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Header() {
  const { user } = useContext(AuthContext);

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
            <Button color="inherit" component={Link} to="/profile">פרופיל</Button>
          ) : (
            <Button color="inherit" component={Link} to="/profile">התחבר</Button>
          )}
          <Button color="inherit" component={Link} to="/employer-profile">פרופיל מעסיק</Button>
          <Button color="inherit" component={Link} to="/admin/messages">ניהול הודעות</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
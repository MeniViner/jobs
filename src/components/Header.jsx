import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          פלטפורמת עבודות מזדמנות
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            דף הבית
          </Button>
          <Button color="inherit" component={Link} to="/jobs">
            עבודות
          </Button>
          <Button color="inherit" component={Link} to="/post-job">
            פרסם עבודה
          </Button>
          <Button color="inherit" component={Link} to="/login">
            התחברות
          </Button>
          <Button color="inherit" component={Link} to="/register">
            הרשמה
          </Button>
          <Button color="inherit" component={Link} to="/admin/messages">
            ניהול הודעות
          </Button>
          <Button color="inherit" component={Link} to="/employer-profile">
            פרופיל מעסיק
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
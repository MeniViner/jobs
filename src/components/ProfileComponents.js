import React from 'react';
import { Container, Typography, TextField, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        פרופיל משתמש
      </Typography>
      {/* Add profile content here */}
    </Container>
  );
}

function RegisterPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add registration logic here
    navigate('/profile');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        הרשמה
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="שם מלא" variant="outlined" required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="אימייל" type="email" variant="outlined" required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="סיסמה" type="password" variant="outlined" required />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              הרשמה
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

const ProfileComponents = {
  ProfilePage,
  RegisterPage
};

export default ProfileComponents;
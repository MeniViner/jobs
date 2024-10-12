import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Grid, TextField, Button, Card, CardContent, CircularProgress, Box, MenuItem } from '@mui/material';
import { Business, Category, Description, Email, Phone } from '@mui/icons-material';

const jobCategories = [
  'כוח אדם',
  'מלצרות',
  'סבלות',
  'דרייברים',
  'עובדי ניקיון',
  'סדרנים'
];

const EmployerRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    companyDescription: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const user = auth.currentUser;

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          pendingEmployer: true,
          employerDetails: formData,
          role: 'pending_employer'
        });

        alert(t('Registration submitted for approval'));
        navigate('/account');
      } catch (error) {
        console.error('Error submitting employer registration:', error);
        setError(t('Error submitting registration'));
      } finally {
        setLoading(false);
      }
    } else {
      setError(t('You must be logged in to register as an employer'));
      setLoading(false);
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {t('Register as Employer')}
      </Typography>
      <Card elevation={3}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('Company Name')}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label={t('Business Type')}
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Category sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                >
                  {jobCategories.map(category => (
                    <MenuItem key={category} value={category}>{t(category)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('Company Description')}
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Description sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Contact Email')}
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('Contact Phone')}
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : t('Submit Registration')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      {error && (
        <Box mt={2}>
          <Typography color="error" align="center">{error}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default EmployerRegistration;
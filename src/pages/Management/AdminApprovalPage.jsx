import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Grid, Button, Card, CardContent, CardActions, CircularProgress, Box, Chip } from '@mui/material';
import { Business, Category, Description, Email, Phone, Check, Close } from '@mui/icons-material';

const AdminApprovalPage = () => {
  const { t } = useTranslation();
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const fetchPendingEmployers = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(collection(db, 'employers'), where('approved', '==', false));
        const querySnapshot = await getDocs(q);
        const employers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingEmployers(employers);
      } catch (error) {
        console.error('Error fetching pending employers:', error);
        setError(t('Error fetching pending employers'));
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEmployers();
  }, [t]);

  const handleApproval = async (employerId, approved) => {
    try {
      await updateDoc(doc(db, 'employers', employerId), { approved });
      await updateDoc(doc(db, 'users', employerId), { role: approved ? 'employer' : 'employee' });
      setPendingEmployers(prevState => prevState.filter(employer => employer.id !== employerId));
      alert(t(approved ? 'Employer approved' : 'Employer rejected'));
    } catch (error) {
      console.error('Error updating employer status:', error);
      alert(t('Error updating employer status'));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {t('Pending Employer Approvals')}
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : pendingEmployers.length === 0 ? (
        <Typography variant="body1" align="center">
          {t('No pending approvals')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {pendingEmployers.map(employer => (
            <Grid item xs={12} key={employer.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {employer.companyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('Business Type')}: {employer.businessType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('Description')}: {employer.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('Email')}: {employer.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {t('Phone')}: {employer.phone}
                  </Typography>
                  <Chip 
                    label={t('Pending Approval')} 
                    color="warning" 
                    size="small" 
                    sx={{ mt: 1 }} 
                  />
                </CardContent>
                <CardActions>
                  <Button 
                    startIcon={<Check />}
                    onClick={() => handleApproval(employer.id, true)}
                    variant="contained"
                    color="success"
                  >
                    {t('Approve')}
                  </Button>
                  <Button 
                    startIcon={<Close />}
                    onClick={() => handleApproval(employer.id, false)}
                    variant="contained"
                    color="error"
                  >
                    {t('Reject')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminApprovalPage;

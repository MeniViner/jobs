import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Grid, Card, CardContent, CardActions, Button, IconButton, Chip, Divider, Box,
  CircularProgress, Typography, Paper
} from '@mui/material';
import {
  LocationOn as LocationOnIcon, Bookmark as BookmarkIcon, Work as WorkIcon, Group as GroupIcon,
  AttachMoney as AttachMoneyIcon, AccessTime as AccessTimeIcon, DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';


export default function SavedJobsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      fetchSavedJobs();
    }
  }, [authLoading, user]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = getAuth().currentUser;
      
      if (!currentUser) {
        navigate('/login'); // Redirect if no user is logged in
        return;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const savedJobIds = userDocSnap.data().savedJobs || [];
        const jobsData = await Promise.all(
          savedJobIds.map(async (jobId) => {
            const jobDocRef = doc(db, 'jobs', jobId);
            const jobDocSnap = await getDoc(jobDocRef);
            return jobDocSnap.exists() ? { id: jobDocSnap.id, ...jobDocSnap.data() } : null;
          })
        );
        setSavedJobs(jobsData.filter(job => job !== null));
      } else {
        setError("לא נמצא מידע על המשתמש");
      }
    } catch (error) {
      console.error("Error fetching saved jobs: ", error);
      setError("אירעה שגיאה בטעינת העבודות השמורות. אנא נסה שוב מאוחר יותר.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = async (jobId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        alert("עליך להתחבר כדי להסיר עבודות שמורות");
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        savedJobs: arrayRemove(jobId)
      });
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Error removing saved job: ", error);
      alert("אירעה שגיאה בהסרת העבודה השמורה.");
    }
  };

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">{error}</Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" align="center">
          עבודות שמורות
        </Typography>
      </Paper>

      {savedJobs.length > 0 ? (
        <Grid container spacing={4}>
          {savedJobs.map((job) => (
            <Grid item key={job.id} xs={12} sm={6} md={6}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                  position: 'relative',
                }}
                elevation={3}
              >
                <IconButton
                  onClick={() => handleRemoveSavedJob(job.id)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <BookmarkIcon color="primary" />
                </IconButton>

                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {job.companyName || 'שם החברה לא זמין'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip icon={<LocationOnIcon />} label={job.location} variant="outlined" />
                    <Chip icon={<WorkIcon />} label={job.type} variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {job.description && job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon color="action" sx={{ ml: 0.5 }} />
                        <Typography variant="body2">
                          <strong style={{ fontSize: '1.2em', color: '#4caf50' }}>
                            ₪{job.salary}
                          </strong>{' '}
                          לשעה
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon color="action" sx={{ ml: 0.5 }} />
                        <Typography variant="body2">
                          {job.workersNeeded || 1} עובדים נדרשים
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '50%' }}>
                      <AccessTimeIcon sx={{ ml: 0.5, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2">שעות עבודה:</Typography>
                        {Array.isArray(job.workHours) ? (
                          job.workHours.map((time, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                              {time}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {job.startTime} - {job.endTime}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '50%' }}>
                      <DateRangeIcon sx={{ ml: 0.5, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2">תאריכי עבודה:</Typography>
                        {Array.isArray(job.workDates) ? (
                          job.workDates.map((date, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">
                              {date}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {job.workDates}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="medium"
                    color="primary"
                    component={Link}
                    to={`/user/${job.employerId}`}
                  >
                    צפיה בפרטי מעסיק
                  </Button>
                  <Button
                    size="medium"
                    variant="contained"
                    color="secondary"
                    onClick={() => {/* Handle apply for job */}}
                  >
                    הגש מועמדות
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" align="center">
          אין לך עבודות שמורות כרגע.
        </Typography>
      )}
    </Container>
  );
}

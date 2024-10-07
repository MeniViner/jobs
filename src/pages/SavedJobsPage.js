import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Box, Chip, Divider, IconButton } from '@mui/material';
import { Work, LocationOn, AttachMoney, AccessTime, DateRange, Group, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { collection, getDocs, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setError("עליך להתחבר כדי לצפות בעבודות השמורות");
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const savedJobIds = userDoc.data().savedJobs || [];
        const jobsData = await Promise.all(
          savedJobIds.map(async (jobId) => {
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } : null;
          })
        );
        setSavedJobs(jobsData.filter(job => job !== null));
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        עבודות שמורות
      </Typography>
      
      {savedJobs.length > 0 ? (
        <Grid container spacing={3}>
          {savedJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>
                      {job.title}
                    </Typography>
                    <IconButton onClick={() => handleRemoveSavedJob(job.id)}>
                      <Bookmark color="primary" />
                    </IconButton>
                  </Box>
                  {job.isDeleted && (
                    <Chip label="עבודה זו נמחקה" color="error" sx={{ mb: 1 }} />
                  )}
                  {job.isFilled && (
                    <Chip label="עבודה זו מלאה" color="warning" sx={{ mb: 1 }} />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work fontSize="small" sx={{ mr: 1 }} />
                    {job.companyName || 'שם העסק לא זמין'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1 }} />
                    {job.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                    ₪{job.salary} לשעה
                  </Typography>
                  {job.startTime && job.endTime && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      {job.startTime} - {job.endTime}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group fontSize="small" sx={{ mr: 1 }} />
                    {job.workersNeeded || 1} עובדים נדרשים
                  </Typography>
                  <Chip label={job.type} size="small" sx={{ mt: 1, mb: 2 }} />
                  <Divider sx={{ my: 1 }} />
                  {job.workDates && job.workDates.length > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                        תאריכי עבודה:
                      </Typography>
                      {job.workDates.map((date, index) => (
                        <Typography key={index} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <DateRange fontSize="small" sx={{ mr: 1 }} />
                          {date}
                        </Typography>
                      ))}
                      <Divider sx={{ my: 1 }} />
                    </>
                  )}
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    תיאור המשרה:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {job.description && job.description.length > 100 
                      ? `${job.description.substring(0, 100)}...` 
                      : job.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="outlined">צפייה בפרטים</Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary" 
                    disabled={job.isDeleted || job.isFilled}
                  >
                    הגשת מועמדות
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

export default SavedJobsPage;
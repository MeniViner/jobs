import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Divider,
  Box,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Work as WorkIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredJobList = jobList.filter((job) => !job.isCompleted && !job.isFullyStaffed);
      setJobs(filteredJobList);
    } catch (error) {
      console.error('Error fetching jobs: ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setSavedJobs(userDocSnap.data().savedJobs || []);
        }
      } catch (error) {
        console.error('Error fetching saved jobs: ', error);
      }
    }
  };

  const handleSaveJob = async (jobId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('עליך להתחבר כדי לשמור עבודות');
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    try {
      if (savedJobs.includes(jobId)) {
        await updateDoc(userRef, {
          savedJobs: arrayRemove(jobId),
        });
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
      } else {
        await updateDoc(userRef, {
          savedJobs: arrayUnion(jobId),
        });
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error updating saved jobs: ', error);
      alert('אירעה שגיאה בעדכון העבודות השמורות.');
    }
  };

  const handleApplyForJob = async (jobId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert('עליך להתחבר כדי להגיש מועמדות');
        return;
      }

      const applicantRef = collection(db, 'jobChats', jobId, 'applicants');
      await addDoc(applicantRef, {
        applicantId: currentUser.uid,
        name: currentUser.displayName || 'אנונימי',
        timestamp: serverTimestamp(),
      });
      alert('הגשת המועמדות נשלחה בהצלחה!');
    } catch (error) {
      console.error('Error submitting application: ', error);
      alert('אירעה שגיאה בשליחת המועמדות.');
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(filter.toLowerCase()) &&
      job.location.toLowerCase().includes(locationFilter.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="חיפוש לפי תפקיד, משרה או מילת מפתח"
              variant="outlined"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton disabled>
                    <SearchIcon color="action" />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="מיקום (עיר, אזור)"
              variant="outlined"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IconButton disabled>
                    <LocationOnIcon color="action" />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ height: '100%' }}
              onClick={() => {
                // פעולה לחיפוש (אם נדרש)
              }}
            >
              חפש
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredJobs.map((job) => (
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
                  onClick={() => handleSaveJob(job.id)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  {savedJobs.includes(job.id) ? (
                    <BookmarkIcon color="primary" />
                  ) : (
                    <BookmarkBorderIcon />
                  )}
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
                  {/* Updated section for date and time */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    width: '100%',
                  }}>
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
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    לפרטים נוספים
                  </Button>
                  <Button
                    size="medium"
                    variant="contained"
                    color="secondary"
                    onClick={() => handleApplyForJob(job.id)}
                  >
                    הגש מועמדות
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { Work, LocationOn, AttachMoney, AccessTime, DateRange } from '@mui/icons-material';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../services/firebase';

function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ title: '', location: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.title.toLowerCase()) &&
    job.location.toLowerCase().includes(filter.location.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        רשימת עבודות זמינות
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="חיפוש לפי כותרת"
            name="title"
            value={filter.title}
            onChange={handleFilterChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="חיפוש לפי מיקום"
            name="location"
            value={filter.location}
            onChange={handleFilterChange}
            variant="outlined"
          />
        </Grid>
      </Grid>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredJobs.length > 0 ? (
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work fontSize="small" sx={{ mr: 1 }} /> {job.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1 }} /> {job.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney fontSize="small" sx={{ mr: 1 }} /> ₪{job.salary} לשעה
                  </Typography>
                  {job.startTime && job.endTime && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" sx={{ mr: 1 }} /> {job.startTime} - {job.endTime}
                    </Typography>
                  )}
                  <Chip label={job.type} size="small" sx={{ mt: 1, mb: 2 }} />
                  <Divider sx={{ my: 1 }} />
                  {job.workDates && job.workDates.length > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                        תאריכי עבודה:
                      </Typography>
                      {job.workDates.map((date, index) => (
                        <Typography key={index} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <DateRange fontSize="small" sx={{ mr: 1 }} /> {date}
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
                  <Button size="small" variant="contained" color="primary">הגשת מועמדות</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" align="center">
          לא נמצאו עבודות התואמות את החיפוש שלך.
        </Typography>
      )}
    </Container>
  );
}

export default JobListPage;
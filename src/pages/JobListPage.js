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
  Chip
} from '@mui/material';
import { Work, LocationOn, AttachMoney } from '@mui/icons-material';
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
                  <Chip label={job.type} size="small" sx={{ mt: 1 }} />
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

import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, Button, Card, CardContent, CardActions } from '@mui/material';
import { collection, query, getDocs } from "firebase/firestore";
import { db } from '../services/firebase';

function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ title: '', location: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const jobsCollection = collection(db, 'jobs');
    const jobSnapshot = await getDocs(jobsCollection);
    const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setJobs(jobList);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.title.toLowerCase()) &&
    job.location.toLowerCase().includes(filter.location.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
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
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="חיפוש לפי מיקום"
            name="location"
            value={filter.location}
            onChange={handleFilterChange}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {filteredJobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מיקום: {job.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  שכר: ₪{job.salary} לשעה
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">צפייה בפרטים</Button>
                <Button size="small">הגשת מועמדות</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default JobListPage;
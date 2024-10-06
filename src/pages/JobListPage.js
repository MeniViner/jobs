import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../services/firebase';
import { Card, CardContent, Typography, Grid, TextField, Button } from '@mui/material';
import JobCard from '../components/JobCard';

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ location: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, 
      where('price', '>=', Number(filter.minPrice) || 0),
      where('price', '<=', Number(filter.maxPrice) || Infinity),
      where('location', '==', filter.location || '')
    );
    const querySnapshot = await getDocs(q);
    const jobList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setJobs(jobList);
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Available Jobs</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="location"
            label="Location"
            value={filter.location}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="minPrice"
            label="Min Price"
            type="number"
            value={filter.minPrice}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="maxPrice"
            label="Max Price"
            type="number"
            value={filter.maxPrice}
            onChange={handleFilterChange}
          />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={fetchJobs}>Apply Filters</Button>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default JobListPage;
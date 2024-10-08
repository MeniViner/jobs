import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { Work, Person } from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  collectionGroup, // Import collectionGroup here
} from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function TopUsersPage() {
  const [topEmployers, setTopEmployers] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        // Fetch all jobs
        const jobsQuery = collection(db, 'jobs');
        const jobsSnapshot = await getDocs(jobsQuery);

        const employerJobCounts = {};
        jobsSnapshot.forEach((doc) => {
          const data = doc.data();
          const employerId = data.employerId;
          if (employerId) {
            if (!employerJobCounts[employerId]) {
              employerJobCounts[employerId] = { count: 0, name: data.employerName || 'אנונימי' };
            }
            employerJobCounts[employerId].count += 1;
          }
        });

        // Convert to array and sort
        const topEmployersData = Object.keys(employerJobCounts)
          .map((employerId) => ({
            id: employerId,
            name: employerJobCounts[employerId].name,
            jobCount: employerJobCounts[employerId].count,
          }))
          .sort((a, b) => b.jobCount - a.jobCount)
          .slice(0, 5);

        setTopEmployers(topEmployersData);

        // Fetch all job applications and hired workers
        const jobApplicationsQuery = collectionGroup(db, 'applicants');
        const jobApplicationsSnapshot = await getDocs(jobApplicationsQuery);

        const workerJobCounts = {};
        jobApplicationsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.hired) {
            const workerId = data.applicantId;
            if (!workerJobCounts[workerId]) {
              workerJobCounts[workerId] = { count: 0, name: data.applicantName || 'אנונימי' };
            }
            workerJobCounts[workerId].count += 1;
          }
        });

        // Convert to array and sort
        const topWorkersData = Object.keys(workerJobCounts)
          .map((workerId) => ({
            id: workerId,
            name: workerJobCounts[workerId].name,
            jobCount: workerJobCounts[workerId].count,
          }))
          .sort((a, b) => b.jobCount - a.jobCount)
          .slice(0, 5);

        setTopWorkers(topWorkersData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching top users:', error);
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  const UserList = ({ users, title, icon }) => (
    <Card>
      <CardHeader title={title} avatar={icon} />
      <CardContent>
        {users.length > 0 ? (
          <List>
            {users.map((user, index) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Avatar>{index + 1}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={`${user.jobCount} עבודות`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>אין נתונים זמינים</Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" align="center">
        משתמשים מובילים
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <UserList users={topEmployers} title="מעסיקים מובילים" icon={<Work />} />
        </Grid>
        <Grid item xs={12} md={6}>
          <UserList users={topWorkers} title="עובדים מובילים" icon={<Person />} />
        </Grid>
      </Grid>
    </Container>
  );
}

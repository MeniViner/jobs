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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Work, Person, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  collectionGroup,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function TopUsersPage() {
  const [topEmployers, setTopEmployers] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchTopUsers();
  }, []);

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

      // Fetch user details for employers
      const topEmployersData = await Promise.all(
        Object.keys(employerJobCounts).map(async (employerId) => {
          const userDoc = await getDoc(doc(db, 'users', employerId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          return {
            id: employerId,
            name: userData.displayName || 'אנונימי',
            photoURL: userData.photoURL || userData.profileURL || null,
            jobCount: employerJobCounts[employerId].count,
            email: userData.email,
            phone: userData.phone,
            company: userData.company,
            role: 'מעסיק',
          };
        })
      );
      // Sort and limit top employers
      topEmployersData.sort((a, b) => b.jobCount - a.jobCount);
      setTopEmployers(topEmployersData.slice(0, 5));

      // Fetch all job applications and hired workers
      const jobApplicationsQuery = collectionGroup(db, 'applicants');
      const jobApplicationsSnapshot = await getDocs(jobApplicationsQuery);

      const workerJobCounts = {};
      for (const applicationDoc of jobApplicationsSnapshot.docs) {
        const data = applicationDoc.data();
        if (data.hired) {
          const workerId = data.applicantId;
          if (!workerJobCounts[workerId]) {
            workerJobCounts[workerId] = { count: 0, name: 'אנונימי' };
          }
          workerJobCounts[workerId].count += 1;
        }
      }

      // Fetch user details for workers
      const topWorkersData = await Promise.all(
        Object.keys(workerJobCounts).map(async (workerId) => {
          const userDoc = await getDoc(doc(db, 'users', workerId));
          const userData = userDoc.exists() ? userDoc.data() : {};
          return {
            id: workerId,
            name: userData.displayName || 'אנונימי',
            photoURL: userData.photoURL || userData.profileURL || null, 
            jobCount: workerJobCounts[workerId].count,
            email: userData.email,
            phone: userData.phone,
            skills: userData.skills,
            role: 'עובד',
          };
        })
      );

      // Sort and limit top workers
      topWorkersData.sort((a, b) => b.jobCount - a.jobCount);
      setTopWorkers(topWorkersData.slice(0, 5));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching top users:', error);
      setLoading(false);
    }
  };

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const UserList = ({ users, title, icon }) => (
    <Card>
      <CardHeader title={title} avatar={icon} />
      <CardContent>
        {users.length > 0 ? (
          <List>
            {users.map((user, index) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Avatar alt={user.name} src={user.photoURL} />
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={`${user.jobCount} עבודות`} />
                <Button
                  component={Link}
                  to={`/user/${user.id}`}
                  startIcon={<Visibility />}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  צפה בפרופיל
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>אין נתונים זמינים</Typography>
        )}
      </CardContent>
    </Card>
  );

  const UserDetailsDialog = ({ user, open, onClose }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user?.name}</DialogTitle>
      <DialogContent>
        <Typography><strong>תפקיד:</strong> {user?.role}</Typography>
        <Typography><strong>אימייל:</strong> {user?.email}</Typography>
        <Typography><strong>טלפון:</strong> {user?.phone || 'לא צוין'}</Typography>
        <Typography><strong>מספר עבודות:</strong> {user?.jobCount}</Typography>
        {user?.role === 'מעסיק' && (
          <Typography><strong>חברה:</strong> {user?.company || 'לא צוין'}</Typography>
        )}
        {user?.role === 'עובד' && user?.skills && (
          <Typography><strong>כישורים:</strong> {user.skills.join(', ')}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>סגור</Button>
      </DialogActions>
    </Dialog>
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
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={openDialog}
          onClose={handleCloseDialog}
        />
      )}
    </Container>
  );
}
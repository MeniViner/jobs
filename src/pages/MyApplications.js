import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsCollection);
      const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const applicationsMap = new Map();

      for (const job of jobsData) {
        const applicantsCollection = collection(db, 'jobChats', job.id, 'applicants');
        const applicantsQuery = query(applicantsCollection, where('applicantId', '==', user.uid));
        const applicantsSnapshot = await getDocs(applicantsQuery);

        if (!applicantsSnapshot.empty) {
          const latestApplication = applicantsSnapshot.docs.reduce((latest, current) => {
            return latest.data().timestamp > current.data().timestamp ? latest : current;
          });

          applicationsMap.set(job.id, {
            id: latestApplication.id,
            jobId: job.id,
            jobTitle: job.title,
            companyName: job.companyName,
            appliedAt: latestApplication.data().timestamp,
            status: 'Pending', // You might want to add a status field to your applicants documents
            applicationCount: applicantsSnapshot.size
          });
        }
      }

      setApplications(Array.from(applicationsMap.values()));
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        המועמדויות שלי
      </Typography>
      {applications.length === 0 ? (
        <Typography variant="h6" align="center">
          לא הגשת עדיין מועמדות לאף משרה
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>כותרת המשרה</TableCell>
                <TableCell>שם החברה</TableCell>
                <TableCell>תאריך הגשה אחרון</TableCell>
                <TableCell>מספר הגשות</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.jobId}>
                  <TableCell>{application.jobTitle}</TableCell>
                  <TableCell>{application.companyName}</TableCell>
                  <TableCell>{application.appliedAt ? new Date(application.appliedAt.toDate()).toLocaleDateString('he-IL') : 'לא זמין'}</TableCell>
                  <TableCell>{application.applicationCount}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/chat/${application.jobId}`}
                      variant="contained"
                      color="primary"
                      size="small"
                    >
                      צ'אט
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
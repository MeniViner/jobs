import React, { useState, useEffect } from 'react';
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
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function AdminJobsDashboard() {
  const [jobs, setJobs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const jobsCollection = collection(db, 'jobs');
    const jobSnapshot = await getDocs(jobsCollection);
    const jobList = jobSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setJobs(jobList);
  };

  const handleOpenDialog = (job) => {
    setCurrentJob(job);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentJob(null);
  };

  const handleSaveJob = async () => {
    if (currentJob) {
      await updateDoc(doc(db, 'jobs', currentJob.id), currentJob);
      setSnackbar({ open: true, message: 'המשרה עודכנה בהצלחה' });
      fetchJobs();
      handleCloseDialog();
    }
  };

  const handleDeleteJob = async (id) => {
    await deleteDoc(doc(db, 'jobs', id));
    setSnackbar({ open: true, message: 'המשרה נמחקה בהצלחה' });
    fetchJobs();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        ניהול משרות
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת</TableCell>
              <TableCell>חברה</TableCell>
              <TableCell>מיקום</TableCell>
              <TableCell>סוג משרה</TableCell>
              <TableCell>שכר</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.type}</TableCell>
                <TableCell>₪{job.salary}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(job)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteJob(job.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>ערוך משרה</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="כותרת"
            type="text"
            fullWidth
            value={currentJob?.title || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="חברה"
            type="text"
            fullWidth
            value={currentJob?.company || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, company: e.target.value })}
          />
          <TextField
            margin="dense"
            label="מיקום"
            type="text"
            fullWidth
            value={currentJob?.location || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="סוג משרה"
            type="text"
            fullWidth
            value={currentJob?.type || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value })}
          />
          <TextField
            margin="dense"
            label="שכר"
            type="number"
            fullWidth
            value={currentJob?.salary || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, salary: e.target.value })}
          />
          <TextField
            margin="dense"
            label="תיאור"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentJob?.description || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button onClick={handleSaveJob}>שמור</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
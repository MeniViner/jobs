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
  Collapse,
  Box,
} from '@mui/material';
import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function AdminJobsDashboard() {
  const [jobs, setJobs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = await Promise.all(jobSnapshot.docs.map(async (docSnapshot) => {
        const jobData = docSnapshot.data();
        let employerData = null;
        if (jobData.employerId) {
          const employerDocRef = doc(db, 'employers', jobData.employerId);
          const employerDocSnapshot = await getDoc(employerDocRef);
          if (employerDocSnapshot.exists()) {
            employerData = employerDocSnapshot.data();
          }
        }
        return {
          id: docSnapshot.id,
          ...jobData,
          employer: employerData
        };
      }));
      setJobs(jobList);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בטעינת המשרות' });
    }
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
      try {
        const jobDocRef = doc(db, 'jobs', currentJob.id);
        await updateDoc(jobDocRef, currentJob);
        setSnackbar({ open: true, message: 'המשרה עודכנה בהצלחה' });
        fetchJobs();
        handleCloseDialog();
      } catch (error) {
        console.error("Error updating job: ", error);
        setSnackbar({ open: true, message: 'אירעה שגיאה בעדכון המשרה' });
      }
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      const jobDocRef = doc(db, 'jobs', id);
      await deleteDoc(jobDocRef);
      setSnackbar({ open: true, message: 'המשרה נמחקה בהצלחה' });
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job: ", error);
      setSnackbar({ open: true, message: 'אירעה שגיאה במחיקת המשרה' });
    }
  };

  const handleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
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
              <TableCell />
              <TableCell>כותרת</TableCell>
              <TableCell>חברה</TableCell>
              <TableCell>מיקום</TableCell>
              <TableCell>סוג משרה</TableCell>
              <TableCell>שכר</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job, index) => (
              <React.Fragment key={job.id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => handleExpandRow(index)}
                      sx={{
                        border: '2px solid #1976d2',
                        borderRadius: '50%',
                        padding: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      {expandedRow === index ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.companyName}</TableCell>
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
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={expandedRow === index} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="h6" gutterBottom component="div">
                          פרטי משרה
                        </Typography>
                        <Table size="small" aria-label="purchases">
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" scope="row">תיאור</TableCell>
                              <TableCell>{job.description}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">שעות עבודה</TableCell>
                              <TableCell>{job.startTime} - {job.endTime}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">תאריכי עבודה</TableCell>
                              <TableCell>{job.workDates ? job.workDates.join(', ') : 'לא צוין'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">פרטי מעסיק</TableCell>
                              <TableCell>
                                {job.employer ? (
                                  <>
                                    <Typography>שם: {job.employer.name}</Typography>
                                    <Typography>אימייל: {job.employer.email}</Typography>
                                    <Typography>טלפון: {job.employer.phone}</Typography>
                                  </>
                                ) : (
                                  'פרטי מעסיק לא זמינים'
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
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
            value={currentJob?.companyName || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, companyName: e.target.value })}
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
          <TextField
            margin="dense"
            label="שעת התחלה"
            type="time"
            fullWidth
            value={currentJob?.startTime || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, startTime: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <TextField
            margin="dense"
            label="שעת סיום"
            type="time"
            fullWidth
            value={currentJob?.endTime || ''}
            onChange={(e) => setCurrentJob({ ...currentJob, endTime: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
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
import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, Collapse, Box, InputAdornment, CircularProgress 
  } from '@mui/material';
import { Delete, Edit, KeyboardArrowDown, KeyboardArrowUp, Search } from '@mui/icons-material';
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function AdminJobsDashboard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.map((employer) => {
        const employerMatches = (employer.employerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  
        // אם שם המעסיק תואם לחיפוש, מציגים את כל העבודות של אותו מעסיק
        if (employerMatches) {
          return employer;
        }
  
        // אם אין התאמה לשם המעסיק, מסננים את העבודות
        const filteredJobs = employer.jobs.filter(job => 
          (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (job.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (job.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (job.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
  
        if (filteredJobs.length > 0) {
          return {
            ...employer,
            jobs: filteredJobs,
          };
        } else {
          return null;
        }
      }).filter(employer => employer !== null);
      
      setFilteredJobs(filtered);
    }
  }, [jobs, searchTerm]);
  
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch jobs
      const jobsCollection = collection(db, 'jobs');
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        };
      });

      // Fetch applications
      const applicationsCollection = collection(db, 'applications'); // או השם המתאים ב-DB שלך
      const applicationsSnapshot = await getDocs(applicationsCollection);
      const applicationsList = applicationsSnapshot.docs.map((docSnapshot) => {
        return docSnapshot.data();
      });

      // Map jobId to employee count
      const jobEmployeeCountMap = {};
      applicationsList.forEach((application) => {
        const jobId = application.jobId;
        if (jobEmployeeCountMap[jobId]) {
          jobEmployeeCountMap[jobId]++;
        } else {
          jobEmployeeCountMap[jobId] = 1;
        }
      });

      // Process jobList
      const processedJobList = await Promise.all(
        jobList.map(async (jobData) => {
          let employerData = null;
          if (jobData.employerId) {
            const employerDocRef = doc(db, 'users', jobData.employerId);
            const employerDocSnapshot = await getDoc(employerDocRef);
            if (employerDocSnapshot.exists()) {
              employerData = employerDocSnapshot.data();
            }
          }
          return {
            ...jobData,
            employerName: employerData?.displayName || employerData?.name || 'לא צוין',
            employerEmail: employerData?.email || 'לא צוין',
            employerPhone: employerData?.phone || 'לא צוין',
            employeeCount: jobEmployeeCountMap[jobData.id] || 0,
          };
        })
      );

      // Group jobs by employerId
      const employerMap = {};
      processedJobList.forEach((job) => {
        const employerId = job.employerId || 'unknown';
        if (!employerMap[employerId]) {
          employerMap[employerId] = {
            employerId,
            employerName: job.employerName,
            employerEmail: job.employerEmail,
            employerPhone: job.employerPhone,
            jobs: [],
          };
        }
        employerMap[employerId].jobs.push(job);
      });

      const groupedJobs = Object.values(employerMap);

      setJobs(groupedJobs);
      setFilteredJobs(groupedJobs);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בטעינת המשרות' });
    } finally {
      setLoading(false);
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

  const handleExpandRow = (jobId) => {
    setExpandedRow(expandedRow === jobId ? null : jobId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="חיפוש לפי כותרת, חברה, מיקום, סוג משרה או שם המפרסם"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

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
              <TableCell>מספר עובדים</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobs.map((employer, employerIndex) => (
              <React.Fragment key={employer.employerId}>
                <TableRow>
                  <TableCell colSpan={8} style={{ backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6">{employer.employerName || 'לא צוין'}</Typography>
                  </TableCell>
                </TableRow>
                {employer.jobs.map((job, index) => (
                  <React.Fragment key={job.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => handleExpandRow(job.id)}
                          sx={{
                            border: '2px solid #1976d2',
                            borderRadius: '50%',
                            padding: '8px',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            },
                          }}
                        >
                          {expandedRow === job.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{job.title || 'N/A'}</TableCell>
                      <TableCell>{job.companyName || 'N/A'}</TableCell>
                      <TableCell>{job.location || 'N/A'}</TableCell>
                      <TableCell>{job.type || 'N/A'}</TableCell>
                      <TableCell>{job.salary ? `₪${job.salary}` : 'N/A'}</TableCell>
                      <TableCell>{job.employeeCount}</TableCell>
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
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRow === job.id} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                              פרטי משרה
                            </Typography>
                            <Table size="small" aria-label="purchases">
                              <TableBody>
                                <TableRow>
                                  <TableCell component="th" scope="row">תיאור</TableCell>
                                  <TableCell>{job.description || 'לא צוין'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" scope="row">שעות עבודה</TableCell>
                                  <TableCell>{job.startTime && job.endTime ? `${job.startTime} - ${job.endTime}` : 'לא צוין'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" scope="row">תאריכי עבודה</TableCell>
                                  <TableCell>{job.workDates && job.workDates.length > 0 ? job.workDates.join(', ') : 'לא צוין'}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell component="th" scope="row">פרטי מעסיק</TableCell>
                                  <TableCell>
                                    <Typography>שם: {job.employerName}</Typography>
                                    <Typography>אימייל: {job.employerEmail}</Typography>
                                    <Typography>טלפון: {job.employerPhone}</Typography>
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
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* שאר הקוד נשאר ללא שינוי */}

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
    </>
  );
}

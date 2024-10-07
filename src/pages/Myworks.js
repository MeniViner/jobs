import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Work, LocationOn, AttachMoney, AccessTime, DateRange, Person, CheckCircle, Group, DoneAll, Delete, Undo, Flag } from '@mui/icons-material';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Myworks() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const fetchEmployerJobs = async () => {
    if (!auth.currentUser) return;

    const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', auth.currentUser.uid));
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setJobs(jobsList);

    // Fetch all unique applicants for all jobs
    const allApplicants = new Map();
    for (const job of jobsList) {
      const applicantsQuery = query(collection(db, 'jobChats', job.id, 'applicants'));
      const applicantsSnapshot = await getDocs(applicantsQuery);
      for (const applicantDoc of applicantsSnapshot.docs) {
        const applicantData = applicantDoc.data();
        if (!allApplicants.has(applicantData.applicantId)) {
          const userData = await getDoc(doc(db, 'users', applicantData.applicantId));
          allApplicants.set(applicantData.applicantId, {
            id: applicantDoc.id,
            ...applicantData,
            userData: userData.data(),
            appliedJobs: [{ jobId: job.id, hired: applicantData.hired || false }]
          });
        } else {
          allApplicants.get(applicantData.applicantId).appliedJobs.push({ 
            jobId: job.id, 
            hired: applicantData.hired || false 
          });
        }
      }
    }
    setApplicants(Array.from(allApplicants.values()));
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleSendMessage = (applicantId) => {
    // Implement the logic to send a message to the applicant
    console.log(`Sending message to applicant ${applicantId}: ${message}`);
    setMessage('');
  };

  const handleToggleHired = async (jobId, applicantId, currentHiredStatus) => {
    try {
      const applicantRef = doc(db, 'jobChats', jobId, 'applicants', applicantId);
      await updateDoc(applicantRef, {
        hired: !currentHiredStatus
      });
      
      // Update local state
      setApplicants(applicants.map(applicant => {
        if (applicant.id === applicantId) {
          const updatedAppliedJobs = applicant.appliedJobs.map(job => 
            job.jobId === jobId ? { ...job, hired: !currentHiredStatus } : job
          );
          return { ...applicant, appliedJobs: updatedAppliedJobs };
        }
        return applicant;
      }));
    } catch (error) {
      console.error("Error updating hired status:", error);
    }
  };

  const getHiredCount = (jobId) => {
    return applicants.filter(applicant => 
      applicant.appliedJobs.some(job => job.jobId === jobId && job.hired)
    ).length;
  };

  const handleToggleFullyStaffed = async (jobId) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      const currentStatus = jobDoc.data().isFullyStaffed;

      await updateDoc(jobRef, {
        isFullyStaffed: !currentStatus,
        isPublic: currentStatus // If we're un-staffing, make it public again
      });

      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, isFullyStaffed: !currentStatus, isPublic: currentStatus } : job
      ));

      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, isFullyStaffed: !currentStatus, isPublic: currentStatus });
      }

      alert(currentStatus ? 'העבודה סומנה כלא מאוישת במלואה והוחזרה לרשימת העבודות הפומביות' : 'העבודה סומנה כמאוישת במלואה והוסרה מרשימת העבודות הפומביות');
    } catch (error) {
      console.error("Error toggling fully staffed status:", error);
      alert('אירעה שגיאה בעת עדכון סטטוס האיוש של העבודה');
    }
  };

  const handleMarkJobCompleted = async (jobId) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        isCompleted: true,
        isPublic: false
      });

      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, isCompleted: true, isPublic: false } : job
      ));

      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, isCompleted: true, isPublic: false });
      }

      alert('העבודה סומנה כהושלמה והוסרה מרשימת העבודות הפעילות');
    } catch (error) {
      console.error("Error marking job as completed:", error);
      alert('אירעה שגיאה בעת סימון העבודה כהושלמה');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      // Delete the job from Firestore
      await deleteDoc(doc(db, 'jobs', jobToDelete.id));

      // Update local state
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));

      // If the deleted job was selected, clear the selection
      if (selectedJob && selectedJob.id === jobToDelete.id) {
        setSelectedJob(null);
      }

      // Close the dialog
      setOpenDeleteDialog(false);
      setJobToDelete(null);

      alert('העבודה נמחקה בהצלחה');
    } catch (error) {
      console.error("Error deleting job:", error);
      alert('אירעה שגיאה בעת מחיקת העבודה');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        עבודות שפרסמתי
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              העבודות שלי
            </Typography>
            <List>
              {jobs.map((job) => (
                <ListItem
                  key={job.id}
                  disablePadding
                  sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2 }}
                >
                  <ListItemButton onClick={() => handleJobSelect(job)} selected={selectedJob && selectedJob.id === job.id}>
                    <ListItemText 
                      primary={job.title} 
                      secondary={
                        <>
                          {job.location}
                          <br />
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Group fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {getHiredCount(job.id)} / {job.workersNeeded || 1} עובדים
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(getHiredCount(job.id) / (job.workersNeeded || 1)) * 100} 
                            sx={{ mt: 1 }}
                          />
                          {job.isFullyStaffed && (
                            <Chip 
                              label="מאויש במלואו" 
                              color="success" 
                              size="small" 
                              icon={<DoneAll />} 
                              sx={{ mt: 1 }}
                            />
                          )}
                          {job.isCompleted && (
                            <Chip 
                              label="הושלם" 
                              color="primary" 
                              size="small" 
                              icon={<Flag />} 
                              sx={{ mt: 1, ml: 1 }}
                            />
                          )}
                        </>
                      }
                    />
                  </ListItemButton>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Button
                      variant="contained"
                      color={job.isFullyStaffed ? "warning" : "primary"}
                      startIcon={job.isFullyStaffed ? <Undo /> : <DoneAll />}
                      onClick={() => handleToggleFullyStaffed(job.id)}
                      sx={{ flex: 1, mr: 1 }}
                    >
                      {job.isFullyStaffed ? 'בטל איוש מלא' : 'סמן כמאויש'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => {
                        setJobToDelete(job);
                        setOpenDeleteDialog(true);
                      }}
                      sx={{ flex: 1, ml: 1 }}
                    >
                      מחק עבודה
                    </Button>
                  </Box>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Flag />}
                    onClick={() => handleMarkJobCompleted(job.id)}
                    disabled={job.isCompleted}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    סמן כהושלם
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            {selectedJob ? (
              <>
                <Typography variant="h6" gutterBottom>
                  פרטי המשרה: {selectedJob.title}
                </Typography>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedJob.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Work fontSize="small" sx={{ mr: 1 }} /> {selectedJob.companyName || 'שם העסק לא זמין'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" sx={{ mr: 1 }} /> {selectedJob.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1 }} /> ₪{selectedJob.salary} לשעה
                    </Typography>
                    {selectedJob.startTime && selectedJob.endTime && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1 }} /> {selectedJob.startTime} - {selectedJob.endTime}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Group fontSize="small" sx={{ mr: 1 }} /> {getHiredCount(selectedJob.id)} / {selectedJob.workersNeeded || 1} עובדים
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(getHiredCount(selectedJob.id) / (selectedJob.workersNeeded || 1)) * 100} 
                      sx={{ mb: 1 }}
                    />
                    <Chip label={selectedJob.type} size="small" sx={{ mt: 1, mb: 2 }} />
                    {selectedJob.isFullyStaffed && (
                      <Chip 
                        label="מאויש במלואו" 
                        color="success" 
                        size="small" 
                        icon={<DoneAll />} 
                        sx={{ ml: 1 }}
                      />
                    )}
                    {selectedJob.isCompleted && (
                      <Chip 
                        label="הושלם" 
                        color="primary" 
                        size="small" 
                        icon={<Flag />} 
                        sx={{ ml: 1 }}
                      />
                    )}
                    <Divider sx={{ my: 1 }} />
                    {selectedJob.workDates && selectedJob.workDates.length > 0 &&
                      <>
                        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                          תאריכי עבודה:
                        </Typography>
                        {selectedJob.workDates.map((date, index) => (
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <DateRange fontSize="small" sx={{ mr: 1 }} /> {date}
                          </Typography>
                        ))}
                        <Divider sx={{ my: 1 }} />
                      </>
                    }
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      תיאור המשרה:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedJob.description}
                    </Typography>
                  </CardContent>
                </Card>
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  מועמדים למשרה
                </Typography>
                {applicants.filter(applicant => applicant.appliedJobs.some(job => job.jobId === selectedJob.id)).length > 0 ? (
                  <List>
                    {applicants
                      .filter(applicant => applicant.appliedJobs.some(job => job.jobId === selectedJob.id))
                      .map((applicant) => {
                        const appliedJob = applicant.appliedJobs.find(job => job.jobId === selectedJob.id);
                        return (
                          <React.Fragment key={applicant.id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar alt={applicant.name} src={applicant.userData?.avatarUrl} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Link to={`/user/${applicant.applicantId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {applicant.name}
                                  </Link>
                                }
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {applicant.userData?.email}
                                    </Typography>
                                    {` — ${applicant.message || 'אין הודעה מהמועמד'}`}
                                  </>
                                }
                              />
                              <Box>
                                <Button
                                  component={Link}
                                  to={`/user/${applicant.applicantId}`}
                                  startIcon={<Person />}
                                  variant="outlined"
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  צפה בפרופיל
                                </Button>
                                <Button
                                  variant={appliedJob.hired ? "contained" : "outlined"}
                                  color={appliedJob.hired ? "success" : "primary"}
                                  size="small"
                                  onClick={() => handleToggleHired(selectedJob.id, applicant.id, appliedJob.hired)}
                                  startIcon={appliedJob.hired ? <CheckCircle /> : null}
                                >
                                  {appliedJob.hired ? 'הועסק' : 'סמן כמועסק'}
                                </Button>
                              </Box>
                            </ListItem>
                            <Box sx={{ mt: 2, mb: 2 }}>
                              <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="הקלד הודעה..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSendMessage(applicant.id)}
                                sx={{ mt: 1 }}
                              >
                                שלח הודעה
                              </Button>
                            </Box>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        );
                      })}
                  </List>
                ) : (
                  <Typography>אין מועמדים למשרה זו עדיין</Typography>
                )}
              </>
            ) : (
              <Typography>בחר עבודה כדי לראות את פרטי המשרה והמועמדים</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"האם אתה בטוח שברצונך למחוק עבודה זו?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            מחיקת העבודה תסיר אותה לצמיתות מהמערכת. פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteJob} color="error" autoFocus>
            מחק עבודה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
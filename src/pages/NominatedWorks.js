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
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Chat as ChatIcon, 
  Work as WorkIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon, 
  DateRange as DateIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  AccessTime,
  DateRange,
  Send as SendIcon,
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [hiredJobs, setHiredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchApplicationsAndHiredJobs();
    }
  }, [user]);

  // const fetchApplicationsAndHiredJobs = async () => {
  //   setLoading(true);
  //   try {
  //     const jobsCollection = collection(db, 'jobs');
  //     const jobsSnapshot = await getDocs(jobsCollection);
  //     const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  //     // Fetch all applicants for each job in parallel
  //     const jobsWithApplicationsPromises = jobsData.map(async (job) => {
  //       const applicantsCollection = collection(db, 'jobChats', job.id, 'applicants');
  //       const applicantsQuery = query(applicantsCollection, where('applicantId', '==', user.uid));
  //       const applicantsSnapshot = await getDocs(applicantsQuery);
  
  //       if (!applicantsSnapshot.empty) {
  //         const latestApplication = applicantsSnapshot.docs.reduce((latest, current) => {
  //           return latest.data().timestamp > current.data().timestamp ? latest : current;
  //         });
  
  //         return {
  //           id: latestApplication.id,
  //           jobId: job.id,
  //           ...job,
  //           appliedAt: latestApplication.data().timestamp,
  //           status: latestApplication.data().hired ? 'התקבלת' : 'ממתין',
  //           applicationCount: applicantsSnapshot.size,
  //         };
  //       }
  //       return null;
  //     });
  
  //     const jobsWithApplications = await Promise.all(jobsWithApplicationsPromises);
  //     const filteredJobs = jobsWithApplications.filter(job => job !== null);
  
  //     setApplications(filteredJobs.filter(job => job.status !== 'התקבלת'));
  //     setHiredJobs(filteredJobs.filter(job => job.status === 'התקבלת'));
  //   } catch (error) {
  //     console.error("Error fetching applications and hired jobs:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const fetchApplicationsAndHiredJobs = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs'); // Correctly pointing to 'jobs' collection
      const jobsSnapshot = await getDocs(jobsCollection);
      const jobsData = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      // Fetch all applicants for each job in parallel
      const jobsWithApplicationsPromises = jobsData.map(async (job) => {
        const applicantsCollection = collection(db, 'jobs', job.id, 'applicants'); // Access applicants subcollection
        const applicantsQuery = query(applicantsCollection, where('applicantId', '==', user.uid));
        const applicantsSnapshot = await getDocs(applicantsQuery);
  
        if (!applicantsSnapshot.empty) {
          const latestApplication = applicantsSnapshot.docs.reduce((latest, current) =>
            latest.data().timestamp > current.data().timestamp ? latest : current
          );
  
          return {
            id: latestApplication.id,
            jobId: job.id,
            ...job,
            appliedAt: latestApplication.data().timestamp,
            status: latestApplication.data().hired ? 'התקבלת' : 'ממתין',
            applicationCount: applicantsSnapshot.size,
          };
        }
        return null;
      });
  
      const jobsWithApplications = await Promise.all(jobsWithApplicationsPromises);
      const filteredJobs = jobsWithApplications.filter((job) => job !== null);
  
      setApplications(filteredJobs.filter((job) => job.status !== 'התקבלת'));
      setHiredJobs(filteredJobs.filter((job) => job.status === 'התקבלת'));
    } catch (error) {
      console.error('Error fetching applications and hired jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // const handleSendMessage = async () => {
  //   if (newMessage.trim() === '' || !selectedJob) return;
  
  //   try {
  //     const applicantsCollection = collection(db, 'jobs', selectedJob.id, 'applicants'); // Correctly access applicants subcollection
  //     const applicantQuery = query(applicantsCollection, where('applicantId', '==', user.uid));
  //     const applicantSnapshot = await getDocs(applicantQuery);
  
  //     let chatId;
  //     if (applicantSnapshot.empty) {
  //       const newApplicant = {
  //         applicantId: user.uid,
  //         applicantName: user.displayName || 'Anonymous',
  //         jobId: selectedJob.id,
  //         jobTitle: selectedJob.title,
  //         employerId: selectedJob.employerId,
  //         employerName: selectedJob.employerName || 'Anonymous',
  //         createdAt: serverTimestamp(),
  //       };
  
  //       const applicantRef = await addDoc(applicantsCollection, newApplicant); // Add new applicant document
  //       chatId = applicantRef.id;
  //     } else {
  //       chatId = applicantSnapshot.docs[0].id;
  //     }
  
  //     await addDoc(collection(db, 'jobChats', selectedJob.id, 'applicants', chatId, 'messages'), {
  //       text: newMessage,
  //       senderId: user.uid,
  //       senderName: user.displayName || 'Anonymous',
  //       timestamp: serverTimestamp(),
  //     });
  
  //     setChatDialogOpen(false);
  //     setNewMessage('');
  //     alert('message sended')
  //     navigate(`/job-chat`);

  //     // navigate(`/job-chat/${selectedJob.id}`);
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //   }
  // };
  


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (applicationToDelete) {
      try {
        await deleteDoc(doc(db, 'jobChats', applicationToDelete.jobId, 'applicants', applicationToDelete.id));
        setApplications(applications.filter(app => app.id !== applicationToDelete.id));
        setDeleteDialogOpen(false);
        setApplicationToDelete(null);
      } catch (error) {
        console.error("Error deleting application:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setApplicationToDelete(null);
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedJob(null);
  };

  const handleStartChat = (job) => {
    setSelectedJob(job);
    setChatDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedJob) return;

    try {
      const chatQuery = query(
        collection(db, 'jobChats'),
        where('jobId', '==', selectedJob.id),
        where('applicantId', '==', user.uid)
      );
      const chatSnapshot = await getDocs(chatQuery);

      let chatId;
      if (chatSnapshot.empty) {
        const newChat = {
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          applicantId: user.uid,
          applicantName: user.displayName || 'Anonymous',
          employerId: selectedJob.employerId,
          employerName: selectedJob.employerName || 'Anonymous',
          createdAt: serverTimestamp()
        };
        const chatRef = await addDoc(collection(db, 'jobChats'), newChat);
        chatId = chatRef.id;
      } else {
        chatId = chatSnapshot.docs[0].id;
      }

      await addDoc(collection(db, 'jobChats', chatId, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        timestamp: serverTimestamp()
      });

      setChatDialogOpen(false);
      setNewMessage('');
      alert('הודעתך נשלחה למעסיק.')
      navigate(`/job-chat`);
      // navigate(`/job-chat/${selectedJob.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const renderJobList = (jobs, isHired = false) => {
    if (jobs.length === 0) {
      return (
        <Typography variant="h6" align="center">
          {isHired ? 'טרם התקבלת לאף עבודה' : 'לא הגשת עדיין מועמדות לאף משרה'}
        </Typography>
      );
    }

    if (isMobile) {
      return (
        <Grid container spacing={2}>
          {jobs.map((job) => (
            <Grid item xs={12} key={job.jobId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {job.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {job.companyName}
                  </Typography>
                  <Typography variant="body2">
                    תאריך הגשה: {job.appliedAt ? new Date(job.appliedAt.toDate()).toLocaleDateString('he-IL') : 'לא זמין'}
                  </Typography>
                  {!isHired && (
                    <Typography variant="body2">
                      מספר הגשות: {job.applicationCount}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    סטטוס: {job.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ChatIcon />}
                    onClick={() => handleStartChat(job)}
                  >
                    התחל צ'אט
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(job)}
                  >
                    פרטים
                  </Button>
                  {!isHired && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(job)}
                    >
                      מחק מועמדות
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת המשרה</TableCell>
              <TableCell>שם החברה</TableCell>
              <TableCell>תאריך הגשה</TableCell>
              {!isHired && <TableCell>מספר הגשות</TableCell>}
              <TableCell>סטטוס</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>{job.appliedAt ? new Date(job.appliedAt.toDate()).toLocaleDateString('he-IL') : 'לא זמין'}</TableCell>
                {!isHired && <TableCell>{job.applicationCount}</TableCell>}
                <TableCell>{job.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ChatIcon />}
                    onClick={() => handleStartChat(job)}
                    sx={{ mr: 1 }}
                  >
                    התחל צ'אט
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(job)}
                    sx={{ mr: 1 }}
                  >
                    פרטים
                  </Button>
                  {!isHired && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(job)}
                    >
                      מחק מועמדות
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
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
        המועמדויות והעבודות שלי
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="application tabs"
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="מועמדויות שהגשתי" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="עבודות שהתקבלתי" icon={<CheckCircleIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        {renderJobList(applications)}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderJobList(hiredJobs, true)}
      </TabPanel>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"האם אתה בטוח שברצונך למחוק את המועמדות?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            פעולה זו תמחק את המועמדות שלך לעבודה זו. לא ניתן לבטל פעולה זו.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            מחק מועמדות
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        aria-labelledby="job-details-dialog-title"
        aria-describedby="job-details-dialog-description"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="job-details-dialog-title">
          {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              פרטי העבודה
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <WorkIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  חברה: {selectedJob?.companyName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  מיקום: {selectedJob?.location}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <AttachMoneyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  שכר: ₪{selectedJob?.salary} לשעה
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  שעות: {selectedJob?.startTime} - {selectedJob?.endTime}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <DateRange fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  תאריכי עבודה: {selectedJob?.workDates ? selectedJob.workDates.join(', ') : 'לא זמין'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <DescriptionIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  תיאור העבודה:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedJob?.description}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            סגור
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)}>
        <DialogTitle>שלח הודעה למעסיק</DialogTitle>
        <DialogContent>
          <DialogContentText>
            התחל שיחה עם המעסיק עבור המשרה: {selectedJob?.title}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="הודעה"
            type="text"
            fullWidth
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleSendMessage} variant="contained" startIcon={<SendIcon />}>
            שלח
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
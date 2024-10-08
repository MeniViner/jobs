import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, List, ListItem, ListItemText, ListItemButton, ListItemAvatar, Avatar,
  Divider, Button, TextField, Box, Card, CardContent, Chip, LinearProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Collapse, Tab, Tabs,
} from '@mui/material';
import { 
  Work, LocationOn, AttachMoney, AccessTime, DateRange, Person, CheckCircle, Group, DoneAll, 
  Delete, Undo, Flag, ExpandMore, ExpandLess, Chat, Edit 
} from '@mui/icons-material';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { RatingInput } from './rating/RatingSystem.jsx';
import JobCompletionRating from './rating/JobCompletionRating.tsx';


function EditJobDialog({ open, handleClose, job, handleSave }) {
  const [editedJob, setEditedJob] = useState(job || {});
  

  useEffect(() => {
    if (job) {
      setEditedJob(job);
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(editedJob);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="edit-job-dialog-title">
      <DialogTitle id="edit-job-dialog-title">ערוך פרטי עבודה</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="כותרת העבודה"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.title || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="companyName"
            label="שם החברה"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.companyName || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="מיקום"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.location || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="salary"
            label="שכר לשעה"
            type="number"
            fullWidth
            variant="outlined"
            value={editedJob.salary || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="startTime"
            label="שעת התחלה"
            type="time"
            fullWidth
            variant="outlined"
            value={editedJob.startTime || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <TextField
            margin="dense"
            name="endTime"
            label="שעת סיום"
            type="time"
            fullWidth
            variant="outlined"
            value={editedJob.endTime || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <TextField
            margin="dense"
            name="workersNeeded"
            label="מספר עובדים נדרש"
            type="number"
            fullWidth
            variant="outlined"
            value={editedJob.workersNeeded || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="type"
            label="סוג העבודה"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.type || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="תיאור העבודה"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editedJob.description || ''}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button type="submit" variant="contained" color="primary">
            שמור שינויים
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}


export default function MyWorksPage() {
  const [jobs, setJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openRatingDialog, setOpenRatingDialog] = useState(false);
  const [jobToRate, setJobToRate] = useState(null);
  const auth = getAuth();

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Check if the user has signed in with Google
      const googleUser = user.providerData.find(provider => provider.providerId === 'google.com');
  
      if (googleUser) {
        // Store user's photoURL and other details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          displayName: googleUser.displayName,
          email: googleUser.email,
          photoURL: googleUser.photoURL,  // Store the Google profile picture
        }, { merge: true });  // Merge so we don't overwrite existing fields
      }
    }
  });

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const fetchEmployerJobs = async () => {
    if (!auth.currentUser) return;
  
    const jobsQuery = query(collection(db, 'jobs'), where('employerId', '==', auth.currentUser.uid));
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobsList = [];
  
    for (const jobDoc of jobsSnapshot.docs) {
      const jobData = jobDoc.data();
  
      const employerDocRef = doc(db, 'employers', jobData.employerId);
      const employerDoc = await getDoc(employerDocRef);
  
      let companyName = 'Unknown Company'; // Default value in case employer data is not found
      if (employerDoc.exists()) {
        const employerData = employerDoc.data();
        companyName = employerData.companyName || companyName;
      }
  
      jobsList.push({
        id: jobDoc.id,
        ...jobData,
        companyName, // Use the fetched companyName instead of the one from jobs collection
      });
    }
  
    setJobs(jobsList);
  
    // const allApplicants = new Map();
    // for (const job of jobsList) {
    //   const applicantsQuery = query(collection(db, 'jobChats', job.id, 'applicants'));
    //   const applicantsSnapshot = await getDocs(applicantsQuery);
    //   for (const applicantDoc of applicantsSnapshot.docs) {
    //     const applicantData = applicantDoc.data();
    //     const userData = await getDoc(doc(db, 'users', applicantData.applicantId));
    //     if (!allApplicants.has(applicantData.applicantId)) {
    //       const userData = await getDoc(doc(db, 'users', applicantData.applicantId));
    //       allApplicants.set(applicantData.applicantId, {
    //         id: applicantDoc.id,
    //         ...applicantData,
    //         userData: userData.data(),
    //         appliedJobs: [{ jobId: job.id, hired: applicantData.hired || false }],
    //       });
    //     } else {
    //       allApplicants.get(applicantData.applicantId).appliedJobs.push({
    //         jobId: job.id,
    //         hired: applicantData.hired || false,
    //       });
    //     }
    //   }
    // }
    // setApplicants(Array.from(allApplicants.values()));

    const allApplicants = new Map();
    for (const job of jobsList) {
      const applicantsQuery = query(collection(db, 'jobChats', job.id, 'applicants'));
      const applicantsSnapshot = await getDocs(applicantsQuery);

      for (const applicantDoc of applicantsSnapshot.docs) {
        const applicantData = applicantDoc.data();
        const userDoc = await getDoc(doc(db, 'users', applicantData.applicantId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        if (!allApplicants.has(applicantData.applicantId)) {
          allApplicants.set(applicantData.applicantId, {
            id: applicantDoc.id,
            ...applicantData,
            userData: {
              ...userData,
              // Ensure you are getting the photoURL from Firestore
              avatarUrl: userData.avatarUrl || null, 
              photoURL: userData.photoURL || null, 
              profileURL: userData.profileURL || null, 
            },
            appliedJobs: [{ jobId: job.id, hired: applicantData.hired || false }],
          });
        } else {
          allApplicants.get(applicantData.applicantId).appliedJobs.push({
            jobId: job.id,
            hired: applicantData.hired || false,
          });
        }
      }
    }
    setApplicants(Array.from(allApplicants.values()));

  };

  const getGoogleProfilePicture = (email) => {
    const auth = getAuth();
    const users = auth.currentUser.providerData;
  
    const user = users.find((provider) => provider.email === email);
    return user ? user.photoURL : null;
  };
  

  const handleToggleExpand = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleSendMessage = async (applicantId, jobId) => {
    if (!message.trim()) return;

    try {
      const chatQuery = query(
        collection(db, 'jobChats'),
        where('jobId', '==', jobId),
        where('applicantId', '==', applicantId)
      );
      const chatSnapshot = await getDocs(chatQuery);

      let chatId;
      if (chatSnapshot.empty) {
        const newChat = {
          jobId: jobId,
          jobTitle: jobs.find((job) => job.id === jobId).title,
          applicantId: applicantId,
          applicantName: applicants.find((app) => app.applicantId === applicantId).name,
          employerId: auth.currentUser.uid,
          employerName: auth.currentUser.displayName || 'מעסיק',
          createdAt: serverTimestamp(),
        };
        const chatRef = await addDoc(collection(db, 'jobChats'), newChat);
        chatId = chatRef.id;
      } else {
        chatId = chatSnapshot.docs[0].id;
      }

      await addDoc(collection(db, 'jobChats', chatId, 'messages'), {
        text: message,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'מעסיק',
        timestamp: serverTimestamp(),
      });

      setMessage('');
      setOpenChatDialog(false);
      alert('ההודעה נשלחה בהצלחה');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('אירעה שגיאה בשליחת ההודעה');
    }
  };

  const handleToggleHired = async (jobId, applicantId, currentHiredStatus) => {
    try {
      const applicantRef = doc(db, 'jobChats', jobId, 'applicants', applicantId);
      await updateDoc(applicantRef, {
        hired: !currentHiredStatus,
      });

      setApplicants(
        applicants.map((applicant) => {
          if (applicant.id === applicantId) {
            const updatedAppliedJobs = applicant.appliedJobs.map((job) =>
              job.jobId === jobId ? { ...job, hired: !currentHiredStatus } : job
            );
            return { ...applicant, appliedJobs: updatedAppliedJobs };
          }
          return applicant;
        })
      );
    } catch (error) {
      console.error('Error updating hired status:', error);
    }
  };

  const getHiredCount = (jobId) => {
    return applicants.filter((applicant) =>
      applicant.appliedJobs.some((job) => job.jobId === jobId && job.hired)
    ).length;
  };

  const handleToggleFullyStaffed = async (jobId) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      const currentJob = jobDoc.data();

      if (!currentJob) {
        throw new Error('Job not found');
      }

      const newIsFullyStaffed = !currentJob.isFullyStaffed;

      const updatedFields = {
        isFullyStaffed: newIsFullyStaffed,
      };

      if (currentJob.hasOwnProperty('isPublic')) {
        updatedFields.isPublic = !newIsFullyStaffed;
      }

      await updateDoc(jobRef, updatedFields);

      setJobs(
        jobs.map((job) => (job.id === jobId ? { ...job, ...updatedFields } : job))
      );

      alert(
        newIsFullyStaffed
          ? 'העבודה סומנה כמאוישת במלואה והוסרה מרשימת העבודות הפומביות'
          : 'העבודה סומנה כלא מאוישת במלואה והוחזרה לרשימת העבודות הפומביות'
      );
    } catch (error) {
      console.error('Error toggling fully staffed status:', error);
      alert('אירעה שגיאה בעת עדכון סטטוס האיוש של העבודה');
    }
  };

  const handleMarkJobCompleted = (jobId) => {
    setJobToRate(jobId);
    setOpenRatingDialog(true);
  };

  const handleJobCompletionRatingClose = () => {
    setOpenRatingDialog(false);
    setJobToRate(null);
  };

  const handleJobCompletionRatingComplete = () => {
    fetchEmployerJobs(); // Refresh the job list
  };

  const handleConfirmJobCompletion = async () => {
    if (!jobToRate) return;
  
    try {
      const jobRef = doc(db, 'jobs', jobToRate);
      await updateDoc(jobRef, {
        isCompleted: true,
        isPublic: false,
      });
  
      setJobs(
        jobs.map((job) => (job.id === jobToRate ? { ...job, isCompleted: true, isPublic: false } : job))
      );
  
      setOpenRatingDialog(false);
      setJobToRate(null);
      alert('העבודה סומנה כהושלמה והוסרה מרשימת העבודות הפעילות');
    } catch (error) {
      console.error('Error marking job as completed:', error);
      alert('אירעה שגיאה בעת סימון העבודה כהושלמה');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await deleteDoc(doc(db, 'jobs', jobToDelete.id));
      setJobs(jobs.filter((job) => job.id !== jobToDelete.id));
      setOpenDeleteDialog(false);
      setJobToDelete(null);
      alert('העבודה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('אירעה שגיאה בעת מחיקת העבודה');
    }
  };

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setOpenEditDialog(true);
  };

  const handleSaveEditedJob = async (editedJob) => {
    try {
      const jobRef = doc(db, 'jobs', editedJob.id);
      await updateDoc(jobRef, editedJob);
      setJobs(jobs.map((job) => (job.id === editedJob.id ? editedJob : job)));
      setOpenEditDialog(false);
      setJobToEdit(null);
      alert('פרטי העבודה עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('אירעה שגיאה בעת עדכון פרטי העבודה');
    }
  };

  const handleOpenChatDialog = (applicant, jobId) => {
    setSelectedApplicant({ ...applicant, jobId });
    setOpenChatDialog(true);
  };

  const handleRateWorker = async (jobId, workerId, rating, review) => {
    try {
      await addDoc(collection(db, 'ratings'), {
        jobId,
        employerId: auth.currentUser.uid,
        workerId,
        rating,
        review,
        createdAt: serverTimestamp(),
      });

      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.applicantId === workerId ? { ...applicant, isRated: true } : applicant
        )
      );

      alert('הדירוג נשלח בהצלחה!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('אירעה שגיאה בעת שליחת הדירוג. אנא נסה שוב.');
    }
  };

  const activeJobs = jobs.filter((job) => !job.isCompleted);
  const completedJobs = jobs.filter((job) => job.isCompleted);

  const renderJobList = (jobList) => {
    if (jobList.length === 0) {
      return <Typography>אין עבודות</Typography>;
    }

    return (
      <List>
        {jobList.map((job) => (
          <React.Fragment key={job.id}>
            <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 2 }}>
              <ListItemButton onClick={() => handleToggleExpand(job.id)}>
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
                    </>
                  }
                />
                {expandedJob === job.id ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={expandedJob === job.id} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                  <Card elevation={3}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {job.title}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<Edit />}
                          onClick={() => handleEditJob(job)}
                          size="small"
                        >
                          ערוך
                        </Button>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Work fontSize="small" sx={{ mr: 1 }} /> {job.companyName || 'שם העסק לא זמין'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <LocationOn fontSize="small" sx={{ mr: 1 }} /> {job.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <AttachMoney fontSize="small" sx={{ mr: 1 }} /> ₪{job.salary} לשעה
                      </Typography>
                      {job.startTime && job.endTime && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <AccessTime fontSize="small" sx={{ mr: 1 }} /> {job.startTime} - {job.endTime}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Group fontSize="small" sx={{ mr: 1 }} /> {getHiredCount(job.id)} /{' '}
                        {job.workersNeeded || 1} עובדים
                      </Typography>
                      <Chip label={job.type} size="small" sx={{ mt: 1, mb: 2 }} />
                      {job.workDates && job.workDates.length > 0 && (
                        <>
                          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                            תאריכי עבודה:
                          </Typography>
                          {job.workDates.map((date, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
                            >
                              <DateRange fontSize="small" sx={{ mr: 1 }} /> {date}
                            </Typography>
                          ))}
                        </>
                      )}
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        תיאור המשרה:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.description}
                      </Typography>
                    </CardContent>
                  </Card>
                  {!job.isCompleted && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="contained"
                        color={job.isFullyStaffed ? 'warning' : 'primary'}
                        startIcon={job.isFullyStaffed ? <Undo /> : <DoneAll />}
                        onClick={() => handleToggleFullyStaffed(job.id)}
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
                      >
                        מחק עבודה
                      </Button>
                    </Box>
                  )}
                  {!job.isCompleted && (
                   <Button
                   variant="contained"
                   color="success"
                   startIcon={<Flag />}
                   onClick={() => handleMarkJobCompleted(job.id)}
                   fullWidth
                   sx={{ mt: 2 }}
                 >
                   סמן כהושלם (רק לאחר שהעובדים הגיעו)
                 </Button>
                  )}
                  {job.isCompleted && (
                    <Box mt={2}>
                      <Typography variant="h6">דרג את העובדים</Typography>
                      {applicants
                        .filter(
                          (applicant) =>
                            applicant.appliedJobs.some(
                              (aj) => aj.jobId === job.id && aj.hired
                            ) && !applicant.isRated
                        )
                        .map((worker) => (
                          <Box key={worker.id} mb={2}>
                            <Typography>{worker.name}</Typography>
                            <RatingInput
                              jobId={job.id}
                              targetUserId={worker.applicantId}
                              isEmployerRating={true}
                              onSubmit={(rating, review) =>
                                handleRateWorker(job.id, worker.applicantId, rating, review)
                              }
                            />
                          </Box>
                        ))}
                    </Box>
                  )}
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    תקשורת עם מועמדים
                  </Typography>
                  {applicants.filter((applicant) =>
                    applicant.appliedJobs.some((appliedJob) => appliedJob.jobId === job.id)
                  ).length > 0 ? (
                    <List>
                      {applicants
                        .filter((applicant) =>
                          applicant.appliedJobs.some((appliedJob) => appliedJob.jobId === job.id)
                        )
                        .map((applicant) => {
                          const appliedJob = applicant.appliedJobs.find(
                            (appliedJob) => appliedJob.jobId === job.id
                          );
                          return (
                            <React.Fragment key={applicant.id}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                  <Avatar
                                    alt={applicant.name}
                                    src={
                                      applicant.userData?.profileURL || 
                                      applicant.userData?.photoURL ||
                                      applicant.userData?.avatarUrl  
                                    }
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Link
                                      to={`/user/${applicant.applicantId}`}
                                      style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                      {applicant.name}
                                    </Link>
                                  }
                                  secondary={
                                    <>
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                      >
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
                                    variant={appliedJob.hired ? 'contained' : 'outlined'}
                                    color={appliedJob.hired ? 'success' : 'primary'}
                                    size="small"
                                    onClick={() =>
                                      handleToggleHired(job.id, applicant.id, appliedJob.hired)
                                    }
                                    startIcon={appliedJob.hired ? <CheckCircle /> : null}
                                  >
                                    {appliedJob.hired ? 'הועסק' : 'סמן כמועסק'}
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<Chat />}
                                    onClick={() => handleOpenChatDialog(applicant, job.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    צ'אט
                                  </Button>
                                </Box>
                              </ListItem>
                              <Divider variant="inset" component="li" />
                            </React.Fragment>
                          );
                        })}
                    </List>
                  ) : (
                    <Typography>אין מועמדים למשרה זו עדיין</Typography>
                  )}
                </Box>
              </Collapse>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        עבודות שפרסמתי
      </Typography>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="עבודות פעילות" />
        <Tab label="היסטוריית עבודות" />
      </Tabs>
      <Paper elevation={3} sx={{ p: 2 }}>
        {activeTab === 0 ? renderJobList(activeJobs) : renderJobList(completedJobs)}
      </Paper>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'האם אתה בטוח שברצונך למחוק עבודה זו?'}</DialogTitle>
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
      <EditJobDialog
        open={openEditDialog}
        handleClose={() => {
          setOpenEditDialog(false);
          setJobToEdit(null);
        }}
        job={jobToEdit}
        handleSave={handleSaveEditedJob}
      />
      <Dialog open={openChatDialog} onClose={() => setOpenChatDialog(false)}>
        <DialogTitle>שלח הודעה למועמד</DialogTitle>
        <DialogContent>
          <DialogContentText>
            שלח הודעה ל{selectedApplicant?.name} עבור המשרה:{' '}
            {jobs.find((job) => job.id === selectedApplicant?.jobId)?.title}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="הודעה"
            type="text"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChatDialog(false)}>ביטול</Button>
          <Button
            onClick={() =>
              handleSendMessage(selectedApplicant.applicantId, selectedApplicant.jobId)
            }
            variant="contained"
            startIcon={<Chat />}
          >
            שלח
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
  open={openRatingDialog}
  onClose={() => setOpenRatingDialog(false)}
  aria-labelledby="rating-dialog-title"
  aria-describedby="rating-dialog-description"
>
  <DialogTitle id="rating-dialog-title">סיום עבודה ודירוג עובדים</DialogTitle>
  <DialogContent>
    <DialogContentText id="rating-dialog-description">
      האם אתה מעוניין לדרג את העובדים שהשתתפו בעבודה זו? תוכל לדרג אותם מיד לאחר סימון העבודה כהושלמה.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenRatingDialog(false)} color="primary">
      ביטול
    </Button>
    <Button onClick={handleConfirmJobCompletion} color="primary" autoFocus>
      סיים עבודה ודרג עובדים
    </Button>
  </DialogActions>
</Dialog>
<JobCompletionRating
        open={openRatingDialog}
        onClose={handleJobCompletionRatingClose}
        jobId={jobToRate}
        onComplete={handleJobCompletionRatingComplete}
      />
    </Container>
  );
}

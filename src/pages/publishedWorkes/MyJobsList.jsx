import React, { useState, useRef, useEffect } from 'react';
import {
  List, ListItem, ListItemButton, ListItemText, Collapse, Box, Card, CardContent,
  Typography, Button, Chip, LinearProgress, Avatar, Divider, ListItemAvatar
} from '@mui/material';
import {
  Work, LocationOn, AttachMoney, AccessTime, DateRange, Group, DoneAll,
  Delete, Undo, Flag, ExpandMore, ExpandLess, Chat, Edit, Person, CheckCircle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { RatingInput } from '../rating/RatingSystem';
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { getAuth } from 'firebase/auth';
import MySnackbar from 'styles/snackers/MySnackbar';
import { setSnackbar, showSnackbar } from '../../styles/snackers/SnackbarUtils'


export default function MyJobsList({ 
  jobs, 
  jobApplicants, 
  onDeleteJob, 
  onEditJob, 
  onOpenChat, 
  onMarkJobCompleted,
  fetchEmployerJobs,
  setJobs,
  setJobApplicants
}) {
  const [expandedJob, setExpandedJob] = useState(null);
  const auth = getAuth();
  const snackbarRef = useRef();

  
  useEffect(() => {
    setSnackbar(snackbarRef.current);
  }, []);

  const handleToggleExpand = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
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

      showSnackbar(
        newIsFullyStaffed
          ? 'העבודה סומנה כמאוישת במלואה והוסרה מרשימת העבודות הפומביות'
          : 'העבודה סומנה חזרה כאינה מאוישת, וכעת מוצגת ברשימת העבודות ',
        newIsFullyStaffed ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Error toggling fully staffed status:', error);
      alert('אירעה שגיאה בעת עדכון סטטוס האיוש של העבודה');
    }
  };

  const handleToggleHired = async (jobId, applicantId, currentHiredStatus) => {
    try {
      const applicantRef = doc(db, 'jobs', jobId, 'applicants', applicantId);
      const jobRef = doc(db, 'jobs', jobId);
      const userAcceptedJobsRef = doc(db, 'users', applicantId, 'acceptedJobs', jobId);
      const userApplicationsRef = doc(db, 'users', applicantId, 'applications', jobId);

      const jobSnapshot = await getDoc(jobRef);
      const jobData = jobSnapshot.data();
  
      // Update the hired status in Firebase
      if (!currentHiredStatus) {
        await updateDoc(applicantRef, { hired: true });
        await setDoc(userAcceptedJobsRef, { jobId, timestamp: serverTimestamp() });
        await deleteDoc(userApplicationsRef);
      } else {
        await updateDoc(applicantRef, { hired: false });
        await deleteDoc(userAcceptedJobsRef);
        await setDoc(userApplicationsRef, {
          jobId,
          timestamp: serverTimestamp(),
          status: 'applied',
        });
      }
  
      // Immediately update the local state to reflect the change
      setJobApplicants((prevJobApplicants) => {
        const updatedApplicants = { ...prevJobApplicants };
        const jobApplicants = updatedApplicants[jobId] || [];
  
        updatedApplicants[jobId] = jobApplicants.map((applicant) =>
          applicant.applicantId === applicantId
            ? { ...applicant, hired: !currentHiredStatus }
            : applicant
        );
  
        return updatedApplicants;
      });

      // Add a notification to Firebase
      await addDoc(collection(db, 'notifications'), {
        userId: applicantId,
        jobId: jobId,
        jobTitle: jobData?.title || 'Unknown Job',
        type: currentHiredStatus ? 'hired_status_revoked' : 'hired_status_updated',
        message: currentHiredStatus
          ? `הסטטוס שלך למשרה: ${jobData?.title} בוטל.`
          : `התקבלת למשרה: ${jobData?.title}!`,
        timestamp: serverTimestamp(),
        isHistory: false,
      });
  
      showSnackbar(
        currentHiredStatus
          ? 'הסטטוס שונה - המועמד כבר לא התקבל למשרה.'
          : 'המועמד התקבל למשרה בהצלחה!',
        currentHiredStatus ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error updating hired status:', error);
      alert('אירעה שגיאה בעדכון הסטטוס.');
    }
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

      setJobApplicants((prevJobApplicants) => {
        const updatedApplicants = { ...prevJobApplicants };
        const applicantsForJob = updatedApplicants[jobId] || [];
        updatedApplicants[jobId] = applicantsForJob.map((applicant) =>
          applicant.applicantId === workerId ? { ...applicant, isRated: true } : applicant
        );
        return updatedApplicants;
      });

      showSnackbar('הדירוג נשלח בהצלחה!', 'success');
    } catch (error) {
      console.error('Error submitting rating:', error);
      showSnackbar('אירעה שגיאה בעת שליחת הדירוג. אנא נסה שוב.', 'error');
    }
  };

  const getHiredCount = (jobId) => {
    const applicantsForJob = jobApplicants[jobId] || [];
    return applicantsForJob.filter(applicant => applicant.hired).length;
  };

  if (jobs.length === 0) {
    return <Typography>אין עבודות</Typography>;
  }

  return (
    <List>
      {jobs.map((job) => (
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
                        onClick={() => onEditJob(job)}
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
                      onClick={() => onDeleteJob(job)}
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
                    onClick={() => onMarkJobCompleted(job.id)}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    סמן כהושלם (רק לאחר שהעובדים הגיעו)
                  </Button>
                )}
                {job.isCompleted && (
                  <Box mt={2}>
                    <Typography variant="h6">דרג את העובדים</Typography>
                    {jobApplicants[job.id]
                      ?.filter((applicant) => applicant.hired && !applicant.isRated)
                      .map((worker) => (
                        <Box key={worker.applicantId} mb={2}>
                          <Typography variant="p">{worker.userData?.name || 'שם לא זמין'}</Typography>
                          <RatingInput
                            jobId={job.id}
                            jobTitle={job.title}
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
                {jobApplicants[job.id] && jobApplicants[job.id].length > 0 ? (
                  <List>
                    {jobApplicants[job.id].map((applicant) => (
                      <React.Fragment key={applicant.applicantId}>
                        <ListItem alignItems="flex-start">
                          
                          <ListItemAvatar>
                            <Avatar
                              alt={applicant.userData?.name || 'מועמד'}
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
                                {applicant.userData?.name || 'שם לא זמין'}
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
                              variant={applicant.hired ? 'contained' : 'outlined'}
                              color={applicant.hired ? 'success' : 'primary'}
                              size="small"
                              onClick={() =>
                                handleToggleHired(job.id, applicant.applicantId, applicant.hired)
                              }
                              startIcon={applicant.hired ? <CheckCircle /> : null}
                            >
                              {applicant.hired ? 'הועסק' : 'סמן כמועסק'}
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<Chat />}
                              onClick={() => onOpenChat(applicant, job.id)}
                              sx={{ ml: 1 }}
                            >
                              צ'אט
                            </Button>
                          </Box>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="p">אין מועמדים למשרה זו עדיין</Typography>
                )}
              </Box>
            </Collapse>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
            <MySnackbar ref={snackbarRef} />
    </List>
  );
}
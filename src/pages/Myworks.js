import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
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
} from '@mui/material';
import { Work, LocationOn, AttachMoney, AccessTime, DateRange } from '@mui/icons-material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function EmployerChatPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState('');
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
  };

  const handleJobSelect = async (job) => {
    setSelectedJob(job);
    const applicantsQuery = query(collection(db, 'jobChats', job.id, 'applicants'));
    const applicantsSnapshot = await getDocs(applicantsQuery);
    const applicantsList = await Promise.all(applicantsSnapshot.docs.map(async (applicantDoc) => {
      const userData = await getDoc(doc(db, 'users', applicantDoc.data().applicantId));
      return { id: applicantDoc.id, ...applicantDoc.data(), userData: userData.data() };
    }));
    setApplicants(applicantsList);
  };

  const handleSendMessage = (applicantId) => {
    // Implement the logic to send a message to the applicant
    console.log(`Sending message to applicant ${applicantId}: ${message}`);
    setMessage('');
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
                  button
                  key={job.id}
                  onClick={() => handleJobSelect(job)}
                  selected={selectedJob && selectedJob.id === job.id}
                >
                  <ListItemText primary={job.title} secondary={job.location} />
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
                    <Chip label={selectedJob.type} size="small" sx={{ mt: 1, mb: 2 }} />
                    <Divider sx={{ my: 1 }} />
                    {selectedJob.workDates && selectedJob.workDates.length > 0 && (
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
                    )}
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
                {applicants.length > 0 ? (
                  <List>
                    {applicants.map((applicant) => (
                      <React.Fragment key={applicant.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt={applicant.name} src={applicant.userData?.avatarUrl} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={applicant.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {applicant.userData?.email}
                                </Typography>
                                {` — ${applicant.message || 'אין הודעה מהמועמד'}`}
                              </>
                            }
                          />
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
                    ))}
                  </List>
                ) : (
                  <Typography>��ין מועמדים למשרה זו עדיין</Typography>
                )}
              </>
            ) : (
              <Typography>בחר עבודה כדי לראות את פרטי המשרה והמועמדים</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EmployerChatPage;
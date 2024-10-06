import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { List, ListItem, ListItemText, Divider, Typography, Button } from '@mui/material';

function JobChat() {
  const [jobs, setJobs] = useState([]); // רשימת העבודות שהמעסיק פרסם
  const [selectedJob, setSelectedJob] = useState(null); // העבודה שנבחרה לצפייה במועמדים
  const [applicants, setApplicants] = useState([]); // רשימת המועמדים לעבודה
  const [messages, setMessages] = useState([]); // הודעות שנשלחו ע"י מועמדים
  const currentUser = getAuth().currentUser;

  // טעינת העבודות שהמעסיק פרסם מקולקציית jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, 'jobs'), where('postedBy', '==', currentUser.uid)); // מחפש את העבודות בקולקציית jobs
        const jobSnapshot = await getDocs(q);
        const jobList = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Jobs fetched:', jobList); // הצגת העבודות בקונסול
        setJobs(jobList);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [currentUser.uid]);

  // טיפול בלחיצה על עבודה וטעינת המועמדים לעבודה זו
  const handleJobClick = (jobId) => {
    setSelectedJob(jobId);
    const fetchApplicants = async () => {
      try {
        // טעינת המועמדים עבור העבודה שנבחרה מתוך jobChats
        const q = query(collection(db, 'jobChats', jobId, 'applicants')); 
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const applicantsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('Applicants fetched:', applicantsList); // הדפסת המועמדים לקונסול
          setApplicants(applicantsList);
        });
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
    };
    fetchApplicants();
  };

  // טעינת ההודעות שנשלחו ע"י המועמד
  const handleApplicantClick = (applicantId) => {
    const fetchMessages = async () => {
      try {
        const q = query(collection(db, 'jobChats', selectedJob, 'applicants', applicantId, 'messages'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messagesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('Messages fetched:', messagesList); // הדפסת ההודעות בקונסול
          setMessages(messagesList);
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  };

  return (
    <div>
      {!selectedJob ? (
        <div>
          <Typography variant="h4" gutterBottom>העבודות שפרסמת</Typography>
          <List>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id}>
                  <ListItem button onClick={() => handleJobClick(job.id)}>
                    <ListItemText primary={job.title} secondary={job.company} />
                  </ListItem>
                  <Divider />
                </div>
              ))
            ) : (
              <Typography variant="body1">לא נמצאו עבודות שפרסמת</Typography>
            )}
          </List>
        </div>
      ) : (
        <div>
          <Button variant="outlined" onClick={() => setSelectedJob(null)}>חזור לרשימת העבודות</Button>
          <Typography variant="h5" gutterBottom>מועמדים לעבודה</Typography>
          <List>
            {applicants.length > 0 ? (
              applicants.map((applicant) => (
                <div key={applicant.id}>
                  <ListItem button onClick={() => handleApplicantClick(applicant.id)}>
                    <ListItemText primary={`מועמד: ${applicant.id}`} />
                  </ListItem>
                  <Divider />
                </div>
              ))
            ) : (
              <Typography variant="body1">אין מועמדים לעבודה זו</Typography>
            )}
          </List>

          {messages.length > 0 && (
            <div>
              <Typography variant="h6" gutterBottom>הודעות מהמועמד:</Typography>
              <List>
                {messages.map((message) => (
                  <div key={message.id}>
                    <ListItem>
                      <ListItemText primary={message.text} secondary={`נשלח ב: ${new Date(message.timestamp.seconds * 1000).toLocaleString()}`} />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JobChat;

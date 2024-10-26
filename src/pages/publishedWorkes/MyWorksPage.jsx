// import React, { useState, useEffect, useMemo } from 'react';
// import { 
//   Container, Typography, Paper, Tabs, Tab, Box, CircularProgress, Snackbar,
// } from '@mui/material';
// import MuiAlert from '@mui/material/Alert';
// import { 
//   collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc, addDoc, serverTimestamp, collectionGroup, onSnapshot
// } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { getAuth } from 'firebase/auth';
// import { useAuth } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import MyJobsList from './MyJobsList';
// import DeleteJobDialog from './DeleteJobDialog.jsx';
// import EditJobDialog from './EditJobDialog';
// import ChatDialog from './ChatDialog.jsx';
// import JobCompletionRating from '../rating/JobCompletionRating';


// export default function MyWorksPage() {
//   const { user, loading: authLoading } = useAuth();
//   const [jobs, setJobs] = useState([]);
//   const [jobApplicants, setJobApplicants] = useState({});
//   const navigate = useNavigate();
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [jobToDelete, setJobToDelete] = useState(null);
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [jobToEdit, setJobToEdit] = useState(null);
//   const [openChatDialog, setOpenChatDialog] = useState(false);
//   const [selectedApplicant, setSelectedApplicant] = useState(null);
//   const [activeTab, setActiveTab] = useState(0);
//   const [openRatingDialog, setOpenRatingDialog] = useState(false);
//   const [jobToRate, setJobToRate] = useState(null);
//   const auth = getAuth();
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);

//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState('');
//   const [snackbarSeverity, setSnackbarSeverity] = useState('success');

//   useEffect(() => {
//     if (authLoading || !user) return;
  
//     setLoading(true); // Start loading
  
//     const unsubscribe = onSnapshot(
//       query(collection(db, 'jobs'), where('employerId', '==', auth.currentUser.uid)),
//       async (snapshot) => {
//         const jobsList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
  
//         try {
//           // Fetch all applicants for the jobs in parallel
//           const applicantsData = await fetchApplicantsForJobs(jobsList);
//           setJobs(jobsList);
//           setJobApplicants(applicantsData);
//         } catch (error) {
//           console.error('Error fetching applicants:', error);
//           setError('Failed to fetch applicants. Please try again.');
//         } finally {
//           setLoading(false); // Ensure loading stops
//         }
//       },
//       (error) => {
//         console.error('Error fetching jobs:', error);
//         setError('Failed to fetch jobs. Please try again.');
//         setLoading(false); // Ensure loading stops even on error
//       }
//     );
  
//     return () => unsubscribe(); // Clean up listener on unmount
//   }, [authLoading, user]);
  
//   // Helper function to fetch all applicants for the jobs
//   const fetchApplicantsForJobs = async (jobsList) => {
//     const applicantsData = {};
  
//     // Use Promise.all to fetch applicants in parallel
//     await Promise.all(
//       jobsList.map(async (job) => {
//         const applicantsRef = collection(db, 'jobs', job.id, 'applicants');
//         const applicantsSnapshot = await getDocs(applicantsRef);
  
//         const jobApplicants = await Promise.all(
//           applicantsSnapshot.docs.map(async (applicantDoc) => {
//             const applicantData = applicantDoc.data();
//             const userDoc = await getDoc(doc(db, 'users', applicantData.applicantId));
//             const userData = userDoc.exists() ? userDoc.data() : {};
  
//             return {
//               applicantId: applicantData.applicantId,
//               ...applicantData,
//               userData,
//             };
//           })
//         );
  
//         applicantsData[job.id] = jobApplicants;
//       })
//     );
  
//     return applicantsData;
//   };
  


    
//   const fetchEmployerJobs = async () => {
//     if (!auth.currentUser) return;
//     setLoading(true);  // Start loading
  
//     try {
//       const jobsQuery = query(
//         collection(db, 'jobs'),
//         where('employerId', '==', auth.currentUser.uid)
//       );
//       const jobsSnapshot = await getDocs(jobsQuery);
  
//       const jobsList = jobsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
  
//       // If no jobs found, stop loading and return early
//       if (jobsList.length === 0) {
//         setJobs([]); // Set empty jobs to avoid errors
//         setLoading(false);
//         return;
//       }
  
//       const jobIds = jobsList.map((job) => job.id);
  
//       // Fetch applicants in batches for all jobs
//       const applicantsQuery = query(
//         collectionGroup(db, 'applicants'),
//         where('jobId', 'in', jobIds)
//       );
//       const applicantsSnapshot = await getDocs(applicantsQuery);
  
//       const applicantsData = applicantsSnapshot.docs.reduce((acc, doc) => {
//         const data = doc.data();
//         if (!acc[data.jobId]) acc[data.jobId] = [];
//         acc[data.jobId].push(data);
//         return acc;
//       }, {});
  
//       setJobs(jobsList);
//       setJobApplicants(applicantsData);
//     } catch (error) {
//       console.error('Error fetching jobs or applicants:', error);
//       setError('Failed to fetch jobs. Please try again.');
//     } finally {
//       // Stop loading regardless of the outcome
//       setLoading(false);
//     }
//   };
    
//   const handleDeleteJob = async () => {
//     if (!jobToDelete) return;

//     try {
//       await deleteDoc(doc(db, 'jobs', jobToDelete.id));
      
//       // Remove the deleted job from the jobs state
//       setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      
//       // Remove the job's applicants from the jobApplicants state
//       const updatedJobApplicants = { ...jobApplicants };
//       delete updatedJobApplicants[jobToDelete.id];
//       setJobApplicants(updatedJobApplicants);

//       setOpenDeleteDialog(false);
//       setJobToDelete(null);
//       showSnackbar('העבודה נמחקה בהצלחה', 'success');
//     } catch (error) {
//       console.error('Error deleting job:', error);
//       showSnackbar('אירעה שגיאה בעת מחיקת העבודה', 'error');
//     }
//   };

//   const handleSaveEditedJob = async (editedJob) => {
//     try {
//       const jobRef = doc(db, 'jobs', editedJob.id);
//       await updateDoc(jobRef, editedJob);
      
//       // Update the job in the jobs state
//       setJobs(jobs.map(job => job.id === editedJob.id ? { ...job, ...editedJob } : job));

//       setOpenEditDialog(false);
//       setJobToEdit(null);
//       showSnackbar('פרטי העבודה עודכנו בהצלחה', 'success');
//     } catch (error) {
//       console.error('Error updating job:', error);
//       showSnackbar('אירעה שגיאה בעת עדכון פרטי העבודה', 'error');
//     }
//   };

//   const handleSendMessage = async (message) => {
//     if (!selectedApplicant || !message.trim()) return;

//     try {
//       const chatQuery = query(
//         collection(db, 'jobChats'),
//         where('jobId', '==', selectedApplicant.jobId),
//         where('applicantId', '==', selectedApplicant.applicantId)
//       );
//       const chatSnapshot = await getDocs(chatQuery);

//       let chatId;
//       if (chatSnapshot.empty) {
//         const newChat = {
//           jobId: selectedApplicant.jobId,
//           jobTitle: jobs.find((job) => job.id === selectedApplicant.jobId)?.title,
//           applicantId: selectedApplicant.applicantId,
//           applicantName: selectedApplicant.userData?.name || 'מועמד',
//           employerId: auth.currentUser.uid,
//           employerName: auth.currentUser.displayName || 'מעסיק',
//           createdAt: serverTimestamp(),
//         };
//         const chatRef = await addDoc(collection(db, 'jobChats'), newChat);
//         chatId = chatRef.id;
//       } else {
//         chatId = chatSnapshot.docs[0].id;
//       }

//       await addDoc(collection(db, 'jobChats', chatId, 'messages'), {
//         text: message,
//         senderId: auth.currentUser.uid,
//         senderName: auth.currentUser.displayName || 'מעסיק',
//         timestamp: serverTimestamp(),
//       });

//       setOpenChatDialog(false);
//       showSnackbar('ההודעה נשלחה בהצלחה', 'success');
//       // navigate(`/job-chat/${chatId}`, { replace: true });
//     } catch (error) {
//       console.error('Error sending message:', error);
//       showSnackbar('אירעה שגיאה בשליחת ההודעה', 'error');
//     }
//   };

//   const activeJobs = useMemo(
//     () => jobs.filter((job) => !job.isCompleted),
//     [jobs]
//   );

//     const completedJobs = useMemo(
//     () => jobs.filter((job) => job.isCompleted),
//     [jobs]
//   );

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   const handleSnackbarClose = (event, reason) => {
//     if (reason === 'clickaway') return;
//     setSnackbarOpen(false);
//   };
  
//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbarMessage(message);
//     setSnackbarSeverity(severity);
//     setSnackbarOpen(true);
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         עבודות שפרסמתי
//       </Typography>
//       <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
//         <Tab label="עבודות פעילות" />
//         <Tab label="היסטוריית עבודות" />
//       </Tabs>

//       <Paper elevation={3} sx={{ p: 2 }}>
//         {loading || authLoading ? (
//           <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//             <CircularProgress />
//           </Box>
//         ) : (
//           <MyJobsList 
//             jobs={activeTab === 0 ? activeJobs : completedJobs} 
//             jobApplicants={jobApplicants}
//             onDeleteJob={(job) => {
//               setJobToDelete(job);
//               setOpenDeleteDialog(true);
//             }}
//             onEditJob={(job) => {
//               setJobToEdit(job);
//               setOpenEditDialog(true);
//             }}
//             onOpenChat={(applicant, jobId) => {
//               setSelectedApplicant({ ...applicant, jobId });
//               setOpenChatDialog(true);
//             }}
//             onMarkJobCompleted={(jobId) => {
//               setJobToRate(jobId);
//               setOpenRatingDialog(true);
//             }}
//             fetchEmployerJobs={fetchEmployerJobs}
//             setJobs={setJobs} // כאן לוודא שהפונקציה מועברת
//             setJobApplicants={setJobApplicants}
//           />
//         )}
//       </Paper>
//       <DeleteJobDialog
//         open={openDeleteDialog}
//         onClose={() => setOpenDeleteDialog(false)}
//         onConfirm={handleDeleteJob}
//       />
//       <EditJobDialog
//         open={openEditDialog}
//         handleClose={() => {
//           setOpenEditDialog(false);
//           setJobToEdit(null);
//         }}
//         job={jobToEdit}
//         handleSave={handleSaveEditedJob}
//       />
//       <ChatDialog
//         open={openChatDialog}
//         onClose={() => setOpenChatDialog(false)}
//         applicant={selectedApplicant}
//         jobTitle={jobs.find((job) => job.id === selectedApplicant?.jobId)?.title}
//         onSendMessage={handleSendMessage}
//       />
//       <JobCompletionRating
//         open={openRatingDialog}
//         onClose={() => {
//           setOpenRatingDialog(false);
//           setJobToRate(null);
//         }}
//         jobId={jobToRate}
//         onComplete={() => {
//           fetchEmployerJobs();
//           setOpenRatingDialog(false);
//           setJobToRate(null);
//         }}
//       />

//       <Snackbar 
//         open={snackbarOpen} 
//         autoHideDuration={6000} 
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <MuiAlert 
//           onClose={handleSnackbarClose} 
//           severity={snackbarSeverity} 
//           sx={{ width: '100%' }}
//           elevation={6} 
//           variant="filled"
//         >
//           {snackbarMessage}
//         </MuiAlert>
//       </Snackbar>

//     </Container>
//   );
// }





// MyWorksPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Typography, Paper, Box, CircularProgress, Snackbar, AppBar, Toolbar, IconButton
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  History as HistoryIcon, Refresh as RefreshIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import {
  collection, query, where, onSnapshot, doc, getDoc, getDocs, deleteDoc, updateDoc, addDoc, serverTimestamp, collectionGroup,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MyJobsList from './MyJobsList';
import DeleteJobDialog from './DeleteJobDialog';
import EditJobDialog from './EditJobDialog';
import ChatDialog from './ChatDialog';
import JobCompletionRating from '../rating/JobCompletionRating';


export default function MyWorksPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobApplicants, setJobApplicants] = useState({});
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true); // התחלת טעינה

    const unsubscribe = onSnapshot(
      query(collection(db, 'jobs'), where('employerId', '==', auth.currentUser.uid)),
      async (snapshot) => {
        const jobsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        try {
          // שליפת כל המועמדים לעבודות במקביל
          const applicantsData = await fetchApplicantsForJobs(jobsList);
          setJobs(jobsList);
          setJobApplicants(applicantsData);
        } catch (error) {
          console.error('Error fetching applicants:', error);
          setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
        } finally {
          setLoading(false); // סיום טעינה
        }
      },
      (error) => {
        console.error('Error fetching jobs:', error);
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
        setLoading(false); // סיום טעינה גם במקרה של שגיאה
      }
    );

    return () => unsubscribe(); // ניקוי מאזין כאשר הרכיב מתנתק
  }, [authLoading, user]);

  // פונקציה עזר לשליפת כל המועמדים לעבודות
  const fetchApplicantsForJobs = async (jobsList) => {
    const applicantsData = {};

    await Promise.all(
      jobsList.map(async (job) => {
        const applicantsRef = collection(db, 'jobs', job.id, 'applicants');
        const applicantsSnapshot = await getDocs(applicantsRef);

        const jobApplicants = await Promise.all(
          applicantsSnapshot.docs.map(async (applicantDoc) => {
            const applicantData = applicantDoc.data();
            const userDoc = await getDoc(doc(db, 'users', applicantData.applicantId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            return {
              applicantId: applicantData.applicantId,
              ...applicantData,
              userData,
            };
          })
        );

        applicantsData[job.id] = jobApplicants;
      })
    );

    return applicantsData;
  };

  const fetchEmployerJobs = async () => {
    if (!auth.currentUser) return;
    setLoading(true); // התחלת טעינה

    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('employerId', '==', auth.currentUser.uid)
      );
      const jobsSnapshot = await getDocs(jobsQuery);

      const jobsList = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // אם לא נמצאו עבודות, עצור את הטעינה והחזר מוקדם
      if (jobsList.length === 0) {
        setJobs([]); // הגדרת עבודות ריקות כדי למנוע שגיאות
        setLoading(false);
        return;
      }

      const jobIds = jobsList.map((job) => job.id);

      // שליפת המועמדים במנות עבור כל העבודות
      const applicantsQuery = query(
        collectionGroup(db, 'applicants'),
        where('jobId', 'in', jobIds)
      );
      const applicantsSnapshot = await getDocs(applicantsQuery);

      const applicantsData = applicantsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (!acc[data.jobId]) acc[data.jobId] = [];
        acc[data.jobId].push(data);
        return acc;
      }, {});

      setJobs(jobsList);
      setJobApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching jobs or applicants:', error);
      setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
    } finally {
      // עצירת הטעינה בכל מקרה
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await deleteDoc(doc(db, 'jobs', jobToDelete.id));
      
      // הסרת העבודה שנמחקה ממצב העבודות
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      
      // הסרת המועמדים של העבודה שנמחקה ממצב המועמדים
      const updatedJobApplicants = { ...jobApplicants };
      delete updatedJobApplicants[jobToDelete.id];
      setJobApplicants(updatedJobApplicants);

      setOpenDeleteDialog(false);
      setJobToDelete(null);
      showSnackbar('העבודה נמחקה בהצלחה', 'success');
    } catch (error) {
      console.error('Error deleting job:', error);
      showSnackbar('אירעה שגיאה בעת מחיקת העבודה', 'error');
    }
  };

  const handleSaveEditedJob = async (editedJob) => {
    try {
      const jobRef = doc(db, 'jobs', editedJob.id);
      await updateDoc(jobRef, editedJob);
      
      // עדכון העבודה במצב העבודות
      setJobs(jobs.map(job => job.id === editedJob.id ? { ...job, ...editedJob } : job));

      setOpenEditDialog(false);
      setJobToEdit(null);
      showSnackbar('פרטי העבודה עודכנו בהצלחה', 'success');
    } catch (error) {
      console.error('Error updating job:', error);
      showSnackbar('אירעה שגיאה בעת עדכון פרטי העבודה', 'error');
    }
  };

  const handleSendMessage = async (message) => {
    if (!selectedApplicant || !message.trim()) return;

    try {
      const chatQuery = query(
        collection(db, 'jobChats'),
        where('jobId', '==', selectedApplicant.jobId),
        where('applicantId', '==', selectedApplicant.applicantId)
      );
      const chatSnapshot = await getDocs(chatQuery);

      let chatId;
      if (chatSnapshot.empty) {
        const newChat = {
          jobId: selectedApplicant.jobId,
          jobTitle: jobs.find((job) => job.id === selectedApplicant.jobId)?.title,
          applicantId: selectedApplicant.applicantId,
          applicantName: selectedApplicant.userData?.name || 'מועמד',
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

      setOpenChatDialog(false);
      showSnackbar('ההודעה נשלחה בהצלחה', 'success');
      // ניתן לנתב לדף הצ'אט אם נדרש
      // navigate(`/job-chat/${chatId}`, { replace: true });
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('אירעה שגיאה בשליחת ההודעה', 'error');
    }
  };

  const activeJobs = useMemo(
    () => jobs.filter((job) => !job.isCompleted),
    [jobs]
  );

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.isCompleted),
    [jobs]
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {activeTab === 0 ? 'עבודות פעילות' : 'היסטוריית עבודות'}
          </Typography>
          <Box>
            <IconButton
              color="primary"
              onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
              aria-label="היסטוריה"
              sx={{ mr: 1 }}
            >
              
              {activeTab === 0 ? <HistoryIcon /> : <ArrowBackIcon/>}
            </IconButton>
            <IconButton color="primary" onClick={() => fetchEmployerJobs()} aria-label="רענן">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        {loading || authLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        ) : (
          <MyJobsList 
            jobs={activeTab === 0 ? activeJobs : completedJobs} 
            jobApplicants={jobApplicants}
            isHistoryView={activeTab === 1}
            onDeleteJob={(job) => {
              setJobToDelete(job);
              setOpenDeleteDialog(true);
            }}
            onEditJob={(job) => {
              setJobToEdit(job);
              setOpenEditDialog(true);
            }}
            onOpenChat={(applicant, jobId) => {
              setSelectedApplicant({ ...applicant, jobId });
              setOpenChatDialog(true);
            }}
            onMarkJobCompleted={(jobId) => {
              setJobToRate(jobId);
              setOpenRatingDialog(true);
            }}
            fetchEmployerJobs={fetchEmployerJobs}
            setJobs={setJobs}
            setJobApplicants={setJobApplicants}
          />
        )}
      </Paper>
      <DeleteJobDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteJob}
      />
      <EditJobDialog
        open={openEditDialog}
        handleClose={() => {
          setOpenEditDialog(false);
          setJobToEdit(null);
        }}
        job={jobToEdit}
        handleSave={handleSaveEditedJob}
      />
      <ChatDialog
        open={openChatDialog}
        onClose={() => setOpenChatDialog(false)}
        applicant={selectedApplicant}
        jobTitle={jobs.find((job) => job.id === selectedApplicant?.jobId)?.title}
        onSendMessage={handleSendMessage}
      />
      <JobCompletionRating
        open={openRatingDialog}
        onClose={() => {
          setOpenRatingDialog(false);
          setJobToRate(null);
        }}
        jobId={jobToRate}
        onComplete={() => {
          fetchEmployerJobs();
          setOpenRatingDialog(false);
          setJobToRate(null);
        }}
      />

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          elevation={6} 
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

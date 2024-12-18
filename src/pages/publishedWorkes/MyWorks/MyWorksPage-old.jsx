import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Paper, Box, CircularProgress, Snackbar, useMediaQuery
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  collection, query, where, onSnapshot, doc, getDoc, getDocs, deleteDoc, updateDoc, addDoc, serverTimestamp, collectionGroup,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MyJobsList from './MyJobsList';
import DeleteJobDialog from '../DeleteJobDialog';
import EditJobDialog from '../EditJobDialog';
import ChatDialog from '../ChatDialog';
import JobCompletionRating from '../../rating/JobCompletionRating';
import JobDetails from '../JobDetails'; 
import { RefreshCw} from 'lucide-react';


const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-100 text-blue-600' 
        : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);
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
  
  // מצב למעקב אחרי עבודה שנבחרה
  const [selectedJob, setSelectedJob] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // שימוש ב-useMediaQuery לזיהוי מסך קטן (מכשיר נייד)
  const isMobile = useMediaQuery('(max-width:600px)');

  // הגדרת הפונקציה fetchEmployerJobs
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

      // אם לא נמצאו עבודות, עצור את הטעינה והגדר רשימה ריקה
      if (jobsList.length === 0) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const jobIds = jobsList.map((job) => job.id);

      // שליפת המועמדים במנות עבור כל העבודות (Firestore 'in' queries תומך עד 10 ערכים)
      const applicantsData = {};

      const chunkSize = 10;
      for (let i = 0; i < jobIds.length; i += chunkSize) {
        const chunk = jobIds.slice(i, i + chunkSize);
        const applicantsQuery = query(
          collectionGroup(db, 'applicants'),
          where('jobId', 'in', chunk)
        );
        const applicantsSnapshot = await getDocs(applicantsQuery);

        applicantsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!applicantsData[data.jobId]) {
            applicantsData[data.jobId] = [];
          }
          applicantsData[data.jobId].push(data);
        });
      }

      setJobs(jobsList);
      setJobApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching jobs or applicants:', error);
      setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
    } finally {
      setLoading(false); // סיום טעינה
    }
  };

  // פונקציה לעזרה בשליפת כל המועמדים לעבודות
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

  // פונקציה לטיפול במחיקת עבודה
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

  // פונקציה לטיפול בשמירת עבודה נערכה
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

  // פונקציה לטיפול בשליחת הודעה
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

  // פונקציה להצגת Snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // הגדרת עבודות פעילות ועבודות היסטוריות
  const activeJobs = useMemo(
    () => jobs.filter((job) => !job.isCompleted),
    [jobs]
  );

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.isCompleted),
    [jobs]
  );

  // פונקציה לטיפול בסגירת Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container   maxWidth={false} // מבטל את הגבלת הרוחב
  disableGutters // מבטל את ה-padding המובנה של ה-Container
  sx={{ 
    width: '100%', 
    minHeight: '100vh', 
    padding: 0, 
    margin: 0 
  }}>
      {/* ה-AppBar יוצג רק אם אין עבודה שנבחרה או שהמסך אינו נייד */}
      {(!selectedJob || !isMobile) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mt-1 h-16 space-x-4 rtl:space-x-reverse">
              {/* <div className="flex items-center space-x-4 rtl:space-x-reverse justify-between"> */}
                <TabButton 
                  active={activeTab === 0} 
                  onClick={() => setActiveTab(0)}
                >
                  עבודות פעילות
                </TabButton>
                <TabButton 
                  active={activeTab === 1} 
                  onClick={() => setActiveTab(1)}
                >
                  היסטוריה
                </TabButton>
              {/* </div> */}
              {/* <button
                onClick={fetchEmployerJobs}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button> */}
            </div>
          </div>
        </div>
      )}

      <Paper>
        {loading || authLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        ) : (
          // אם עבודה נבחרה ותצוגת נייד, הצג את פרטי העבודה
          selectedJob && isMobile ? (
            <JobDetails
              job={selectedJob}
              jobs={jobs}
              setJobs={setJobs}
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
              setJobApplicants={setJobApplicants}
              goBack={() => setSelectedJob(null)} // פונקציה לחזרה לרשימת העבודות
              fetchEmployerJobs={fetchEmployerJobs} // העברת הפונקציה כפרופ אם נדרש
            />
          ) : (
            // אחרת, הצג את רשימת העבודות
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
              onSelectJob={(job) => setSelectedJob(job)} // פונקציה לבחירת עבודה
            />
          )
        )}
      </Paper>
      
      {/* שאר הדיאלוגים */}
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
        jobTitle={jobs.find((job) => job.id === selectedApplicant?.jobId)?.title || 'job not found'}
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

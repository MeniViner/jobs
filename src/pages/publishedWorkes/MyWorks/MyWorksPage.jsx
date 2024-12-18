import React, { useState, useCallback } from 'react';
import {
  Container, Paper, Box, CircularProgress, Snackbar, useMediaQuery
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  deleteDoc, doc, updateDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import TabButton from './components/TabButton';
import JobList from './components/JobList';
import JobDetails from './JobDetails';
import Dialogs from './components/Dialogs';
import JobsManager from './components/JobsManager';

export default function MyWorksPage() {
  const { user, loading: authLoading } = useAuth();
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await deleteDoc(doc(db, 'jobs', jobToDelete.id));
      showSnackbar('העבודה נמחקה בהצלחה', 'success');
    } catch (error) {
      console.error('Error deleting job:', error);
      showSnackbar('אירעה שגיאה בעת מחיקת העבודה', 'error');
    } finally {
      setOpenDeleteDialog(false);
      setJobToDelete(null);
    }
  };

  const handleSaveEditedJob = async (editedJob) => {
    try {
      const jobRef = doc(db, 'jobs', editedJob.id);
      await updateDoc(jobRef, editedJob);
      showSnackbar('פרטי העבודה עודכנו בהצלחה', 'success');
    } catch (error) {
      console.error('Error updating job:', error);
      showSnackbar('אירעה שגיאה בעת עדכון פרטי העבודה', 'error');
    } finally {
      setOpenEditDialog(false);
      setJobToEdit(null);
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
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('אירעה שגיאה בשליחת ההודעה', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleJobsLoaded = useCallback((loadedJobs, loadedApplicants) => {
    // This function can be used to perform any actions needed when jobs are loaded
    console.log('Jobs loaded:', loadedJobs.length);
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <JobsManager onJobsLoaded={handleJobsLoaded} onError={handleError}>
      {({ jobs, setJobs, jobApplicants, setJobApplicants, loading, activeJobs, completedJobs, fetchEmployerJobs }) => (
        <Container maxWidth={false} disableGutters sx={{ width: '100%', minHeight: '100vh', padding: 0, margin: 0 }}>
          {(!selectedJob || !isMobile) && (
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mt-1 h-16 space-x-4 rtl:space-x-reverse">
                  <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)}>
                    עבודות פעילות
                  </TabButton>
                  <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>
                    היסטוריה
                  </TabButton>
                  <button
                    onClick={fetchEmployerJobs}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
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
                  goBack={() => setSelectedJob(null)}
                  fetchEmployerJobs={fetchEmployerJobs}
                />
              ) : (
                <JobList 
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
                  onSelectJob={(job) => setSelectedJob(job)}
                />
              )
            )}
          </Paper>
          
          <Dialogs
            openDeleteDialog={openDeleteDialog}
            setOpenDeleteDialog={setOpenDeleteDialog}
            handleDeleteJob={handleDeleteJob}
            openEditDialog={openEditDialog}
            setOpenEditDialog={setOpenEditDialog}
            jobToEdit={jobToEdit}
            handleSaveEditedJob={handleSaveEditedJob}
            openChatDialog={openChatDialog}
            setOpenChatDialog={setOpenChatDialog}
            selectedApplicant={selectedApplicant}
            jobs={jobs}
            handleSendMessage={handleSendMessage}
            openRatingDialog={openRatingDialog}
            setOpenRatingDialog={setOpenRatingDialog}
            jobToRate={jobToRate}
            fetchEmployerJobs={fetchEmployerJobs}
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
      )}
    </JobsManager>
  );
}


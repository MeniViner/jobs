import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, MapPin, Clock, MessageCircle, Trash2, ChevronDown, ChevronUp, Users, DollarSign, Car, User 
} from 'lucide-react'
import { 
  collection, doc, getDocs, deleteDoc, getDoc, addDoc, query, where, serverTimestamp 
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button 
} from '@mui/material'
import 'tailwindcss/tailwind.css'
import NoNotificationsImage from '../images/completed.svg';


export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState([])
  const [acceptedApplications, setAcceptedApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedApplication, setExpandedApplication] = useState(null)
  const [activeTab, setActiveTab] = useState('waiting')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState(null)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    fetchApplications()
  }, [authLoading, user, navigate])

  // const fetchApplications = async () => {
  //   setLoading(true)
  //   try {
  //     const jobsCollection = collection(db, 'jobs')
  //     const jobsSnapshot = await getDocs(jobsCollection)
  //     const jobsData = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  //     const applicationsPromises = jobsData.map(async (job) => {
  //       const applicantRef = doc(db, 'jobs', job.id, 'applicants', user.uid)
  //       const applicantSnap = await getDoc(applicantRef)
  //       if (applicantSnap.exists()) {
  //         const applicationData = applicantSnap.data()
  //         const applicantsCollection = collection(db, 'jobs', job.id, 'applicants')
  //         const applicantsSnapshot = await getDocs(applicantsCollection)
  //         return {
  //           jobId: job.id,
  //           ...job,
  //           appliedAt: applicationData.timestamp,
  //           status: applicationData.hired ? 'התקבלת' : 'ממתין',
  //           applicationCount: applicantsSnapshot.size,
  //         }
  //       }
  //       return null
  //     })
  //     const applicationsData = await Promise.all(applicationsPromises)
  //     const filteredApplications = applicationsData.filter((app) => app !== null)
  //     setApplications(filteredApplications.filter((app) => app.status !== 'התקבלת'))
  //     setAcceptedApplications(filteredApplications.filter((app) => app.status === 'התקבלת'))
  //   } catch (error) {
  //     console.error('Error fetching applications:', error)
  //     setSnackbar({ open: true, message: 'שגיאה בטעינת המועמדויות.', severity: 'error' })
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  // const fetchApplications = async () => {
  //   setLoading(true);
  //   try {
  //     const jobsCollection = collection(db, 'jobs');
  //     const jobsSnapshot = await getDocs(jobsCollection);
  //     const jobsData = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //     const applicationsPromises = jobsData.map(async (job) => {
  //       const applicantRef = doc(db, 'jobs', job.id, 'applicants', user.uid);
  //       const applicantSnap = await getDoc(applicantRef);
  //       if (applicantSnap.exists()) {
  //         const applicationData = applicantSnap.data();
  //         const jobCompleted = job.isCompleted; // בדיקת אם העבודה הושלמה
  
  //         const status = jobCompleted
  //           ? (applicationData.hired ? 'התקבלת' : 'לא התקבל')
  //           : 'ממתין';
  
  //         const applicantsCollection = collection(db, 'jobs', job.id, 'applicants');
  //         const applicantsSnapshot = await getDocs(applicantsCollection);
  //         console.log('Filtered Applications:', filteredApplications);
  
  //         return {
  //           jobId: job.id,
  //           ...job,
  //           appliedAt: applicationData.timestamp,
  //           status,
  //           applicationCount: applicantsSnapshot.size,
  //         };
  //       }
  //       return null;
  //     });
  
  //     const applicationsData = await Promise.all(applicationsPromises);
  //     const filteredApplications = applicationsData.filter((app) => app !== null);
  
  //     // עדכון הרשימות בהתאם לסטטוס
  //     setApplications(filteredApplications.filter((app) => app.status === 'ממתין'));
  //     setAcceptedApplications(filteredApplications.filter((app) => app.status === 'התקבלת'));
  //     console.log('Job completed:', job.isCompleted, 'Hired:', applicationData.hired);
  //   } catch (error) {
  //     console.error('Error fetching applications:', error);
  //     setSnackbar({ open: true, message: 'שגיאה בטעינת המועמדויות.', severity: 'error' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // const fetchApplications = async () => {
  //   setLoading(true);
  //   try {
  //     const jobsCollection = collection(db, 'jobs');
  //     const jobsSnapshot = await getDocs(jobsCollection);
  //     const jobsData = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
  //     const applicationsPromises = jobsData.map(async (job) => {
  //       const applicantRef = doc(db, 'jobs', job.id, 'applicants', user.uid);
  //       const applicantSnap = await getDoc(applicantRef);
  
  //       if (applicantSnap.exists()) {
  //         const applicationData = applicantSnap.data();
  //         const jobCompleted = job.isCompleted; // Check if job is marked as completed
  
  //         // Determine the status based on whether the job is complete or not
  //         const status = jobCompleted
  //           ? (applicationData.hired ? 'לא התקבל' : 'ממתין') // Completed jobs won't appear as "התקבלת"
  //           : (applicationData.hired ? 'התקבלת' : 'ממתין');  // Incomplete jobs can still show "התקבלת"
  
  //         const applicantsCollection = collection(db, 'jobs', job.id, 'applicants');
  //         const applicantsSnapshot = await getDocs(applicantsCollection);
  
  //         return {
  //           jobId: job.id,
  //           ...job,
  //           appliedAt: applicationData.timestamp,
  //           status,
  //           applicationCount: applicantsSnapshot.size,
  //         };
  //       }
  //       return null;
  //     });
  
  //     const applicationsData = await Promise.all(applicationsPromises);
  //     const filteredApplications = applicationsData.filter((app) => app !== null);
  
  //     // Update lists based on the new status logic
  //     setApplications(filteredApplications.filter((app) => app.status === 'ממתין'));
  //     setAcceptedApplications(filteredApplications.filter((app) => app.status === 'התקבלת'));
  
  //   } catch (error) {
  //     console.error('Error fetching applications:', error);
  //     setSnackbar({ open: true, message: 'שגיאה בטעינת המועמדויות.', severity: 'error' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsCollection);
      const jobsData = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      const applicationsPromises = jobsData.map(async (job) => {
        const applicantRef = doc(db, 'jobs', job.id, 'applicants', user.uid);
        const applicantSnap = await getDoc(applicantRef);
  
        if (applicantSnap.exists()) {
          const applicationData = applicantSnap.data();
  
          // Skip jobs that are marked as completed
          if (job.isCompleted) return null;
  
          const applicantsCollection = collection(db, 'jobs', job.id, 'applicants');
          const applicantsSnapshot = await getDocs(applicantsCollection);
  
          return {
            jobId: job.id,
            ...job,
            appliedAt: applicationData.timestamp,
            status: applicationData.hired ? 'התקבלת' : 'ממתין',
            applicationCount: applicantsSnapshot.size,
          };
        }
        return null;
      });
  
      const applicationsData = await Promise.all(applicationsPromises);
      const filteredApplications = applicationsData.filter((app) => app !== null);
  
      // Update state with filtered applications
      setApplications(filteredApplications.filter((app) => app.status !== 'התקבלת'));
      setAcceptedApplications(filteredApplications.filter((app) => app.status === 'התקבלת'));
  
    } catch (error) {
      console.error('Error fetching applications:', error);
      setSnackbar({ open: true, message: 'שגיאה בטעינת המועמדויות.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteApplication = async (jobId) => {
    setApplicationToDelete({ jobId })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (applicationToDelete) {
      try {
        await deleteDoc(doc(db, 'jobs', applicationToDelete.jobId, 'applicants', user.uid))
        setApplications(applications.filter((app) => app.jobId !== applicationToDelete.jobId))
        setSnackbar({ open: true, message: 'המועמדות נמחקה בהצלחה.', severity: 'success' })
        setDeleteDialogOpen(false)
        setApplicationToDelete(null)
      } catch (error) {
        console.error('Error deleting application:', error)
        setSnackbar({ open: true, message: 'שגיאה במחיקת המועמדות.', severity: 'error' })
      }
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedJob) return

    try {
      const chatQuery = query(
        collection(db, 'jobChats'),
        where('jobId', '==', selectedJob.jobId),
        where('applicantId', '==', user.uid)
      )
      const chatSnapshot = await getDocs(chatQuery)

      let chatId
      if (chatSnapshot.empty) {
        const newChat = {
          jobId: selectedJob.jobId,
          jobTitle: selectedJob.title,
          applicantId: user.uid,
          applicantName: user.displayName || 'Anonymous',
          employerId: selectedJob.employerId,
          employerName: selectedJob.companyName || 'Anonymous',
          createdAt: serverTimestamp(),
        }
        const chatRef = await addDoc(collection(db, 'jobChats'), newChat)
        chatId = chatRef.id
      } else {
        chatId = chatSnapshot.docs[0].id
      }

      await addDoc(collection(db, 'jobChats', chatId, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      })

      setChatDialogOpen(false)
      setNewMessage('')
      alert('הודעתך נשלחה למעסיק.')
      navigate(`/job-chat`)
    } catch (error) {
      console.error('Error starting chat:', error)
      setSnackbar({ open: true, message: 'שגיאה בשליחת ההודעה.', severity: 'error' })
    }
  }

  const styles = {
    container: 'min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6',
    header: 'text-4xl font-bold text-center text-indigo-900 mb-8',
    tabMenu: 'flex justify-center space-x-4 mb-6',
    tabButton: (active) =>
      `px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
        active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 hover:bg-indigo-100'
      }`,
    applicationGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
    applicationCard: 'bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl',
    statusBar: (status) => `p-4 flex justify-between items-center ${status === 'התקבלת' ? 'bg-green-100' : 'bg-blue-100'}`,
    statusText: (status) => `font-semibold ${status === 'התקבלת' ? 'text-green-600' : 'text-blue-600'}`,
    applicationInfo: 'text-sm flex items-center',
    cardHeader: 'p-6 border-b border-indigo-100',
    jobTitle: 'text-2xl font-bold text-indigo-900 mb-2',
    companyName: 'text-indigo-600 flex items-center mb-4',
    tagsContainer: 'flex flex-wrap gap-2 mb-4',
    tag: 'bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium flex items-center',
    cardBody: 'p-6 flex-1',
    description: 'text-gray-600 mb-4',
    jobDetails: 'flex justify-between mb-4',
    jobDetailItem: 'flex items-center bg-gray-100 px-3 py-1 rounded-full',
    expandButton: 'text-indigo-600 font-semibold flex items-center hover:underline',
    cardFooter: 'p-6 border-t border-indigo-100 flex items-center justify-between',
    actionButton: 'flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-300',
    deleteButton: 'text-red-400 hover:text-red-600 transition-colors duration-300',
    snackbar: 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
  }

  const renderApplications = (applicationsList) => (
    <div className={styles.applicationGrid}>
      <AnimatePresence>
        {applicationsList.length > 0 ? (
          applicationsList.map((job) => (
            <motion.div
              key={job.jobId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={styles.applicationCard}
            >
              <div className={styles.statusBar(job.status)}>
                <span className={styles.statusText(job.status)}>
                  {job.status}
                </span>
                <div className={styles.applicationInfo}>
                  <div className="flex items-center mr-4">
                    <Users size={14} className="mr-1" />
                    <span>{job.applicationCount || 'N/A'} הגשות</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{job.appliedAt ? new Date(job.appliedAt.toDate()).toLocaleString('he-IL') : 'לא זמין'}</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardHeader}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <button
                    onClick={() => handleDeleteApplication(job.jobId)}
                    className={styles.deleteButton}
                    aria-label="מחק מועמדות"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className={styles.companyName}>
                  <Briefcase size={16} className="mr-2" />
                  {job.companyName || 'שם החברה לא זמין'}
                </div>
                <div className={styles.tagsContainer}>
                  <span className={styles.tag}>
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                  </span>
                  <span className={`${styles.tag} bg-green-100 text-green-600`}>
                    <Clock size={14} className="mr-1" />
                    {job.type}
                  </span>
                  {job.experience && (
                    <span className={`${styles.tag} bg-red-100 text-red-600`}>
                      ניסיון: {job.experience}
                    </span>
                  )}
                  {job.jobType && (
                    <span className={`${styles.tag} bg-yellow-100 text-yellow-600`}>
                      סוג עבודה: {job.jobType}
                    </span>
                  )}
                  {job.requiresCar && (
                    <span className={`${styles.tag} bg-orange-100 text-orange-600`}>
                      <Car size={14} className="mr-1" />
                      דרוש רכב
                    </span>
                  )}
                </div>
                <p className={styles.description}>{job.description}</p>
                <div className={styles.jobDetails}>
                  <div className={styles.jobDetailItem}>
                    <DollarSign size={14} className="mr-1" />
                    <span>₪{job.salary} לשעה</span>
                  </div>
                  <div className={styles.jobDetailItem}>
                    <Users size={14} className="mr-1" />
                    <span>{job.workersNeeded || 1} עובדים</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardBody}>
                <button
                  onClick={() => setExpandedApplication(expandedApplication === job.jobId ? null : job.jobId)}
                  className={styles.expandButton}
                >
                  {expandedApplication === job.jobId ? 'הסתר פרטים' : 'הצג פרטים'}
                  {expandedApplication === job.jobId ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedApplication === job.jobId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="font-bold mb-2">שעות עבודה:</p>
                          {job.isFlexibleTime ? (
                            <p>שעות גמישות</p>
                          ) : Array.isArray(job.workHours) ? (
                            job.workHours.map((time, index) => (
                              <p key={index}>{time}</p>
                            ))
                          ) : (
                            <p>{job.startTime} - {job.endTime}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-bold mb-2">תאריכי עבודה:</p>
                          {job.isFlexibleDates ? (
                            <p>תאריכים גמישים</p>
                          ) : Array.isArray(job.workDates) ? (
                            job.workDates.map((date, index) => (
                              <p key={index}>{date}</p>
                            ))
                          ) : (
                            <p>{job.workDates}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {job.fullDescription || 'תיאור מלא של המשרה לא זמין  כרגע.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={styles.cardFooter}>
                <button
                  onClick={() => {
                    setSelectedJob(job)
                    setChatDialogOpen(true)
                  }}
                  className={styles.actionButton}
                  aria-label="שלח הודעה למעסיק"
                >
                  <MessageCircle size={20} className="mr-2" />
                  שלח הודעה
                </button>
                <Link
                  to={`/user/${job.employerId}`}
                  className={styles.actionButton}
                  aria-label="צפייה בפרטי מעסיק"
                >
                  <User size={20} className="mr-2" />
                  צפייה בפרטי מעסיק
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center p-8">
            <img src={NoNotificationsImage} alt="No applications" className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">אין מועמדויות</h3>
            <p className="text-gray-600">לא נמצאו מועמדויות בקטגוריה זו.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )

  if (loading) {
    return (
      <div className="my-applications-page">
        <div className={`${styles.container} flex items-center justify-center`}>
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-indigo-200 h-32 w-32 animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-applications-page">
      <div className={styles.container}>
        <h1 className={styles.header}>המועמדויות שלי</h1>
        <div className={styles.tabMenu}>
          <button
            onClick={() => setActiveTab('waiting')}
            className={styles.tabButton(activeTab === 'waiting')}
          >
            ממתין לתשובה
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={styles.tabButton(activeTab === 'accepted')}
          >
            התקבלתי
          </button>
        </div>
        {activeTab === 'accepted'
          ? renderApplications(acceptedApplications)
          : renderApplications(applications)}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          className={styles.snackbar}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">אישור מחיקת מועמדות</DialogTitle>
          <DialogContent>
            האם אתה בטוח שברצונך למחוק את המועמדות?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              ביטול
            </Button>
            <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
              אישור
            </Button>
          </DialogActions>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog
          open={chatDialogOpen}
          onClose={() => setChatDialogOpen(false)}
          aria-labelledby="chat-dialog-title"
        >
          <DialogTitle id="chat-dialog-title">שלח הודעה למעסיק</DialogTitle>
          <DialogContent>
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
            <Button onClick={() => setChatDialogOpen(false)} color="primary">
              ביטול
            </Button>
            <Button onClick={handleSendMessage} color="primary">
              שלח
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <style jsx>{`
        .my-applications-page {
          /* Add any global styles for this page here */
        }
        .my-applications-page .MuiSnackbar-root {
          z-index: 9999;
        }
      `}</style>
    </div>
  )
}








// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Bookmark,
//   Briefcase,
//   MapPin,
//   Clock,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle,
//   Calendar,
//   Users,
//   Building2,
//   Trash2,
//   MessageCircle,
//   User,
//   Car,
// } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   collection,
//   doc,
//   getDocs,
//   deleteDoc,
//   getDoc,
//   addDoc,
//   query,
//   where,
//   serverTimestamp,
// } from 'firebase/firestore';
// import { db } from '../services/firebase';
// import { useAuth } from '../contexts/AuthContext';
// import {
//   Snackbar,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
// } from '@mui/material';
// import NoNotificationsImage from '../images/completed.svg';
// import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// import styles from './mainJobs/JobListPageStyles';

// export default function MyApplicationsPage() {
//   const { user, loading: authLoading } = useAuth();
//   const [applications, setApplications] = useState([]);
//   const [acceptedApplications, setAcceptedApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedApplication, setExpandedApplication] = useState(null);
//   const [activeTab, setActiveTab] = useState('waiting');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [applicationToDelete, setApplicationToDelete] = useState(null);
//   const [chatDialogOpen, setChatDialogOpen] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [newMessage, setNewMessage] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (authLoading) return;
//     if (!user) {
//       navigate('/login');
//       return;
//     }
//     fetchApplications();
//   }, [authLoading, user, navigate]);

//   const fetchApplications = async () => {
//     setLoading(true);
//     try {
//       const jobsCollection = collection(db, 'jobs');
//       const jobsSnapshot = await getDocs(jobsCollection);
//       const jobsData = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//       const applicationsPromises = jobsData.map(async (job) => {
//         const applicantRef = doc(db, 'jobs', job.id, 'applicants', user.uid);
//         const applicantSnap = await getDoc(applicantRef);

//         if (applicantSnap.exists()) {
//           const applicationData = applicantSnap.data();

//           // דילוג על משרות שהושלמו
//           if (job.isCompleted) return null;

//           const applicantsCollection = collection(db, 'jobs', job.id, 'applicants');
//           const applicantsSnapshot = await getDocs(applicantsCollection);

//           return {
//             jobId: job.id,
//             ...job,
//             appliedAt: applicationData.timestamp,
//             status: applicationData.hired ? 'התקבלת' : 'ממתין',
//             applicationCount: applicantsSnapshot.size,
//           };
//         }
//         return null;
//       });

//       const applicationsData = await Promise.all(applicationsPromises);
//       const filteredApplications = applicationsData.filter((app) => app !== null);

//       // עדכון הסטטוס של המועמדויות
//       setApplications(filteredApplications.filter((app) => app.status !== 'התקבלת'));
//       setAcceptedApplications(filteredApplications.filter((app) => app.status === 'התקבלת'));
//     } catch (error) {
//       console.error('Error fetching applications:', error);
//       setSnackbar({ open: true, message: 'שגיאה בטעינת המועמדויות.', severity: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteApplication = async (jobId) => {
//     setApplicationToDelete({ jobId });
//     setDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (applicationToDelete) {
//       try {
//         await deleteDoc(doc(db, 'jobs', applicationToDelete.jobId, 'applicants', user.uid));
//         setApplications(applications.filter((app) => app.jobId !== applicationToDelete.jobId));
//         setSnackbar({ open: true, message: 'המועמדות נמחקה בהצלחה.', severity: 'success' });
//         setDeleteDialogOpen(false);
//         setApplicationToDelete(null);
//       } catch (error) {
//         console.error('Error deleting application:', error);
//         setSnackbar({ open: true, message: 'שגיאה במחיקת המועמדות.', severity: 'error' });
//       }
//     }
//   };

//   const handleSendMessage = async () => {
//     if (newMessage.trim() === '' || !selectedJob) return;

//     try {
//       const chatQuery = query(
//         collection(db, 'jobChats'),
//         where('jobId', '==', selectedJob.jobId),
//         where('applicantId', '==', user.uid)
//       );
//       const chatSnapshot = await getDocs(chatQuery);

//       let chatId;
//       if (chatSnapshot.empty) {
//         const newChat = {
//           jobId: selectedJob.jobId,
//           jobTitle: selectedJob.title,
//           applicantId: user.uid,
//           applicantName: user.displayName || 'Anonymous',
//           employerId: selectedJob.employerId,
//           employerName: selectedJob.companyName || 'Anonymous',
//           createdAt: serverTimestamp(),
//         };
//         const chatRef = await addDoc(collection(db, 'jobChats'), newChat);
//         chatId = chatRef.id;
//       } else {
//         chatId = chatSnapshot.docs[0].id;
//       }

//       await addDoc(collection(db, 'jobChats', chatId, 'messages'), {
//         text: newMessage,
//         senderId: user.uid,
//         senderName: user.displayName || 'Anonymous',
//         timestamp: serverTimestamp(),
//       });

//       setChatDialogOpen(false);
//       setNewMessage('');
//       alert('הודעתך נשלחה למעסיק.');
//       navigate(`/job-chat`);
//     } catch (error) {
//       console.error('Error starting chat:', error);
//       setSnackbar({ open: true, message: 'שגיאה בשליחת ההודעה.', severity: 'error' });
//     }
//   };

//   const getTagStyle = (type) => {
//     const baseStyle = { ...styles.tag };
//     switch (type) {
//       case 'location':
//         return { ...baseStyle, background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' };
//       case 'type':
//         return {
//           ...baseStyle,
//           background: 'rgba(16, 185, 129, 0.08)',
//           color: '#059669',
//           border: '1px solid rgba(16, 185, 129, 0.12)',
//         };
//       case 'experience':
//         return {
//           ...baseStyle,
//           background: 'rgba(239, 68, 68, 0.08)',
//           color: '#DC2626',
//           border: '1px solid rgba(239, 68, 68, 0.12)',
//         };
//       case 'jobType':
//         return {
//           ...baseStyle,
//           background: 'rgba(245, 158, 11, 0.08)',
//           color: '#D97706',
//           border: '1px solid rgba(245, 158, 11, 0.12)',
//         };
//       case 'car':
//         return {
//           ...baseStyle,
//           background: 'rgba(217, 119, 6, 0.08)',
//           color: '#B45309',
//           border: '1px solid rgba(217, 119, 6, 0.12)',
//         };
//       case 'flexible':
//         return {
//           ...baseStyle,
//           background: 'rgba(16, 185, 129, 0.08)',
//           color: '#059669',
//           border: '1px solid rgba(16, 185, 129, 0.12)',
//         };
//       case 'accepted':
//         return {
//           ...baseStyle,
//           background: 'rgba(16, 185, 129, 0.08)',
//           color: '#059669',
//           border: '1px solid rgba(16, 185, 129, 0.12)',
//         };
//       default:
//         return baseStyle;
//     }
//   };

//   const renderApplications = (applicationsList) => (
//     <div style={styles.jobGrid}>
//       <AnimatePresence>
//         {applicationsList.length > 0 ? (
//           applicationsList.map((job) => (
//             <motion.div
//               key={job.jobId}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
//               style={styles.jobCard}
//             >
//               {/* סטטוס המועמדות ותאריך ההגשה */}
//               <div
//                 style={{
//                   padding: '16px 24px',
//                   borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
//                   background:
//                     job.status === 'התקבלת'
//                       ? 'rgba(16, 185, 129, 0.08)'
//                       : 'rgba(59, 130, 246, 0.08)',
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                 }}
//               >
//                 <span
//                   style={{
//                     fontWeight: '600',
//                     color: job.status === 'התקבלת' ? '#059669' : '#3B82F6',
//                     display: 'flex',
//                     alignItems: 'center',
//                   }}
//                 >
//                   {job.status === 'התקבלת' ? (
//                     <CheckCircle size={18} style={{ marginLeft: '8px' }} />
//                   ) : null}
//                   {job.status}
//                 </span>
//                 <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}>
//                   <Clock size={16} style={{ marginLeft: '8px' }} />
//                   <span>
//                     הוגש בתאריך:{' '}
//                     {job.appliedAt
//                       ? new Date(job.appliedAt.toDate()).toLocaleDateString('he-IL')
//                       : 'לא זמין'}
//                   </span>
//                 </div>
//               </div>

//               <div style={styles.jobHeader}>
//                 <div
//                   style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'flex-start',
//                   }}
//                 >
//                   <h2 style={styles.jobTitle}>{job.title}</h2>
//                   <button
//                     onClick={() => handleDeleteApplication(job.jobId)}
//                     style={styles.bookmarkButton}
//                     aria-label="מחק מועמדות"
//                   >
//                     <Trash2 size={18} color="#DC2626" />
//                   </button>
//                 </div>

//                 <p style={styles.jobCompany}>
//                   <Briefcase size={16} style={{ marginLeft: '8px', color: '#3B82F6' }} />
//                   {job.companyName || 'שם החברה לא זמין'}
//                 </p>

//                 <div style={styles.jobTags}>
//                   <span style={getTagStyle('location')}>
//                     <MapPin size={14} />
//                     {job.location}
//                   </span>
//                   <span style={getTagStyle('type')}>
//                     <Clock size={14} />
//                     {job.type}
//                   </span>
//                   {job.experience && (
//                     <span style={getTagStyle('experience')}>ניסיון: {job.experience}</span>
//                   )}
//                   {job.jobType && (
//                     <span style={getTagStyle('jobType')}>סוג עבודה: {job.jobType}</span>
//                   )}
//                   {job.requiresCar && (
//                     <span style={getTagStyle('car')}>
//                       <DirectionsCarIcon style={{ fontSize: '16px' }} />
//                       דרוש רכב
//                     </span>
//                   )}
//                   {job.isFlexibleTime && (
//                     <span style={getTagStyle('flexible')}>
//                       <Clock size={14} />
//                       שעות גמישות
//                     </span>
//                   )}
//                   {job.isFlexibleDates && (
//                     <span style={getTagStyle('flexible')}>
//                       <Calendar size={14} />
//                       תאריכים גמישים
//                     </span>
//                   )}
//                   {job.status === 'התקבלת' && (
//                     <span style={getTagStyle('accepted')}>
//                       <CheckCircle size={14} />
//                       התקבלתי
//                     </span>
//                   )}
//                 </div>

//                 <p style={styles.jobDescription}>{job.description}</p>

//                 <div style={styles.jobDetails}>
//                   <div style={styles.jobDetailItem}>
//                     <span style={{ color: '#3B82F6' }}>₪</span>
//                     <span>{job.salary} לשעה</span>
//                   </div>
//                   <div style={styles.jobDetailItem}>
//                     <Users size={16} style={{ color: '#3B82F6' }} />
//                     <span>{job.workersNeeded || 1} עובדים</span>
//                   </div>
//                   <div style={styles.jobDetailItem}>
//                     <Users size={16} style={{ color: '#3B82F6' }} />
//                     <span>{job.applicationCount || 0} הגשות</span>
//                   </div>
//                 </div>
//               </div>

//               <AnimatePresence>
//                 {expandedApplication === job.jobId && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     style={{
//                       padding: '20px 24px',
//                       borderTop: '1px solid rgba(0, 0, 0, 0.06)',
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         marginBottom: '1.5rem',
//                       }}
//                     >
//                       <div>
//                         <p
//                           style={{
//                             fontWeight: '600',
//                             marginBottom: '0.75rem',
//                             color: '#111827',
//                             fontSize: '0.9375rem',
//                           }}
//                         >
//                           שעות עבודה:
//                         </p>
//                         {job.isFlexibleTime ? (
//                           <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>שעות גמישות</p>
//                         ) : Array.isArray(job.workHours) ? (
//                           job.workHours.map((time, index) => (
//                             <p
//                               key={index}
//                               style={{
//                                 fontSize: '0.875rem',
//                                 color: '#6B7280',
//                                 marginBottom: '0.25rem',
//                               }}
//                             >
//                               {time}
//                             </p>
//                           ))
//                         ) : (
//                           <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
//                             {job.startTime} - {job.endTime}
//                           </p>
//                         )}
//                       </div>
//                       <div>
//                         <p
//                           style={{
//                             fontWeight: '600',
//                             marginBottom: '0.75rem',
//                             color: '#111827',
//                             fontSize: '0.9375rem',
//                           }}
//                         >
//                           תאריכי עבודה:
//                         </p>
//                         {job.isFlexibleDates ? (
//                           <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>תאריכים גמישים</p>
//                         ) : Array.isArray(job.workDates) ? (
//                           job.workDates.map((date, index) => (
//                             <p
//                               key={index}
//                               style={{
//                                 fontSize: '0.875rem',
//                                 color: '#6B7280',
//                                 marginBottom: '0.25rem',
//                               }}
//                             >
//                               {date}
//                             </p>
//                           ))
//                         ) : (
//                           <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>{job.workDates}</p>
//                         )}
//                       </div>
//                     </div>
//                     <p
//                       style={{
//                         fontSize: '0.875rem',
//                         color: '#6B7280',
//                         lineHeight: '1.6',
//                         background: 'rgba(59, 130, 246, 0.04)',
//                         padding: '16px',
//                         borderRadius: '12px',
//                         border: '1px solid rgba(59, 130, 246, 0.08)',
//                       }}
//                     >
//                       {job.fullDescription ||
//                         'תיאור מלא של המשרה לא זמין כרגע. אנא צור קשר עם המעסיק לקבלת מידע נוסף.'}
//                     </p>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <div style={styles.jobFooter}>
//                 <Link to={`/user/${job.employerId}`} style={styles.employerLink}>
//                   {/* <span style={styles.employerIcon}>
//                     <Building2 size={16} color="#3B82F6" />
//                   </span> */}
//                   פרטי מעסיק
//                 </Link>

//                 <button
//                   style={styles.expandButton}
//                   onClick={() =>
//                     setExpandedApplication(
//                       expandedApplication === job.jobId ? null : job.jobId
//                     )
//                   }
//                   aria-expanded={expandedApplication === job.jobId}
//                   aria-controls={`job-details-${job.jobId}`}
//                 >
//                   {expandedApplication === job.jobId ? (
//                     <>
//                       <span>הסתר פרטים</span>
//                       <ChevronUp size={16} />
//                     </>
//                   ) : (
//                     <>
//                       <span>הצג פרטים</span>
//                       <ChevronDown size={16} />
//                     </>
//                   )}
//                 </button>

//                 <button
//                   style={{
//                     ...styles.applyButton,
//                     background:
//                       job.status === 'התקבלת'
//                         ? '#4CAF50'
//                         : 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
//                     opacity: job.status === 'התקבלת' ? 0.6 : 1,
//                     cursor: job.status === 'התקבלת' ? 'not-allowed' : 'pointer',
//                   }}
//                   onClick={() => {
//                     if (job.status !== 'התקבלת') {
//                       setSelectedJob(job);
//                       setChatDialogOpen(true);
//                     }
//                   }}
//                   disabled={job.status === 'התקבלת'}
//                 >
//                   {job.status === 'התקבלת' ? 'התקבלת למשרה' : 'שלח הודעה'}
//                 </button>
//               </div>
//             </motion.div>
//           ))
//         ) : (
//           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
//             <img src={NoNotificationsImage} alt="No applications" style={{ marginBottom: '16px' }} />
//             <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
//               אין מועמדויות
//             </h3>
//             <p style={{ color: '#6B7280' }}>לא נמצאו מועמדויות בקטגוריה זו.</p>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div style={styles.container}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <div
//             style={{
//               borderTop: '8px solid #3B82F6',
//               borderRadius: '50%',
//               width: '80px',
//               height: '80px',
//               animation: 'spin 1s linear infinite',
//             }}
//           ></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div style={styles.container}>
//         <h1
//           style={{
//             fontSize: '2rem',
//             fontWeight: '600',
//             textAlign: 'center',
//             color: '#111827',
//             marginBottom: '32px',
//           }}
//         >
//           המועמדויות שלי
//         </h1>
//         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
//           <button
//             onClick={() => setActiveTab('waiting')}
//             style={{
//               padding: '12px 24px',
//               borderRadius: '9999px',
//               fontWeight: '500',
//               margin: '0 8px',
//               background: activeTab === 'waiting' ? '#3B82F6' : '#FFFFFF',
//               color: activeTab === 'waiting' ? '#FFFFFF' : '#3B82F6',
//               border: '1px solid #3B82F6',
//               cursor: 'pointer',
//               transition: 'background 0.3s, color 0.3s',
//             }}
//           >
//             ממתין לתשובה
//           </button>
//           <button
//             onClick={() => setActiveTab('accepted')}
//             style={{
//               padding: '12px 24px',
//               borderRadius: '9999px',
//               fontWeight: '500',
//               margin: '0 8px',
//               background: activeTab === 'accepted' ? '#3B82F6' : '#FFFFFF',
//               color: activeTab === 'accepted' ? '#FFFFFF' : '#3B82F6',
//               border: '1px solid #3B82F6',
//               cursor: 'pointer',
//               transition: 'background 0.3s, color 0.3s',
//             }}
//           >
//             התקבלתי
//           </button>
//         </div>
//         {activeTab === 'accepted'
//           ? renderApplications(acceptedApplications)
//           : renderApplications(applications)}
//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={6000}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//         >
//           <Alert
//             onClose={() => setSnackbar({ ...snackbar, open: false })}
//             severity={snackbar.severity}
//             sx={{ width: '100%' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>

//         {/* דיאלוג למחיקת מועמדות */}
//         <Dialog
//           open={deleteDialogOpen}
//           onClose={() => setDeleteDialogOpen(false)}
//           aria-labelledby="delete-dialog-title"
//         >
//           <DialogTitle id="delete-dialog-title">אישור מחיקת מועמדות</DialogTitle>
//           <DialogContent>האם אתה בטוח שברצונך למחוק את המועמדות?</DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
//               ביטול
//             </Button>
//             <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
//               אישור
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* דיאלוג לשליחת הודעה */}
//         <Dialog
//           open={chatDialogOpen}
//           onClose={() => setChatDialogOpen(false)}
//           aria-labelledby="chat-dialog-title"
//         >
//           <DialogTitle id="chat-dialog-title">שלח הודעה למעסיק</DialogTitle>
//           <DialogContent>
//             <TextField
//               autoFocus
//               margin="dense"
//               id="message"
//               label="הודעה"
//               type="text"
//               fullWidth
//               variant="outlined"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               multiline
//               rows={4}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChatDialogOpen(false)} color="primary">
//               ביטול
//             </Button>
//             <Button onClick={handleSendMessage} color="primary">
//               שלח
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </div>
//     </div>
//   );
// }


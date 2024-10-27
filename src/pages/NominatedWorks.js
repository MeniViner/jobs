'use client'

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
          const jobCompleted = job.isCompleted; // בדיקת אם העבודה הושלמה
  
          const status = jobCompleted
            ? (applicationData.hired ? 'התקבלת' : 'לא התקבל')
            : 'ממתין';
  
          const applicantsCollection = collection(db, 'jobs', job.id, 'applicants');
          const applicantsSnapshot = await getDocs(applicantsCollection);
  
          return {
            jobId: job.id,
            ...job,
            appliedAt: applicationData.timestamp,
            status,
            applicationCount: applicantsSnapshot.size,
          };
        }
        return null;
      });
  
      const applicationsData = await Promise.all(applicationsPromises);
      const filteredApplications = applicationsData.filter((app) => app !== null);
  
      // עדכון הרשימות בהתאם לסטטוס
      setApplications(filteredApplications.filter((app) => app.status === 'ממתין'));
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
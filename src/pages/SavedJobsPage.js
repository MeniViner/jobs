'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Bookmark, Users, Clock, Briefcase, ChevronDown, ChevronUp, CheckCircle, Calendar, Car
} from 'lucide-react'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, arrayRemove, serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material'
import NoNotificationsImage from '../images/completed.svg';


export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const [savedJobs, setSavedJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedJob, setExpandedJob] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    fetchSavedJobs()
    fetchAppliedJobs()
  }, [authLoading, user, navigate])

  const fetchSavedJobs = async () => {
    setLoading(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      const savedJobIds = userDoc.data().savedJobs || []

      const jobsPromises = savedJobIds.map(async (jobId) => {
        const jobRef = doc(db, 'jobs', jobId)
        const jobDoc = await getDoc(jobRef)
        if (jobDoc.exists()) {
          return { id: jobDoc.id, ...jobDoc.data() }
        }
        return null
      })

      const jobs = await Promise.all(jobsPromises)
      setSavedJobs(jobs.filter(job => job !== null))
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      setError('Failed to load saved jobs.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppliedJobs = async () => {
    try {
      const applicationsRef = collection(db, 'users', user.uid, 'applications')
      const applicationsSnapshot = await getDocs(applicationsRef)
      const appliedJobsList = applicationsSnapshot.docs.map((doc) => doc.id)
      setAppliedJobs(appliedJobsList)
    } catch (error) {
      console.error('Error fetching applied jobs:', error)
    }
  }

  const handleRemoveSavedJob = async (jobId) => {
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        savedJobs: arrayRemove(jobId)
      })
      setSavedJobs(savedJobs.filter(job => job.id !== jobId))
      setSnackbar({ open: true, message: 'המשרה הוסרה מהמשרות השמורות.', severity: 'success' })
    } catch (error) {
      console.error('Error removing saved job:', error)
      setSnackbar({ open: true, message: 'שגיאה בהסרת המשרה השמורה.', severity: 'error' })
    }
  }

  const handleApplyForJob = async (jobId) => {
    try {
      const applicantRef = doc(db, 'jobs', jobId, 'applicants', user.uid)
      const userApplicationsRef = doc(db, 'users', user.uid, 'applications', jobId)

      if (appliedJobs.includes(jobId)) {
        await deleteDoc(applicantRef)
        await deleteDoc(userApplicationsRef)
        setAppliedJobs(appliedJobs.filter((id) => id !== jobId))
        setSnackbar({ open: true, message: 'המועמדות בוטלה בהצלחה!', severity: 'info' })
      } else {
        await setDoc(applicantRef, {
          applicantId: user.uid,
          timestamp: serverTimestamp(),
        })
        await setDoc(userApplicationsRef, {
          jobId: jobId,
          timestamp: serverTimestamp(),
          status: 'applied',
        })
        setAppliedJobs([...appliedJobs, jobId])
        setSnackbar({ open: true, message: 'המועמדות הוגשה בהצלחה!', severity: 'success' })
      }
    } catch (error) {
      console.error('Error applying for job: ', error)
      setSnackbar({ open: true, message: 'אירעה שגיאה בהגשת המועמדות.', severity: 'error' })
    }
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)',
      padding: '32px 16px',
      fontFamily: 'Arial, sans-serif',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#102A43',
      textAlign: 'center',
      marginBottom: '2rem',
    },
    jobGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem',
    },
    jobCard: {
      background: '#FFFFFF',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    jobHeader: {
      padding: '24px',
      borderBottom: '1px solid #E4E7EB',
    },
    jobTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#102A43',
      marginBottom: '0.5rem',
    },
    jobCompany: {
      display: 'flex',
      alignItems: 'center',
      color: '#486581',
      marginBottom: '1rem',
    },
    jobTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    tag: {
      background: '#E0F2FE',
      color: '#0077B6',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
    },
    jobDescription: {
      color: '#486581',
      marginBottom: '1rem',
      lineHeight: '1.6',
    },
    jobDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1rem',
    },
    jobDetailItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderRadius: '12px',
      background: '#F0F4F8',
      color: '#102A43',
      fontWeight: '600',
    },
    jobFooter: {
      background: '#F0F4F8',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    link: {
      color: '#0077B6',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.3s',
    },
    expandButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      color: '#0077B6',
      fontWeight: '600',
    },
    applyButton: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: '15px',
      padding: '1px 14px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.3s, color 0.3s, opacity 0.3s',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    noJobsContainer: {
      textAlign: 'center',
      padding: '2rem',
      background: '#FFFFFF',
      borderRadius: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundImage: 'url("/placeholder.svg?height=400&width=600")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    noJobsContent: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '2rem',
      borderRadius: '10px',
    },
  }

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.header}>המשרות השמורות שלי</h1>
        {savedJobs.length === 0 ? (
          <div style={styles.noJobsContainer}>
              <img
                src={NoNotificationsImage}
                alt="No notifications"
                style={{ width: '60%', maxWidth: 300, marginBottom: 20 }}
              />
            <div style={styles.noJobsContent}>
              <h2 style={{ fontSize: '1.5rem', color: '#102A43', marginBottom: '1rem' }}>אין לך משרות שמורות כרגע</h2>
              <p style={{ color: '#486581', marginBottom: '1rem' }}>כשתמצא משרות שמעניינות אותך, תוכל לשמור אותן כאן לצפייה מאוחרת.</p>
              <Link to="/" style={{ ...styles.link, display: 'inline-block' }}>
                חזור לדף המשרות הראשי
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.jobGrid}>
            <AnimatePresence>
              {savedJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={styles.jobCard}
                >
                  <div style={styles.jobHeader}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                    }}>
                      <h2 style={styles.jobTitle}>{job.title}</h2>
                      <button
                        onClick={() => handleRemoveSavedJob(job.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label="הסר משרה מהשמורים"
                      >
                        <Bookmark color="#0077B6" fill="#0077B6" />
                      </button>
                    </div>
                    <p style={styles.jobCompany}>
                      <Briefcase size={16} style={{ marginLeft: '8px' }} />
                      {job.companyName || 'שם החברה לא זמין'}
                    </p>
                    <div style={styles.jobTags}>
                      <span style={styles.tag}>
                        <MapPin size={14} style={{ marginLeft: '4px' }} />
                        {job.location}
                      </span>
                      <span style={{ ...styles.tag, background: '#E0FFF4', color: '#047857' }}>
                        <Clock size={14} style={{ marginLeft: '4px' }} />
                        {job.type}
                      </span>
                      {job.experience && (
                        <span style={{ ...styles.tag, background: '#FFF0F0', color: '#D00000' }}>
                          ניסיון: {job.experience}
                        </span>
                      )}
                      {job.jobType && (
                        <span style={{ ...styles.tag, background: '#F0E68C', color: '#DAA520' }}>
                          סוג עבודה: {job.jobType}
                        </span>
                      )}
                      {job.requiresCar && (
                        <span style={{ ...styles.tag, background: '#FFEDCC', color: '#D2691E' }}>
                          <DirectionsCarIcon style={{ fontSize: '18px', marginLeft: '4px' }}/>
                          דרוש רכב
                        </span>
                      )}
                      {job.isFlexibleTime && (
                        <span style={{ ...styles.tag, background: '#E0FFE0', color: '#008000' }}>
                          <Clock size={14} style={{ marginLeft: '4px' }} />
                          שעות גמישות
                        </span>
                      )}
                      {job.isFlexibleDates && (
                        <span style={{ ...styles.tag, background: '#E0FFE0', color: '#008000' }}>
                          <Calendar size={14} style={{ marginLeft:  '4px' }} />
                          תאריכים גמישים
                        </span>
                      )}
                    </div>
                    <p style={styles.jobDescription}>{job.description}</p>
                    <div style={styles.jobDetails}>
                      <div style={styles.jobDetailItem}>
                        <span>₪{job.salary} לשעה</span>
                      </div>
                      <div style={styles.jobDetailItem}>
                        <Users size={20} color="#0077B6" style={{ marginLeft: '8px' }} />
                        <span>{job.workersNeeded || 1} עובדים</span>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedJob === job.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ padding: '16px 24px', borderTop: '1px solid #E4E7EB' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div>
                            <p style={{
                              fontWeight: 'bold',
                              marginBottom: '0.5rem',
                              color: '#102A43',
                            }}>
                              שעות עבודה:
                            </p>
                            {job.isFlexibleTime ? (
                              <p style={{ fontSize: '0.875rem', color: '#486581' }}>שעות גמישות</p>
                            ) : Array.isArray(job.workHours) ? (
                              job.workHours.map((time, index) => (
                                <p key={index} style={{ fontSize: '0.875rem', color: '#486581' }}>
                                  {time}
                                </p>
                              ))
                            ) : (
                              <p style={{ fontSize: '0.875rem', color: '#486581' }}>
                                {job.startTime} - {job.endTime}
                              </p>
                            )}
                          </div>
                          <div>
                            <p style={{
                              fontWeight: 'bold',
                              marginBottom: '0.5rem',
                              color: '#102A43',
                            }}>
                              תאריכי עבודה:
                            </p>
                            {job.isFlexibleDates ? (
                              <p style={{ fontSize: '0.875rem', color: '#486581' }}>תאריכים גמישים</p>
                            ) : Array.isArray(job.workDates) ? (
                              job.workDates.map((date, index) => (
                                <p key={index} style={{ fontSize: '0.875rem', color: '#486581' }}>
                                  {date}
                                </p>
                              ))
                            ) : (
                              <p style={{ fontSize: '0.875rem', color: '#486581' }}>{job.workDates}</p>
                            )}
                          </div>
                        </div>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#486581',
                          lineHeight: '1.6',
                        }}>
                          {job.fullDescription ||
                            'תיאור מלא של המשרה לא זמין כרגע. אנא צור קשר עם המעסיק לקבלת מידע נוסף.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div style={styles.jobFooter}>
                    <Link to={`/user/${job.employerId}`} style={styles.link}>
                      צפיה בפרטי מעסיק
                    </Link>
                    <button
                      style={styles.expandButton}
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      aria-expanded={expandedJob === job.id}
                      aria-controls={`job-details-${job.id}`}
                    >
                      {expandedJob === job.id ? (
                        <>
                          <span style={{ marginLeft: '2px' }}>הסתר פרטים</span>
                          <ChevronUp size={20} style={{ marginLeft: '17px' }} />
                        </>
                      ) : (
                        <>
                          <span style={{ marginLeft: '2px' }}>הצג פרטים</span>
                          <ChevronDown size={20} style={{ marginLeft: '17px' }} />
                        </>
                      )}
                    </button>
                    <button
                      style={{
                        ...styles.applyButton,
                        background: appliedJobs.includes(job.id)
                          ? '#99AFA3'
                          : 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
                      }}
                      onClick={() => handleApplyForJob(job.id)}
                    >
                      {appliedJobs.includes(job.id) ? 'בטל מועמדות' : 'הגש מועמדות'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
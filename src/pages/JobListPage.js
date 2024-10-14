import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Bookmark, DollarSign, Users, Clock, Briefcase, Filter, X, ChevronDown, ChevronUp,
  Settings as TuneIcon } from 'lucide-react'
  import { SlidersHorizontal } from 'lucide-react'

import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getAuth } from 'firebase/auth'
import { Link } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Dialog,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Chip,

} from '@mui/material'

export default function JobListPage() {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [salaryFilter, setSalaryFilter] = useState([40, 3400])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [expandedJob, setExpandedJob] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])

  useEffect(() => {
    fetchJobs()
    fetchSavedJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const jobsCollection = collection(db, 'jobs')
      const jobSnapshot = await getDocs(jobsCollection)
      const jobList = jobSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const filteredJobList = jobList.filter((job) => !job.isCompleted && !job.isFullyStaffed)
      setJobs(filteredJobList)
    } catch (error) {
      console.error('Error fetching jobs: ', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedJobs = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap.exists()) {
          setSavedJobs(userDocSnap.data().savedJobs || [])
        }
      } catch (error) {
        console.error('Error fetching saved jobs: ', error)
      }
    }
  }

  const handleSaveJob = async (jobId) => {
    const auth = getAuth()
    const currentUser = auth.currentUser

    if (!currentUser) {
      alert('עליך להתחבר כדי לשמור עבודות')
      return
    }

    const userRef = doc(db, 'users', currentUser.uid)

    try {
      if (savedJobs.includes(jobId)) {
        await updateDoc(userRef, {
          savedJobs: arrayRemove(jobId),
        })
        setSavedJobs(savedJobs.filter((id) => id !== jobId))
      } else {
        await updateDoc(userRef, {
          savedJobs: arrayUnion(jobId),
        })
        setSavedJobs([...savedJobs, jobId])
      }
    } catch (error) {
      console.error('Error updating saved jobs: ', error)
      alert('אירעה שגיאה בעדכון העבודות השמורות.')
    }
  }

  const handleApplyForJob = async (jobId) => {
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (!currentUser) {
        alert('עליך להתחבר כדי להגיש מועמדות')
        return
      }

      const applicantRef = collection(db, 'jobChats', jobId, 'applicants')
      await addDoc(applicantRef, {
        applicantId: currentUser.uid,
        name: currentUser.displayName || 'אנונימי',
        timestamp: serverTimestamp(),
      })
      alert('הגשת המועמדות נשלחה בהצלחה!')
    } catch (error) {
      console.error('Error submitting application: ', error)
      alert('אירעה שגיאה בשליחת המועמדות.')
    }
  }

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter(value)
        if (value) {
          setActiveFilters([...activeFilters.filter(f => f.type !== 'category'), { type: 'category', value }])
        } else {
          setActiveFilters(activeFilters.filter(f => f.type !== 'category'))
        }
        break
      case 'salary':
        setSalaryFilter(value)
        if (value[0] > 40 || value[1] < 3400) {
          setActiveFilters([...activeFilters.filter(f => f.type !== 'salary'), { type: 'salary', value }])
        } else {
          setActiveFilters(activeFilters.filter(f => f.type !== 'salary'))
        }
        break
      case 'location':
        setLocationFilter(value)
        if (value) {
          setActiveFilters([...activeFilters.filter(f => f.type !== 'location'), { type: 'location', value }])
        } else {
          setActiveFilters(activeFilters.filter(f => f.type !== 'location'))
        }
        break
      default:
        break
    }
  }

  const removeFilter = (filterType) => {
    setActiveFilters(activeFilters.filter(f => f.type !== filterType))
    switch (filterType) {
      case 'category':
        setCategoryFilter('')
        break
      case 'salary':
        setSalaryFilter([40, 3400])
        break
      case 'location':
        setLocationFilter('')
        break
      default:
        break
    }
  }

  const filteredJobs = jobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(filter.toLowerCase()) &&
      (locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (categoryFilter === '' || job.category === categoryFilter)
      // Remove the salary filter for testing
      // && (job.salary >= salaryFilter[0] && job.salary <= salaryFilter[1])
    )
  })
  

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
      fontSize: '3rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#102A43',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    },
    searchContainer: {
      background: '#FFFFFF',
      borderRadius: '20px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem',
    },
    inputWrapper: {
      position: 'relative',
      marginBottom: '1rem',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E4E7EB',
      borderRadius: '8px',
      fontSize: '1rem',
      textAlign: 'right',
      transition: 'all 0.3s',
    },
    button: {
      background: 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
      color: '#FFFFFF',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    jobGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    jobCard: {
      background: '#FFFFFF',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s',
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
    applyButton: {
      background: 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
      color: '#FFFFFF',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
    activeFiltersContainer: {
      display: 'flex',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      padding: '0.5rem 0',
      marginTop: '1rem',
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: '-ms-autohiding-scrollbar'
    },
    activeFilter: {
      background: '#E0F2FE',
      color: '#0077B6',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
    },
    removeFilterButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginLeft: '4px',
      color: '#0077B6',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>        
        <Box sx={{ width: '100%',  mb: 2,  display: 'flex', gap :'2%'}}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              p: 2,
              width: '80%',
              borderRadius: '100px',
              border: '1px solid #e0e0e0',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            }}
          >
            <Typography sx={{ flexGrow: 1, textAlign: 'right' }}>
              מיקום? · קטגוריה · סכום
            </Typography>
            <IconButton size="small" sx={{ ml: 1 }}>
              <Search />
            </IconButton>
          </Box>
          <Box
            sx={{
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              p: 2,
              width: '15%',
              borderRadius: '100px',
              border: '1px solid #e0e0e0',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            }}
            onClick={() => setShowFilters(true)}
          >
            < SlidersHorizontal sx={{ mr: 1 }} />
          </Box>

          <Dialog
            open={showFilters}
            onClose={() => setShowFilters(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
              sx: {
                borderRadius: '12px',
                m: 0,
                width: '100%',
                maxHeight: '100%',
              },
            }}
          >
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                  מסננים
                </Typography>
                <IconButton edge="end" color="inherit" onClick={() => setShowFilters(false)} aria-label="close">
                  <X />
                </IconButton>
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                סוג משרה
              </Typography>
              <ToggleButtonGroup
                value={categoryFilter}
                exclusive
                onChange={(e, value) => handleFilterChange('category', value)}
                
                aria-label="job type"
                sx={{ mb: 3, width: '100%' }}
              >
                <ToggleButton
                  value="fullTime"
                  aria-label="full time"
                  sx={{
                    flex: 1,
                    borderRadius: '100px',
                    mr: 1,
                    border: '1px solid #e0e0e0',
                    '&.Mui-selected': {
                      bgcolor: '#E0F2FE',
                      color: '#0077B6',
                      '&:hover': {
                        bgcolor: '#E0F2FE',
                      },
                    },
                  }}
                >
                  משרה מלאה
                </ToggleButton>
                <ToggleButton
                  value="partTime"
                  aria-label="part time"
                  sx={{
                    flex: 1,
                    borderRadius: '100px',
                    border: '1px solid #e0e0e0',
                    '&.Mui-selected': {
                      bgcolor: '#E0F2FE',
                      color: '#0077B6',
                      '&:hover': {
                        bgcolor: '#E0F2FE',
                      },
                    },
                  }}
                >
                  משרה חלקית
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                טווח מחירים
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  מינימום
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מקסימום
                </Typography>
              </Box>
              <Slider
                value={salaryFilter}
                onChange={(e, newValue) => handleFilterChange('salary', newValue)}
                valueLabelDisplay="auto"
                min={40}
                max={3400}
                step={10}
                sx={{
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                      boxShadow: 'inherit',
                    },
                  },
                  '& .MuiSlider-track': {
                    height: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                    opacity: 0.5,
                    backgroundColor: '#bfbfbf',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ₪ {salaryFilter[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {salaryFilter[1] === 3400 ? `₪ ${salaryFilter[1]} ומעלה` : `₪ ${salaryFilter[1]}`}
                </Typography>
              </Box>
            </DialogContent>

            <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#486581' }}>
                      תפקיד
                    </label>
                    <input
                      type="text"
                      id="title"
                      style={styles.input}
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="הזן תפקיד"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#486581' }}>
                      מיקום
                    </label>
                    <input
                      type="text"
                      id="location"
                      style={styles.input}
                      value={locationFilter}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="הזן מיקום"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#486581' }}>
                      קטגוריה
                    </label>
                    <select
                      id="category"
                      style={{ ...styles.input, appearance: 'none' }}
                      value={categoryFilter}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">כל הקטגוריות</option>
                      <option value="tech">טכנולוגיה</option>
                      <option value="finance">פיננסים</option>
                      <option value="marketing">שיווק</option>
                      <option value="education">חינוך</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={() => {
                  setCategoryFilter('')
                  setSalaryFilter([40, 3400])
                  setLocationFilter('')
                  setActiveFilters([])
                }}
                sx={{
                  color: 'text.primary',
                  bgcolor: '#F3F4F6',
                  '&:hover': {
                    bgcolor: '#E5E7EB',
                  },
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                }}
              >
                לנקות הכל
              </Button>
              <Button
                onClick={() => setShowFilters(false)}
                sx={{
                  color: 'white',
                  bgcolor: 'black',
                  '&:hover': {
                    bgcolor: '#333',
                  },
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                }}
              >
                הצגת {filteredJobs.length} משרות
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        {activeFilters.length > 0 && (
            <div style={styles.activeFiltersContainer}>
              {activeFilters.map((filter, index) => (
                <span key={index} style={{...styles.activeFilter, marginRight: '0.5rem', flex: '0 0 auto',backgroundColor: 'lightblue', color:'black'}}>
                  {filter.type === 'category' && `קטגוריה: ${filter.value}`}
                  {filter.type === 'salary' && `שכר מינימלי: ₪${filter.value[0]}`}
                  {filter.type === 'location' && `מיקום: ${filter.value}`}
                  <button
                    onClick={() => removeFilter(filter.type)}
                    style={styles.removeFilterButton}
                    aria-label={`הסר סינון ${filter.type}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}


        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0077B6',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
            }}></div>
          </div>
        ) : 
        filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#102A43', marginBottom: '1rem' }}>לא נמצאו משרות מתאימות</h2>
            <p style={{ color: '#486581' }}>נסה לשנות את הגדרות החיפוש שלך או לחפש מחדש מאוחר יותר.</p>
          </div>
        ) : (
          <div style={styles.jobGrid}>
            <AnimatePresence>
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={styles.jobCard}
                >
                  <div style={styles.jobHeader}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h2 style={styles.jobTitle}>{job.title}</h2>
                      <button
                        onClick={() => handleSaveJob(job.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label={savedJobs.includes(job.id) ? "הסר משרה מהשמורים" : "שמור משרה"}
                      >
                        <Bookmark color={savedJobs.includes(job.id) ? '#0077B6' : '#829AB1'} fill={savedJobs.includes(job.id) ? '#0077B6' : 'none'} />
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
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#102A43' }}>שעות עבודה:</p>
                            {Array.isArray(job.workHours) ? (
                              job.workHours.map((time, index) => (
                                <p key={index} style={{ fontSize: '0.875rem', color: '#486581' }}>{time}</p>
                              ))
                            ) : (
                              <p style={{ fontSize: '0.875rem', color: '#486581' }}>
                                {job.startTime} - {job.endTime}
                              </p>
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#102A43' }}>תאריכי עבודה:</p>
                            {Array.isArray(job.workDates) ? (
                              job.workDates.map((date, index) => (
                                <p key={index} style={{ fontSize: '0.875rem', color: '#486581' }}>{date}</p>
                              ))
                            ) : (
                              <p style={{ fontSize: '0.875rem', color: '#486581' }}>{job.workDates}</p>
                            )}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#486581', lineHeight: '1.6' }}>
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
                          <ChevronUp size={20}style={{ marginLeft: '17px' }} />
                        </>
                      ) : (
                        <>
                          <span style={{ marginLeft: '2px' }}>הצג פרטים</span>
                          <ChevronDown size={20}style={{ marginLeft: '17px' }} />
                        </>
                      )}
                    </button>
                    <button
                      style={styles.applyButton}
                      onClick={() => handleApplyForJob(job.id)}
                    >
                      הגש מועמדות
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
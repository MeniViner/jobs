import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Bookmark, DollarSign, Users, Clock, Briefcase, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { getAuth } from 'firebase/auth'
import { Link } from 'react-router-dom'

export default function JobListPage() {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [salaryFilter, setSalaryFilter] = useState(0)
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
        if (value > 0) {
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
        setSalaryFilter(0)
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
      (categoryFilter === '' || job.category === categoryFilter) &&
      (salaryFilter === 0 || job.salary >= salaryFilter)
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
      padding: '24px',
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
        <div style={styles.searchContainer}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ ...styles.inputWrapper, flex: 1 }}>
              <Search style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#829AB1' }} />
              <input
                type="text"
                placeholder="חיפוש מהיר לפי תפקיד"
                style={styles.input}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button
              style={styles.button}
              onClick={() => setShowFilters(!showFilters)}
            >
              הגדר סינון
            </button>
          </div>
          
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
                      <option  value="tech">טכנולוגיה</option>
                      <option value="finance">פיננסים</option>
                      <option value="marketing">שיווק</option>
                      <option value="education">חינוך</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="salary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#486581' }}>
                      שכר מינימלי לשעה: ₪{salaryFilter}
                    </label>
                    <input
                      type="range"
                      id="salary"
                      min="0"
                      max="200"
                      step="10"
                      style={{ ...styles.input, padding: '8px 0' }}
                      value={salaryFilter}
                      onChange={(e) => handleFilterChange('salary', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeFilters.length > 0 && (
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              padding: '0.5rem 0',
              marginTop: '1rem',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: '-ms-autohiding-scrollbar'
            }}>
              {activeFilters.map((filter, index) => (
                <span key={index} style={{...styles.activeFilter, marginRight: '0.5rem', flex: '0 0 auto'}}>
                  {filter.type === 'category' && `קטגוריה: ${filter.value}`}
                  {filter.type === 'salary' && `שכר מינימלי: ₪${filter.value}`}
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
        </div>

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
                          {job.fullDescription || 'אין תיאור מפורט זמין למשרה זו.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div style={styles.jobFooter}>
                    <Link to={`/user/${job.employerId}`} style={styles.link}>
                      צפיה בפרטי מעסיק
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                        style={styles.expandButton}
                        aria-expanded={expandedJob === job.id}
                        aria-controls={`job-details-${job.id}`}
                      >
                        {expandedJob === job.id ? (
                          <>
                            <ChevronUp size={20} style={{ marginLeft: '4px' }} />
                            פחות פרטים
                          </>
                        ) : (
                          <>
                            <ChevronDown size={20} style={{ marginLeft: '4px' }} />
                            יותר פרטים
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApplyForJob(job.id)}
                        style={styles.applyButton}
                      >
                        הגש מועמדות
                      </button>
                    </div>
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
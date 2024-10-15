// JobListPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bookmark, Users, Clock, Briefcase, X, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  collection, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, getDocs, serverTimestamp,
  arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Box, Typography, IconButton, Button } from '@mui/material';

// עדכן את נתיב הייבוא בהתאם למיקום הקובץ SearchFilters.js
import SearchFilters from './SearchFilters';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState([40, 3400]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchAppliedJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredJobList = jobList.filter((job) => !job.isCompleted && !job.isFullyStaffed);
      setJobs(filteredJobList);
    } catch (error) {
      console.error('Error fetching jobs: ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setSavedJobs(userDocSnap.data().savedJobs || []);
        }
      } catch (error) {
        console.error('Error fetching saved jobs: ', error);
      }
    }
  };

  const fetchAppliedJobs = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const applicationsRef = collection(db, 'applications');
        const applicationsSnapshot = await getDocs(applicationsRef);
        const appliedJobsList = applicationsSnapshot.docs
          .filter((doc) => doc.data().applicantId === currentUser.uid)
          .map((doc) => doc.data().jobId);
        setAppliedJobs(appliedJobsList.map(String)); // המרת ה-IDs למחרוזות
      } catch (error) {
        console.error('Error fetching applied jobs: ', error);
      }
    }
  };

  const handleSaveJob = async (jobId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('עליך להתחבר כדי לשמור עבודות');
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    try {
      if (savedJobs.includes(jobId)) {
        await updateDoc(userRef, {
          savedJobs: arrayRemove(jobId),
        });
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
      } else {
        await updateDoc(userRef, {
          savedJobs: arrayUnion(jobId),
        });
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error updating saved jobs: ', error);
      alert('אירעה שגיאה בעדכון העבודות השמורות.');
    }
  };

  const handleApplyForJob = async (jobId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('עליך להתחבר כדי להגיש מועמדות');
      return;
    }

    const applicationRef = doc(db, 'applications', `${jobId}_${currentUser.uid}`);
    const jobRef = doc(db, 'jobs', jobId);

    try {
      const jobSnapshot = await getDoc(jobRef);
      const jobData = jobSnapshot.data();

      if (appliedJobs.includes(jobId.toString())) {
        // Canceling application
        await deleteDoc(applicationRef);
        setAppliedJobs(appliedJobs.filter((id) => id !== jobId.toString()));

        // Send cancellation notification
        await addDoc(collection(db, 'notifications'), {
          userId: currentUser.uid,
          jobId: jobId,
          jobTitle: jobData.title,
          type: 'application_canceled',
          message: `ביטלת את מועמדותך למשרה: ${jobData.title}`,
          timestamp: serverTimestamp(),
          isRead: false
        });
      } else {
        // Submitting application
        await setDoc(applicationRef, {
          jobId: jobId,
          applicantId: currentUser.uid,
          timestamp: serverTimestamp(),
        });
        setAppliedJobs([...appliedJobs, jobId.toString()]);

        // Send application notification
        await addDoc(collection(db, 'notifications'), {
          userId: currentUser.uid,
          jobId: jobId,
          jobTitle: jobData.title,
          type: 'application_submitted',
          message: `הגשת מועמדות למשרה: ${jobData.title}`,
          timestamp: serverTimestamp(),
          isRead: false
        });
      }

      // Show success message to the user
      alert(appliedJobs.includes(jobId.toString()) 
        ? 'המועמדות בוטלה בהצלחה' 
        : 'המועמדות הוגשה בהצלחה');

    } catch (error) {
      console.error('Error updating application: ', error);
      alert('אירעה שגיאה בעדכון המועמדות.');
    }
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter(value);
        if (value) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'category'), { type: 'category', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'category'));
        }
        break;
      case 'salary':
        setSalaryFilter(value);
        if (value[0] > 40 || value[1] < 3400) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'salary'), { type: 'salary', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'salary'));
        }
        break;
      case 'location':
        setLocationFilter(value);
        if (value) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'location'), { type: 'location', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'location'));
        }
        break;
      default:
        break;
    }
  };

  const removeFilter = (filterType) => {
    setActiveFilters(activeFilters.filter((f) => f.type !== filterType));
    switch (filterType) {
      case 'category':
        setCategoryFilter('');
        break;
      case 'salary':
        setSalaryFilter([40, 3400]);
        break;
      case 'location':
        setLocationFilter('');
        break;
      default:
        break;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(filter.toLowerCase()) &&
      (locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (categoryFilter === '' || job.category === categoryFilter)
      // ניתן להוסיף את סינון השכר אם תרצה
    );
  });

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
    activeFiltersContainer: {
      display: 'flex',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      padding: '0.5rem 0',
      marginTop: '1rem',
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: '-ms-autohiding-scrollbar',
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
    applyButton: {
      color: '#FFFFFF',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.3s, color 0.3s, opacity 0.3s',
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <SearchFilters
          filter={filter}
          setFilter={setFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          salaryFilter={salaryFilter}
          setSalaryFilter={setSalaryFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          handleFilterChange={handleFilterChange}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          removeFilter={removeFilter}
          filteredJobsCount={filteredJobs.length}
        />

        {activeFilters.length > 0 && (
          <div style={styles.activeFiltersContainer}>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                style={{
                  ...styles.activeFilter,
                  marginRight: '0.5rem',
                  flex: '0 0 auto',
                  backgroundColor: 'lightblue',
                  color: 'black',
                }}
              >
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <div
              style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #0077B6',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                      }}
                    >
                      <h2 style={styles.jobTitle}>{job.title}</h2>
                      <button
                        onClick={() => handleSaveJob(job.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label={savedJobs.includes(job.id) ? 'הסר משרה מהשמורים' : 'שמור משרה'}
                      >
                        <Bookmark
                          color={savedJobs.includes(job.id) ? '#0077B6' : '#829AB1'}
                          fill={savedJobs.includes(job.id) ? '#0077B6' : 'none'}
                        />
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
                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}
                        >
                          <div>
                            <p
                              style={{
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                color: '#102A43',
                              }}
                            >
                              שעות עבודה:
                            </p>
                            {Array.isArray(job.workHours) ? (
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
                            <p
                              style={{
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                color: '#102A43',
                              }}
                            >
                              תאריכי עבודה:
                            </p>
                            {Array.isArray(job.workDates) ? (
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
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: '#486581',
                            lineHeight: '1.6',
                          }}
                        >
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
                        background: appliedJobs.includes(job.id.toString())
                          ? '#99AFA3' // צבע רקע כאשר המועמדות קיימת
                          : 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)', // גרדיינט רקע כאשר המועמדות לא קיימת
                        opacity: 1,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                      onClick={() => handleApplyForJob(job.id)}
                    >
                      {appliedJobs.includes(job.id.toString()) ? 'בטל מועמדות' : 'הגש מועמדות'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

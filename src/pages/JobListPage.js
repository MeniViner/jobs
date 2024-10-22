// JobListPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bookmark, Users, Clock, Briefcase, X, ChevronDown, ChevronUp, CheckCircle, Calendar, Car
} from 'lucide-react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, serverTimestamp,
  arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { debounce } from 'lodash';

// pages Import 
import SearchFilters from './SearchFilters';


export default function JobListPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState([20, 500]);
  const [debouncedSalaryFilter, setDebouncedSalaryFilter] = useState([20, 500]);
  const [experienceFilter, setExperienceFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate()

  // useEffect(() => {
  //   if (authLoading) return;

  //   if (!user) {
  //     setLoading(false);
  //     navigate('/login')
  //     return;
  //   }

  //   fetchAllData();
  // }, [authLoading, user]);

  // const fetchAllData = async () => {
  //   setLoading(true);

  //   try {
  //     const userRef = doc(db, 'users', user.uid);
  //     const [jobsSnapshot, savedJobsSnapshot, applicationsSnapshot, acceptedJobsSnapshot] = await Promise.all([
  //       getDocs(collection(db, 'jobs')),
  //       getDoc(userRef),
  //       getDocs(collection(userRef, 'applications')),
  //       getDocs(collection(userRef, 'acceptedJobs')),
  //     ]);

  //     const jobList = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //     const filteredJobList = jobList.filter((job) => !job.isCompleted && !job.isFullyStaffed);
  //     setJobs(filteredJobList);

  //     const savedJobsData = savedJobsSnapshot.exists() ? savedJobsSnapshot.data().savedJobs || [] : [];
  //     setSavedJobs(savedJobsData);

  //     const appliedJobsList = applicationsSnapshot.docs.map((doc) => doc.id);
  //     setAppliedJobs(appliedJobsList);

  //     const acceptedJobsList = acceptedJobsSnapshot.docs.map((doc) => doc.id);
  //     setAcceptedJobs(acceptedJobsList);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setError('Failed to load data.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  useEffect(() => {
    if (authLoading) return; // Wait until authentication loading is complete.
  
    fetchAllData(); // Fetch jobs data for all users (signed in or not).
  }, [authLoading]);
  
  const fetchAllData = async () => {
    setLoading(true);
  
    try {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobList = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredJobList = jobList.filter((job) => !job.isCompleted && !job.isFullyStaffed);
      setJobs(filteredJobList);
  
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const [savedJobsSnapshot, applicationsSnapshot, acceptedJobsSnapshot] = await Promise.all([
          getDoc(userRef),
          getDocs(collection(userRef, 'applications')),
          getDocs(collection(userRef, 'acceptedJobs')),
        ]);
  
        const savedJobsData = savedJobsSnapshot.exists() ? savedJobsSnapshot.data().savedJobs || [] : [];
        setSavedJobs(savedJobsData);
  
        const appliedJobsList = applicationsSnapshot.docs.map((doc) => doc.id);
        setAppliedJobs(appliedJobsList);
  
        const acceptedJobsList = acceptedJobsSnapshot.docs.map((doc) => doc.id);
        setAcceptedJobs(acceptedJobsList);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleSaveJob = async (jobId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'בכדי להגיש מועמדות, עליך להתחבר.',
        severity: 'warning',
      });
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    try {
      if (savedJobs.includes(jobId)) {
        await updateDoc(userRef, {
          savedJobs: arrayRemove(jobId),
        });
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
        setSnackbar({ open: true, message: 'המשרה הוסרה מהמשרות השמורות.', severity: 'info' });
      } else {
        await updateDoc(userRef, {
          savedJobs: arrayUnion(jobId),
        });
        setSavedJobs([...savedJobs, jobId]);
        setSnackbar({ open: true, message: 'המשרה נוספה למשרות השמורות.', severity: 'success' });
      }
    } catch (error) {
      console.error('Error updating saved jobs: ', error);
      setSnackbar({ open: true, message: 'שגיאה בעדכון המשרות השמורות.', severity: 'error' });
    }
  };

  const handleApplyForJob = async (jobId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSnackbar({
        open: true,
        message: '',
        severity: 'warning',
      });
      return;
    }

    const applicantRef = doc(db, 'jobs', jobId, 'applicants', currentUser.uid);
    const userApplicationsRef = doc(db, 'users', currentUser.uid, 'applications', jobId);

    try {
      if (appliedJobs.includes(jobId)) {
        await deleteDoc(applicantRef);
        await deleteDoc(userApplicationsRef);
        setAppliedJobs(appliedJobs.filter((id) => id !== jobId));
        setSnackbar({ open: true, message: 'המועמדות בוטלה בהצלחה!', severity: 'info' });
      } else {
        await setDoc(applicantRef, {
          applicantId: currentUser.uid,
          timestamp: serverTimestamp(),
        });
        await setDoc(userApplicationsRef, {
          jobId: jobId,
          timestamp: serverTimestamp(),
          status: 'applied',
        });
        setAppliedJobs([...appliedJobs, jobId]);
        setSnackbar({ open: true, message: 'המועמדות הוגשה בהצלחה!', severity: 'success' });
      }
    } catch (error) {
      console.error('Error applying for job: ', error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בהגשת המועמדות.', severity: 'error' });
    }
  };

  // Debounce salary filter
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSalaryFilter(salaryFilter);
      if (salaryFilter[0] > 20 || salaryFilter[1] < 500) {
        setActiveFilters([...activeFilters.filter((f) => f.type !== 'salary'), { type: 'salary', value: salaryFilter }]);
      } else {
        setActiveFilters(activeFilters.filter((f) => f.type !== 'salary'));
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [salaryFilter]);

  // Handle other filter changes with debounce
  const handleFilterChange = debounce((filterType, value) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter(value);
        if (value) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'category'), { type: 'category', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'category'));
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
      case 'experience':
        setExperienceFilter(value);
        if (value) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'experience'), { type: 'experience', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'experience'));
        }
        break;
      case 'jobType':
        setJobTypeFilter(value);
        if (value) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'jobType'), { type: 'jobType', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'jobType'));
        }
        break;
      case 'title':
        setFilter(value);
        if (value) {
          setActiveFilters([...activeFilters.filter((f) => f.type !== 'title'), { type: 'title', value }]);
        } else {
          setActiveFilters(activeFilters.filter((f) => f.type !== 'title'));
        }
        break;
      default:
        break;
    }
  }, 300);

  const removeFilter = (filterType) => {
    setActiveFilters(activeFilters.filter((f) => f.type !== filterType));
    switch (filterType) {
      case 'category':
        setCategoryFilter('');
        break;
      case 'salary':
        setSalaryFilter([20, 500]);
        break;
      case 'location':
        setLocationFilter('');
        break;
      case 'experience':
        setExperienceFilter('');
        break;
      case 'jobType':
        setJobTypeFilter('');
        break;
      case 'title':
        setFilter('');
        break;
      default:
        break;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    return (
      !acceptedJobs.includes(job.id) &&
      job.title.toLowerCase().includes(filter.toLowerCase()) &&
      (locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (categoryFilter === '' || job.category === categoryFilter) &&
      (experienceFilter === '' || job.experience === experienceFilter) &&
      (jobTypeFilter === '' || job.jobType === jobTypeFilter) &&
      (job.salary >= debouncedSalaryFilter[0] && job.salary <= debouncedSalaryFilter[1])
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
      marginRight: '0.5rem',
      flex: '0 0 auto',
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

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
          experienceFilter={experienceFilter}
          setExperienceFilter={setExperienceFilter}
          jobTypeFilter={jobTypeFilter}
          setJobTypeFilter={setJobTypeFilter}
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
                {filter.type === 'salary' && `שכר: ₪${filter.value[0]} - ₪${filter.value[1]}`}
                {filter.type === 'location' && `מיקום: ${filter.value}`}
                {filter.type === 'experience' && `ניסיון: ${filter.value}`}
                {filter.type === 'jobType' && `סוג עבודה: ${filter.value}`}
                {filter.type === 'title' && `תפקיד: ${filter.value}`}
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

        {filteredJobs.length === 0 ? (
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
                          <Calendar size={14} style={{ marginLeft: '4px' }} />
                          תאריכים גמישים
                        </span>
                      )}
                      {acceptedJobs.includes(job.id) && (
                        <span style={{ ...styles.tag, background: '#D1FAE5', color: '#065F46' }}>
                          <CheckCircle size={14} style={{ marginLeft: '4px' }} />
                          התקבלתי
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
                            <p
                              style={{
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                color: '#102A43',
                              }}
                            >
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
                        background: acceptedJobs.includes(job.id)
                          ? '#4CAF50'
                          : appliedJobs.includes(job.id)
                          ? '#99AFA3'
                          : 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
                        opacity: acceptedJobs.includes(job.id) ? 0.6 : 1,
                        cursor: acceptedJobs.includes(job.id) ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!acceptedJobs.includes(job.id)) e.currentTarget.style.opacity = 0.8;
                      }}
                      onMouseLeave={(e) => {
                        if (!acceptedJobs.includes(job.id)) e.currentTarget.style.opacity = 1;
                      }}
                      onClick={() => {
                        if (!acceptedJobs.includes(job.id)) handleApplyForJob(job.id);
                      }}
                      disabled={acceptedJobs.includes(job.id)}
                    >
                      {acceptedJobs.includes(job.id)
                        ? 'התקבלתי למשרה'
                        : appliedJobs.includes(job.id)
                        ? 'בטל מועמדות'
                        : 'הגש מועמדות'}
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
  );
}

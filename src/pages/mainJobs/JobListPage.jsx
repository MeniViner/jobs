import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, serverTimestamp,
  arrayUnion, arrayRemove, addDoc, query, where,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { debounce } from 'lodash';

// pages Import 
import SearchFilters from './SearchFilters';
import styles from './JobListPageStyles';
import JobCard from './JobCard';


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

  useEffect(() => {
    if (!authLoading) loadJobs();

    fetchAllData(); 
  }, [authLoading]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      setJobs(jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllData = async () => {
    setLoading(true);
  
    try {
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobList = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredJobList = jobList.filter((job) => !job.isCompleted && !job.isFullyStaffed );
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
        message: 'עליך להתחבר כדי להגיש מועמדות.',
        severity: 'warning',
      });
      return;
    }
  
    const applicantRef = doc(db, 'jobs', jobId, 'applicants', currentUser.uid);
    const userApplicationsRef = doc(db, 'users', currentUser.uid, 'applications', jobId);
    const notificationRef = collection(db, 'notifications'); // הפניה לקולקשן של ההתראות
  
    try {
      if (appliedJobs.includes(jobId)) {
        // מחיקת המועמדות וההתראה הקשורה
        await deleteDoc(applicantRef);
        await deleteDoc(userApplicationsRef);
  
        const notificationsSnapshot = await getDocs(
          query(notificationRef, where('jobId', '==', jobId), where('applicantId', '==', currentUser.uid))
        );
  
        notificationsSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
  
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
  
        // const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        // const jobData = jobDoc.exists() ? jobDoc.data() : null;
  
        // const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        // const userData = userDoc.exists() ? userDoc.data() : null;
  
        // if (jobData && userData) {
          // const applicantName = userData.name || 'מועמד לא מזוהה';
  
          // await addDoc(notificationRef, {
          //   userId: jobData.employerId,
          //   jobId: jobId,
          //   applicantId: currentUser.uid,
          //   jobTitle: jobData.title || 'Unknown Job',
          //   type: 'new_application',
          //   message: `המשתמש ${applicantName} הגיש מועמדות למשרה: ${jobData.title}`,
          //   timestamp: serverTimestamp(),
          //   isHistory: false,
          // });
          // }
  
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


  // עובד סופי אבל בלי סינון שכר משכורות
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobTitle = job.title?.toLowerCase() || '';
      const jobDescription = job.description?.toLowerCase() || '';
      const jobLocation = job.location?.toLowerCase() || '';
      const jobCategory = job.category || '';
      const jobExperience = job.experience || '';
      const jobJobType = job.jobType || '';
      // const jobSalary = job.salary != null ? job.salary : 0;
  
      const filterText = filter.toLowerCase();
      const locationFilterText = locationFilter.toLowerCase();
  
      const matchesTitleOrDescription =
        jobTitle.includes(filterText) || jobDescription.includes(filterText);
  
      return (
        !acceptedJobs.includes(job.id) &&
        matchesTitleOrDescription &&
        (locationFilter === '' || jobLocation.includes(locationFilterText)) &&
        (categoryFilter === '' || jobCategory === categoryFilter) &&
        (experienceFilter === '' || jobExperience === experienceFilter) &&
        (jobTypeFilter === '' || jobJobType === jobTypeFilter) 
        // && (jobSalary >= debouncedSalaryFilter[0] && jobSalary <= debouncedSalaryFilter[1])
      );
    });
  }, [
    jobs,
    filter,
    locationFilter,
    categoryFilter,
    experienceFilter,
    jobTypeFilter,
    debouncedSalaryFilter,
    acceptedJobs,
  ]);
  
  
  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
            Error: {error}
        </Box>
    );
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
                  {filteredJobs.map((job) => (
                      <JobCard 
                      key={job.id} 
                      job={job} 
                      expandedJob={expandedJob} 
                      setExpandedJob={setExpandedJob} 
                      savedJobs={savedJobs} 
                      appliedJobs={appliedJobs} 
                      acceptedJobs={acceptedJobs} 
                      handleSaveJob={handleSaveJob} 
                      handleApplyForJob={handleApplyForJob} 
                      />
                  ))}
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

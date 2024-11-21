'use client';

import React, { useState, useEffect } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import NoNotificationsImage from '../../images/completed.svg';
import JobCard from './JobCard'; // Import JobCard component

export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]); // Add acceptedJobs state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedJob, setExpandedJob] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
    fetchAppliedJobs();
    fetchAcceptedJobs(); // Fetch acceptedJobs
  }, [authLoading, user, navigate]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const savedJobIds = userDoc.data().savedJobs || [];

      const jobsPromises = savedJobIds.map(async (jobId) => {
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobRef);
        if (jobDoc.exists()) {
          return { id: jobDoc.id, ...jobDoc.data() };
        }
        return null;
      });

      const jobs = await Promise.all(jobsPromises);
      setSavedJobs(jobs.filter((job) => job !== null));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setError('Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const applicationsRef = collection(db, 'users', user.uid, 'applications');
      const applicationsSnapshot = await getDocs(applicationsRef);
      const appliedJobsList = applicationsSnapshot.docs.map((doc) => doc.id);
      setAppliedJobs(appliedJobsList);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const fetchAcceptedJobs = async () => {
    try {
      const acceptedJobsRef = collection(db, 'users', user.uid, 'acceptedJobs');
      const acceptedJobsSnapshot = await getDocs(acceptedJobsRef);
      const acceptedJobsList = acceptedJobsSnapshot.docs.map((doc) => doc.id);
      setAcceptedJobs(acceptedJobsList);
    } catch (error) {
      console.error('Error fetching accepted jobs:', error);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        savedJobs: arrayRemove(jobId),
      });
      setSavedJobs(savedJobs.filter((job) => job.id !== jobId));
      setSnackbar({ open: true, message: 'המשרה הוסרה מהמשרות השמורות.', severity: 'success' });
    } catch (error) {
      console.error('Error removing saved job:', error);
      setSnackbar({ open: true, message: 'שגיאה בהסרת המשרה השמורה.', severity: 'error' });
    }
  };

  const handleApplyForJob = async (jobId) => {
    try {
      const applicantRef = doc(db, 'jobs', jobId, 'applicants', user.uid);
      const userApplicationsRef = doc(db, 'users', user.uid, 'applications', jobId);

      if (appliedJobs.includes(jobId)) {
        await deleteDoc(applicantRef);
        await deleteDoc(userApplicationsRef);
        setAppliedJobs(appliedJobs.filter((id) => id !== jobId));
        setSnackbar({ open: true, message: 'המועמדות בוטלה בהצלחה!', severity: 'info' });
      } else {
        await setDoc(applicantRef, {
          applicantId: user.uid,
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

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F0F4F8 0%, #D9E2EC 100%)',
        padding: '32px 16px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#102A43',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          המשרות השמורות שלי
        </h1>
        {savedJobs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src={NoNotificationsImage}
              alt="No notifications"
              style={{ width: '60%', maxWidth: 300, marginBottom: 20 }}
            />
            <h2 style={{ fontSize: '1.5rem', color: '#102A43', marginBottom: '1rem' }}>
              אין לך משרות שמורות כרגע
            </h2>
            <p style={{ color: '#486581', marginBottom: '1rem' }}>
              כשתמצא משרות שמעניינות אותך, תוכל לשמור אותן כאן לצפייה מאוחרת.
            </p>
            <Link to="/" style={{ color: '#0077B6', textDecoration: 'none', fontWeight: '600' }}>
              חזור לדף המשרות הראשי
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                expandedJob={expandedJob}
                setExpandedJob={setExpandedJob}
                savedJobs={savedJobs.map((job) => job.id)} // Pass IDs
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

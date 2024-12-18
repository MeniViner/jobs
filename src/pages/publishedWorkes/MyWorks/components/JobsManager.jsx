import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

const JobsManager = ({ children, onJobsLoaded, onError }) => {
  const [jobs, setJobs] = useState([]);
  const [jobApplicants, setJobApplicants] = useState({});
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  const fetchApplicantsForJobs = async (jobsList) => {
    const applicantsData = {};

    await Promise.all(
      jobsList.map(async (job) => {
        const applicantsRef = collection(db, 'jobs', job.id, 'applicants');
        const applicantsSnapshot = await getDocs(applicantsRef);

        const jobApplicants = await Promise.all(
          applicantsSnapshot.docs.map(async (applicantDoc) => {
            const applicantData = applicantDoc.data();
            const userDoc = await getDoc(doc(db, 'users', applicantData.applicantId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            return {
              applicantId: applicantData.applicantId,
              ...applicantData,
              userData,
            };
          })
        );

        applicantsData[job.id] = jobApplicants;
      })
    );

    return applicantsData;
  };

  const fetchEmployerJobs = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('employerId', '==', auth.currentUser.uid)
      );
      const jobsSnapshot = await getDocs(jobsQuery);

      const jobsList = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (jobsList.length === 0) {
        setJobs([]);
        setJobApplicants({});
        setLoading(false);
        return;
      }

      const jobIds = jobsList.map((job) => job.id);
      const applicantsData = {};

      const chunkSize = 10;
      for (let i = 0; i < jobIds.length; i += chunkSize) {
        const chunk = jobIds.slice(i, i + chunkSize);
        const applicantsQuery = query(
          collectionGroup(db, 'applicants'),
          where('jobId', 'in', chunk)
        );
        const applicantsSnapshot = await getDocs(applicantsQuery);

        applicantsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!applicantsData[data.jobId]) {
            applicantsData[data.jobId] = [];
          }
          applicantsData[data.jobId].push(data);
        });
      }

      setJobs(jobsList);
      setJobApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching jobs or applicants:', error);
      onError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);

    const unsubscribe = onSnapshot(
      query(collection(db, 'jobs'), where('employerId', '==', auth.currentUser.uid)),
      async (snapshot) => {
        const jobsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        try {
          const applicantsData = await fetchApplicantsForJobs(jobsList);
          setJobs(jobsList);
          setJobApplicants(applicantsData);
          onJobsLoaded(jobsList, applicantsData);
        } catch (error) {
          console.error('Error fetching applicants:', error);
          onError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching jobs:', error);
        onError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser, onJobsLoaded, onError]);

  const activeJobs = useMemo(
    () => jobs.filter((job) => !job.isCompleted),
    [jobs]
  );

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.isCompleted),
    [jobs]
  );

  return children({
    jobs,
    setJobs,
    jobApplicants,
    setJobApplicants,
    loading,
    activeJobs,
    completedJobs,
    fetchEmployerJobs,
  });
};

export default JobsManager;


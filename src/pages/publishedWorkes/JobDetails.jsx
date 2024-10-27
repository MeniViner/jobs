// src/pages/publishedWorkes/JobDetails.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getDoc, doc, addDoc, setDoc, deleteDoc, collection, getDocs, updateDoc, serverTimestamp,  
  query, where 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  MapPin, DollarSign, Users, CheckCircle, UserPlus, ChevronLeft, ChevronUp, Edit2, Trash2,
  MessageCircle, User, Briefcase, ArrowUpDown, Calendar 
} from 'lucide-react';
import MySnackbar from 'styles/snackers/MySnackbar';
import { setSnackbar, showSnackbar } from '../../styles/snackers/SnackbarUtils';
import { Avatar, Rating } from '@mui/material'; 

// פונקציה לחישוב התקדמות
const calculateProgress = (hired, total) => {
  if (total === 0) return 0;
  const progress = Math.round((hired / total) * 100);
  return Math.min(progress, 100); // הגבלת ההתקדמות ל-100%
};

export default function JobDetails({
  job,
  jobs,
  setJobs,
  onDeleteJob,
  onEditJob,
  onOpenChat,
  onMarkJobCompleted,
  setJobApplicants,
  goBack
}) {
  const snackbarRef = useRef();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [expandedWorker, setExpandedWorker] = useState(-1);
  const [currentJob, setCurrentJob] = useState(job);
  const [sortOrderDate, setSortOrderDate] = useState('asc'); // מצב מיון
  const [sortOrderRating, setSortOrderRating] = useState('desc'); // מצב מיון
  const [activeButton, setActiveButton] = useState('rating'); // שמירת כפתור פעיל

  const hiredCount = applicants.filter((applicant) => applicant.hired).length;
  const totalWorkers = job.workersNeeded || 1;
  const progressPercentage = calculateProgress(hiredCount, totalWorkers);

  const handleDelete = () => onDeleteJob(job.id);
  const handleEdit = () => onEditJob(job);
  const handleChat = () => onOpenChat(job);
  const handleComplete = () => onMarkJobCompleted(job.id);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const applicantsRef = collection(db, 'jobs', job.id, 'applicants');
        const applicantsSnapshot = await getDocs(applicantsRef);

        const applicantsData = await Promise.all(
          applicantsSnapshot.docs.map(async (applicantDoc) => {
            const applicantData = applicantDoc.data();
            const userDoc = await getDoc(doc(db, 'users', applicantData.applicantId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            return { ...applicantData, userData };
          })
        );

        const applicantIds = applicantsData.map(applicant => applicant.applicantId);
        const chunkSize = 10;
        const chunks = [];

        for (let i = 0; i < applicantIds.length; i += chunkSize) {
          chunks.push(applicantIds.slice(i, i + chunkSize));
        }

        let allRatings = [];

        for (const chunk of chunks) {
          const ratingsRef = collection(db, 'ratings');
          const ratingsQuery = query(ratingsRef, where('ratedUser', 'in', chunk));
          const ratingsSnapshot = await getDocs(ratingsQuery);
          const ratingsData = ratingsSnapshot.docs.map(doc => doc.data());
          allRatings = allRatings.concat(ratingsData);
        }

        const ratingsMap = allRatings.reduce((acc, rating) => {
          const userId = rating.ratedUser;
          if (!acc[userId]) acc[userId] = [];
          acc[userId].push(rating.rating);
          return acc;
        }, {});

        const applicantsWithRatings = applicantsData.map(applicant => {
          const ratings = ratingsMap[applicant.applicantId] || [];
          const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;
          return { ...applicant, rating: averageRating };
        });

        setApplicants(applicantsWithRatings);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
    };

    fetchApplicants();

    const updatedJob = jobs.find((j) => j.id === job.id);
    if (updatedJob) {
      setCurrentJob(updatedJob);
    }
    setSnackbar(snackbarRef.current);
  }, [jobs, job.id]);

  const handleToggleFullyStaffed = async (jobId) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      const currentJob = jobDoc.data();

      if (!currentJob) throw new Error('Job not found');

      const newIsFullyStaffed = !currentJob.isFullyStaffed;
      const updatedFields = { isFullyStaffed: newIsFullyStaffed };

      if (currentJob.hasOwnProperty('isPublic')) {
        updatedFields.isPublic = !newIsFullyStaffed;
      }

      await updateDoc(jobRef, updatedFields);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, ...updatedFields } : job
        )
      );

      showSnackbar(
        newIsFullyStaffed
          ? 'העבודה סומנה כמאוישת במלואה והוסרה מרשימת העבודות הפומביות'
          : 'העבודה סומנה חזרה כאינה מאוישת, וכעת מוצגת ברשימת העבודות',
        newIsFullyStaffed ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Error toggling fully staffed status:', error);
      alert('אירעה שגיאה בעת עדכון סטטוס האיוש של העבודה');
    }
  };

  const handleToggleHired = async (jobId, applicantId, currentHiredStatus) => {
    try {
      const applicantRef = doc(db, 'jobs', jobId, 'applicants', applicantId);
      const userAcceptedJobsRef = doc(db, 'users', applicantId, 'acceptedJobs', jobId);
      const userApplicationsRef = doc(db, 'users', applicantId, 'applications', jobId);

      if (!currentHiredStatus) {
        await updateDoc(applicantRef, { hired: true });
        await setDoc(userAcceptedJobsRef, { jobId, timestamp: serverTimestamp() });
        await deleteDoc(userApplicationsRef);
      } else {
        await updateDoc(applicantRef, { hired: false });
        await deleteDoc(userAcceptedJobsRef);
        await setDoc(userApplicationsRef, {
          jobId,
          timestamp: serverTimestamp(),
          status: 'applied',
        });
      }

      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.applicantId === applicantId
            ? { ...applicant, hired: !currentHiredStatus }
            : applicant
        )
      );

      setJobApplicants((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((applicant) =>
          applicant.applicantId === applicantId
            ? { ...applicant, hired: !currentHiredStatus }
            : applicant
        ),
      }));

      await addDoc(collection(db, 'notifications'), {
        userId: applicantId,
        jobId,
        jobTitle: currentJob.title || 'Unknown Job',
        type: currentHiredStatus ? 'hired_status_revoked' : 'hired_status_updated',
        message: currentHiredStatus
          ? `הסטטוס שלך למשרה: ${currentJob.title} בוטל.`
          : `התקבלת למשרה: ${currentJob.title}!`,
        timestamp: serverTimestamp(),
        isHistory: false,
      });

      showSnackbar(
        currentHiredStatus
          ? 'הסטטוס שונה - המועמד כבר לא התקבל למשרה.'
          : 'המועמד התקבל למשרה בהצלחה!',
        currentHiredStatus ? 'info' : 'success'
      );
    } catch (error) {
      console.error('Error updating hired status:', error);
      alert('אירעה שגיאה בעדכון הסטטוס.');
    }
  };

  const sortByDate = () => {
    const sortedApplicants = [...applicants].sort((a, b) => {
      const dateA = a.timestamp?.toDate() || new Date(0);
      const dateB = b.timestamp?.toDate() || new Date(0);
  
      return sortOrderDate === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
    setApplicants(sortedApplicants);
    setSortOrderDate(sortOrderDate === 'asc' ? 'desc' : 'asc'); // החלפת הסדר
    setActiveButton('date'); 
  };

  const sortByRating = () => {
    const sortedApplicants = [...applicants].sort((a, b) => {
      const weightA = (a.rating || 0) * 0.8 + (a.userData.jobsWorkedCount || 0) * 0.2;
      const weightB = (b.rating || 0) * 0.8 + (b.userData.jobsWorkedCount || 0) * 0.2;
  
      return sortOrderRating === 'asc' ? weightA - weightB : weightB - weightA;
    });
  
    setApplicants(sortedApplicants);
    setSortOrderRating(sortOrderRating === 'asc' ? 'desc' : 'asc'); // החלפת הסדר
    setActiveButton('rating'); 
  };

  return (
    <div className="w-full sm:max-w-md sm:mx-auto bg-white min-h-screen flex flex-col" dir="rtl">
      <header className="px-4 py-3 bg-[#4285f4] text-white flex items-center justify-between">
        <button onClick={goBack} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium flex-grow text-center">{currentJob.title}</h1>
        <div className="flex items-center">
          <button className="p-2" onClick={handleEdit}>
            <Edit2 className="w-5 h-5" />
          </button>
          <button className="p-2" onClick={handleDelete}>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-4 flex-grow">
        <p className="text-gray-600 mb-4">{currentJob.description}</p>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 ml-2" />
          <span>{currentJob.location}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <DollarSign className="w-4 h-4 ml-2" />
          <span>₪{currentJob.salary} לשעה</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 ml-2" />
          <span>{hiredCount} / {totalWorkers} עובדים</span>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">התקדמות המשימה</span>
            <span className="text-sm font-medium text-[#4285f4]">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#4285f4] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleToggleFullyStaffed(currentJob.id)}
            className={`w-full py-3 rounded-lg flex items-center justify-center 
              ${currentJob.isFullyStaffed ? 'bg-blue-500' : 'bg-amber-500'} text-white`}
          >
            {currentJob.isFullyStaffed ? (
              <User className="w-5 h-5 ml-2" />
            ) : (
              <UserPlus className="w-5 h-5 ml-2" />
            )}
            {currentJob.isFullyStaffed ? 'בטל איוש מלא' : 'סמן כמאויש'}
          </button>

          <button
            onClick={handleComplete}
            className="w-full py-3 bg-[#34A853] text-white rounded-lg flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 ml-2" />
            סיים עבודה ועבור לדירוג עובדים
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          <button
            className={`border px-3 py-1.5 rounded-lg flex items-center text-sm 
              ${activeButton === 'rating' ? 'border-blue-500' : 'border-gray-300'}`}            
            onClick={sortByRating}
          >
            <ArrowUpDown className="w-4 h-4 ml-1" />
            מיין לפי דירוג
          </button>
          <button
            className={`border px-3 py-1.5 rounded-lg flex items-center text-sm 
              ${activeButton === 'date' ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={sortByDate}
          >
            <Calendar className="w-4 h-4 ml-1" />
            מיין לפי תאריך
          </button>
        </div>

        <div className="space-y-4">
          {applicants.map((worker, index) => (
            <div key={worker.applicantId} className="bg-gray-50 rounded-lg shadow-sm">
              <div
                className="flex items-center p-3 cursor-pointer"
                onClick={() => setExpandedWorker(expandedWorker === index ? -1 : index)}
              >
                <Avatar
                  src={worker.userData?.profileURL || worker.userData?.photoURL}
                  alt={worker.userData?.name}
                  className="w-full h-full object-cover"
                />
                <div className="mr-3 flex-grow">
                  <h4 className="font-medium">{worker.userData?.name}</h4>
                  <div className="flex items-center mt-1">
                    <Rating
                      value={worker.rating || 0}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <span className="text-sm text-gray-600 mr-2">{worker.rating ? worker.rating.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
                <ChevronUp
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 
                    ${expandedWorker === index ? 'rotate-180' : ''}`}
                />

              </div>
              {expandedWorker === index && (
                <div className="px-3 pb-3 pt-1 flex gap-2">
                  <Link to={`/user/${worker.applicantId}`} style={{ textDecoration: 'none' }}>
                    <button 
                      className="border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center flex-1 text-sm"
                    >
                      <User className="w-4 h-4 ml-2" />
                      צפה בפרופיל
                    </button>
                  </Link>
                  <button
                    className={`px-4 py-2 rounded-lg flex items-center justify-center flex-1 text-sm border 
                      ${worker.hired ? 'bg-green-500 text-white' : 'bg-white text-gray-800 border-gray-300'}`}
                    onClick={() =>
                      handleToggleHired(currentJob.id, worker.applicantId, worker.hired)
                    }
                  >
                    {worker.hired ? (
                      <CheckCircle className="w-4 h-4 ml-2" />
                    ) : (
                      <Briefcase className="w-4 h-4 ml-2" />
                    )}
                    {worker.hired ? 'הועסק' : 'סמן כמועסק'}
                  </button>
                  <button 
                    onClick={handleChat}
                    className="border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center flex-1 text-sm"
                  >
                    <MessageCircle className="w-4 h-4 ml-2" />
                    צ'אט
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
      <MySnackbar ref={snackbarRef} />
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getDoc, doc, addDoc, setDoc, deleteDoc, collection, getDocs, updateDoc, serverTimestamp,  
  query, where 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  MapPin, DollarSign, Users, CheckCircle, UserPlus, ChevronLeft, ChevronUp, Edit2, Trash2,
  MessageCircle, User, Briefcase, ArrowUpDown, Calendar, Clock, Award, ChevronDown
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
    const [sortOrderDate, setSortOrderDate] = useState('asc');
    const [sortOrderRating, setSortOrderRating] = useState('desc');
    const [activeButton, setActiveButton] = useState('rating');
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
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
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header remains the same */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-100">
        <header className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={goBack} 
            className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {currentJob.title}
          </h1>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95"
              onClick={handleEdit}
            >
              <Edit2 className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              className="p-2 hover:bg-red-50 rounded-full transition-all duration-200 active:scale-95"
              onClick={handleDelete}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </header>
      </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Collapsible Job Details Section */}
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/20 border border-gray-100 mb-6
            backdrop-blur-xl bg-white/60 overflow-hidden">
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200"
            >
              <span className="font-semibold text-gray-800">לחץ לפרטי עבודה</span>
              {isDetailsExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {isDetailsExpanded && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 text-lg mb-6">{currentJob.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="w-5 h-5 ml-2 text-blue-500" />
                      <span className="text-sm text-gray-500">מיקום</span>
                    </div>
                    <span className="text-gray-800 font-medium">{currentJob.location}</span>
                  </div>
  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <DollarSign className="w-5 h-5 ml-2 text-green-500" />
                      <span className="text-sm text-gray-500">שכר לשעה</span>
                    </div>
                    <span className="text-gray-800 font-medium">₪{currentJob.salary}</span>
                  </div>
  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Users className="w-5 h-5 ml-2 text-purple-500" />
                      <span className="text-sm text-gray-500">עובדים</span>
                    </div>
                    <span className="text-gray-800 font-medium">{hiredCount} / {totalWorkers}</span>
                  </div>
  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Clock className="w-5 h-5 ml-2 text-amber-500" />
                      <span className="text-sm text-gray-500">סטטוס</span>
                    </div>
                    <span className="text-gray-800 font-medium">
                      {currentJob.isFullyStaffed ? 'מאויש' : 'פתוח'}
                    </span>
                  </div>
                </div>
  
                {/* Progress section */}
        
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-gray-800 font-semibold mb-1">התקדמות המשימה</h3>
                  <p className="text-sm text-gray-500">איוש משרות ומעקב</p>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 
                  bg-clip-text text-transparent">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-blue-400"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleToggleFullyStaffed(currentJob.id)}
              className={`w-full py-4 rounded-xl flex items-center justify-center transition-all duration-200
                shadow-lg active:scale-[0.99] font-medium text-base
                ${currentJob.isFullyStaffed 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-200' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-200'} text-white`}
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
              className="w-full py-4 rounded-xl flex items-center justify-center transition-all duration-200
                bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg shadow-green-200
                active:scale-[0.99] font-medium text-base"
            >
              <CheckCircle className="w-5 h-5 ml-2" />
              סיים עבודה ועבור לדירוג עובדים
            </button>
          </div>

          {/* Sort Section */}
          <div className="bg-white rounded-2xl p-4 shadow-lg shadow-blue-100/20 border border-gray-100 mb-6">
            <div className="flex gap-3">
            <button
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center transition-all
                ${activeButton === 'rating' 
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-600' 
                  : 'bg-white border border-gray-200 text-gray-700'}`}
              onClick={sortByRating}
            >
              <ArrowUpDown className="w-4 h-4 ml-2" />
              מיין לפי דירוג
            </button>
            <button
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center transition-all
                ${activeButton === 'date' 
                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-600' 
                  : 'bg-white border border-gray-200 text-gray-700'}`}
              onClick={sortByDate}
            >
              <Calendar className="w-4 h-4 ml-2" />
              מיין לפי תאריך
            </button>
            </div>
          </div>

          {/* Applicants List */}
          <div className="space-y-4">
            {applicants.map((worker, index) => (
              <div key={worker.applicantId} 
                className="group bg-white rounded-2xl shadow-lg shadow-blue-100/10 border border-gray-100 
                  overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-100/20">
                <div
                  className="flex items-center p-5 cursor-pointer"
                  onClick={() => setExpandedWorker(expandedWorker === index ? -1 : index)}
                >
                  <Avatar
                    src={worker.userData?.profileURL || worker.userData?.photoURL}
                    alt={worker.userData?.name}
                    className="w-14 h-14 rounded-full border-2 border-gray-100"
                  />
                  <div className="mr-4 flex-grow">
                    <h4 className="font-semibold text-gray-800 mb-1">{worker.userData?.name}</h4>
                    <div className="flex items-center">
                      <Rating
                        value={worker.rating || 0}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <span className="text-sm text-gray-500 mr-2 font-medium">
                        {worker.rating ? worker.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </div>
                  <ChevronUp
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:text-gray-600
                      ${expandedWorker === index ? 'rotate-180' : ''}`}
                  />
                </div>

                {expandedWorker === index && (
                  <div className="px-5 pb-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                    <Link 
                      to={`/user/${worker.applicantId}`} 
                      className="text-decoration-none"
                    >
                      <button className="w-full h-11 rounded-xl flex items-center justify-center
                        bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-gray-700 
                        text-sm font-medium active:scale-[0.98]">
                        <User className="w-4 h-4 ml-2" />
                        פרופיל
                      </button>
                    </Link>
                    
                    <button
                      className={`w-full h-11 rounded-xl flex items-center justify-center
                        transition-all duration-200 text-sm font-medium active:scale-[0.98]
                        ${worker.hired 
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200/50' 
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
                      onClick={() => handleToggleHired(currentJob.id, worker.applicantId, worker.hired)}
                    >
                      {worker.hired ? (
                        <CheckCircle className="w-4 h-4 ml-2" />
                      ) : (
                        <Briefcase className="w-4 h-4 ml-2" />
                      )}
                      {worker.hired ? 'הועסק' : 'העסק'}
                    </button>

                    <button 
                      onClick={handleChat}
                      className="w-full h-11 rounded-xl flex items-center justify-center
                        bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-gray-700 
                        text-sm font-medium active:scale-[0.98]"
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
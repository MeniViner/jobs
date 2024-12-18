// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getDoc, doc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import {
//   MapPin, DollarSign, Users, CheckCircle, UserPlus, Star, ChevronLeft, ChevronUp, Edit2, Trash2,
//   MessageCircle, User, Briefcase, ArrowUpDown, Calendar
// } from 'lucide-react';

// export default function JobDetails({ onDeleteJob, onMarkJobCompleted, onOpenChat, onEditJob }) {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [job, setJob] = useState(null);
//   const [applicants, setApplicants] = useState([]);
//   const [expandedWorker, setExpandedWorker] = useState(-1);

//   useEffect(() => {
//     const fetchJobAndApplicants = async () => {
//       try {
//         const jobRef = doc(db, 'jobs', id);
//         const jobDoc = await getDoc(jobRef);

//         if (jobDoc.exists()) {
//           setJob({ id: jobDoc.id, ...jobDoc.data() });

//           const applicantsRef = collection(db, 'jobs', id, 'applicants');
//           const applicantsSnapshot = await getDocs(applicantsRef);

//           const applicantsData = await Promise.all(
//             applicantsSnapshot.docs.map(async (applicantDoc) => {
//               const applicantData = applicantDoc.data();
//               const userDoc = await getDoc(doc(db, 'users', applicantData.applicantId));
//               const userData = userDoc.exists() ? userDoc.data() : {};
//               return { ...applicantData, userData };
//             })
//           );

//           setApplicants(applicantsData);
//         } else {
//           navigate('/');
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     };

//     fetchJobAndApplicants();
//   }, [id, navigate]);

//   const handleDelete = async () => {
//     try {
//       await deleteDoc(doc(db, 'jobs', id));
//       onDeleteJob(id);
//       navigate('/');
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const toggleCompletion = async () => {
//     try {
//       const newStatus = !job?.isCompleted;
//       await updateDoc(doc(db, 'jobs', id), { isCompleted: newStatus });
//       setJob((prev) => ({ ...prev, isCompleted: newStatus }));
//       onMarkJobCompleted(id);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const toggleNeedWorkers = async () => {
//     try {
//       const newStatus = !job?.needWorkers;
//       await updateDoc(doc(db, 'jobs', id), { needWorkers: newStatus });
//       setJob((prev) => ({ ...prev, needWorkers: newStatus }));
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleEditJob = () => {
//     navigate(`/edit-job/${id}`);
//   };

//   if (!job) return null;

//   const hiredCount = applicants.filter((applicant) => applicant.hired).length;
//   const totalWorkers = job.workersNeeded || 1;
//   const progressPercentage = Math.round((hiredCount / totalWorkers) * 100);

//   return (
//     <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col" dir="rtl">
//       {/* Header */}
//       <header className="px-4 py-3 bg-[#4285f4] text-white flex items-center justify-between">
//         <button onClick={() => navigate(-1)} className="p-2">
//           <ChevronLeft className="w-6 h-6" />
//         </button>
//         <h1 className="text-lg font-medium flex-grow text-center">{job.title}</h1>
//         <div className="flex items-center">
//           <button className="p-2" onClick={handleEditJob}>
//             <Edit2 className="w-5 h-5" />
//           </button>
//           <button onClick={handleDelete} className="p-2">
//             <Trash2 className="w-5 h-5" />
//           </button>
//         </div>
//       </header>

//       {/* Content */}
//       <div className="p-4 flex-grow">
//         <p className="text-gray-600 mb-4">{job.description}</p>

//         <div className="flex items-center text-gray-600 mb-2">
//           <MapPin className="w-4 h-4 ml-2" />
//           <span>{job.location}</span>
//         </div>

//         <div className="flex items-center text-gray-600 mb-2">
//           <DollarSign className="w-4 h-4 ml-2" />
//           <span>₪{job.salary} לשעה</span>
//         </div>

//         <div className="flex items-center text-gray-600">
//           <Users className="w-4 h-4 ml-2" />
//           <span>{hiredCount} / {totalWorkers} עובדים</span>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-6">
//           <div className="flex justify-between items-center mb-2">
//             <span className="text-sm font-medium text-gray-700">התקדמות המשימה</span>
//             <span className="text-sm font-medium text-[#4285f4]">{progressPercentage}%</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-[#4285f4] h-2 rounded-full transition-all duration-300"
//               style={{ width: `${progressPercentage}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="space-y-3 mb-8">
//           <button
//             onClick={toggleNeedWorkers}
//             className="w-full py-3 bg-[#F4B940] text-white rounded-lg flex items-center justify-center"
//           >
//             <UserPlus className="w-5 h-5 ml-2" />
//             כרגע לא צריך עוד עובדים
//           </button>

//           <button
//             onClick={toggleCompletion}
//             className="w-full py-3 bg-[#34A853] text-white rounded-lg flex items-center justify-center"
//           >
//             <CheckCircle className="w-5 h-5 ml-2" />
//             סיים עבודה ועבור לדירוג עובדים
//           </button>
//         </div>

//         {/* Sort Buttons */}
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-medium">רשימת מועמדים</h3>
//           <div className="flex gap-2">
//             <button className="border border-gray-300 px-3 py-1.5 rounded-lg flex items-center text-sm">
//               <ArrowUpDown className="w-4 h-4 ml-1" />
//               מיין לפי דירוג
//             </button>
//             <button className="border border-gray-300 px-3 py-1.5 rounded-lg flex items-center text-sm">
//               <Calendar className="w-4 h-4 ml-1" />
//               מיין לפי תאריך
//             </button>
//           </div>
//         </div>

//         <div className="space-y-4">
//           {applicants.map((worker, index) => (
//             <div key={worker.applicantId} className="bg-gray-50 rounded-lg shadow-sm">
//               <div
//                 className="flex items-center p-3 cursor-pointer"
//                 onClick={() => setExpandedWorker(expandedWorker === index ? -1 : index)}
//               >
//                 <div className="w-12 h-12 rounded-full border-2 border-[#4285f4] overflow-hidden">
//                   <img
//                     src={worker.userData?.photoURL || '/api/placeholder/100/100'}
//                     alt={worker.userData?.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="mr-3 flex-grow">
//                   <h4 className="font-medium">{worker.userData?.name}</h4>
//                   <div className="flex items-center mt-1">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`w-4 h-4 ${
//                           i < Math.floor(worker.rating) ? 'text-yellow-400' : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                     <span className="text-sm text-gray-600 mr-2">{worker.rating}</span>
//                   </div>
//                 </div>
//                 <ChevronUp
//                   className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
//                     expandedWorker === index ? 'rotate-180' : ''
//                   }`}
//                 />
//               </div>
//               {expandedWorker === index && (
//                 <div className="px-3 pb-3 pt-1 flex gap-2">
//                   <button className="border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center flex-1 text-sm">
//                     <User className="w-4 h-4 ml-2" />
//                     צפה בפרופיל
//                   </button>
//                   <button className="border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center flex-1 text-sm">
//                     <Briefcase className="w-4 h-4 ml-2" />
//                     העסק עובד
//                   </button>
//                   <button className="border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center flex-1 text-sm">
//                     <MessageCircle className="w-4 h-4 ml-2" />
//                     צ'אט
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

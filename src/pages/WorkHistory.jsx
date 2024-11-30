import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';


export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [authLoading, user, navigate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const q = query(jobsCollection, where('isCompleted', '==', true)); // Fetch only completed jobs
      const jobsSnapshot = await getDocs(q);
      const jobsData = jobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(jobsData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-50 to-indigo-100">
      <h4 className="text font-bold text-center text-indigo-900 mb-6">היסטוריית מועמדויות (?)</h4>
      <h1 className="text-2xl font-bold text-center text-indigo-900 mb-6">היסטוריית העבודות שלי</h1>

      <div className="grid grid-cols-1 gap-4">
        {history.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-indigo-800">{job.title}</h2>
              <span className="text-sm bg-green-100 text-green-600 py-1 px-3 rounded-full">
                {'להוסיף כאן משהו'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{job.location} • ₪{job.salary}/שעה</p>
            <p className="text-sm text-gray-600">
                הושלמה בתאריך {new Date(job.completedAt.toDate()).toLocaleDateString('he-IL')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

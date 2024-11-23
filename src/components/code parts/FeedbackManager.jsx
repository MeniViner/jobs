import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getFirestore, collection, addDoc, getDocs, query, 
  orderBy, serverTimestamp, doc, getDoc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Custom Button Component
const Button = ({ children, variant = 'primary', className = '', disabled = false, onClick }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    archive: "bg-amber-50 text-amber-600 hover:bg-amber-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Custom Input Component
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${className}`}
    {...props}
  />
);

// Custom Textarea Component
const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none ${className}`}
    {...props}
  />
);

// Archive Modal Component
const ArchiveModal = ({ isOpen, onClose, onConfirm, feedbackData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold text-right mb-4">העבר לארכיון</h3>
        <p className="text-gray-600 text-right mb-6">
          האם אתה בטוח שברצונך להעביר את המשוב הזה לארכיון? 
          ניתן יהיה לצפות בו בכל עת בחלק הארכיון.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="archive" onClick={() => {
            onConfirm();
            onClose();
          }}>
            העבר לארכיון
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold text-right mb-4">מחיקת משוב</h3>
        <p className="text-gray-600 text-right mb-6">
          האם אתה בטוח שברצונך למחוק את המשוב הזה? 
          פעולה זו היא בלתי הפיכה ולא ניתן יהיה לשחזר את המידע.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="danger" onClick={() => {
            onConfirm();
            onClose();
          }}>
            מחק משוב
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Component to Send Feedback
export const SendFeedback = () => {
  const [message, setMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        message,
        userId: user?.uid || 'אנונימי',
        timestamp: serverTimestamp(),
        isArchived: false,
      });
      setMessage('');
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-right">שתף אותנו במה שיש לך לומר</h2>
        <div className="space-y-4">
          <Textarea
            rows={5}
            className="text-right"
            placeholder="כתוב כאן את המשוב שלך..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              disabled={!message.trim() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  שולח...
                </>
              ) : 'שלח משוב'}
            </Button>
          </div>
          <AnimatePresence>
            {feedbackSent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 text-green-600 p-3 rounded-lg text-right"
              >
                תודה על המשוב! הודעתך נשלחה בהצלחה.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('he-IL', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

// Component to Manage Feedbacks in Admin Panel
export const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [view, setView] = useState('active'); // 'active' or 'archived'
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        const feedbackSnapshot = await getDocs(feedbackQuery);

        const feedbackList = await Promise.all(
          feedbackSnapshot.docs.map(async (doc) => {
            const feedbackData = doc.data();
            const userData = await fetchUserData(feedbackData.userId);

            const timestamp = feedbackData.timestamp?.toDate
              ? feedbackData.timestamp.toDate()
              : new Date(feedbackData.timestamp);

            return {
              id: doc.id,
              ...feedbackData,
              timestamp,
              user: userData,
            };
          })
        );

        setFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async (userId) => {
      if (!userId || userId === 'אנונימי') {
        return { name: 'משתמש אנונימי', profileURL: '/placeholder.svg' };
      }

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          return {
            name: userData.name || 'משתמש ללא שם',
            profileURL: userData.profileURL || userData.photoURL,
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      return { name: 'משתמש לא ידוע', profileURL: '/placeholder.svg' };
    };

    fetchFeedbacks();
  }, [db]);

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      (feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      feedback.isArchived === (view === 'archived')
  );

  const moveToArchive = async (id) => {
    try {
      const feedbackRef = doc(db, 'feedback', id);
      await updateDoc(feedbackRef, { isArchived: true });
      setFeedbacks(feedbacks.map((fb) => fb.id === id ? { ...fb, isArchived: true } : fb));
    } catch (error) {
      console.error('Error moving to archive:', error);
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const FeedbackItem = ({ feedback }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={feedback.user.profileURL}
                alt={feedback.user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              />
              {!feedback.isArchived && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{feedback.user.name}</h3>
              <button
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                onClick={() => navigate(`/user/${feedback.userId}`)}
              >
                הצג פרופיל
              </button>
            </div>
          </div>
          <span className="text-sm text-gray-400">{formatDate(feedback.timestamp)}</span>
        </div>
        
        <p className="mt-4 text-gray-700 text-right leading-relaxed">
          {feedback.message}
        </p>

        <div className="flex justify-end gap-2 mt-4">
          {!feedback.isArchived && (
            <Button
              variant="archive"
              onClick={() => {
                setSelectedFeedback(feedback);
                setShowArchiveModal(true);
              }}
            >
              העבר לארכיון
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => {
              setSelectedFeedback(feedback);
              setShowDeleteModal(true);
            }}
          >
            מחק
          </Button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-right mb-6">משוב משתמשים</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant={view === 'active' ? 'primary' : 'secondary'}
              onClick={() => setView('active')}
            >
              משובים פעילים
            </Button>
            <Button
              variant={view === 'archived' ? 'primary' : 'secondary'}
              onClick={() => setView('archived')}
            >
              ארכיון
            </Button>
          </div>
          <div className="relative flex-1 max-w-md mr-4">
            <Input
              className="pr-10 text-right"
              placeholder="חפש לפי משתמש או תוכן ההודעה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">
              {searchTerm ? 'לא נמצאו תוצאות' : view === 'active' ? 'אין משובים פעילים' : 'אין משובים בארכיון'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'נסה לחפש מילות מפתח אחרות'
                : view === 'active'
                  ? 'כרגע אין משובים פעילים במערכת'
                  : 'כרגע אין משובים בארכיון'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFeedbacks.map((feedback) => (
                <FeedbackItem
                  key={feedback.id}
                  feedback={feedback}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Archive Confirmation Modal */}
      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={() => {
          if (selectedFeedback) {
            moveToArchive(selectedFeedback.id);
          }
        }}
        feedbackData={selectedFeedback}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (selectedFeedback) {
            deleteFeedback(selectedFeedback.id);
          }
        }}
      />
    </div>
  );
};
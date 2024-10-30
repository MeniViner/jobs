import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { getAuth } from 'firebase/auth';

const jobTypes = [
  'משרה מלאה',
  'משרה חלקית',
  'עבודה זמנית',
  'פרילנס',
  'התמחות'
];

export default function PostJob() {
  const [authLoading, setAuthLoading] = useState(true);
  const [jobData, setJobData] = useState({
    title: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    fullDescription: '',
    startTime: '',
    endTime: '',
    workDates: [''],
    workersNeeded: 1,
    requiresCar: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [businessName, setBusinessName] = useState('');
  const [businessLoading, setBusinessLoading] = useState(true);
  const [isFlexibleTime, setIsFlexibleTime] = useState(false);
  const [isFlexibleDates, setIsFlexibleDates] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showValidationError, setShowValidationError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchBusinessName();
      } else {
        navigate('/login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchBusinessName = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const employerDoc = await getDoc(doc(db, 'employers', user.uid));
        if (employerDoc.exists()) {
          const companyName = employerDoc.data().companyName;
          setBusinessName(companyName);
          setJobData(prevData => ({
            ...prevData,
            companyName: companyName
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching business name:", error);
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked :
        name === 'workersNeeded' ? Math.max(1, parseInt(value) || 1) :
          value
    }));
  };

  const handleDateChange = (value, index) => {
    const newWorkDates = [...jobData.workDates];
    newWorkDates[index] = value;
    setJobData(prevData => ({
      ...prevData,
      workDates: newWorkDates
    }));
  };

  const addWorkDate = () => {
    setJobData(prevData => ({
      ...prevData,
      workDates: [...prevData.workDates, '']
    }));
  };

  const removeWorkDate = (index) => {
    setJobData(prevData => ({
      ...prevData,
      workDates: prevData.workDates.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      setShowValidationError(true);
      return;
    }

    try {
      const user = getAuth().currentUser;
      if (!user) {
        setSnackbar({ open: true, message: 'יש להתחבר כדי לפרסם משרה', severity: 'error' });
        return;
      }

      const jobToSubmit = {
        ...jobData,
        requiresCar: jobData.requiresCar || false,
        employerId: user.uid,
        companyName: businessName,
        isFlexibleTime,
        isFlexibleDates,
        workDates: isFlexibleDates ? [] : jobData.workDates.filter(date => date),
      };

      await addDoc(collection(db, 'jobs'), {
        ...jobToSubmit,
        postedBy: user.uid
      });
      
      setSnackbar({ open: true, message: 'המשרה פורסמה בהצלחה!', severity: 'success' });
      navigate('/my-published-jobs');
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbar({ open: true, message: `אירעה שגיאה בפרסום המשרה: ${error.message}`, severity: 'error' });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return jobData.title && jobData.type;
      case 2:
        return jobData.location && jobData.salary;
      case 3:
        if (!isFlexibleTime && (!jobData.startTime || !jobData.endTime)) return false;
        if (!isFlexibleDates && jobData.workDates.some(date => !date)) return false;
        return true;
      case 4:
        return jobData.description && jobData.workersNeeded;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);
    setCurrentStep(prev => prev + 1);
  };

  const goToPrevStep = () => {
    setShowValidationError(false);
    setCurrentStep(prev => prev - 1);
  };

  if (authLoading || businessLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          {currentStep > 1 ? (
            <button 
              onClick={goToPrevStep}
              className="text-blue-500 text-lg font-medium"
            >
              חזור
            </button>
          ) : (
            <div className="w-16"></div>
          )}
          
          <div className="text-base font-semibold">
            משרה חדשה {currentStep}/4
          </div>
          
          <div className="w-16"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="pt-16 pb-20">
        <div className="max-w-md mx-auto">
          {currentStep === 1 && (
            <div className="space-y-6 p-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-800">כותרת המשרה</label>
                <p className="text-xs text-gray-500">לדוגמה: מלצר/ית למסעדה איטלקית</p>
                <input
                  type="text"
                  placeholder="הכנס/י כותרת"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                  required
                />
              </div>

              <div className="space-y-1 relative">
                <label className="block text-sm font-medium text-gray-800">סוג משרה</label>
                <p className="text-xs text-gray-500">בחר/י את סוג המשרה המתאים</p>
                <div className="relative">
                  <CustomSelect
                    options={jobTypes}
                    selectedOption={jobData.type}
                    onSelect={(value) => setJobData({ ...jobData, type: value })}
                    placeholder="בחר/י סוג משרה"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 p-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-800">מיקום</label>
                <p className="text-xs text-gray-500">ציין/י את מיקום המשרה</p>
                <input
                  type="text"
                  placeholder="עיר או כתובת"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-800">שכר לשעה (₪)</label>
                <p className="text-xs text-gray-500">הכנס/י את השכר המוצע לשעה</p>
                <input
                  type="number"
                  placeholder="לדוגמה: 50"
                  name="salary"
                  value={jobData.salary}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 p-4">
              {/* Flexible Time */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">שעות גמישות</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlexibleTime}
                      onChange={() => setIsFlexibleTime(!isFlexibleTime)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600">
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-full"></div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">בחר/י אם שעות העבודה גמישות</p>

                {!isFlexibleTime && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-800">שעת התחלה</label>
                      <input
                        type="time"
                        name="startTime"
                        value={jobData.startTime}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                        required={!isFlexibleTime}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-800">שעת סיום</label>
                      <input
                        type="time"
                        name="endTime"
                        value={jobData.endTime}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                        required={!isFlexibleTime}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Flexible Dates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">תאריכים גמישים</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlexibleDates}
                      onChange={() => setIsFlexibleDates(!isFlexibleDates)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600">
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-full"></div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">בחר/י אם תאריכי העבודה גמישים</p>

                {!isFlexibleDates && (
                  <div className="space-y-4">
                    {jobData.workDates.map((date, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => handleDateChange(e.target.value, index)}
                          className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                          required={!isFlexibleDates}
                        />
                        {jobData.workDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWorkDate(index)}
                            className="ml-2 p-2 text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addWorkDate}
                      className="w-full h-12 border border-blue-500 text-blue-500 rounded-lg font-medium text-base"
                    >
                      + הוסף תאריך
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 p-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-800">תיאור קצר</label>
                <p className="text-xs text-gray-500">תאר/י את המשרה בקצרה</p>
                <textarea
                  placeholder="הכנס/י תיאור קצר"
                  name="description"
                  value={jobData.description}
                  onChange={handleChange}
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-800">פירוט נוסף (אופציונלי)</label>
                <p className="text-xs text-gray-500">הוסף/י מידע נוסף על המשרה</p>
                <textarea
                  placeholder="הכנס/י פירוט נוסף"
                  name="fullDescription"
                  value={jobData.fullDescription}
                  onChange={handleChange}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">דרוש רכב</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobData.requiresCar}
                      onChange={(e) => setJobData({ ...jobData, requiresCar: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600">
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-full"></div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">סמן/י אם המשרה דורשת רכב</p>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-800">מספר עובדים נדרש</label>
                  <p className="text-xs text-gray-500">ציין/י כמה עובדים נדרשים למשרה</p>
                  <input
                    type="number"
                    name="workersNeeded"
                    value={jobData.workersNeeded}
                    onChange={handleChange}
                    min="1"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
          {showValidationError && (
            <div className="mb-2 text-red-500 text-center">
              נא למלא את כל השדות הנדרשים לפני המשך.
            </div>
          )}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className={`w-full h-12 rounded-lg text-white font-medium text-lg ${
                validateStep(currentStep) ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              המשך
            </button>
          ) : (
            <button
              type="submit"
              className={`w-full h-12 rounded-lg text-white font-medium text-lg ${
                validateStep(currentStep) ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              פרסם משרה
            </button>
          )}
        </div>
      </form>

      {/* Snackbar */}
      {snackbar.open && (
        <div 
          className={`fixed bottom-24 left-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            snackbar.severity === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <p className="text-white text-center text-base">{snackbar.message}</p>
        </div>
      )}
    </div>
  );
}

// Custom Select Component
function CustomSelect({ options, selectedOption, onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef();

  const handleOptionClick = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-base flex items-center justify-between"
      >
        <span>{selectedOption || placeholder}</span>
        <svg className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 14a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L10 11.586l4.293-4.293a1 1 0 011.414 1.414l-5 5A1 1 0 0110 14z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

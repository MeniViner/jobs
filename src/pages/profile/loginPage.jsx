// LoginPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged
} from 'firebase/auth';
import {
  getDoc, setDoc, doc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { MapPin, Phone, Briefcase, Star, User } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon from react-icons

const LoginPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    age: '',
    experience: '',
    expertise: '',
    phoneNumber: '',
  });
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('login');
  const [userType, setUserType] = useState('');

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        checkUserExists(firebaseUser);
      } else {
        setUser(null);
        setIsNewUser(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const checkUserExists = async (firebaseUser) => {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User exists, redirect to home page
        navigate('/');
      } else {
        // New user, show profile completion form
        setUser(firebaseUser);
        setIsNewUser(true);
        setStep('completeProfile');
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      setError('An error occurred while checking user existence.');
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('An error occurred during Google sign-in.');
      setIsLoading(false);
    }
  };

  const handleUserTypeContinue = () => {
    if (userType) {
      handleGoogleSignIn();
    } else {
      setError('Please select an account type.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        ...formData,
        isEmployer: userType === 'employer',
        isEmployee: userType === 'teenager',
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      navigate('/');
    } catch (error) {
      console.error('Error creating user profile:', error);
      setError('An error occurred while creating your profile.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {!user && step === 'login' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    WorkMatch
                  </h1>
                  <p className="mt-2 text-gray-600">
                  ההזדמנות שלך למצוא את המשרות או העובדים הטובים ביותר
                  </p>
                </div>

                <button
                  onClick={() => setStep('selectUserType')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                יצירת חשבון חדש               
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">יש לך כבר חשבון?</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <FcGoogle className="w-5 h-5" />
                  <span className="font-medium">התחבר עם Google</span>
                </button>
              </div>
            )}

            {step === 'selectUserType' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  בחר את הדרך שלך
                  </h1>
                  <p className="mt-2 text-gray-600">
                  בחר את סוג החשבון שמתאר אותך בצורה הטובה ביותר
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setUserType('teenager')}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                      userType === 'teenager'
                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          userType === 'teenager'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">אני עובד</h3>
                        <p className="mt-1 text-sm text-gray-500">
                        מחפש הזדמנויות עבודה והבנת הזכויות שלי                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setUserType('employer')}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                      userType === 'employer'
                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          userType === 'employer'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">אני מעסיק</h3>
                        <p className="mt-1 text-sm text-gray-500">
                        מעוניין להעסיק עובדים לעסק שלי
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleUserTypeContinue}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!userType}
                >
                  המשך
                  {userType === 'teenager'
                    ? 'כעובד'
                    : userType === 'employer'
                    ? 'כמעסיק'
                    : ''}
                </button>

                <button
                  onClick={() => setStep('login')}
                  className="w-full text-gray-600 text-sm hover:text-gray-900"
                >
                  חזרה לכניסה
                </button>
              </div>
            )}

            {user && isNewUser && step === 'completeProfile' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    השלם את הפרופיל שלך
                  </h1>
                  <p className="mt-2 text-gray-600">ספר לנו עוד על עצמך</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      placeholder="מיקום"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="age"
                      placeholder="גיל"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="experience"
                      placeholder="התמחאות"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Star className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="expertise"
                      placeholder="ניסיון"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="מספר טלפון"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200"
                  >
                    יצירת חשבון
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;


// LoginPage.js

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged
// } from 'firebase/auth';
// import {
//   getDoc, setDoc, doc
// } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { MapPin, Phone, Briefcase, Star, User } from 'lucide-react';
// import { FcGoogle } from 'react-icons/fc'; // ייבוא האייקון של Google

// const LoginPage = () => {
//   const [user, setUser] = useState(null);
//   const [formData, setFormData] = useState({
//     location: '',
//     age: '',
//     experience: '',
//     expertise: '',
//     phoneNumber: '',
//   });
//   const [isNewUser, setIsNewUser] = useState(false);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [step, setStep] = useState('login');
//   const [userType, setUserType] = useState('');

//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         checkUserExists(firebaseUser);
//       } else {
//         setUser(null);
//         setIsNewUser(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [auth]);

//   const checkUserExists = async (firebaseUser) => {
//     setIsLoading(true);
//     try {
//       const userDocRef = doc(db, 'users', firebaseUser.uid);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         // המשתמש קיים, ניתוב לעמוד הבית
//         navigate('/');
//       } else {
//         // משתמש חדש, הצגת טופס השלמת פרופיל
//         setUser(firebaseUser);
//         setIsNewUser(true);
//         setStep('completeProfile');
//       }
//     } catch (error) {
//       console.error('Error checking user existence:', error);
//       setError('אירעה שגיאה בבדיקת קיום המשתמש.');
//     }
//     setIsLoading(false);
//   };

//   const handleGoogleSignIn = async () => {
//     setIsLoading(true);
//     const provider = new GoogleAuthProvider();
//     try {
//       await signInWithPopup(auth, provider);
//       // onAuthStateChanged יטפל בשאר
//     } catch (error) {
//       console.error('Error signing in with Google:', error);
//       setError('אירעה שגיאה בהתחברות עם Google.');
//       setIsLoading(false);
//     }
//   };

//   const handleUserTypeContinue = () => {
//     if (userType) {
//       handleGoogleSignIn();
//     } else {
//       setError('אנא בחר סוג חשבון.');
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const userData = {
//         uid: user.uid,
//         email: user.email,
//         name: user.displayName,
//         photoURL: user.photoURL,
//         ...formData,
//         isEmployer: userType === 'employer',
//         isEmployee: userType === 'teenager',
//         createdAt: new Date(),
//       };

//       await setDoc(doc(db, 'users', user.uid), userData);
//       navigate('/');
//     } catch (error) {
//       console.error('Error creating user profile:', error);
//       setError('אירעה שגיאה ביצירת הפרופיל.');
//     }
//     setIsLoading(false);
//   };

//   // הגדרת סגנונות בתוך הרכיב
//   const styles = {
//     container: {
//       minHeight: '100vh',
//       background: 'linear-gradient(to bottom, #F9FAFB, #FFFFFF)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '0 1rem',
//     },
//     card: {
//       width: '100%',
//       maxWidth: '28rem',
//     },
//     loadingSpinner: {
//       display: 'flex',
//       justifyContent: 'center',
//     },
//     spinner: {
//       width: '2rem',
//       height: '2rem',
//       border: '2px solid #3B82F6',
//       borderTopColor: 'transparent',
//       borderRadius: '50%',
//       animation: 'spin 1s linear infinite',
//     },
//     errorMessage: {
//       marginBottom: '1.5rem',
//       padding: '1rem',
//       backgroundColor: '#FEF2F2',
//       border: '1px solid #FECACA',
//       color: '#DC2626',
//       borderRadius: '0.75rem',
//       fontSize: '0.875rem',
//     },
//     // הוספת סגנונות נוספים לפי הצורך
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         {isLoading ? (
//           <div style={styles.loadingSpinner}>
//             <div style={styles.spinner}></div>
//           </div>
//         ) : (
//           <>
//             {error && (
//               <div style={styles.errorMessage}>
//                 {error}
//               </div>
//             )}

//             {!user && step === 'login' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <h1 style={{
//                     fontSize: '1.875rem',
//                     fontWeight: 'bold',
//                     background: 'linear-gradient(to right, #2563EB, #4F46E5)',
//                     WebkitBackgroundClip: 'text',
//                     color: 'transparent'
//                   }}>
//                     WorkMatch
//                   </h1>
//                   <p style={{ marginTop: '0.5rem', color: '#4B5563' }}>
//                     ההזדמנות שלך למצוא את המשרות או העובדים הטובים ביותר
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => setStep('selectUserType')}
//                   style={{
//                     width: '100%',
//                     backgroundColor: '#2563EB',
//                     color: '#FFFFFF',
//                     padding: '0.75rem 1.5rem',
//                     borderRadius: '0.75rem',
//                     transition: 'background-color 0.2s',
//                     fontWeight: '500',
//                     cursor: 'pointer',
//                   }}
//                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
//                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
//                 >
//                   יצירת חשבון חדש
//                 </button>

//                 <div style={{ position: 'relative' }}>
//                   <div style={{
//                     position: 'absolute',
//                     inset: '0',
//                     display: 'flex',
//                     alignItems: 'center',
//                   }}>
//                     <div style={{ width: '100%', borderTop: '1px solid #E5E7EB' }}></div>
//                   </div>
//                   <div style={{
//                     position: 'relative',
//                     display: 'flex',
//                     justifyContent: 'center',
//                     fontSize: '0.875rem',
//                   }}>
//                     <span style={{
//                       padding: '0 0.5rem',
//                       backgroundColor: '#FFFFFF',
//                       color: '#6B7280'
//                     }}>יש לך כבר חשבון?</span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleGoogleSignIn}
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '0.75rem',
//                     backgroundColor: '#FFFFFF',
//                     border: '1px solid #E5E7EB',
//                     color: '#374151',
//                     padding: '0.75rem 1.5rem',
//                     borderRadius: '0.75rem',
//                     transition: 'background-color 0.2s',
//                     fontWeight: '500',
//                     cursor: 'pointer',
//                   }}
//                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
//                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
//                 >
//                   <FcGoogle style={{ width: '1.25rem', height: '1.25rem' }} />
//                   <span>התחבר עם Google</span>
//                 </button>
//               </div>
//             )}

//             {step === 'selectUserType' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <h1 style={{
//                     fontSize: '1.875rem',
//                     fontWeight: 'bold',
//                     background: 'linear-gradient(to right, #2563EB, #4F46E5)',
//                     WebkitBackgroundClip: 'text',
//                     color: 'transparent'
//                   }}>
//                     בחר את הדרך שלך
//                   </h1>
//                   <p style={{ marginTop: '0.5rem', color: '#4B5563' }}>
//                     בחר את סוג החשבון שמתאר אותך בצורה הטובה ביותר
//                   </p>
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                   <button
//                     onClick={() => setUserType('teenager')}
//                     style={{
//                       width: '100%',
//                       padding: '1rem',
//                       borderRadius: '0.75rem',
//                       border: '1px solid',
//                       borderColor: userType === 'teenager' ? '#BFDBFE' : '#E5E7EB',
//                       backgroundColor: userType === 'teenager' ? '#EFF6FF' : '#FFFFFF',
//                       textAlign: 'left',
//                       transition: 'all 0.2s',
//                       boxShadow: userType === 'teenager' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
//                       <div
//                         style={{
//                           padding: '0.5rem',
//                           borderRadius: '0.5rem',
//                           backgroundColor: userType === 'teenager' ? '#2563EB' : '#F3F4F6',
//                           color: userType === 'teenager' ? '#FFFFFF' : '#6B7280',
//                         }}
//                       >
//                         <User style={{ width: '1.5rem', height: '1.5rem' }} />
//                       </div>
//                       <div>
//                         <h3 style={{ fontWeight: '600', color: '#111827' }}>אני עובד</h3>
//                         <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
//                           מחפש הזדמנויות עבודה והבנת הזכויות שלי
//                         </p>
//                       </div>
//                     </div>
//                   </button>

//                   <button
//                     onClick={() => setUserType('employer')}
//                     style={{
//                       width: '100%',
//                       padding: '1rem',
//                       borderRadius: '0.75rem',
//                       border: '1px solid',
//                       borderColor: userType === 'employer' ? '#BFDBFE' : '#E5E7EB',
//                       backgroundColor: userType === 'employer' ? '#EFF6FF' : '#FFFFFF',
//                       textAlign: 'left',
//                       transition: 'all 0.2s',
//                       boxShadow: userType === 'employer' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
//                       <div
//                         style={{
//                           padding: '0.5rem',
//                           borderRadius: '0.5rem',
//                           backgroundColor: userType === 'employer' ? '#2563EB' : '#F3F4F6',
//                           color: userType === 'employer' ? '#FFFFFF' : '#6B7280',
//                         }}
//                       >
//                         <Briefcase style={{ width: '1.5rem', height: '1.5rem' }} />
//                       </div>
//                       <div>
//                         <h3 style={{ fontWeight: '600', color: '#111827' }}>אני מעסיק</h3>
//                         <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
//                           מעוניין להעסיק עובדים לעסק שלי
//                         </p>
//                       </div>
//                     </div>
//                   </button>
//                 </div>

//                 <button
//                   onClick={handleUserTypeContinue}
//                   style={{
//                     width: '100%',
//                     backgroundColor: userType ? '#2563EB' : '#93C5FD',
//                     color: '#FFFFFF',
//                     padding: '0.75rem 1.5rem',
//                     borderRadius: '0.75rem',
//                     transition: 'background-color 0.2s',
//                     fontWeight: '500',
//                     cursor: userType ? 'pointer' : 'not-allowed',
//                   }}
//                   disabled={!userType}
//                   onMouseEnter={(e) => {
//                     if (userType) e.currentTarget.style.backgroundColor = '#1D4ED8';
//                   }}
//                   onMouseLeave={(e) => {
//                     if (userType) e.currentTarget.style.backgroundColor = '#2563EB';
//                   }}
//                 >
//                   המשך
//                   {userType === 'teenager'
//                     ? ' כעובד'
//                     : userType === 'employer'
//                     ? ' כמעסיק'
//                     : ''}
//                 </button>

//                 <button
//                   onClick={() => setStep('login')}
//                   style={{ width: '100%', color: '#4B5563', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'underline', cursor: 'pointer' }}
//                 >
//                   חזרה לכניסה
//                 </button>
//               </div>
//             )}

//             {user && isNewUser && step === 'completeProfile' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <h1 style={{
//                     fontSize: '1.875rem',
//                     fontWeight: 'bold',
//                     background: 'linear-gradient(to right, #2563EB, #4F46E5)',
//                     WebkitBackgroundClip: 'text',
//                     color: 'transparent'
//                   }}>
//                     השלם את הפרופיל שלך
//                   </h1>
//                   <p style={{ marginTop: '0.5rem', color: '#4B5563' }}>ספר לנו עוד על עצמך</p>
//                 </div>

//                 <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                   <div style={{ position: 'relative' }}>
//                     <MapPin style={{ position: 'absolute', left: '0.75rem', top: '0.875rem', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
//                     <input
//                       type="text"
//                       name="location"
//                       placeholder="מיקום"
//                       value={formData.location}
//                       onChange={handleInputChange}
//                       style={{
//                         width: '100%',
//                         paddingLeft: '2.5rem',
//                         paddingRight: '1rem',
//                         paddingTop: '0.75rem',
//                         paddingBottom: '0.75rem',
//                         border: '1px solid #E5E7EB',
//                         borderRadius: '0.75rem',
//                         outline: 'none',
//                         fontSize: '1rem',
//                       }}
//                       required
//                     />
//                   </div>

//                   <div style={{ position: 'relative' }}>
//                     <User style={{ position: 'absolute', left: '0.75rem', top: '0.875rem', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
//                     <input
//                       type="number"
//                       name="age"
//                       placeholder="גיל"
//                       value={formData.age}
//                       onChange={handleInputChange}
//                       style={{
//                         width: '100%',
//                         paddingLeft: '2.5rem',
//                         paddingRight: '1rem',
//                         paddingTop: '0.75rem',
//                         paddingBottom: '0.75rem',
//                         border: '1px solid #E5E7EB',
//                         borderRadius: '0.75rem',
//                         outline: 'none',
//                         fontSize: '1rem',
//                       }}
//                       required
//                     />
//                   </div>

//                   <div style={{ position: 'relative' }}>
//                     <Briefcase style={{ position: 'absolute', left: '0.75rem', top: '0.875rem', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
//                     <input
//                       type="text"
//                       name="experience"
//                       placeholder="התמחאות"
//                       value={formData.experience}
//                       onChange={handleInputChange}
//                       style={{
//                         width: '100%',
//                         paddingLeft: '2.5rem',
//                         paddingRight: '1rem',
//                         paddingTop: '0.75rem',
//                         paddingBottom: '0.75rem',
//                         border: '1px solid #E5E7EB',
//                         borderRadius: '0.75rem',
//                         outline: 'none',
//                         fontSize: '1rem',
//                       }}
//                       required
//                     />
//                   </div>

//                   <div style={{ position: 'relative' }}>
//                     <Star style={{ position: 'absolute', left: '0.75rem', top: '0.875rem', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
//                     <input
//                       type="text"
//                       name="expertise"
//                       placeholder="ניסיון"
//                       value={formData.expertise}
//                       onChange={handleInputChange}
//                       style={{
//                         width: '100%',
//                         paddingLeft: '2.5rem',
//                         paddingRight: '1rem',
//                         paddingTop: '0.75rem',
//                         paddingBottom: '0.75rem',
//                         border: '1px solid #E5E7EB',
//                         borderRadius: '0.75rem',
//                         outline: 'none',
//                         fontSize: '1rem',
//                       }}
//                       required
//                     />
//                   </div>

//                   <div style={{ position: 'relative' }}>
//                     <Phone style={{ position: 'absolute', left: '0.75rem', top: '0.875rem', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
//                     <input
//                       type="tel"
//                       name="phoneNumber"
//                       placeholder="מספר טלפון"
//                       value={formData.phoneNumber}
//                       onChange={handleInputChange}
//                       style={{
//                         width: '100%',
//                         paddingLeft: '2.5rem',
//                         paddingRight: '1rem',
//                         paddingTop: '0.75rem',
//                         paddingBottom: '0.75rem',
//                         border: '1px solid #E5E7EB',
//                         borderRadius: '0.75rem',
//                         outline: 'none',
//                         fontSize: '1rem',
//                       }}
//                       required
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     style={{
//                       width: '100%',
//                       backgroundColor: '#2563EB',
//                       color: '#FFFFFF',
//                       padding: '0.75rem 1.5rem',
//                       borderRadius: '0.75rem',
//                       transition: 'background-color 0.2s',
//                       fontWeight: '500',
//                       cursor: 'pointer',
//                     }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
//                   >
//                     יצירת חשבון
//                   </button>
//                 </form>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

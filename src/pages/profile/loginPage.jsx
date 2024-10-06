import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import '../../styles/loginPage.css';

const LoginPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    age: '',
    experience: '',
    expertise: ''
  });
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserExists(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const checkUserExists = async (user) => {
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        navigate('/account');
      } else {
        setUser(user);
        setIsNewUser(true);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        ...formData,
        createdAt: new Date()
      });
      navigate('/account');
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="login-page">
      <h1>Social Jobs Login</h1>
      {error && <div className="error-message">{error}</div>}
      {!user ? (
        <button onClick={handleGoogleSignIn} className="google-sign-in">
          Connect with Google
        </button>
      ) : isNewUser ? (
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Complete Your Profile</h2>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="experience"
            placeholder="Experience"
            value={formData.experience}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="expertise"
            placeholder="Expertise"
            value={formData.expertise}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Create Account</button>
        </form>
      ) : null}
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import '../../styles/accountPage.css';


const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // User is signed in
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            setUser({ id: authUser.uid, ...userDoc.data() });
          } else {
            console.error('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // User is signed out
        navigate('/register');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/register');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null; // This should not happen as we redirect to /register if there's no user
  }

  return (
    <div className="account-page">
      <h1>Account Information</h1>
      <div className="user-info">
        <img src={user.picture} alt={user.name} className="user-picture" />
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Location:</strong> {user.location}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>Experience:</strong> {user.experience}</p>
        <p><strong>Expertise:</strong> {user.expertise}</p>
      </div>
      <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
    </div>
  );
};

export default AccountPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged
} from 'firebase/auth';
import {
  collection, query, where, getDocs, setDoc, doc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  TextField, Button, Typography, Container, CircularProgress, Alert, Box
} from '@mui/material';
import { Google } from '@mui/icons-material';


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
  const [step, setStep] = useState('login'); // 'login', 'selectUserType', 'register'
  const [userType, setUserType] = useState(''); // 'teenager' or 'employer'

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserExists(user);
      } else {
        setUser(null);
        setIsNewUser(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const checkUserExists = async (user) => {
    setIsLoading(true);
    try {
      // Check if email already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User exists, navigate to account page
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await checkUserExists(user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTypeContinue = async () => {
    if (userType) {
      await handleGoogleSignIn();
    } else {
      setError('Please select a user type.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if phone number already exists
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('phoneNumber', '==', formData.phoneNumber)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('A user with this phone number already exists.');
        setIsLoading(false);
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        userType: userType,
        ...formData,
        createdAt: new Date(),
      });

      if (userType === 'employer') {
        navigate('/employer-registration');
      } else {
        navigate('/account');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      {isLoading ? (
        <Box sx={{ textAlign: 'center', marginTop: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {!user && step === 'login' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" gutterBottom align="center">
                Welcome to WorkMatch
              </Typography>
              <Typography variant="body1" gutterBottom align="center">
                Your gateway to find the best jobs or employees.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<Google />}
                  onClick={handleGoogleSignIn}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Sign in with Google
                </Button>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2">First time here?</Typography>
                <Button
                  onClick={() => setStep('selectUserType')}
                  sx={{ textTransform: 'none' }}
                >
                  Register here
                </Button>
              </Box>
            </Box>
          )}
          {!user && step === 'selectUserType' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" gutterBottom align="center">
                Welcome to WorkMatch
              </Typography>
              <Typography variant="h6" gutterBottom align="center">
                Which kind of user are you?
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant={userType === 'teenager' ? 'contained' : 'outlined'}
                  onClick={() => setUserType('teenager')}
                  fullWidth
                  sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="h6">I am a teenager</Typography>
                    <Typography variant="body2">
                      I'm here to look for a job and recognize my rights etc
                    </Typography>
                  </Box>
                </Button>
                <Button
                  variant={userType === 'employer' ? 'contained' : 'outlined'}
                  onClick={() => setUserType('employer')}
                  fullWidth
                  sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography variant="h6">I am an employer</Typography>
                    <Typography variant="body2">
                      I'm here to look for employees/workers for my business
                    </Typography>
                  </Box>
                </Button>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleUserTypeContinue}
                  fullWidth
                >
                  Continue as{' '}
                  {userType === 'teenager'
                    ? 'Employee'
                    : userType === 'employer'
                    ? 'Employer'
                    : ''}
                </Button>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2">Already have an account?</Typography>
                <Button
                  onClick={() => setStep('login')}
                  sx={{ textTransform: 'none' }}
                >
                  Sign in here
                </Button>
              </Box>
            </Box>
          )}
          {user && isNewUser && (
            <form onSubmit={handleSubmit}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Complete Your Profile
              </Typography>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Create Account
              </Button>
            </form>
          )}
        </>
      )}
    </Container>
  );
};

export default LoginPage;

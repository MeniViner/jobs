// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore, doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import {
//   TextField, Button, Typography, Container, CircularProgress, Alert
// } from '@mui/material';
// import { Google } from '@mui/icons-material';

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
//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         checkUserExists(user);
//       }
//     });

//     return () => unsubscribe();
//   }, [auth]);

//   const checkUserExists = async (user) => {
//     setIsLoading(true);
//     try {
//       // Check if email or phone number already exists
//       const usersRef = collection(db, 'users');
//       const q = query(
//         usersRef,
//         where('email', '==', user.email)
//       );
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         // User exists, navigate to account page
//         navigate('/account');
//       } else {
//         setUser(user);
//         setIsNewUser(true);
//         // Pre-fill formData with data from Google
//         setFormData({
//           ...formData,
//           location: user?.photoURL || '',
//           age: '', // Age is not provided by Google
//           phoneNumber: user?.phoneNumber || '',
//         });
//       }
//     } catch (error) {
//       console.error('Error checking user:', error);
//       setError('An error occurred. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchAdditionalUserData = async (user) => {
//     try {
//       const credential = GoogleAuthProvider.credentialFromResult(user);
//       const token = credential.accessToken;

//       const response = await fetch(
//         'https://people.googleapis.com/v1/people/me?personFields=addresses,birthdays,phoneNumbers',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();
//       const city = data.addresses ? data.addresses[0]?.formattedValue : '';
//       const phoneNumber = data.phoneNumbers ? data.phoneNumbers[0]?.value : '';
//       const birthday = data.birthdays ? data.birthdays[0]?.date : {};

//       setFormData({
//         ...formData,
//         location: city || '',
//         phoneNumber: phoneNumber || '',
//         age: birthday ? birthday.year : '', // Assuming you want the year as age
//       });
//     } catch (error) {
//       console.error('Error fetching additional user data:', error);
//     }
//   };

//   // const handleGoogleSignIn = async () => {
//   //   setIsLoading(true);
//   //   try {
//   //     const provider = new GoogleAuthProvider();

//   //     // Request additional scopes
//   //     provider.addScope('https://www.googleapis.com/auth/user.addresses.read');
//   //     provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
//   //     provider.addScope('https://www.googleapis.com/auth/user.birthday.read');

//   //     await signInWithPopup(auth, provider);
//   //   } catch (error) {
//   //     console.error('Error signing in with Google:', error);
//   //     setError('Failed to sign in with Google. Please try again.');
//   //     setIsLoading(false);
//   //   }
//   // };

//   const handleGoogleSignIn = async () => {
//     setIsLoading(true);
//     try {
//       const provider = new GoogleAuthProvider();
//       provider.addScope('https://www.googleapis.com/auth/user.addresses.read');
//       provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
//       provider.addScope('https://www.googleapis.com/auth/user.birthday.read');

//       const result = await signInWithPopup(auth, provider);
//       const credential = GoogleAuthProvider.credentialFromResult(result);

//       await fetchAdditionalUserData(result.user); // Fetch data after sign-in
//     } catch (error) {
//       console.error('Error signing in with Google:', error);
//       setError('Failed to sign in with Google. Please try again.');
//       setIsLoading(false);
//     }
//   };


//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // Check if phone number already exists
//       const usersRef = collection(db, 'users');
//       const q = query(
//         usersRef,
//         where('phoneNumber', '==', formData.phoneNumber)
//       );
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         setError('A user with this phone number already exists.');
//         setIsLoading(false);
//         return;
//       }

//       await setDoc(doc(db, 'users', user.uid), {
//         email: user.email,
//         name: user.displayName,
//         ...formData,
//         createdAt: new Date(),
//       });
//       navigate('/account');
//     } catch (error) {
//       console.error('Error creating user:', error);
//       setError('Failed to create account. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <Container sx={{ textAlign: 'center', marginTop: 4 }}>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h4" gutterBottom>
//         Social Jobs Login
//       </Typography>
//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}
//       {!user ? (
//         <Button
//           variant="contained"
//           startIcon={<Google />}
//           onClick={handleGoogleSignIn}
//           fullWidth
//         >
//           Connect with Google
//         </Button>
//       ) : isNewUser ? (
//         <form onSubmit={handleSubmit}>
//           <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
//             Complete Your Profile
//           </Typography>
//           <TextField
//             label="Location"
//             name="location"
//             value={formData.location}
//             onChange={handleInputChange}
//             required
//             fullWidth
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             label="Age"
//             name="age"
//             type="number"
//             value={formData.age}
//             onChange={handleInputChange}
//             required
//             fullWidth
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             label="Experience"
//             name="experience"
//             value={formData.experience}
//             onChange={handleInputChange}
//             required
//             fullWidth
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             label="Expertise"
//             name="expertise"
//             value={formData.expertise}
//             onChange={handleInputChange}
//             required
//             fullWidth
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             label="Phone Number"
//             name="phoneNumber"
//             value={formData.phoneNumber}
//             onChange={handleInputChange}
//             required
//             fullWidth
//             sx={{ mb: 2 }}
//           />
//           <Button type="submit" variant="contained" color="primary" fullWidth>
//             Create Account
//           </Button>
//         </form>
//       ) : null}
//     </Container>
//   );
// };

// export default LoginPage;





import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  TextField, Button, Typography, Container, CircularProgress, Alert
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
      // Check if email or phone number already exists
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('email', '==', user.email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User exists, navigate to account page
        navigate('/account');
      } else {
        setUser(user);
        setIsNewUser(true);
        await fetchAdditionalUserData(user); // Fetch additional data from Google
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdditionalUserData = async (user) => {
    try {
      const credential = GoogleAuthProvider.credentialFromResult(user);
      const token = credential.accessToken;

      // Fetch additional information from Google People API
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=addresses,birthdays,phoneNumbers',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      const city = data.addresses ? data.addresses[0]?.formattedValue : '';
      const phoneNumber = data.phoneNumbers ? data.phoneNumbers[0]?.value : '';
      const birthday = data.birthdays ? data.birthdays[0]?.date : {};

      setFormData({
        ...formData,
        location: city || '',
        phoneNumber: phoneNumber || '',
        age: birthday ? birthday.year : '', // Assuming you want the year as age
      });
    } catch (error) {
      console.error('Error fetching additional user data:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // Request additional scopes
      provider.addScope('https://www.googleapis.com/auth/user.addresses.read');
      provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
      provider.addScope('https://www.googleapis.com/auth/user.birthday.read');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      await fetchAdditionalUserData(result.user); // Fetch data after sign-in
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
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
        ...formData,
        createdAt: new Date(),
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
    return (
      <Container sx={{ textAlign: 'center', marginTop: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Social Jobs Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!user ? (
        <Button
          variant="contained"
          startIcon={<Google />}
          onClick={handleGoogleSignIn}
          fullWidth
        >
          Connect with Google
        </Button>
      ) : isNewUser ? (
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
      ) : null}
    </Container>
  );
};

export default LoginPage;

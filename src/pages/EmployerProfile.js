// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Typography,
//   Paper,
//   TextField,
//   Button,
//   Grid,
//   Avatar,
//   Snackbar,
// } from '@mui/material';
// import { Edit } from '@mui/icons-material';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { db } from '../services/firebase';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';

// function EmployerProfile() {
//   const [employer, setEmployer] = useState(null);
//   const [editing, setEditing] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '' });
//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         fetchEmployerData(user.uid);
//       } else {
//         navigate('/register');
//       }
//     });

//     return () => unsubscribe();
//   }, [auth, navigate]);

//   const fetchEmployerData = async (employerId) => {
//     const employerDoc = await getDoc(doc(db, 'employers', employerId));
//     if (employerDoc.exists()) {
//       setEmployer(employerDoc.data());
//     } else {
//       const newEmployer = {
//         companyName: '',
//         industry: '',
//         description: '',
//         email: '',
//         phone: '',
//         address: '',
//         avatarUrl: '',
//       };
//       await setDoc(doc(db, 'employers', employerId), newEmployer);
//       setEmployer(newEmployer);
//     }
//   };

//   const handleEdit = () => {
//     setEditing(true);
//   };

//   const handleSave = async () => {
//     try {
//       await setDoc(doc(db, 'employers', auth.currentUser.uid), employer);
//       setEditing(false);
//       setSnackbar({ open: true, message: 'הפרופיל עודכן בהצלחה' });
//     } catch (error) {
//       console.error('Error updating profile: ', error);
//       setSnackbar({ open: true, message: 'אירעה שגיאה בעדכון הפרופיל' });
//     }
//   };

//   const handleChange = (e) => {
//     setEmployer({ ...employer, [e.target.name]: e.target.value });
//   };

//   if (!employer) {
//     return <Typography>טוען...</Typography>;
//   }

//   return (
//     <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
//       <Paper elevation={3} sx={{ p: 3 }}>
//         <Grid container spacing={3} alignItems="center">
//           <Grid item>
//             <Avatar
//               src={employer.avatarUrl}
//               sx={{ width: 100, height: 100 }}
//             >
//               {employer.companyName ? employer.companyName[0] : '?'}
//             </Avatar>
//           </Grid>
//           <Grid item xs>
//             <Typography variant="h4" gutterBottom>
//               {employer.companyName || 'שם החברה'}
//             </Typography>
//             <Typography variant="subtitle1" color="text.secondary">
//               {employer.industry || 'תעשייה'}
//             </Typography>
//           </Grid>
//           <Grid item>
//             <Button
//               variant="contained"
//               startIcon={<Edit />}
//               onClick={handleEdit}
//               disabled={editing}
//             >
//               ערוך פרופיל
//             </Button>
//           </Grid>
//         </Grid>

//         <Grid container spacing={3} sx={{ mt: 2 }}>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="שם החברה"
//               name="companyName"
//               value={employer.companyName}
//               onChange={handleChange}
//               disabled={!editing}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="תעשייה"
//               name="industry"
//               value={employer.industry}
//               onChange={handleChange}
//               disabled={!editing}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="תיאור החברה"
//               name="description"
//               value={employer.description}
//               onChange={handleChange}
//               multiline
//               rows={4}
//               disabled={!editing}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="אימייל"
//               name="email"
//               value={employer.email}
//               onChange={handleChange}
//               disabled={!editing}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="טלפון"
//               name="phone"
//               value={employer.phone}
//               onChange={handleChange}
//               disabled={!editing}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="כתובת"
//               name="address"
//               value={employer.address}
//               onChange={handleChange}
//               disabled={!editing}
//             />
//           </Grid>
//         </Grid>

//         {editing && (
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleSave}
//             sx={{ mt: 3 }}
//           >
//             שמור שינויים
//           </Button>
//         )}
//       </Paper>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         message={snackbar.message}
//       />
//     </Container>
//   );
// }

// export default EmployerProfile;






import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Snackbar,
  IconButton
} from '@mui/material';
import { Edit, Chat } from '@mui/icons-material'; // ייבוא אייקון הצ'אט
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function EmployerProfile() {
  const [employer, setEmployer] = useState(null);
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchEmployerData(user.uid);
      } else {
        navigate('/register');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchEmployerData = async (employerId) => {
    const employerDoc = await getDoc(doc(db, 'employers', employerId));
    if (employerDoc.exists()) {
      setEmployer(employerDoc.data());
    } else {
      const newEmployer = {
        companyName: '',
        industry: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        avatarUrl: '',
      };
      await setDoc(doc(db, 'employers', employerId), newEmployer);
      setEmployer(newEmployer);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'employers', auth.currentUser.uid), employer);
      setEditing(false);
      setSnackbar({ open: true, message: 'הפרופיל עודכן בהצלחה' });
    } catch (error) {
      console.error('Error updating profile: ', error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בעדכון הפרופיל' });
    }
  };

  const handleChange = (e) => {
    setEmployer({ ...employer, [e.target.name]: e.target.value });
  };

  // פונקציה לניווט לצ'אט של המעסיק
  const handleChatClick = () => {
    navigate(`/chat/${auth.currentUser.uid}`); // נווט לדף הצ'אט עם מזהה המעסיק
  };

  if (!employer) {
    return <Typography>טוען...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={employer.avatarUrl}
              sx={{ width: 100, height: 100 }}
            >
              {employer.companyName ? employer.companyName[0] : '?'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {employer.companyName || 'שם החברה'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {employer.industry || 'תעשייה'}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
              disabled={editing}
            >
              ערוך פרופיל
            </Button>
          </Grid>
          <Grid item>
            <IconButton color="primary" onClick={handleChatClick}>
              <Chat /> {/* אייקון של צ'אט */}
            </IconButton>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* המשך שדות העריכה */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="שם החברה"
              name="companyName"
              value={employer.companyName}
              onChange={handleChange}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="תעשייה"
              name="industry"
              value={employer.industry}
              onChange={handleChange}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="תיאור החברה"
              name="description"
              value={employer.description}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="אימייל"
              name="email"
              value={employer.email}
              onChange={handleChange}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="טלפון"
              name="phone"
              value={employer.phone}
              onChange={handleChange}
              disabled={!editing}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="כתובת"
              name="address"
              value={employer.address}
              onChange={handleChange}
              disabled={!editing}
            />
          </Grid>
        </Grid>

        {editing && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mt: 3 }}
          >
            שמור שינויים
          </Button>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}

export default EmployerProfile;

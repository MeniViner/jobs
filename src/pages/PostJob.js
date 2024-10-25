import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, Grid, MenuItem, Snackbar, Paper, IconButton,
  Box, CircularProgress, Switch, FormControlLabel, Alert, ThemeProvider, createTheme
} from '@mui/material';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});

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
    if (
      !jobData.title || 
      !jobData.location || 
      !jobData.type || 
      !jobData.salary || 
      !jobData.description ||
      (!isFlexibleTime && (!jobData.startTime || !jobData.endTime)) ||
      (!isFlexibleDates && jobData.workDates.some(date => !date))
    ) {
      setSnackbar({ open: true, message: 'נא למלא את כל השדות הנדרשים', severity: 'error' });
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

      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobToSubmit,
        postedBy: user.uid
      });
      // console.log("Document written with ID: ", docRef.id);
      setSnackbar({ open: true, message: 'המשרה פורסמה בהצלחה!', severity: 'success' });
      setJobData({
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
      navigate('/my-published-jobs'); 
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbar({ open: true, message: `אירעה שגיאה בפרסום המשרה: ${error.message}`, severity: 'error' });
    }
  };
  
  if (authLoading || businessLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container dir="rtl" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            פרסום משרה חדשה
          </Typography>
          <Typography variant="h6" gutterBottom align="center" sx={{ color: '#666' }}>
            {businessName ? `מפרסם: ${businessName}` : 'לא נמצא שם חברה'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="כותרת המשרה"
                  name="title"
                  value={jobData.title}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="מיקום"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="סוג משרה"
                  name="type"
                  value={jobData.type}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {jobTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="שכר (בש״ח לשעה)"
                  name="salary"
                  type="number"
                  value={jobData.salary}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="מספר עובדים נדרש"
                  name="workersNeeded"
                  type="number"
                  value={jobData.workersNeeded}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={jobData.requiresCar}
                      onChange={(e) => setJobData({ ...jobData, requiresCar: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="האם דרוש רכב?"
                  sx={{
                    '.MuiFormControlLabel-label': {
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFlexibleTime}
                      onChange={() => setIsFlexibleTime(!isFlexibleTime)}
                      color="primary"
                    />
                  }
                  label="שעות גמישות?"
                  sx={{
                    width: '100%',
                    marginBottom: '16px',
                    '.MuiFormControlLabel-label': {
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />
                {!isFlexibleTime && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        label="שעת התחלה"
                        name="startTime"
                        type="time"
                        value={jobData.startTime}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        fullWidth
                        label="שעת סיום"
                        name="endTime"
                        type="time"
                        value={jobData.endTime}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFlexibleDates}
                      onChange={() => setIsFlexibleDates(!isFlexibleDates)}
                      color="primary"
                    />
                  }
                  label="תאריכים גמישים?"
                  sx={{
                    width: '100%',
                    marginBottom: '16px',
                    '.MuiFormControlLabel-label': {
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />
                {!isFlexibleDates && (
                  <>
                    {jobData.workDates.map((date, index) => (
                      <Grid container spacing={2} key={index} alignItems="center">
                        <Grid item xs>
                          <TextField
                            fullWidth
                            label={`תאריך עבודה ${index + 1}`}
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value, index)}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item>
                          <IconButton
                            onClick={() => removeWorkDate(index)}
                            disabled={jobData.workDates.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Button 
                      startIcon={<AddIcon />} 
                      onClick={addWorkDate} 
                      sx={{ mt: 2 }}
                      variant="outlined"
                    >
                      הוסף תאריך עבודה
                    </Button>
                  </>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={2}
                  label="תיאור המשרה בקצרה"
                  name="description"
                  value={jobData.description}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="תיאור מפורט"
                  name="fullDescription"
                  value={jobData.fullDescription}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  size="large"
                  sx={{ 
                    mt: 2, 
                    py: 1.5,
                    fontSize:  '1.1rem',
                    boxShadow: '0 4px 6px rgba(25, 118, 210, 0.25)',
                    '&:hover': {
                      boxShadow: '0 6px 8px rgba(25, 118, 210, 0.3)',
                    },
                  }}
                >
                  פרסם משרה
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
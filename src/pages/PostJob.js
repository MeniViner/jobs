import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, Grid, MenuItem, Snackbar, Paper,
  Switch, FormControlLabel, IconButton, Box, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    fullDescription: '',
    workersNeeded: 1,
    requiresCar: false,
    isFlexibleTime: false,
    startTime: '',
    endTime: '',
    isFlexibleDates: false,
    workDates: [''],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchBusinessName(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchBusinessName = async (userId) => {
    try {
      const employerDoc = await getDoc(doc(db, 'employers', userId));
      if (employerDoc.exists()) {
        const companyName = employerDoc.data().companyName;
        setBusinessName(companyName);
        setJobData(prevData => ({
          ...prevData,
          companyName: companyName
        }));
      }
    } catch (error) {
      console.error("Error fetching business name:", error);
      setSnackbar({ open: true, message: 'שגיאה בטעינת שם העסק' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: name === 'workersNeeded' ? Math.min(Math.max(1, parseInt(value) || 1), 10) : value
    }));
  };

  const handleSwitchChange = (name) => (event) => {
    setJobData(prevData => ({
      ...prevData,
      [name]: event.target.checked
    }));
  };

  const handleDateChange = (value, index) => {
    const newWorkDates = [...jobData.workDates];
    newWorkDates[index] = value;
    setJobData({
      ...jobData,
      workDates: newWorkDates
    });
  };

  const addWorkDate = () => {
    setJobData({
      ...jobData,
      workDates: [...jobData.workDates, '']
    });
  };

  const removeWorkDate = (index) => {
    const newWorkDates = jobData.workDates.filter((_, i) => i !== index);
    setJobData({
      ...jobData,
      workDates: newWorkDates
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !jobData.title || 
      !jobData.location || 
      !jobData.type || 
      !jobData.salary || 
      !jobData.description ||
      (!jobData.isFlexibleTime && (!jobData.startTime || !jobData.endTime)) ||
      (!jobData.isFlexibleDates && jobData.workDates.some(date => !date))
    ) {
      setSnackbar({ open: true, message: 'נא למלא את כל השדות הנדרשים' });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setSnackbar({ open: true, message: 'יש להתחבר כדי לפרסם משרה' });
        return;
      }

      const jobToSubmit = {
        ...jobData,
        employerId: user.uid,
        companyName: businessName,
        workDates: jobData.isFlexibleDates ? [] : jobData.workDates.filter(date => date),
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobToSubmit);
      console.log("Document written with ID: ", docRef.id);
      setSnackbar({ open: true, message: 'המשרה פורסמה בהצלחה!' });
      
      // Reset form after successful submission
      setJobData({
        title: '',
        location: '',
        type: '',
        salary: '',
        description: '',
        fullDescription: '',
        workersNeeded: 1,
        requiresCar: false,
        isFlexibleTime: false,
        startTime: '',
        endTime: '',
        isFlexibleDates: false,
        workDates: [''],
      });

      // Navigate to the published jobs page
      navigate('/my-published-jobs');
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbar({ open: true, message: `אירעה שגיאה בפרסום המשרה: ${error.message}` });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const form = formRef.current;
        if (form) {
          const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
          const index = inputs.indexOf(e.target);
          if (index > -1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          פרסום משרה חדשה
        </Typography>
        <Typography variant="h6" gutterBottom align="center">
          {businessName ? `מפרסם: ${businessName}` : 'לא נמצא שם חברה'}
        </Typography>
        <form ref={formRef} onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="כותרת המשרה"
                name="title"
                value={jobData.title}
                onChange={handleChange}
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
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobData.requiresCar}
                    onChange={handleSwitchChange('requiresCar')}
                    name="requiresCar"
                    color="primary"
                  />
                }
                label="האם דרוש רכב?"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobData.isFlexibleTime}
                    onChange={handleSwitchChange('isFlexibleTime')}
                    name="isFlexibleTime"
                    color="primary"
                  />
                }
                label="שעות גמישות?"
              />
            </Grid>
            {!jobData.isFlexibleTime && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="שעת התחלה"
                    name="startTime"
                    type="time"
                    value={jobData.startTime}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="שעת סיום"
                    name="endTime"
                    type="time"
                    value={jobData.endTime}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={jobData.isFlexibleDates}
                    onChange={handleSwitchChange('isFlexibleDates')}
                    name="isFlexibleDates"
                    color="primary"
                  />
                }
                label="תאריכים גמישים?"
              />
            </Grid>
            {!jobData.isFlexibleDates && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  תאריכי עבודה
                </Typography>
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
                      />
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => removeWorkDate(index)} disabled={jobData.workDates.length === 1}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<AddIcon />} onClick={addWorkDate} sx={{ mt: 2 }}>
                  הוסף תאריך עבודה
                </Button>
              </Grid>
            )}
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
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                size="large"
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
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}
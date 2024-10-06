import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Snackbar,
  Paper,
  IconButton
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const jobTypes = [
  'משרה מלאה',
  'משרה חלקית',
  'עבודה זמנית',
  'פרילנס',
  'התמחות'
];

export default function PostJob() {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    startTime: '',
    endTime: '',
    workDates: [''],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: value
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
    console.log("Attempting to submit job:", jobData);

    if (!jobData.title || !jobData.company || !jobData.location || !jobData.type || !jobData.salary || !jobData.description || !jobData.startTime || !jobData.endTime || jobData.workDates.some(date => !date)) {
      setSnackbar({ open: true, message: 'נא למלא את כל השדות הנדרשים' });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'jobs'), jobData);
      console.log("Document written with ID: ", docRef.id);
      setSnackbar({ open: true, message: 'המשרה פורסמה בהצלחה!' });
      setJobData({
        title: '',
        company: '',
        location: '',
        type: '',
        salary: '',
        description: '',
        startTime: '',
        endTime: '',
        workDates: [''],
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbar({ open: true, message: `אירעה שגיאה בפרסום המשרה: ${error.message}` });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          פרסום משרה חדשה
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
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
                label="שם החברה"
                name="company"
                value={jobData.company}
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
                label="שעת התחלה"
                name="startTime"
                type="time"
                value={jobData.startTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="שעת סיום"
                name="endTime"
                type="time"
                value={jobData.endTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
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
                      InputLabelProps={{
                        shrink: true,
                      }}
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
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="תיאור המשרה"
                name="description"
                value={jobData.description}
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
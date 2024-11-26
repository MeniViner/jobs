
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Switch, 
  Grid, IconButton, FormControlLabel, MenuItem, Box
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const jobTypes = [
  'משרה מלאה',
  'משרה חלקית',
  'עבודה זמנית',
  'פרילנס',
  'התמחות'
];

export default function EditJobDialog({ open, handleClose, job, handleSave }) {
  const [editedJob, setEditedJob] = useState({ ...job });

  useEffect(() => {
    if (job) {
      setEditedJob({ ...job });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedJob((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDateChange = (value, index) => {
    const newWorkDates = [...(editedJob.workDates || [])];
    newWorkDates[index] = value;
    setEditedJob((prev) => ({ ...prev, workDates: newWorkDates }));
  };

  const addWorkDate = () => {
    setEditedJob((prev) => ({
      ...prev,
      workDates: [...(prev.workDates || []), ''],
    }));
  };

  const removeWorkDate = (index) => {
    setEditedJob((prev) => ({
      ...prev,
      workDates: prev.workDates.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave({ ...editedJob });
  };

  if (!job) return null;

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="edit-job-dialog-title">
      <DialogTitle id="edit-job-dialog-title">ערוך פרטי עבודה</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="כותרת המשרה"
                value={editedJob.title || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                name="type"
                label="סוג משרה"
                value={editedJob.type || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              >
                {jobTypes.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="location"
                label="מיקום"
                value={editedJob.location || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="workersNeeded"
                label="מספר עובדים נדרש"
                type="number"
                value={editedJob.workersNeeded || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="salary"
                label="שכר (בש״ח לשעה)"
                type="number"
                value={editedJob.salary || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedJob.isFlexibleTime || false}
                    onChange={(e) =>
                      handleChange({ target: { name: 'isFlexibleTime', type: 'checkbox', checked: e.target.checked } })
                    }
                  />
                }
                label="שעות גמישות"
              />
              {!editedJob.isFlexibleTime && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      name="startTime"
                      label="שעת התחלה"
                      type="time"
                      value={editedJob.startTime || ''}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="endTime"
                      label="שעת סיום"
                      type="time"
                      value={editedJob.endTime || ''}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedJob.isFlexibleDates || false}
                    onChange={(e) =>
                      handleChange({ target: { name: 'isFlexibleDates', type: 'checkbox', checked: e.target.checked } })
                    }
                  />
                }
                label="תאריכים גמישים"
              />
              {!editedJob.isFlexibleDates && (
                <Box>
                  {editedJob.workDates?.map((date, index) => (
                    <Box key={index} display="flex">
                      <TextField
                        fullWidth
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value, index)}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="normal"
                      />
                      <IconButton onClick={() => removeWorkDate(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addWorkDate}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    הוסף תאריך עבודה
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="תיאור המשרה"
                multiline
                rows={2}
                value={editedJob.description || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="fullDescription"
                label="תיאור מפורט"
                multiline
                rows={3}
                value={editedJob.fullDescription || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedJob.requiresCar || false}
                    onChange={(e) =>
                      handleChange({ target: { name: 'requiresCar', type: 'checkbox', checked: e.target.checked } })
                    }
                  />
                }
                label="דרוש רכב"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button type="submit" variant="contained" color="primary">
            שמור שינויים
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

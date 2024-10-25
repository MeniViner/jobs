import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material';

export default function EditJobDialog({ open, handleClose, job, handleSave }) {
  const [editedJob, setEditedJob] = useState(job || {});

  useEffect(() => {
    if (job) {
      setEditedJob(job);
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(editedJob);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="edit-job-dialog-title">
      <DialogTitle id="edit-job-dialog-title">ערוך פרטי עבודה</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="כותרת העבודה"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.title || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="companyName"
            label="שם החברה"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.companyName || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="מיקום"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.location || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="salary"
            label="שכר לשעה"
            type="number"
            fullWidth
            variant="outlined"
            value={editedJob.salary || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="startTime"
            label="שעת התחלה"
            type="time"
            fullWidth
            variant="outlined"
            value={editedJob.startTime || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <TextField
            margin="dense"
            name="endTime"
            label="שעת סיום"
            type="time"
            fullWidth
            variant="outlined"
            value={editedJob.endTime || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
          />
          <TextField
            margin="dense"
            name="workersNeeded"
            label="מספר עובדים נדרש"
            type="number"
            fullWidth
            variant="outlined"
            value={editedJob.workersNeeded || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="type"
            label="סוג העבודה"
            type="text"
            fullWidth
            variant="outlined"
            value={editedJob.type || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="תיאור העבודה"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editedJob.description || ''}
            onChange={handleChange}
          />
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
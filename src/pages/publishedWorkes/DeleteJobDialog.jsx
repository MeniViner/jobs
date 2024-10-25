import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';

export default function DeleteJobDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'האם אתה בטוח שברצונך למחוק עבודה זו?'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          מחיקת העבודה תסיר אותה לצמיתות מהמערכת. פעולה זו אינה ניתנת לביטול.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          ביטול
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          מחק עבודה
        </Button>
      </DialogActions>
    </Dialog>
  );
}
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField
} from '@mui/material';
import { Chat } from '@mui/icons-material';
export default function ChatDialog({ open, onClose, applicant, jobTitle, onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>שלח הודעה למועמד</DialogTitle>
      <DialogContent>
        <DialogContentText>
          שלח הודעה ל{applicant?.userData?.name || 'מועמד'} עבור המשרה: {jobTitle}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="message"
          label="הודעה"
          type="text"
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={<Chat />}
        >
          שלח
        </Button>
      </DialogActions>
    </Dialog>
  );
}
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Snackbar, Alert } from '@mui/material';

const MySnackbar = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  // Expose the `show` method through the ref
  useImperativeHandle(ref, () => ({
    show: (msg, sev = 'success') => {
      setMessage(msg);
      setSeverity(sev);
      setOpen(true);
    },
  }));

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{ width: '100%' }}
        elevation={6}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
});

export default MySnackbar;

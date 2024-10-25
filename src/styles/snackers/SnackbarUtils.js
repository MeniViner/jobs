let snackbarRef; // Store the snackbar instance

export const setSnackbar = (snackbarInstance) => {
  snackbarRef = snackbarInstance;
};

export const showSnackbar = (message, severity = 'success') => {
  if (['success', 'error', 'info', 'warning'].includes(severity)) {
    snackbarRef?.show(message, severity);
  } else {
    console.warn(`Invalid severity: ${severity}`);
  }
};

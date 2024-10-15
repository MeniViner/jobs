import React, { useState, useEffect } from 'react';
import { 
    getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy,
     doc, deleteDoc, onSnapshot, updateDoc, writeBatch,
} from 'firebase/firestore';
import { 
  Container, Typography, TextField, Button, Snackbar, Alert, Paper, Box, CircularProgress,
  List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Menu, MenuItem
} from '@mui/material';
import { 
    Send as SendIcon, History as HistoryIcon, Delete as DeleteIcon, Edit as EditIcon,
    MoreVert as MoreVertIcon 
} from '@mui/icons-material';

const NotificationsPanel = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [editDialog, setEditDialog] = useState({ open: false, id: null, content: '' });
  const [anchorEl, setAnchorEl] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    const broadcastsQuery = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(broadcastsQuery, (snapshot) => {
      const broadcastList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(broadcastList);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [db]);
    
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setSnackbar({ open: true, message: 'Please enter a message', severity: 'error' });
      return;
    }
  
    setSending(true);
    try {
      // Create a single broadcast message
      const broadcastRef = await addDoc(collection(db, 'broadcasts'), {
        content: message,
        timestamp: serverTimestamp(),
      });
  
      // Add this broadcast to all users' notifications
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
  
      usersSnapshot.forEach((userDoc) => {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          broadcastId: broadcastRef.id,
          userId: userDoc.id,
          isRead: false,
          isHistory: false,
        });
      });
  
      await batch.commit();
      
      setSnackbar({ open: true, message: 'Message sent successfully to all users', severity: 'success' });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbar({ open: true, message: 'Error sending message. Please try again.', severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setSnackbar({ open: true, message: 'Notification deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting notification', severity: 'error' });
      console.log('Error deleting notification\n', error)
    }
    setConfirmDelete({ open: false, id: null });
  };

  const handleClearAllHistory = async () => {
    try {
      const batch = writeBatch(db);
      history.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      setSnackbar({ open: true, message: 'All history cleared successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error clearing history', severity: 'error' });
      console.log('Error clearing history\n', error)
    }
  };

  const handleEditNotification = async () => {
    try {
      await updateDoc(doc(db, 'notifications', editDialog.id), {
        content: editDialog.content
      });
      setSnackbar({ open: true, message: 'Notification updated successfully', severity: 'success' });
      setEditDialog({ open: false, id: null, content: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating notification', severity: 'error' });
      console.log('Error updating notification\n', error)
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleConfirmDelete = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete({ open: false, id: null });
  };

  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setEditDialog({ ...editDialog, id: notification.id, content: notification.content });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenEditDialog = () => {
    setEditDialog({ ...editDialog, open: true });
    handleMenuClose();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Admin Broadcast Message Panel
        </Typography>
        <form onSubmit={handleSendMessage}>
          <TextField
            fullWidth
            label="Message for all users"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            variant="outlined"
            required
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              disabled={sending}
            >
              {sending ? (
                <>
                  Sending
                  <CircularProgress size={24} sx={{ ml: 1, color: 'inherit' }} />
                </>
              ) : (
                'Send to All Users'
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HistoryIcon />}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
      </Box>

      {showHistory && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Broadcast History
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Typography align="center">No broadcast messages in history.</Typography>
          ) : (
            <List>
              {history.map((notification) => (
                <ListItem key={notification.id} sx={{ mb: 2 }}>
                  <ListItemText
                    primary={notification.content}
                    secondary={new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
                  />
                  <IconButton
                    edge="end"
                    aria-label="more"
                    onClick={(event) => handleMenuClick(event, notification)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}

          {history.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="contained" color="error" onClick={handleClearAllHistory}>
                Clear All History
              </Button>
            </Box>
          )}
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleConfirmDelete(editDialog.id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDelete.open}
        onClose={handleCloseConfirmDelete}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notification? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>Cancel</Button>
          <Button onClick={() => handleDeleteNotification(confirmDelete.id)} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })}>
        <DialogTitle>Edit Notification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notification Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editDialog.content}
            onChange={(e) => setEditDialog({ ...editDialog, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
          <Button onClick={handleEditNotification}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationsPanel;

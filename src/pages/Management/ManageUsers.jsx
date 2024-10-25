import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../services/firebase';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Button,
  Box, TextField, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Person, Search, Delete, Email } from '@mui/icons-material';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users: ", err);
      setError("Failed to fetch users. Please try again.");
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, 'users', userToDelete.id));
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setSnackbar({ open: true, message: `משתמש ${userToDelete.name} נמחק בהצלחה` });
      } catch (error) {
        console.error("Error deleting user: ", error);
        setSnackbar({ open: true, message: 'אירעה שגיאה במחיקת המשתמש' });
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSnackbar({ open: true, message: `אימייל לאיפוס סיסמה נשלח ל-${email}` });
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בשליחת אימייל לאיפוס סיסמה' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        ניהול משתמשים
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="חיפוש לפי שם, אימייל, מיקום או התמחות"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>מיקום</TableCell>
              <TableCell>גיל</TableCell>
              <TableCell>ניסיון</TableCell>
              <TableCell>התמחות</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link to={`/user/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {user.name}
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell>{user.experience}</TableCell>
                <TableCell>{user.expertise}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/user/${user.id}`}
                    startIcon={<Person />}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    צפה בפרופיל
                  </Button>
                  <Button
                    startIcon={<Email />}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSendPasswordReset(user.email)}
                    sx={{ mr: 1 }}
                  >
                    שלח אימות סיסמה
                  </Button>
                  <Button
                    startIcon={<Delete />}
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user)}
                  >
                    מחק
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"אישור מחיקת משתמש"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            האם אתה בטוח שברצונך למחוק את המשתמש {userToDelete?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={confirmDeleteUser} autoFocus>
            אישור
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ManageUsers;
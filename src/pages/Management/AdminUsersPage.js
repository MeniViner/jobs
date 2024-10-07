import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Button,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, Business, Category, Description, Email, Phone } from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          displayName: data.displayName || data.name || 'לא צוין'
        };
      });
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (userId, permission, currentValue) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = { [permission]: !currentValue };
      
      if (permission === 'isEmployer') {
        updates.pendingEmployer = false;
        updates.role = !currentValue ? 'employer' : 'user';
      }

      await updateDoc(userRef, updates);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
    } catch (error) {
      console.error(`Error updating user ${permission}:`, error);
    }
  };


  const handleEmployerApproval = async (userId, approved) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = { 
        isEmployer: approved,
        pendingEmployer: false,
        role: approved ? 'employer' : 'user'
      };

      await updateDoc(userRef, updates);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      alert(approved ? 'המעסיק אושר בהצלחה' : 'בקשת המעסיק נדחתה');
    } catch (error) {
      console.error('Error updating employer status:', error);
      alert('שגיאה בעדכון סטטוס המעסיק');
    }
  };
  

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        ניהול משתמשים והרשאות
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="חיפוש לפי שם או אימייל"
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
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>שם משתמש</TableCell>
                <TableCell>אימייל</TableCell>
                <TableCell>מנהל</TableCell>
                <TableCell>מעסיק</TableCell>
                <TableCell>סטטוס מעסיק</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isAdmin || false}
                      onChange={() => handlePermissionToggle(user.id, 'isAdmin', user.isAdmin)}
                      inputProps={{ 'aria-label': 'admin status' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isEmployer || false}
                      onChange={() => handlePermissionToggle(user.id, 'isEmployer', user.isEmployer)}
                      inputProps={{ 'aria-label': 'employer status' }}
                      disabled={user.pendingEmployer}
                    />
                  </TableCell>
                  <TableCell>
                    {user.isEmployer ? 'מאושר' : user.pendingEmployer ? 'ממתין לאישור' : 'לא מעסיק'}
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/user/${user.id}`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      צפייה בפרופיל
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <DialogTitle>אישור בקשת מעסיק</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <Typography variant="h6" gutterBottom>
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                {selectedUser.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                סוג עסק: {selectedUser.businessType}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                תיאור: {selectedUser.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                אימייל: {selectedUser.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                טלפון: {selectedUser.phone}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEmployerApproval(selectedUser.id, true)} color="primary">
            אישור
          </Button>
          <Button onClick={() => handleEmployerApproval(selectedUser.id, false)} color="secondary">
            דחייה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

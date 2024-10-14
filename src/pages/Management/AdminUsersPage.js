import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Switch, Button, Box, CircularProgress, TextField, InputAdornment 
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function AdminUsersPage({ setTab }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const filtered = users.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }, 300); // Adjust debounce delay as needed
  
    return () => clearTimeout(delayDebounceFn); // Cleanup the timeout
  }, [users, searchTerm]);
 
  const getEmployerDetails = async (userDoc) => {
    const employerRef = doc(db, 'employers', userDoc.id);
    const employerDoc = await getDoc(employerRef);
    return employerDoc.exists() ? employerDoc.data() : {};
  };
  
  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = await Promise.all(userSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const employerDetails = userData.pendingEmployer || userData.isEmployer ? await getEmployerDetails(userDoc) : {};
        return { id: userDoc.id, ...userData, ...employerDetails, displayName: userData.displayName || userData.name || 'לא צוין' };
      }));
  
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
  
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        const index = updatedUsers.findIndex(user => user.id === userId);
        if (index !== -1) {
          updatedUsers[index] = { ...updatedUsers[index], ...updates };
        }
        return updatedUsers;
      });
    } catch (error) {
      console.error(`Error updating user ${permission}:`, error);
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  לא נמצאו משתמשים
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName || 'Unknown'}</TableCell>
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
                    {user.pendingEmployer && (
                      <Button
                        onClick={() => setTab(1)} 
                        variant="contained"
                        size="small"
                        color="primary"
                      >
                        בקשה לאישור
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
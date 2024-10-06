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
} from '@mui/material';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(userList);
  };

  const handlePermissionToggle = async (userId, permission, currentValue) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { [permission]: !currentValue });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, [permission]: !currentValue } : user
      ));
    } catch (error) {
      console.error(`Error updating user ${permission}:`, error);
    }
  };

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        ניהול משתמשים והרשאות
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>שם משתמש</TableCell>
                <TableCell>אימייל</TableCell>
                <TableCell>מנהל</TableCell>
                <TableCell>מעסיק</TableCell>
                <TableCell>עובד</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName || 'לא צוין'}</TableCell>
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
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isEmployee || false}
                      onChange={() => handlePermissionToggle(user.id, 'isEmployee', user.isEmployee)}
                      inputProps={{ 'aria-label': 'employee status' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small">
                      צפייה בפרופיל
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
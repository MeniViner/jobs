// AdminUsersPage.js

import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Box,
} from '@mui/material';
import { Search } from '@mui/icons-material';

const AdminUsersPage = ({ setTab }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [filterBy, setFilterBy] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    let filtered = users;

    // חיפוש
    if (searchTerm) {
      filtered = users.filter(
        (user) =>
          ((user.name?.toLowerCase() || user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase())) ||
          (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // מיון לפי מנהלים או מעסיקים
    if (filterBy === 'admins') {
      filtered = filtered.filter((user) => user.isAdmin);
    } else if (filterBy === 'employers') {
      filtered = filtered.filter((user) => user.isEmployer);
    }

    // הצגת כל המשתמשים או רק בעלי הרשאות
    if (!showAllUsers && !searchTerm) {
      filtered = filtered.filter(
        (user) => user.isAdmin || user.isEmployer || user.pendingEmployer
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, showAllUsers, filterBy]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users: ', err);
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (userId, permission, currentValue) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { [permission]: !currentValue });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, [permission]: !currentValue } : user
        )
      );
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        ניהול משתמשים והרשאות
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        נהל הרשאות משתמשים ובקשות מעסיקים
      </Typography>

      {/* Search and Filters */}
      <Toolbar disableGutters sx={{ mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <TextField
          variant="outlined"
          placeholder="חיפוש לפי שם או אימייל..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: '250px' }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />,
          }}
        />
        <FormControl variant="outlined" sx={{ minWidth: '150px' }}>
          <InputLabel id="filter-by-label">מיין לפי</InputLabel>
          <Select
            labelId="filter-by-label"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            label="מיין לפי"
          >
            <MenuItem value="">הכל</MenuItem>
            <MenuItem value="admins">מנהלים</MenuItem>
            <MenuItem value="employers">מעסיקים</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={showAllUsers}
              onChange={() => setShowAllUsers(!showAllUsers)}
              color="primary"
            />
          }
          label="הצג את כל המשתמשים"
        />
      </Toolbar>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>משתמש</TableCell>
                <TableCell>הרשאות</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    לא נמצאו משתמשים
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={user.profileURL || user.photoURL || '/placeholder.svg'}
                          alt={user.name || user.displayName || 'User'}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {user.name || user.displayName || 'לא צוין'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.isAdmin || false}
                              onChange={() =>
                                handlePermissionToggle(
                                  user.id,
                                  'isAdmin',
                                  user.isAdmin
                                )
                              }
                              color="primary"
                            />
                          }
                          label="מנהל"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.isEmployer || false}
                              onChange={() =>
                                handlePermissionToggle(
                                  user.id,
                                  'isEmployer',
                                  user.isEmployer
                                )
                              }
                              disabled={user.pendingEmployer}
                              color="primary"
                            />
                          }
                          label="מעסיק"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.isEmployer ? (
                        <Typography color="primary">מאושר</Typography>
                      ) : user.pendingEmployer ? (
                        <Typography color="secondary">ממתין לאישור</Typography>
                      ) : (
                        <Typography color="textSecondary">לא מעסיק</Typography>
                      )}
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
                          color="primary"
                          size="small"
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
      )}
    </Box>
  );
};

export default AdminUsersPage;

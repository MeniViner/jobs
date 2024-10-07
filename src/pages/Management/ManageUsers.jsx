import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Typography,
  Button,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Person } from '@mui/icons-material';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users: ", err);
        setError("Failed to fetch users. Please try again.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
            {users.map(user => (
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
                  >
                    צפה בפרופיל
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManageUsers;
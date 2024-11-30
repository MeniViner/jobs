import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../../services/firebase';
import { Search } from 'lucide-react';
import { CircularProgress, Button, Stack } from '@mui/material';

import UserTable from './UserTable';

const ManageUsers = () => {
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedTab, setSelectedTab] = useState('workers');

  const functions = getFunctions();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filterUsers = (users) =>
      users.filter((user) =>
        Object.values(user)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    setFilteredWorkers(filterUsers(workers));
    setFilteredEmployers(filterUsers(employers));
  }, [workers, employers, searchTerm]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const workersList = userList.filter((user) => !user.isEmployer);
      const employersList = userList.filter((user) => user.isEmployer);

      setWorkers(workersList);
      setEmployers(employersList);
      setFilteredWorkers(workersList);
      setFilteredEmployers(employersList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users: ', err);
      setError('אירעה שגיאה בטעינת המשתמשים. נסה שוב.');
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
        const deleteUserFunction = httpsCallable(functions, 'deleteUser');
        await deleteUserFunction({ uid: userToDelete.id });
        setWorkers(workers.filter((user) => user.id !== userToDelete.id));
        setEmployers(employers.filter((user) => user.id !== userToDelete.id));
        setSnackbar({ open: true, message: `משתמש ${userToDelete.name} נמחק בהצלחה`, severity: 'success' });
      } catch (error) {
        console.error('Error deleting user: ', error);
        setSnackbar({ open: true, message: 'אירעה שגיאה במחיקת המשתמש', severity: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSendPasswordReset = async (email) => {
    try {
      const sendPasswordResetFunction = httpsCallable(functions, 'sendPasswordReset');
      await sendPasswordResetFunction({ email });
      setSnackbar({ open: true, message: `אימייל לאיפוס סיסמה נשלח ל-${email}`, severity: 'success' });
    } catch (error) {
      console.error('Error sending password reset email: ', error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בשליחת אימייל לאיפוס סיסמה', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">ניהול משתמשים</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש לפי כל שדה"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-11 pl-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-80"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Stack direction="row" spacing={2}>
            <Button
              variant={selectedTab === 'workers' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('workers')}
            >
              עובדים
            </Button>
            <Button
              variant={selectedTab === 'employers' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('employers')}
            >
              מעסיקים
            </Button>
          </Stack>
        </div>

        {/* User Table */}
        {selectedTab === 'workers' ? (
          <UserTable
            users={filteredWorkers}
            handleDeleteUser={handleDeleteUser}
            handleSendPasswordReset={handleSendPasswordReset}
          />
        ) : (
          <UserTable
            users={filteredEmployers}
            handleDeleteUser={handleDeleteUser}
            handleSendPasswordReset={handleSendPasswordReset}
            isEmployer={true}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900">אישור מחיקת משתמש</h3>
            <p className="mt-2 text-gray-500">
              האם אתה בטוח שברצונך למחוק את המשתמש {userToDelete?.name}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => setDeleteDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmDeleteUser}
              >
                מחק
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div
          className={`fixed bottom-4 left-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            snackbar.severity === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
          onClick={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

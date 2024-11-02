// ManageUsers.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CircularProgress, Avatar, Button, Stack } from '@mui/material';
import { Mail as MailIcon, Trash2 as TrashIcon } from 'lucide-react';

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

// UserTable Component
const UserTable = ({ users, handleDeleteUser, handleSendPasswordReset, isEmployer = false }) => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-right">
              <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                שם
              </th>
              <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                אימייל
              </th>
              {isEmployer ? (
                <>
                  <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                    שם העסק
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                    סוג העסק
                  </th>
                </>
              ) : (
                <>
                  <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                    מיקום
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                    גיל
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                    מקצוע
                  </th>
                </>
              )}
              <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    to={`/user/${user.id}`}
                    className="flex items-center gap-3 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    <Avatar
                      src={user.profileURL || user.photoURL || '/placeholder.svg'}
                      alt={user.name || 'User'}
                      sx={{ width: 32, height: 32 }}
                    />
                    {user.name || 'שם משתמש'}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                {isEmployer ? (
                  <>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.companyName || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.businessType || '-'}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.location || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.age || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.profession || '-'}
                    </td>
                  </>
                )}
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendPasswordReset(user.email)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500"
                      title="שלח אימות סיסמה"
                    >
                      <MailIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                      title="מחק משתמש"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={isEmployer ? 5 : 7} className="px-6 py-4 text-center text-sm text-gray-500">
                  אין משתמשים להצגה
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

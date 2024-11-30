import React, {useState} from "react";
import { Link } from 'react-router-dom';
import { Mail as MailIcon, Trash2 as TrashIcon } from 'lucide-react';
import {Avatar, } from '@mui/material';

import EmployeeWorkedJobs from "../UserHistory/EmployeeWorkedJobs";


export default function UserTable ({ users, handleDeleteUser, handleSendPasswordReset, isEmployer = false }) {
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleUserClick = (userId) => {
        setSelectedUserId(userId); // קובע את ה-`userId` שנבחר
    };

    const handleBackClick = () => {
        setSelectedUserId(null); // Reset the selected user ID to return to the table
    };

    if (selectedUserId) {
        return (
          <div>
            {/* Back button to return to the user table */}
            <button
              onClick={handleBackClick}
              className="mb-4 rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500"
            >
              חזרה
            </button>
            <EmployeeWorkedJobs userId={selectedUserId} />
          </div>
        );
    }
        

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
                    <th className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-600">
                     עבודות
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
                        <td className="whitespace-nowrap px-6 py-4 text-sm ">
                            {user.workedJobs?.length > 0 ? (
                                <button 
                                    onClick={() => handleUserClick(user.id)} 
                                    className="text-blue-500 ">
                                {user.workedJobs.length}
                                </button>
                            ) : (
                                "-"
                            )}
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
              {selectedUserId && <EmployeeWorkedJobs userId={selectedUserId} />}
            </tbody>
          </table>
        </div>
      </div>
    );
};
  
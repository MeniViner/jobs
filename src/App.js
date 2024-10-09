import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import PostJob from './pages/PostJob';
import AdminStatisticsPage from './pages/Management/AdminStatisticsPage.js';
import AdminMessagesDashboard from './pages/Management/AdminMessagesDashboard';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ManageUsers from './pages/Management/ManageUsers';
import AccountPage from './pages/profile/AccountPage';
import JobChat from './pages/JobChat'; // ייבוא הקומפוננטה של הצ'אט
import LoginPage from './pages/profile/loginPage';
import AdminPage from './pages/Management/AdminPage.jsx';
import AdminUsersPage from './pages/Management/AdminUsersPage';
import MyWorksPage from './pages/WorksIPublished.js';
import MyApplications from './pages/NominatedWorks.js';
import UserProfilePage from './pages/profile/SocialProfile.js';
import TopUsersPage from './pages/Management/TopUsersPage.js';
import JobCompletionRating from './pages/rating/JobCompletionRating.tsx';
import EmployerRegistrationForm from './pages/profile/EmployerRegistrationForm.jsx';


const ProtectedAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const theme = createTheme({
  direction: 'rtl', // תמיכה בימין לשמאל
});

// יצירת cache עם תמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

function App() {
  return (
    <AuthProvider>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/management/top-users" element={<TopUsersPage />} />
              <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
              <Route path="/job-chat" element={<JobChat />} /> {/* נתיב לדף הצ'אט */}
              <Route path="/user/:userId" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsersPage /></ProtectedAdminRoute>} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/admin/messages" element={<AdminMessagesDashboard />} />
              <Route path="/ManageUsers" element={<ManageUsers />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/chat/:jobId" element={<JobChat />} />
              <Route path="/my-published-jobs" element={<MyWorksPage />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/employer-registration" element={<EmployerRegistrationForm />} />
              
              {/* נתיב לדף הדירוג החדש */}
              <Route path="/rate-employer/:jobId" element={<JobCompletionRating />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </CacheProvider>
    </AuthProvider>
  );
}

export default App;

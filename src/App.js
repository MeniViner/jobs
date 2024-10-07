import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import PostJob from './pages/PostJob';
import AdminMessagesDashboard from './pages/Management/AdminMessagesDashboard';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';
import EmployerProfile from './pages/profile/EmployerProfile';
import ManageUsers from './pages/Management/ManageUsers';
import AccountPage from './pages/profile/AccountPage';
import JobChat from './pages/JobChat';
import LoginPage from './pages/profile/loginPage';
import AdminPage from './pages/Management/AdminPage';
import AdminUsersPage from './pages/Management/AdminUsersPage';
import EmployerChatPage from './pages/Myworks';
import MyApplications from './pages/MyApplications.js';
import EmployerRegistration from './pages/profile/EmployerRegistration.jsx';




// Create a theme with RTL support
const theme = createTheme({
  direction: 'rtl',  // Right-to-left support
});

// Create RTL cache
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
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/post-job" element={<PostJob />} />
              <Route path="/admin/messages" element={<AdminMessagesDashboard />} />
              <Route path="/ManageUsers" element={<ManageUsers />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/employer-registration" element={<EmployerRegistration />} />
              <Route path="/employer-profile" element={<EmployerProfile />} />
              <Route path="/chat/:jobId" element={<JobChat />} />
              <Route path="/employer-chat" element={<EmployerChatPage />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </CacheProvider>
    </AuthProvider>
  ); 
}

export default App;
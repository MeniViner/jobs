import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import PostJob from './pages/PostJob';
import AdminMessagesDashboard from './pages/AdminMessagesDashboard';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';
import ProfileComponents from './components/ProfileComponents';
import EmployerProfile from './pages/EmployerProfile';
import RegisterPage from './pages/profile/registerPage';
import ManageUsers from './pages/Management/ManageUsers';



function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/employer-register" element={<ProfileComponents.RegisterPage />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/admin/messages" element={<AdminMessagesDashboard />} />
            <Route path="/ManageUsers" element={<ManageUsers />} />
            <Route path="/RegisterPage" element={<RegisterPage />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
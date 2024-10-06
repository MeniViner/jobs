
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
import UserProfile from './components/UserProfile';
import JobChat from './pages/JobChat'; // ייבוא דף הצ'אט

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/register" element={<ProfileComponents.RegisterPage />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/admin/messages" element={<AdminMessagesDashboard />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route path="/chat/:jobId" element={<JobChat />} /> {/* נתיב לדף הצ'אט עם מזהה העבודה */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

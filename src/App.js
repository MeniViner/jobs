// App.js
import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery, Box } from '@mui/material';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CompanyInfoPage from 'pages/CompanyInfoPage';
import JobDetails from 'pages/publishedWorkes/JobDetails';
import UserReviews from 'pages/UserReviews';
// ייבוא כל הרכיבים שלך
import PostJob from './pages/PostJob';
import AdminStatisticsPage from './pages/Management/AdminStatisticsPage.js';
import AdminMessagesDashboard from './pages/Management/AdminMessagesDashboard';
import Header from './menu/Header';
import HomePage from './pages/recycling basket/HomePage';
// import JobListPage from './pages/JobListPage';
import JobListPage from 'pages/mainJobs/JobListPage';

import SavedJobsPage from './pages/mainJobs/SavedJobsPage';
import ManageUsers from './pages/Management/ManageUsers';
import AccountPage from './pages/profile/AccountPage';
import JobChat from './pages/JobChat';
import LoginPage from './pages/profile/loginPage';
import AdminPage from './pages/Management/AdminPage.jsx';
import AdminUsersPage from './pages/Management/AdminUsersPage';
import MyWorksPage from './pages/publishedWorkes/MyWorksPage';
import MyApplications from './pages/NominatedWorks.js';
import UserProfilePage from './pages/profile/SocialProfile.js';
import TopUsersPage from './pages/Management/TopUsersPage.js';
import JobCompletionRating from './pages/rating/JobCompletionRating';
import EmployerRegistrationForm from './pages/profile/EmployerRegistrationForm.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.js';
import MobileMenuPage from './menu/MobileMenuPage';
import HistoryPage from 'pages/WorkHistory';
import NotificationSettings from 'pages/notifications/NotificationSettingsPage';
import NotificationTestPage from 'pages/notifications/NotificationTestPage';


const ProtectedAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const appTheme = createTheme({
  direction: 'rtl', // תמיכה בימין לשמאל
});

// יצירת cache עם תמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // זיהוי אם המכשיר הוא נייד
  const location = useLocation(); // שימוש ב-useLocation כדי לקבל את הנתיב הנוכחי

  useEffect(() => {
    window.scrollTo(0, 0); // גולל לראש העמוד בכל פעם שהנתיב משתנה
  }, [location.pathname]); // הפעלת useEffect כאשר הנתיב משתנה

  return (
    <AuthProvider>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                pt: { sm: '64px', md: '70px' }, // התאמה לגובה ה-Header
                pb: isMobile ? '64px' : 0, // הוספת מרווח תחתון למכשירים ניידים
                bgcolor: 'background.default',
              }}
            >
              <Routes>
                <Route path="/" element={<JobListPage />} />
                <Route path="/management/top-users" element={<TopUsersPage />} />
                <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
                <Route path="/job-chat" element={<JobChat />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedAdminRoute>
                      <AdminUsersPage />
                    </ProtectedAdminRoute>
                  }
                />

                  <Route path="/my-reviews" element={<UserReviews />} />
                <Route path="/company-info" element={<CompanyInfoPage />} />
                <Route path="/job/:id" element={<JobDetails />} />
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
                <Route path="/rate-employer/:jobId" element={<JobCompletionRating />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/mobile-menu" element={<MobileMenuPage />} />
                <Route path="/my-job-history" element={<HistoryPage />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />


                <Route path="/notification-test" element={<NotificationTestPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </ThemeProvider>
      </CacheProvider>
    </AuthProvider>
  );
}

// עטיפת ה-App ב-Router כדי שנוכל להשתמש ב-useLocation
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;

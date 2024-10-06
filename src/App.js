// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/Header.jsx';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardWorker from './pages/DashboardWorker';
// import DashboardEmployer from './pages/DashboardEmployer';
// import JobList from './pages/JobList';
// import JobDetails from './pages/JobDetails';
// import ProfilePage from './pages/ProfilePage';
// import NotFound from './pages/NotFound';


// function App() {
//   return (
//     <Router>
//       <Header />
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/dashboard/worker" element={<DashboardWorker />} />
//         <Route path="/dashboard/employer" element={<DashboardEmployer />} />
//         <Route path="/jobs" element={<JobList />} />
//         <Route path="/jobs/:id" element={<JobDetails />} />
//         <Route path="/profile/:id" element={<ProfilePage />} />
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/jobs" component={JobListPage} />
            <Route path="/profile/:id" component={ProfilePage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
          </Switch>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
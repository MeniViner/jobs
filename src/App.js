import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardWorker from './pages/DashboardWorker';
import DashboardEmployer from './pages/DashboardEmployer';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/worker" element={<DashboardWorker />} />
        <Route path="/dashboard/employer" element={<DashboardEmployer />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

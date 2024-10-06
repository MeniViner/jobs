import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardWorker from './pages/DashboardWorker/DashboardWorker';
import DashboardEmployer from './pages/DashboardEmployer/DashboardEmployer';
import JobList from './pages/JobList/JobList';
import JobDetails from './pages/JobDetails/JobDetails';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import NotFound from './pages/NotFound/NotFound';

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
      <Footer />
    </Router>
  );
}

export default App;

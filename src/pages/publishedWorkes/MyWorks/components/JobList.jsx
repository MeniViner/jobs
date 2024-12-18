import React from 'react';
import MyJobsList from './MyJobsList';

const JobList = ({ 
  jobs, 
  jobApplicants, 
  isHistoryView, 
  onDeleteJob, 
  onEditJob, 
  onOpenChat, 
  onMarkJobCompleted, 
  fetchEmployerJobs, 
  setJobs, 
  setJobApplicants, 
  onSelectJob 
}) => (
  <MyJobsList 
    jobs={jobs} 
    jobApplicants={jobApplicants}
    isHistoryView={isHistoryView}
    onDeleteJob={onDeleteJob}
    onEditJob={onEditJob}
    onOpenChat={onOpenChat}
    onMarkJobCompleted={onMarkJobCompleted}
    fetchEmployerJobs={fetchEmployerJobs}
    setJobs={setJobs}
    setJobApplicants={setJobApplicants}
    onSelectJob={onSelectJob}
  />
);

export default JobList;


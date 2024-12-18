import React from 'react';
import { Briefcase, MapPin, Users, Clock, ChevronRight } from 'lucide-react';

const JobCard = ({ job, jobApplicants, onSelectJob, getHiredCount, isHistoryView }) => {
  const hiredCount = getHiredCount(job.id);
  const totalWorkers = job.workersNeeded || 1;
  const progress = totalWorkers === 0 ? 0 : Math.round((hiredCount / totalWorkers) * 100);
  
  return (
    <div 
      onClick={() => onSelectJob(job)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
    >
      <div className="p-6 space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h2>
              <div className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1 rtl:ml-1" />
                {job.location}
              </div>
            </div>
          </div>
          
          {!isHistoryView && (
            <div className="bg-blue-50 px-4 py-2 rounded-full">
              <div className="text-center">
                <span className="block text-blue-600 font-semibold">
                  {jobApplicants[job.id]?.length || 0}
                </span>
                <span className="text-xs text-blue-600/70">מועמדים</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {!isHistoryView && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">התקדמות גיוס</span>
              <span className="text-blue-600 font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-1.5 rtl:ml-1.5" />
              <span>{hiredCount}/{totalWorkers}</span>
            </div>
            {!isHistoryView && (
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-1.5 rtl:ml-1.5" />
                <span>{job.timeLeft || 'לא זמין'}</span>
              </div>
            )}
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default function JobList({
  jobs = [],
  jobApplicants = {},
  onSelectJob,
  isHistoryView,
  onDeleteJob,
  onEditJob,
  onOpenChat,
  onMarkJobCompleted,
  fetchEmployerJobs,
  setJobs,
  setJobApplicants,
}) {
  const getHiredCount = (jobId) => {
    const applicantsForJob = jobApplicants[jobId] || [];
    return applicantsForJob.filter((applicant) => applicant.hired).length;
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen p-6">
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            jobApplicants={jobApplicants}
            onSelectJob={onSelectJob}
            getHiredCount={getHiredCount}
            isHistoryView={isHistoryView}
          />
        ))}
      </div>
    </div>
  );
}


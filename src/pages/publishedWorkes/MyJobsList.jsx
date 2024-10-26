import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function JobList({ jobs = [], jobApplicants = {} }) {
  const navigate = useNavigate();

  // פונקציה לספירת מספר העובדים שהועסקו
  const getHiredCount = (jobId) => {
    const applicantsForJob = jobApplicants[jobId] || [];
    return applicantsForJob.filter((applicant) => applicant.hired).length;
  };

  const calculateProgress = (hired, total) => {
    if (total === 0) return 0; // מניעת חלוקה באפס
    return Math.round((hired / total) * 100);
  };

  return (
    <div className="w-full max-w-md mx-auto  min-h-screen  space-y-4">
      {jobs.map((job) => {
        const hiredCount = getHiredCount(job.id); // מספר עובדים שהועסקו
        const totalWorkers = job.workersNeeded || 1; // סך העובדים הנדרשים

        return (
          <div
            key={job.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
            onClick={() => navigate(`/job/${job.id}`)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">{job.title}</h2>
                    <p className="text-sm text-gray-500">{job.location}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-bold text-blue-600">
                    {jobApplicants[job.id]?.length || 0}
                  </span>
                  <span className="text-xs text-gray-500">מועמדים</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>התקדמות</span>
                  <span>{calculateProgress(hiredCount, totalWorkers)}%</span>
                </div>
                <ProgressBar value={calculateProgress(hiredCount, totalWorkers)} />
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  <span>
                    {hiredCount} / {totalWorkers} עובדים
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{job.timeLeft || 'לא זמין'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">פרטים נוספים</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

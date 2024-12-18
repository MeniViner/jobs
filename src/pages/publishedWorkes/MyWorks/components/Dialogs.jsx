import React from 'react';
import DeleteJobDialog from './DeleteJobDialog';
import EditJobDialog from './EditJobDialog';
import ChatDialog from './ChatDialog';
import JobCompletionRating from '../rating/JobCompletionRating';

const Dialogs = ({
  openDeleteDialog,
  setOpenDeleteDialog,
  handleDeleteJob,
  openEditDialog,
  setOpenEditDialog,
  jobToEdit,
  handleSaveEditedJob,
  openChatDialog,
  setOpenChatDialog,
  selectedApplicant,
  jobs,
  handleSendMessage,
  openRatingDialog,
  setOpenRatingDialog,
  jobToRate,
  fetchEmployerJobs
}) => (
  <>
    <DeleteJobDialog
      open={openDeleteDialog}
      onClose={() => setOpenDeleteDialog(false)}
      onConfirm={handleDeleteJob}
    />
    <EditJobDialog
      open={openEditDialog}
      handleClose={() => {
        setOpenEditDialog(false);
        setJobToEdit(null);
      }}
      job={jobToEdit}
      handleSave={handleSaveEditedJob}
    />
    <ChatDialog
      open={openChatDialog}
      onClose={() => setOpenChatDialog(false)}
      applicant={selectedApplicant}
      jobTitle={jobs.find((job) => job.id === selectedApplicant?.jobId)?.title}
      onSendMessage={handleSendMessage}
    />
    <JobCompletionRating
      jobTitle={jobs.find((job) => job.id === selectedApplicant?.jobId)?.title || 'job not found'}
      open={openRatingDialog}
      onClose={() => {
        setOpenRatingDialog(false);
        setJobToRate(null);
      }}
      jobId={jobToRate}
      onComplete={() => {
        fetchEmployerJobs();
        setOpenRatingDialog(false);
        setJobToRate(null);
      }}
    />
  </>
);

export default Dialogs;


// AdminJobsDashboard.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Grid } from '@mui/material';

import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Collapse,
  Chip,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Search,
  MoreVert,
  Delete,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  LocationOn,
  Schedule,
  Group,
  AttachMoney,
  DirectionsCar,
  EventAvailable,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AdminJobsDashboard() {
  // Existing state management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedEmployer, setExpandedEmployer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedEmployerId, setSelectedEmployerId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.map((employer) => {
        const employerMatches = (employer.employerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        if (employerMatches) {
          return employer;
        }

        const filteredJobs = employer.jobs.filter(job =>
          (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (job.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (job.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (job.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

        if (filteredJobs.length > 0) {
          return {
            ...employer,
            jobs: filteredJobs,
          };
        } else {
          return null;
        }
      }).filter(employer => employer !== null);

      setFilteredJobs(filtered);
    }
  }, [jobs, searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch jobs
      const jobsCollection = collection(db, 'jobs');
      const jobSnapshot = await getDocs(jobsCollection);
      const jobList = jobSnapshot.docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        };
      });

      // Fetch applications
      const applicationsCollection = collection(db, 'applications');
      const applicationsSnapshot = await getDocs(applicationsCollection);
      const applicationsList = applicationsSnapshot.docs.map((docSnapshot) => {
        return docSnapshot.data();
      });

      // Map jobId to employee count
      const jobEmployeeCountMap = {};
      applicationsList.forEach((application) => {
        const jobId = application.jobId;
        if (jobEmployeeCountMap[jobId]) {
          jobEmployeeCountMap[jobId]++;
        } else {
          jobEmployeeCountMap[jobId] = 1;
        }
      });

      // Process jobList
      const processedJobList = await Promise.all(
        jobList.map(async (jobData) => {
          let employerData = null;
          if (jobData.employerId) {
            const employerDocRef = doc(db, 'users', jobData.employerId);
            const employerDocSnapshot = await getDoc(employerDocRef);
            if (employerDocSnapshot.exists()) {
              employerData = employerDocSnapshot.data();
            }
          }
          return {
            ...jobData,
            employerName: employerData?.displayName || employerData?.name || 'לא צוין',
            employerEmail: employerData?.email || 'לא צוין',
            employerPhone: employerData?.phone || 'לא צוין',
            employerId: jobData.employerId || 'unknown',
            employeeCount: jobEmployeeCountMap[jobData.id] || 0,
            employerProfileURL: employerData?.profileURL || employerData?.photoURL || '/placeholder.svg',
          };
        })
      );

      // Group jobs by employerId
      const employerMap = {};
      processedJobList.forEach((job) => {
        const employerId = job.employerId || 'unknown';
        if (!employerMap[employerId]) {
          employerMap[employerId] = {
            employerId,
            employerName: job.employerName,
            employerEmail: job.employerEmail,
            employerPhone: job.employerPhone,
            employerProfileURL: job.employerProfileURL,
            jobs: [],
          };
        }
        employerMap[employerId].jobs.push(job);
      });

      const groupedJobs = Object.values(employerMap);

      setJobs(groupedJobs);
      setFilteredJobs(groupedJobs);
    } catch (error) {
      console.error("Error fetching jobs: ", error);
      setSnackbar({ open: true, message: 'אירעה שגיאה בטעינת המשרות', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (job) => {
    setCurrentJob(job);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentJob(null);
  };

  const handleSaveJob = async () => {
    if (currentJob) {
      try {
        const jobDocRef = doc(db, 'jobs', currentJob.id);
        await updateDoc(jobDocRef, { ...currentJob });
        setSnackbar({ open: true, message: 'המשרה עודכנה בהצלחה', severity: 'success' });
        fetchJobs();
        handleCloseDialog();
      } catch (error) {
        console.error("Error updating job: ", error);
        setSnackbar({ open: true, message: 'אירעה שגיאה בעדכון המשרה', severity: 'error' });
      }
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      const jobDocRef = doc(db, 'jobs', id);
      await deleteDoc(jobDocRef);
      setSnackbar({ open: true, message: 'המשרה נמחקה בהצלחה', severity: 'success' });
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job: ", error);
      setSnackbar({ open: true, message: 'אירעה שגיאה במחיקת המשרה', severity: 'error' });
    }
  };

  const handleExpandRow = (jobId) => {
    setExpandedRow(expandedRow === jobId ? null : jobId);
  };

  const handleExpandEmployer = (employerId) => {
    setExpandedEmployer(expandedEmployer === employerId ? null : employerId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, jobId) => {
    setAnchorEl(event.currentTarget);
    setSelectedJobId(jobId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJobId(null);
  };

  const handleViewEmployerProfile = (employerId) => {
    navigate(`/user/${employerId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header and Search */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          ניהול משרות
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          נהל את כל המשרות הפעילות במערכת
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="חיפוש לפי כותרת, חברה, מיקום..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 2,
            }
          }}
        />
      </Box>

      {/* Jobs List */}
      <Stack spacing={2}>
        {filteredJobs.map((employer) => (
          <Card key={employer.employerId} sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={employer.employerProfileURL}
                  alt={employer.employerName}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="h6">{employer.employerName || 'לא צוין'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {employer.employerEmail}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={`${employer.jobs.length} משרות`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <IconButton onClick={() => handleViewEmployerProfile(employer.employerId)}>
                  <Person />
                </IconButton>
                <IconButton onClick={() => handleExpandEmployer(employer.employerId)}>
                  {expandedEmployer === employer.employerId ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedEmployer === employer.employerId}>
              <Divider />
              {employer.jobs.map((job) => (
                <Box key={job.id}>
                  <Box sx={{ p: 2, '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {job.title || 'N/A'}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                          <Chip
                            size="small"
                            icon={<Business />}
                            label={job.companyName || 'N/A'}
                          />
                          <Chip
                            size="small"
                            icon={<LocationOn />}
                            label={job.location || 'N/A'}
                          />
                          <Chip
                            size="small"
                            icon={<Schedule />}
                            label={job.type || 'N/A'}
                          />
                          <Chip
                            size="small"
                            icon={<Group />}
                            label={`${job.employeeCount} מועמדים`}
                          />
                          <Chip
                            size="small"
                            icon={<AttachMoney />}
                            label={`₪${job.salary || 'N/A'}`}
                          />
                          <Chip
                            size="small"
                            icon={<Group />}
                            label={`${job.workersNeeded || '1'} עובדים נדרשים`}
                          />
                          {job.requiresCar && (
                            <Chip
                              size="small"
                              icon={<DirectionsCar />}
                              label="דורש רכב"
                            />
                          )}
                          {job.isFlexibleTime && (
                            <Chip
                              size="small"
                              icon={<Schedule />}
                              label="שעות גמישות"
                            />
                          )}
                          {job.isFlexibleDates && (
                            <Chip
                              size="small"
                              icon={<EventAvailable />}
                              label="תאריכים גמישים"
                            />
                          )}
                        </Stack>
                      </Box>

                      <IconButton onClick={(e) => handleMenuOpen(e, job.id)}>
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleExpandRow(job.id)}
                      endIcon={expandedRow === job.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    >
                      {expandedRow === job.id ? 'הסתר פרטים' : 'הצג פרטים'}
                    </Button>

                    <Collapse in={expandedRow === job.id}>
                      <Box sx={{ mt: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          תיאור המשרה
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {job.description || 'לא צוין'}
                        </Typography>
                        {job.fullDescription && (
                          <>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              פירוט נוסף
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              {job.fullDescription}
                            </Typography>
                          </>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              שעות עבודה
                            </Typography>
                            <Typography variant="body2">
                              {job.isFlexibleTime ? 'שעות גמישות' : (job.startTime && job.endTime) ? `${job.startTime} - ${job.endTime}` : 'לא צוין'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              תאריכי עבודה
                            </Typography>
                            <Typography variant="body2">
                              {job.isFlexibleDates ? 'תאריכים גמישים' : (job.workDates && job.workDates.length > 0) ? job.workDates.join(', ') : 'לא צוין'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              מספר עובדים נדרש
                            </Typography>
                            <Typography variant="body2">
                              {job.workersNeeded || 1}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              דרישות מיוחדות
                            </Typography>
                            <Typography variant="body2">
                              {job.requiresCar ? 'דורש רכב' : 'אין'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Collapse>
          </Card>
        ))}
      </Stack>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenDialog(jobs.flatMap(e => e.jobs).find(j => j.id === selectedJobId));
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          ערוך משרה
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteJob(selectedJobId);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          מחק משרה
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ערוך משרה</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="כותרת"
              value={currentJob?.title || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="חברה"
              value={currentJob?.companyName || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, companyName: e.target.value })}
            />
            <TextField
              fullWidth
              label="מיקום"
              value={currentJob?.location || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
            />
            <TextField
              fullWidth
              label="סוג משרה"
              value={currentJob?.type || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value })}
            />
            <TextField
              fullWidth
              label="שכר"
              type="number"
              value={currentJob?.salary || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, salary: e.target.value })}
            />
            <TextField
              fullWidth
              label="תיאור"
              multiline
              rows={4}
              value={currentJob?.description || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="פירוט נוסף"
              multiline
              rows={4}
              value={currentJob?.fullDescription || ''}
              onChange={(e) => setCurrentJob({ ...currentJob, fullDescription: e.target.value })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentJob?.isFlexibleTime || false}
                  onChange={(e) => setCurrentJob({ ...currentJob, isFlexibleTime: e.target.checked })}
                />
              }
              label="שעות גמישות"
            />
            {!currentJob?.isFlexibleTime && (
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="שעת התחלה"
                  type="time"
                  value={currentJob?.startTime || ''}
                  onChange={(e) => setCurrentJob({ ...currentJob, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="שעת סיום"
                  type="time"
                  value={currentJob?.endTime || ''}
                  onChange={(e) => setCurrentJob({ ...currentJob, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentJob?.isFlexibleDates || false}
                  onChange={(e) => setCurrentJob({ ...currentJob, isFlexibleDates: e.target.checked })}
                />
              }
              label="תאריכים גמישים"
            />
            {!currentJob?.isFlexibleDates && (
              <>
                {currentJob?.workDates?.map((date, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <TextField
                      label={`תאריך ${index + 1}`}
                      type="date"
                      value={date}
                      onChange={(e) => {
                        const newDates = [...currentJob.workDates];
                        newDates[index] = e.target.value;
                        setCurrentJob({ ...currentJob, workDates: newDates });
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    {currentJob?.workDates?.length > 1 && (
                      <IconButton onClick={() => {
                        const newDates = currentJob.workDates.filter((_, i) => i !== index);
                        setCurrentJob({ ...currentJob, workDates: newDates });
                      }}>
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button onClick={() => {
                  const newDates = [...(currentJob.workDates || []), ''];
                  setCurrentJob({ ...currentJob, workDates: newDates });
                }}>
                  הוסף תאריך
                </Button>
              </>
            )}
            <TextField
              fullWidth
              label="מספר עובדים נדרש"
              type="number"
              value={currentJob?.workersNeeded || 1}
              onChange={(e) => setCurrentJob({ ...currentJob, workersNeeded: e.target.value })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentJob?.requiresCar || false}
                  onChange={(e) => setCurrentJob({ ...currentJob, requiresCar: e.target.checked })}
                />
              }
              label="דורש רכב"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button onClick={handleSaveJob} variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

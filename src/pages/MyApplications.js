import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Chat as ChatIcon, 
  Work as WorkIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon, 
  DateRange as DateIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [hiredJobs, setHiredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user) {
      fetchApplicationsAndHiredJobs();
    }
  }, [user]);

  const fetchApplicationsAndHiredJobs = async () => {
    setLoading(true);
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsCollection);
      const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const applicationsMap = new Map();
      const hiredJobsMap = new Map();

      for (const job of jobsData) {
        const applicantsCollection = collection(db, 'jobChats', job.id, 'applicants');
        const applicantsQuery = query(applicantsCollection, where('applicantId', '==', user.uid));
        const applicantsSnapshot = await getDocs(applicantsQuery);

        if (!applicantsSnapshot.empty) {
          const latestApplication = applicantsSnapshot.docs.reduce((latest, current) => {
            return latest.data().timestamp > current.data().timestamp ? latest : current;
          });

          const applicationData = {
            id: latestApplication.id,
            jobId: job.id,
            jobTitle: job.title,
            companyName: job.companyName,
            appliedAt: latestApplication.data().timestamp,
            status: latestApplication.data().hired ? 'התקבלת' : 'ממתין',
            applicationCount: applicantsSnapshot.size,
            location: job.location,
            startTime: job.startTime,
            workDates: job.workDates,
          };

          if (latestApplication.data().hired) {
            hiredJobsMap.set(job.id, applicationData);
          } else {
            applicationsMap.set(job.id, applicationData);
          }
        }
      }

      setApplications(Array.from(applicationsMap.values()));
      setHiredJobs(Array.from(hiredJobsMap.values()));
    } catch (error) {
      console.error("Error fetching applications and hired jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const renderApplications = () => {
    if (applications.length === 0) {
      return (
        <Typography variant="h6" align="center">
          לא הגשת עדיין מועמדות לאף משרה
        </Typography>
      );
    }

    if (isMobile) {
      return (
        <Grid container spacing={2}>
          {applications.map((application) => (
            <Grid item xs={12} key={application.jobId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {application.jobTitle}
                  </Typography>
                  <Typography color="text.secondary">
                    {application.companyName}
                  </Typography>
                  <Typography variant="body2">
                    תאריך הגשה: {application.appliedAt ? new Date(application.appliedAt.toDate()).toLocaleDateString('he-IL') : 'לא זמין'}
                  </Typography>
                  <Typography variant="body2">
                    מספר הגשות: {application.applicationCount}
                  </Typography>
                  <Typography variant="body2">
                    סטטוס: {application.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={`/chat/${application.jobId}`}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ChatIcon />}
                  >
                    צ'אט
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת המשרה</TableCell>
              <TableCell>שם החברה</TableCell>
              <TableCell>תאריך הגשה אחרון</TableCell>
              <TableCell>מספר הגשות</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.jobId}>
                <TableCell>{application.jobTitle}</TableCell>
                <TableCell>{application.companyName}</TableCell>
                <TableCell>{application.appliedAt ? new Date(application.appliedAt.toDate()).toLocaleDateString('he-IL') : 'לא זמין'}</TableCell>
                <TableCell>{application.applicationCount}</TableCell>
                <TableCell>{application.status}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/chat/${application.jobId}`}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ChatIcon />}
                  >
                    צ'אט
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderHiredJobs = () => {
    if (hiredJobs.length === 0) {
      return (
        <Typography variant="h6" align="center">
          טרם התקבלת לאף עבודה
        </Typography>
      );
    }

    if (isMobile) {
      return (
        <Grid container spacing={2}>
          {hiredJobs.map((job) => (
            <Grid item xs={12} key={job.jobId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {job.jobTitle}
                  </Typography>
                  <Typography color="text.secondary">
                    {job.companyName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {job.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <DateIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {job.workDates ? job.workDates.join(', ') : 'לא זמין'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {job.startTime || 'לא זמין'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={`/chat/${job.jobId}`}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ChatIcon />}
                  >
                    צ'אט
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>כותרת המשרה</TableCell>
              <TableCell>שם החברה</TableCell>
              <TableCell>מיקום</TableCell>
              <TableCell>תאריכי עבודה</TableCell>
              <TableCell>שעת התחלה</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hiredJobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell>{job.jobTitle}</TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {job.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {job.workDates ? job.workDates.join(', ') : 'לא זמין'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {job.startTime || 'לא זמין'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/chat/${job.jobId}`}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ChatIcon />}
                  >
                    צ'אט
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        המועמדויות והעבודות שלי
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="application tabs"
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="מועמדויות שהגשתי" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="עבודות שהתקבלתי" icon={<CheckCircleIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        {renderApplications()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderHiredJobs()}
      </TabPanel>
    </Container>
  );
}
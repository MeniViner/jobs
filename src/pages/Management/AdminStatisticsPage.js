import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, CircularProgress, Box, Card, CardContent, CardHeader, Tab, Tabs
} from '@mui/material';
import {
  Work, CheckCircle, Pending, Person, Business, Assignment, TrendingUp, AttachMoney
} from '@mui/icons-material';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const StatCard = ({ title, value, icon }) => (
  <Card>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h4" component="p">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState({
    totalJobs: 0, completedJobs: 0, activeJobs: 0, totalWorkers: 0,
    totalEmployers: 0, averageJobsPerEmployer: 0, averageDailyJobs: 0,
    averageJobCost: 0, jobsPerDay: [], jobTypes: [], employerJobCounts: []
  });

  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const jobsSnapshot = await getCountFromServer(collection(db, 'jobs'));
        const totalJobs = jobsSnapshot.data().count;

        const completedJobsQuery = query(collection(db, 'jobs'), where('isCompleted', '==', true));
        const completedJobsSnapshot = await getCountFromServer(completedJobsQuery);
        const completedJobs = completedJobsSnapshot.data().count;

        const activeJobs = totalJobs - completedJobs;

        const workersQuery = query(collection(db, 'users'), where('isEmployer', '==', false));
        const workersSnapshot = await getCountFromServer(workersQuery);
        const totalWorkers = workersSnapshot.data().count;

        const employersQuery = query(collection(db, 'users'), where('isEmployer', '==', true));
        const employersSnapshot = await getCountFromServer(employersQuery);
        const totalEmployers = employersSnapshot.data().count;

        const jobsQuery = query(collection(db, 'jobs'));
        const jobsDocsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const averageJobsPerEmployer = totalEmployers > 0 ? (totalJobs / totalEmployers).toFixed(2) : 0;

        const now = new Date();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const recentJobs = jobs.filter(job => job.createdAt?.toDate() > oneWeekAgo);
        const averageDailyJobs = (recentJobs.length / 7).toFixed(2);

        const totalCost = jobs.reduce((sum, job) => sum + (job.salary || 0), 0);
        const averageJobCost = totalJobs > 0 ? (totalCost / totalJobs).toFixed(2) : 0;

        const jobsPerDay = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
          const count = recentJobs.filter(job => job.createdAt?.toDate().toDateString() === date.toDateString()).length;
          return { name: date.toLocaleDateString('he-IL'), Jobs: count };
        });

        const jobTypeCounts = jobs.reduce((acc, job) => {
          acc[job.type] = (acc[job.type] || 0) + 1;
          return acc;
        }, {});
        const jobTypes = Object.entries(jobTypeCounts).map(([name, value]) => ({ name, value }));

        const employerJobCounts = Array.from({ length: 5 }, (_, i) => ({
          name: `מעסיק ${i + 1}`, Jobs: Math.floor(Math.random() * 50) + 1
        }));

        setStats({
          totalJobs, completedJobs, activeJobs, totalWorkers, totalEmployers,
          averageJobsPerEmployer, averageDailyJobs, averageJobCost, jobsPerDay, jobTypes, employerJobCounts
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">סטטיסטיקות האתר</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "סה״כ עבודות", value: stats.totalJobs, icon: <Work /> },
          { title: "עבודות שהושלמו", value: stats.completedJobs, icon: <CheckCircle /> },
          { title: "עבודות פעילות", value: stats.activeJobs, icon: <Pending /> },
          { title: "סה״כ עובדים", value: stats.totalWorkers, icon: <Person /> },
          { title: "סה״כ מעסיקים", value: stats.totalEmployers, icon: <Business /> },
          { title: "ממוצע עבודות למעסיק", value: stats.averageJobsPerEmployer, icon: <Assignment /> },
          { title: "ממוצע עבודות ביום", value: stats.averageDailyJobs, icon: <TrendingUp /> },
          { title: "עלות ממוצעת לעבודה", value: `₪${stats.averageJobCost}`, icon: <AttachMoney /> }
        ].map(({ title, value, icon }, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard title={title} value={value} icon={icon} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardHeader title="גרפים סטטיסטיים" />
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="עבודות יומיות" />
            <Tab label="סוגי עבודות" />
            <Tab label="עבודות למעסיק" />
          </Tabs>
          <Box sx={{ height: 400, mt: 2 }}>
            {tabValue === 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.jobsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Jobs" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {tabValue === 1 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.jobTypes} dataKey="value" cx="50%" cy="50%"
                    outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.jobTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            {tabValue === 2 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.employerJobCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Jobs" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}







// למה להשתמש בפאקניג טייפסקריפט? זה יוצר בעיות עם שאר הדפים
// import React, { useState, useEffect } from 'react';
// import { 
//   Container, Typography, Grid, Paper, CircularProgress, Box, Card, CardContent, CardHeader, Tab, Tabs 
// } from '@mui/material';
// import { 
//   Work, CheckCircle, Pending, Person, Business, Assignment, TrendingUp, CalendarToday, AttachMoney 
// } from '@mui/icons-material';
// import { 
//   collection, query, where, getDocs, getCountFromServer, Timestamp 
// } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { 
//   LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
// } from 'recharts';

// interface StatCardProps {
//   title: string;
//   value: number | string;
//   icon: React.ReactNode;
// }

// const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
//   <Card>
//     <CardContent sx={{ display: 'flex', flexDirection: 'column', height: 140, justifyContent: 'space-between' }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Typography variant="h6" component="h2">
//           {title}
//         </Typography>
//         {icon}
//       </Box>
//       <Typography variant="h4" component="p">
//         {value}
//       </Typography>
//     </CardContent>
//   </Card>
// );

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

// export default function AdminStatisticsPage() {
//   const [stats, setStats] = useState({
//     totalJobs: 0,
//     completedJobs: 0,
//     activeJobs: 0,
//     totalWorkers: 0,
//     totalEmployers: 0,
//     averageJobsPerEmployer: 0,
//     averageDailyJobs: 0,
//     averageJobCost: 0,
//     jobsPerDay: [],
//     jobTypes: [],
//     employerJobCounts: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [tabValue, setTabValue] = useState(0);

//   useEffect(() => {
//     const fetchStatistics = async () => {
//       try {
//         // Fetch total jobs
//         const jobsSnapshot = await getCountFromServer(collection(db, 'jobs'));
//         const totalJobs = jobsSnapshot.data().count;

//         // Fetch completed jobs
//         const completedJobsQuery = query(collection(db, 'jobs'), where('isCompleted', '==', true));
//         const completedJobsSnapshot = await getCountFromServer(completedJobsQuery);
//         const completedJobs = completedJobsSnapshot.data().count;

//         // Calculate active jobs
//         const activeJobs = totalJobs - completedJobs;

//         // Fetch total workers (users who are not employers)
//         const workersQuery = query(collection(db, 'users'), where('isEmployer', '==', false));
//         const workersSnapshot = await getCountFromServer(workersQuery);
//         const totalWorkers = workersSnapshot.data().count;

//         // Fetch total employers
//         const employersQuery = query(collection(db, 'users'), where('isEmployer', '==', true));
//         const employersSnapshot = await getCountFromServer(employersQuery);
//         const totalEmployers = employersSnapshot.data().count;

//         // Fetch all jobs for detailed analysis
//         const jobsQuery = query(collection(db, 'jobs'));
//         const jobsDocsSnapshot = await getDocs(jobsQuery);
//         const jobs = jobsDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//         // Calculate average jobs per employer (including completed jobs)
//         const averageJobsPerEmployer = totalEmployers > 0 ? (totalJobs / totalEmployers).toFixed(2) : 0;

//         // Calculate average daily jobs
//         const now = new Date();
//         const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         const recentJobs = jobs.filter(job => job.createdAt && job.createdAt.toDate() > oneWeekAgo);
//         const averageDailyJobs = (recentJobs.length / 7).toFixed(2);

//         // Calculate average job cost
//         const totalCost = jobs.reduce((sum, job) => sum + (job.salary || 0), 0);
//         const averageJobCost = totalJobs > 0 ? (totalCost / totalJobs).toFixed(2) : 0;

//         // Calculate jobs per day for the last week
//         const jobsPerDay = Array(7).fill(0).map((_, index) => {
//           const date = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
//           const count = recentJobs.filter(job => 
//             job.createdAt.toDate().toDateString() === date.toDateString()
//           ).length;
//           return { name: date.toLocaleDateString('he-IL'), Jobs: count };
//         });

//         // Count job types
//         const jobTypeCounts = jobs.reduce((acc, job) => {
//           acc[job.type] = (acc[job.type] || 0) + 1;
//           return acc;
//         }, {});
//         const jobTypes = Object.entries(jobTypeCounts).map(([name, value]) => ({ name, value }));

//         // Count jobs per employer (mock data for now)
//         const employerJobCounts = Array.from({ length: 5 }, (_, i) => ({
//           name: `מעסיק ${i + 1}`,
//           Jobs: Math.floor(Math.random() * 50) + 1
//         }));

//         setStats({
//           totalJobs,
//           completedJobs,
//           activeJobs,
//           totalWorkers,
//           totalEmployers,
//           averageJobsPerEmployer,
//           averageDailyJobs,
//           averageJobCost,
//           jobsPerDay,
//           jobTypes,
//           employerJobCounts,
//         });
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching statistics:', error);
//         setLoading(false);
//       }
//     };

//     fetchStatistics();
//   }, []);

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setTabValue(newValue);
//   };

//   if (loading) {
//     return (
//       <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h4" gutterBottom component="h1" align="center">
//         סטטיסטיקות האתר
//       </Typography>
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="סה״כ עבודות" value={stats.totalJobs} icon={<Work />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="עבודות שהושלמו" value={stats.completedJobs} icon={<CheckCircle />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="עבודות פעילות" value={stats.activeJobs} icon={<Pending />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="סה״כ עובדים" value={stats.totalWorkers} icon={<Person />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="סה״כ מעסיקים" value={stats.totalEmployers} icon={<Business />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="ממוצע עבודות למעסיק" value={stats.averageJobsPerEmployer} icon={<Assignment />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="ממוצע עבודות ביום" value={stats.averageDailyJobs} icon={<TrendingUp />} />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4}>
//           <StatCard title="עלות ממוצעת לעבודה" value={`₪${stats.averageJobCost}`} icon={<AttachMoney />} />
//         </Grid>
//       </Grid>

//       <Card>
//         <CardHeader title="גרפים סטטיסטיים" />
//         <CardContent>
//           <Tabs value={tabValue} onChange={handleTabChange} centered>
//             <Tab label="עבודות יומיות" />
//             <Tab label="סוגי עבודות" />
//             <Tab label="עבודות למעסיק" />
//           </Tabs>
//           <Box sx={{ height: 400, mt: 2 }}>
//             {tabValue === 0 && (
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart data={stats.jobsPerDay}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="Jobs" stroke="#8884d8" activeDot={{ r: 8 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//             {tabValue === 1 && (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={stats.jobTypes}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {stats.jobTypes.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             )}
//             {tabValue === 2 && (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={stats.employerJobCounts}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="Jobs" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </Box>
//         </CardContent>
//       </Card>
//     </Container>
//   );
// }
import React, { useState, useContext } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import AdminUsersPage from './AdminUsersPage';
import ManageUsers from './ManageUsers';
import AdminJobsDashboard from './AdminMessagesDashboard';
import ApprovalRequests from './ApprovalRequests';
import AdminStatisticsPage from './AdminStatisticsPage';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const tabComponents = [
  { label: "סטטיסטיקות", component: AdminStatisticsPage },
  { label: "ניהול הרשאות", component: AdminUsersPage },
  { label: "צפייה במשתמשים", component: ManageUsers },
  { label: "ניהול משרות", component: AdminJobsDashboard },
  { label: "בקשות לאישור", component: ApprovalRequests },
];

export default function AdminPage() {
  const [value, setValue] = useState(0);
  const { user } = useContext(AuthContext);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        דף ניהול
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="admin tabs"
          sx={{ '& .MuiTabs-flexContainer': { flexDirection: 'row-reverse' } }}
        >
          {tabComponents.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              id={`admin-tab-${index}`} 
              aria-controls={`admin-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
      {tabComponents.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          <tab.component />
        </TabPanel>
      ))}
    </Container>
  );
}
import React, { useState, useContext, useEffect } from 'react';
import { Container, Typography, Tabs, Tab, Box, Badge } from '@mui/material';
import AdminUsersPage from './AdminUsersPage';
import ManageUsers from './ManageUsers';
import AdminJobsDashboard from './AdminMessagesDashboard';
import ApprovalRequests from './ApprovalRequests';
import AdminStatisticsPage from './AdminStatisticsPage';
import TopUsersPage from './TopUsersPage';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function TabPanel({ children, value, index }) {
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

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

const tabComponents = [
  { label: "ניהול הרשאות", component: AdminUsersPage },
  { label: "בקשות לאישור", component: ApprovalRequests },
  { label: "צפייה במשתמשים", component: ManageUsers },
  { label: "ניהול משרות", component: AdminJobsDashboard },
  { label: "סטטיסטיקות", component: AdminStatisticsPage },
  { label: "משתמשים מובילים", component: TopUsersPage },
];

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const [value, setValue] = useState(() => {
    return parseInt(localStorage.getItem('adminTabIndex') || '0', 10);
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    localStorage.setItem('adminTabIndex', String(newValue));
  };

  useEffect(() => {
    const savedTab = localStorage.getItem('adminTabIndex');
    if (savedTab) {
      setValue(parseInt(savedTab, 10));
    }
  }, []);

  const handleCountUpdate = (count) => {
    setPendingRequestsCount(count);
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
              label={
                index === 1 ? (
                  <Badge badgeContent={pendingRequestsCount} color="error">
                    {tab.label}
                  </Badge>
                ) : (
                  tab.label
                )
              }
              id={`admin-tab-${index}`}
              aria-controls={`admin-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>
      {tabComponents.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {index === 1 ? (
            <ApprovalRequests onCountUpdate={handleCountUpdate} />
          ) : (
            <tab.component setTab={setValue} />   
          )}
        </TabPanel>
      ))}
    </Container>
  );
}
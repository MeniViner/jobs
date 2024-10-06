import React, { useState, useContext } from 'react';
import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import AdminUsersPage from './AdminUsersPage';
import ManageUsers from './ManageUsers';
import AdminJobsDashboard from './AdminMessagesDashboard';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
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

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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
          <Tab label="ניהול הרשאות" {...a11yProps(0)} />
          <Tab label="צפייה במשתמשים" {...a11yProps(1)} />
          <Tab label="ניהול משרות" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <AdminUsersPage />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ManageUsers />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AdminJobsDashboard />
      </TabPanel>
    </Container>
  );
}
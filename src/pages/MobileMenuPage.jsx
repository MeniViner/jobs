import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, List, ListItem, ListItemText, Typography, IconButton, Button, Divider 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';

const menuItems = [
  { label: 'דף הבית', path: '/' },
  { label: 'עבודות', path: '/jobs' },
  { label: 'עבודות שמורות', path: '/saved-jobs', authRequired: true },
  { label: 'המועמדויות שלי', path: '/my-applications', authRequired: true },
  { label: "צ'אט", path: '/job-chat', authRequired: true },
  { label: 'פרופיל', path: '/account', authRequired: true },
];

const adminItems = [
  { label: 'ניהול משתמשים', path: '/ManageUsers' },
  { label: 'הודעות מנהלים', path: '/admin/messages' },
  { label: 'סטטיסטיקות', path: '/admin/statistics' },
  { label: 'משתמשי על', path: '/management/top-users' },
];

export default function MobileMenuPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Access user data

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        bgcolor: 'background.paper',
        zIndex: 1300,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ alignSelf: 'flex-end', mb: 2 }}
      >
        <CloseIcon />
      </IconButton>

      {/* Title */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        תפריט ניווט
      </Typography>

      {/* Main Menu Items */}
      <List sx={{ width: '100%', flexGrow: 1 }}>
        {menuItems.map((item, index) =>
          (!item.authRequired || user) && (
            <ListItem
              key={index}
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&:hover': { bgcolor: 'action.hover' },
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          )
        )}

        {/* Admin Menu Items (Only if User is Admin) */}
        {user?.isAdmin && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              ניהול
            </Typography>
            {adminItems.map((item, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </>
        )}
      </List>

      {/* Post Job Button */}
      {user?.isEmployer && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => handleNavigation('/post-job')}
          sx={{ mt: 2, borderRadius: '20px' }}
        >
          פרסם עבודה
        </Button>
      )}
    </Box>
  );
}

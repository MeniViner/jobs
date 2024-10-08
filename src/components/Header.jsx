import React, { useContext, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import logo from '../logo.png';

export default function Header() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePostJobClick = (event) => {
    event.preventDefault();
    if (!user) {
      setSnackbarMessage('נדרש להתחבר כדי לפרסם עבודה. אנא התחבר או הירשם.');
      setSnackbarOpen(true);
      navigate('/login');
    } else if (!user.isEmployer) {
      setSnackbarMessage('נדרש להיות מעסיק כדי לפרסם עבודה. אנא שדרג את החשבון שלך.');
      setSnackbarOpen(true);
      navigate('/account');
    } else {
      navigate('/post-job');
    }
  };

  const regularMenuItems = [
    { text: 'דף הבית', icon: <HomeIcon />, link: '/' },
    { text: 'צ\'אט', icon: <ChatIcon />, link: '/job-chat' },
    { text: 'עבודות', icon: <WorkIcon />, link: '/jobs' },
    { text: 'עבודות שמורות', icon: <BookmarkIcon />, link: '/saved-jobs', authRequired: true },
    { text: 'המועמדויות שלי', icon: <AssignmentIcon />, link: '/my-applications', authRequired: true },
  ];

  const employerMenuItems = [
    { text: 'פרסם עבודה', icon: <AddIcon />, link: '/post-job', onClick: handlePostJobClick },
    { text: 'עבודות שפרסמתי', icon: <ChatIcon />, link: '/my-published-jobs' },
  ];

  const adminMenuItems = [
    { text: 'דף ניהול', icon: <AdminPanelSettingsIcon />, link: '/admin' },
  ];

  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.authRequired && !user) {
        return null;
      }

      return (
        <ListItem 
          key={item.text} 
          component={Link} 
          to={item.link}
          onClick={item.onClick}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      );
    });
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ my: 2 }}>
        <img src={logo} alt="Logo" style={{ height: '50px' }} />
      </Box>
      <Divider />
      <List>
        {renderMenuItems(regularMenuItems)}
        {user?.isEmployer && (
          <>
            <Divider />
            <ListItem>
              <ListItemIcon><BusinessIcon /></ListItemIcon>
              <ListItemText primary="אזור מעסיק" />
            </ListItem>
            {renderMenuItems(employerMenuItems)}
          </>
        )}
        {user?.isAdmin && (
          <>
            <Divider />
            <ListItem>
              <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
              <ListItemText primary="ניהול" />
            </ListItem>
            {renderMenuItems(adminMenuItems)}
          </>
        )}
      </List>
      <Divider />
      <List>
        {user ? (
          <ListItem component={Link} to="/account">
            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
            <ListItemText primary={user.displayName || user.email} />
          </ListItem>
        ) : (
          <ListItem component={Link} to="/login">
            <ListItemIcon><AccountCircleIcon /></ListItemIcon>
            <ListItemText primary="התחבר" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            WorkMatch
          </Box>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {regularMenuItems.map((item) => (
                (!item.authRequired || (item.authRequired && user)) && (
                  <Button key={item.text} color="inherit" component={Link} to={item.link}>
                    {item.text}
                  </Button>
                )
              ))}

              {user?.isEmployer ? (
                <>
                  <Button 
                    color="inherit" 
                    component={Link}
                    to="/post-job"
                    startIcon={<BusinessIcon />}
                  >
                    פרסם עבודה
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/my-published-jobs" 
                    startIcon={<ChatIcon />}
                  >
                    עבודות שפרסמתי
                  </Button>
                </>
              ) : (
                <Button 
                  color="inherit" 
                  onClick={handlePostJobClick}
                  startIcon={<BusinessIcon />}
                >
                  פרסם עבודה
                </Button>
              )}

              {user?.isAdmin && (
                <Button color="inherit" component={Link} to="/admin" startIcon={<SupervisorAccountIcon />}>
                  ניהול
                </Button>
              )}
              {user ? (
                <Button
                  color="inherit"
                  component={Link}
                  to="/account"
                  startIcon={<AccountCircleIcon />}
                >
                  {user.displayName || user.email}
                </Button>
              ) : (
                <Button color="inherit" component={Link} to="/login" startIcon={<AccountCircleIcon />}>
                  התחבר
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* This empty Toolbar acts as a spacer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
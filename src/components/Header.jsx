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
  Typography,
  Avatar,
  Badge,
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
import NotificationsIcon from '@mui/icons-material/Notifications';
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
      // navigate('/employer-registration'); //לא להפעיל כרגע!
    } else {
      navigate('/post-job');
    }
  };

  // פונקציה חדשה: הפניית המשתמש לדף הדירוג
  const handleNotificationClick = () => {
    navigate('/rate-employer'); // הפנייה לדף הדירוג
  };

  const regularMenuItems = [
    { text: 'דף הבית', icon: <HomeIcon />, link: '/' },
    { text: 'צ\'אט', icon: <ChatIcon />, link: '/job-chat', authRequired: true },
    { text: 'עבודות', icon: <WorkIcon />, link: '/jobs' },
    { text: 'עבודות שמורות', icon: <BookmarkIcon />, link: '/saved-jobs', authRequired: true },
    { text: 'המועמדויות שלי', icon: <AssignmentIcon />, link: '/my-applications', authRequired: true },
  ];

  const employerMenuItems = [
    { text: 'פרסם עבודה', icon: <AddIcon />, link: '/post-job', onClick: handlePostJobClick },
    { text: 'עבודות שפרסמתי', icon: <BusinessIcon />, link: '/my-published-jobs' },
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
          button
          key={item.text}
          component={Link}
          to={item.link}
          onClick={(e) => {
            if (item.onClick) {
              item.onClick(e);
            }
            if (isMobile) {
              handleDrawerToggle();
            }
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      );
    });
  };

  const drawer = (
    <Box sx={{ textAlign: 'center', width: 250 }}>
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
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="אזור מעסיק" />
            </ListItem>
            {renderMenuItems(employerMenuItems)}
          </>
        )}
        {user?.isAdmin && (
          <>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <SupervisorAccountIcon />
              </ListItemIcon>
              <ListItemText primary="ניהול" />
            </ListItem>
            {renderMenuItems(adminMenuItems)}
          </>
        )}
      </List>
      <Divider />
      <List>
        {user ? (
          <ListItem
            button
            component={Link}
            to="/account"
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary={user.displayName || user.email} />
          </ListItem>
        ) : (
          <ListItem
            button
            component={Link}
            to="/login"
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="התחבר" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
                {user ? (
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/account"
                  >
                    <Avatar alt={user.displayName || user.email} src={user.photoURL}>
                      {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                    </Avatar>
                  </IconButton>
                ) : (
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/login"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                {user ? (
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/account"
                    sx={{ mr: 1 }}
                  >
                    <Avatar alt={user.displayName || user.email} src={user.photoURL}>
                      {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                    </Avatar>
                  </IconButton>
                ) : (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
                    startIcon={<AccountCircleIcon />}
                    sx={{ mr: 1 }}
                  >
                    התחבר
                  </Button>
                )}

                {user && (
                  <IconButton color="inherit" sx={{ mx: 1 }} onClick={handleNotificationClick}>
                    <Badge badgeContent={4} color="secondary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                )}

                {user?.isAdmin && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin"
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{ mx: 1 }}
                  >
                    ניהול
                  </Button>
                )}

                {user?.isEmployer ? (
                  <>
                    {employerMenuItems.map((item) => (
                      <Button
                        key={item.text}
                        color="inherit"
                        component={Link}
                        to={item.link}
                        startIcon={item.icon}
                        sx={{ mx: 1 }}
                        onClick={item.onClick}
                      >
                        {item.text}
                      </Button>
                    ))}
                  </>
                ) : (
                  <Button
                    color="inherit"
                    onClick={handlePostJobClick}
                    startIcon={<AddIcon />}
                    sx={{ mx: 1 }}
                  >
                    פרסם עבודה
                  </Button>
                )}

                {regularMenuItems.map(
                  (item) =>
                    (!item.authRequired || (item.authRequired && user)) && (
                      <Button
                        key={item.text}
                        color="inherit"
                        component={Link}
                        to={item.link}
                        startIcon={item.icon}
                        sx={{ mx: 1 }}
                      >
                        {item.text}
                      </Button>
                    )
                )}
              </>
            )}
          </Box>

          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Typography variant="h6" noWrap>
              WorkMatch
            </Typography>
            <img src={logo} alt="Logo" style={{ height: '40px', marginLeft: '10px' }} />
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Drawer
        variant="temporary"
        anchor="left" // הגדרת התפריט להיפתח מצד ימין
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: { width: 250 },
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
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

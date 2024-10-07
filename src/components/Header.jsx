import React, { useContext, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
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
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
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

export default function Header() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const auth = getAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const regularMenuItems = [
    { text: 'דף הבית', icon: <HomeIcon />, link: '/' },
    { text: 'עבודות', icon: <WorkIcon />, link: '/jobs' },
    { text: 'עבודות שמורות', icon: <BookmarkIcon />, link: '/saved-jobs', authRequired: true },
    { text: 'המועמדויות שלי', icon: <AssignmentIcon />, link: '/my-applications', authRequired: true },
  ];

  const employerMenuItems = [
    { text: 'פרסם עבודה', icon: <AddIcon />, link: '/post-job' },
    { text: 'עבודות שפורסמו', icon: <ChatIcon />, link: '/employer-chat' },
  ];

  const adminMenuItems = [
    { text: 'דף ניהול', icon: <AdminPanelSettingsIcon />, link: '/admin', adminRequired: true },
  ];

  const renderMenuItems = (items) => {
    return items.map((item) => (
      (!item.adminRequired || (item.adminRequired && user?.isAdmin)) && (
        <ListItem key={item.text} component={Link} to={item.link}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      )
    ));
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        פלטפורמת עבודות מזדמנות
      </Typography>
      <Divider />
      <List>
        {renderMenuItems(regularMenuItems)}
        <Divider />
        <ListItem>
          <ListItemIcon><BusinessIcon /></ListItemIcon>
          <ListItemText primary="אזור מעסיק" />
        </ListItem>
        {renderMenuItems(employerMenuItems)}
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
            <ListItemText primary="פרופיל" />
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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          פלטפורמת עבודות מזדמנות
        </Typography>
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
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {regularMenuItems.map((item) => (
              (!item.authRequired || (item.authRequired && user)) && (
                <Button key={item.text} color="inherit" component={Link} to={item.link}>
                  {item.text}
                </Button>
              )
            ))}
            {employerMenuItems.map((item) => (
              <Button key={item.text} color="inherit" component={Link} to={item.link} startIcon={<BusinessIcon />}>
                {item.text}
              </Button>
            ))}
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
                פרופיל
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
  );
}
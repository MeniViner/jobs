import React, { useContext, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Drawer,
  List,
  ListItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function Header() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const auth = getAuth();
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'דף הבית', icon: <HomeIcon />, link: '/' },
    { text: 'עבודות', icon: <WorkIcon />, link: '/jobs' },
    { text: 'פרסם עבודה', icon: <AddIcon />, link: '/post-job', authRequired: true, employerOnly: true },
    { text: 'עבודות שפרסמתי', icon: <ChatIcon />, link: '/employer-chat', authRequired: true, employerOnly: true },
    { text: 'המועמדויות שלי', icon: <AssignmentIcon />, link: '/my-applications', authRequired: true, employeeOnly: true },
    { text: 'דף ניהול', icon: <AdminPanelSettingsIcon />, link: '/admin', adminRequired: true },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        פלטפורמת עבודות מזדמנות
      </Typography>
      <List>
        {menuItems.map((item) => (
          ((!item.authRequired && !item.adminRequired && !item.employerOnly && !item.employeeOnly) || 
           (item.authRequired && user) || 
           (item.adminRequired && user?.isAdmin) ||
           (item.employerOnly && user?.isEmployer) ||
           (item.employeeOnly && user?.isEmployee)) && (
            <ListItem key={item.text} component={Link} to={item.link}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          )
        ))}
        {!user ? (
          <>
            <ListItem component={Link} to="/login">
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="התחבר" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem component={Link} to="/account">
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="חשבון אישי" />
            </ListItem>
            <ListItem component={Link} to="/employer-profile">
              <ListItemIcon><BusinessIcon /></ListItemIcon>
              <ListItemText primary="פרופיל מעסיק" />
            </ListItem>
            <ListItem onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="התנתק" />
            </ListItem>
          </>
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
          <Box>
            {menuItems.map((item) => (
              ((!item.authRequired && !item.adminRequired && !item.employerOnly && !item.employeeOnly) || 
               (item.authRequired && user) || 
               (item.adminRequired && user?.isAdmin) ||
               (item.employerOnly && user?.isEmployer) ||
               (item.employeeOnly && user?.isEmployee)) && (
                <Button key={item.text} color="inherit" component={Link} to={item.link}>
                  {item.text}
                </Button>
              )
            ))}
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleMenu}
                  startIcon={<AccountCircleIcon />}
                >
                  {user.displayName || user.email}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose} component={Link} to="/account">
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>חשבון אישי</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleClose} component={Link} to="/employer-profile">
                    <ListItemIcon>
                      <BusinessIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>פרופיל מעסיק</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>התנתק</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">התחבר</Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
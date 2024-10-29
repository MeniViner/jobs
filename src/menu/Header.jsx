import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { getAuth, signOut } from 'firebase/auth'

import {
  AppBar, Toolbar, IconButton, Typography, Button, Avatar, Menu, MenuItem, ListItemIcon, ListItemText,
  Badge, Tooltip, useMediaQuery, useTheme, Box, Paper, BottomNavigation, BottomNavigationAction,
  Drawer, List, ListItem, ListItemButton, ListItemIcon as MuiListItemIcon, ListItemText as MuiListItemText,
  Divider, Fade
} from '@mui/material'
import {
  Search as SearchIcon, Favorite as FavoriteIcon, ChatBubbleOutline as ChatIcon,
  PersonOutline as PersonIcon, Add as AddIcon, Business as BusinessIcon,
  AssignmentOutlined as AssignmentIcon, NotificationsNone as NotificationsIcon,
  AccountCircle as AccountCircleIcon, ExitToApp as LogoutIcon,
  MoreVert as MoreVertIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'
import { useNotificationCount } from '../pages/notifications/NotificationsPage'
import MenuIcon from '@mui/icons-material/Menu'; 

export default function Header() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const auth = getAuth()
  const notificationCount = useNotificationCount();
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePostJobClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/post-job' } })
    } else if (!user.isEmployer) {
      navigate('/account', { state: { openEmployerUpgrade: true } })
    } else {
      navigate('/post-job')
    }
  };

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'right' : 'left' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: isMobile ? 'right' : 'left' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      TransitionComponent={Fade}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/account') }}>
        <ListItemIcon>
          <AccountCircleIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="פרופיל" />
      </MenuItem>
      {user?.isEmployer && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/my-published-jobs') }}>
          <ListItemIcon>
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="עבודות שפרסמתי" />
        </MenuItem>
      )}
      <MenuItem onClick={handleSignOut}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="התנתק" />
      </MenuItem>
    </Menu>
  )

  const navItems = user?.isEmployer
    ? [
        { label: 'חיפוש', icon: <SearchIcon />, path: '/jobs' },
        { label: 'פרסם עבודה', icon: <AddIcon />, path: '/post-job' },
        { label: 'פרסומים שלי', icon: <BusinessIcon />, path: '/my-published-jobs' },
        { label: "הודעות", icon: <ChatIcon />, path: '/job-chat' },
        { label: 'פרופיל', icon: <PersonIcon />, path: '/account' },
      ]
    : [
        { label: 'חיפוש', icon: <SearchIcon />, path: '/jobs' },
        { label: 'שמורים', icon: <FavoriteIcon />, path: '/saved-jobs' },
        { label: 'מועמדויות', icon: <AssignmentIcon />, path: '/my-applications' },
        { label: "הודעות", icon: <ChatIcon />, path: '/job-chat' },
        { label: 'פרופיל', icon: <PersonIcon />, path: '/account' },
      ];

  const desktopNavItems = [
    { text: 'עבודות', link: '/jobs' },
    { text: "צ'אט", link: '/job-chat', authRequired: true },
    { text: 'עבודות שמורות', link: '/saved-jobs', authRequired: true },
    { text: 'המועמדויות שלי', link: '/my-applications', authRequired: true },
    { text: 'ניהול', link: '/admin', authRequired: true, adminRequired: true },
  ];

  // רשימת דפים לדוגמה
  const examplePages = [
    { text: 'היסטוריית העבודות שלי', link: '/my-job-history', authRequired: true },
    { text: 'דף דוגמה 1 (דוגמה)', link: '/example1' },
    { text: 'דף דוגמה 2 (דוגמה)', link: '/example2' },
    { text: 'דף דוגמה 3 (דוגמה)', link: '/example3' },
  ];

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const list = () => (
    <Box
      sx={{ width: 230 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List disablePadding sx={{ marginTop :2 }}> {/* הסרת הרווחים הפנימיים */}
        {desktopNavItems.map((item, index) => (
          (!item.authRequired || (item.authRequired && user)) &&
          (!item.adminRequired || (item.adminRequired && user?.isAdmin)) && (
            <ListItem key={item.text} disablePadding >
              <ListItemButton 
                component={Link} 
                to={item.link}
                sx={{ pl:3, pr: 1 }} // התאמת הרווחים הצדדיים
              >
                <MuiListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      <Divider />
      {/* הוספת דפים לדוגמה מתחת ל-Divider */}
      <List disablePadding>
        {examplePages.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.link}
              sx={{ pl: 3, pr: 1 }} // התאמת הרווחים הצדדיים
            >
              <MuiListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={0} 
          sx={{ 
            top: 0, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
            zIndex: theme.zIndex.drawer + 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* אייקון תפריט לפתיחת Drawer */}
            <IconButton
              onClick={toggleDrawer(true)}
              sx={{ p: '10px' }}
              aria-label="open menu"
            >
              <MoreVertIcon />
            </IconButton>
            
            {/* שם החברה במרכז */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              WorkMatch
            </Typography>

            {/* אייקון התראות */}
            <IconButton
              onClick={() => navigate('/notifications')}
              sx={{ p: '10px' }}
              aria-label="notifications"
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          transitionDuration={300}
        >
          {list()}
        </Drawer>

        <Box sx={{ pb: 7 }} /> {/* Spacer for content */}

        {/* Bottom Navigation */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: theme.zIndex.drawer + 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          }} 
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={navItems.findIndex(item => item.path === location.pathname)}
            onChange={(event, newValue) => {
              navigate(navItems[newValue].path);
            }}
            sx={{
              height: 64,
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            }}
          >
            {navItems.map((item, index) => (
              <BottomNavigationAction 
                key={index} 
                label={item.label} 
                icon={item.icon} 
                sx={{
                  minWidth: 'auto',
                  padding: '6px 0',
                  '& .MuiSvgIcon-root': {
                    fontSize: 28,
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </>
    )
  }

  // גרסת הדסקטופ - כפי שסיפקת בקוד שלך
  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={scrolled ? 4 : 0}
      sx={{
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        bgcolor: 'background.paper',
        borderBottom: scrolled ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
        zIndex: theme.zIndex.drawer + 2,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, direction: 'rtl' }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              ml: 2,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'primary.main',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            WorkMatch
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            {desktopNavItems.map((item) => (
              (!item.authRequired || (item.authRequired && user)) &&
              (!item.adminRequired || (item.adminRequired && user?.isAdmin)) && (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.link}
                  sx={{ 
                    mx: 1, 
                    color: location.pathname === item.link ? 'primary.main' : 'text.primary',
                    fontWeight: location.pathname === item.link ? 600 : 400,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      right: 0,
                      width: '100%',
                      height: 2,
                      bgcolor: 'primary.main',
                      transform: location.pathname === item.link ? 'scaleX(1)' : 'scaleX(0)',
                      transition: 'transform 0.3s ease-in-out',
                      transformOrigin: 'right',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              )
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
            <Tooltip title="התראות">
              <IconButton 
                size="large" 
                aria-label="show 4 new notifications" 
                color="inherit"
                onClick={() => navigate('/notifications')}
                sx={{
                  ml: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePostJobClick}
            sx={{
              ml: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              borderRadius: '20px',
              px: 3,
            }}
          >
            פרסם עבודה
          </Button>

          {user ? (
            <Tooltip title="הגדרות חשבון">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Avatar 
                  alt={user.displayName || user.email} 
                  src={user.photoURL || user.profileURL || auth.currentUser?.photoURL}
                  sx={{ width: 32, height: 32 }}
                >
                  {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AccountCircleIcon />}
              component={Link}
              to="/login"
              sx={{
                mr: 2,
                color: 'primary.main',
                borderColor: 'primary.main',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'primary.light',
                  borderColor: 'primary.main',
                },
                borderRadius: '20px',
                px: 3,
              }}
            >
              התחבר
            </Button>
          )}
        </Box>
      </Toolbar>
      {renderMenu}
    </AppBar>
  )
}

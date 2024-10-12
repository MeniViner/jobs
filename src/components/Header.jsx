import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { getAuth } from 'firebase/auth'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme,
  Box,
  Fade,
  Paper,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Chat as ChatIcon,
  Assignment as AssignmentIcon,
  Bookmark as BookmarkIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const auth = getAuth()

  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

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

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMobileMoreAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    handleMenuClose()
    navigate('/')
  }

  const handlePostJobClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/post-job' } })
    } else if (!user.isEmployer) {
      navigate('/account', { state: { openEmployerUpgrade: true } })
    } else {
      navigate('/post-job')
    }
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
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
      {user?.isAdmin && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin') }}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ניהול" />
        </MenuItem>
      )}
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="התנתק" />
      </MenuItem>
    </Menu>
  )

  const mobileMenuId = 'primary-search-account-menu-mobile'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(mobileMoreAnchorEl)}
      onClose={handleMenuClose}
    >
      {[
        { icon: <HomeIcon />, text: 'דף הבית', link: '/' },
        { icon: <WorkIcon />, text: 'עבודות', link: '/jobs' },
        { icon: <ChatIcon />, text: "צ'אט", link: '/job-chat', authRequired: true },
        { icon: <BookmarkIcon />, text: 'עבודות שמורות', link: '/saved-jobs', authRequired: true },
        { icon: <AssignmentIcon />, text: 'המועמדויות שלי', link: '/my-applications', authRequired: true },
      ].map((item) => (
        (!item.authRequired || (item.authRequired && user)) && (
          <MenuItem key={item.text} onClick={() => { handleMenuClose(); navigate(item.link) }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        )
      ))}
      {user?.isEmployer && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/post-job') }}>
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText primary="פרסם עבודה" />
        </MenuItem>
      )}
      {!user?.isEmployer && (
        <MenuItem onClick={handlePostJobClick}>
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText primary="פרסם עבודה" />
        </MenuItem>
      )}
    </Menu>
  )

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
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, direction: 'rtl' }}> {/* Set direction to RTL */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              ml: 2, // Changed from mr to ml
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

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}> {/* Changed from ml to mr */}
              {[
                { text: 'דף הבית', link: '/' },
                { text: 'עבודות', link: '/jobs' },
                { text: "צ'אט", link: '/job-chat', authRequired: true },
                { text: 'עבודות שמורות', link: '/saved-jobs', authRequired: true },
                { text: 'המועמדויות שלי', link: '/my-applications', authRequired: true },
              ].map((item) => (
                (!item.authRequired || (item.authRequired && user)) && (
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
                        right: 0, // Changed from left to right
                        width: '100%',
                        height: 2,
                        bgcolor: 'primary.main',
                        transform: location.pathname === item.link ? 'scaleX(1)' : 'scaleX(0)',
                        transition: 'transform 0.3s ease-in-out',
                        transformOrigin: 'right', // Changed from left to right
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
          )}
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
                  ml: 2, // Changed from mr to ml
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="חיפוש">
            <IconButton
              size="large"
              aria-label="search"
              color="inherit"
              onClick={() => setShowSearch(!showSearch)}
              sx={{
                ml: 2, // Changed from mr to ml
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handlePostJobClick}
              sx={{
                ml: 2, // Changed from mr to ml
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
          )}

          {isMobile && (
            <Tooltip title="תפריט">
              <IconButton
                size="large"
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

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
                mr: 2, // Changed from ml to mr
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
      <Fade in={showSearch}>
        <Paper 
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            p: 2,
            display: showSearch ? 'block' : 'none',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl' }}> {/* Set direction to RTL */}
            <SearchIcon sx={{ color: 'action.active', ml: 1, my: 0.5 }} /> {/* Changed from mr to ml */}
            <input 
              type="text" 
              placeholder="חפש עבודות..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                padding: '8px',
                textAlign: 'right', // Align text to the right
              }}
            />
          </Box>
        </Paper>
      </Fade>
      {renderMobileMenu}
      {renderMenu}
    </AppBar>
  )
}
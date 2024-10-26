import React, { useContext } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const menuItems = [
  { label: 'דף הבית', path: '/' },
  { label: 'עבודות', path: '/jobs' },
  { label: 'עבודות שמורות', path: '/saved-jobs' },
  { label: 'המועמדויות שלי', path: '/my-applications' },
  { label: "צ'אט", path: '/job-chat' },
];

export default function SimpleSideDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '50%',
          maxWidth: 300,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={index} onClick={() => handleNavigation(item.path)}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      {user?.isAdmin && (
        <ListItem button onClick={() => handleNavigation('/admin')}>
          <ListItemText primary="ניהול" />
        </ListItem>
      )}
    </Drawer>
  );
}
















// import React, { useContext } from 'react';
// import { Drawer, List, ListItem, ListItemText, IconButton, Box } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';

// interface SimpleSideDrawerProps {
//   open: boolean;
//   onClose: () => void;
// }

// const menuItems = [
//   { label: 'דף הבית', path: '/' },
//   { label: 'עבודות', path: '/jobs' },
//   { label: 'עבודות שמורות', path: '/saved-jobs' },
//   { label: 'המועמדויות שלי', path: '/my-applications' },
//   { label: "צ'אט", path: '/job-chat' },
// ];

// export default function SimpleSideDrawer({ open, onClose }: SimpleSideDrawerProps) {
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   const handleNavigation = (path: string) => {
//     navigate(path);
//     onClose();
//   };

//   return (
//     <Drawer
//       anchor="right"
//       open={open}
//       onClose={onClose}
//       sx={{
//         '& .MuiDrawer-paper': {
//           width: '50%',
//           maxWidth: 300,
//           bgcolor: 'background.paper',
//         },
//       }}
//     >
//       <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
//         <IconButton onClick={onClose}>
//           <CloseIcon />
//         </IconButton>
//       </Box>
//       <List>
//         {menuItems.map((item, index) => (
//           <ListItem button key={index} onClick={() => handleNavigation(item.path)}>
//             <ListItemText primary={item.label} />
//           </ListItem>
//         ))}
//       </List>
//       {user?.isAdmin && (
//         <>
//           <ListItem button onClick={() => handleNavigation('/admin')}>
//             <ListItemText primary="ניהול" />
//           </ListItem>
//         </>
//       )}
//     </Drawer>
//   );
// }
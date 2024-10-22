// ContactMethodsManager.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText, IconButton,
  TextField, Button, MenuItem, Select, Divider, Snackbar, Alert, Link as MuiLink
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { WhatsApp, Instagram, Telegram, Sms, Phone } from '@mui/icons-material';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// תבניות אייקונים וקישורים
const TEMPLATES = [
  { type: 'Whatsapp', icon: <WhatsApp style={{ color: '#25D366' }} /> },
  { type: 'Instagram', icon: <Instagram style={{ color: '#C13584' }} /> },
  { type: 'Telegram', icon: <Telegram style={{ color: '#0088cc' }} /> },
  { type: 'SMS', icon: <Sms style={{ color: '#34B7F1' }} /> },
  { type: 'Phone', icon: <Phone style={{ color: '#4CAF50' }} /> },
];

// פונקציה לבניית קישורים
const buildLink = (type, value) => {
  switch (type) {
    case 'Whatsapp':
      return `https://wa.me/${value}`;
    case 'Instagram':
      return `https://instagram.com/${value}`;
    case 'Telegram':
      return `https://t.me/${value}`;
    case 'SMS':
      return `sms:${value}`;
    case 'Phone':
      return `tel:${value}`;
    default:
      return '#';
  }
};

// פונקציה להצגת אייקונים עם קישורים
export const ContactIconsDisplay = ({ contactMethods }) => {
  const iconsWithLinks = contactMethods
    .filter((method) => method.value) // רק פרטים עם ערך תקף
    .map((method) => {
      const template = TEMPLATES.find((t) => t.type === method.type);
      return template
        ? { icon: template.icon, link: buildLink(method.type, method.value) }
        : null;
    })
    .filter(Boolean); // מסנן ערכים ריקים

  if (iconsWithLinks.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      {iconsWithLinks.map((item, index) => (
        <MuiLink
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontSize: 40 }}
        >
          {item.icon}
        </MuiLink>
      ))}
    </Box>
  );
};

// קומפוננטה לניהול דרכי יצירת קשר
export const ContactMethodsManager = () => {
  const [contactMethods, setContactMethods] = useState([]);
  const [newContact, setNewContact] = useState({ type: '', value: '' });
  const [editingContactIndex, setEditingContactIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchContactMethods = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContactMethods(docSnap.data().contactMethods || []);
        }
      }
    };
    fetchContactMethods();
  }, [user, db]);

  const saveToFirebase = async (updatedMethods) => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { contactMethods: updatedMethods });
    }
  };

  const handleAddContact = () => {
    const link = buildLink(newContact.type, newContact.value);
    const updatedMethods = [...contactMethods, { ...newContact, link }];
    setContactMethods(updatedMethods);
    saveToFirebase(updatedMethods);
    setNewContact({ type: '', value: '' });
    setSnackbar({ open: true, message: 'פרטי קשר נוספו בהצלחה', severity: 'success' });
  };

  const handleEditContact = (index) => {
    setEditingContactIndex(index);
    setNewContact(contactMethods[index]);
  };

  const handleSaveContact = () => {
    const link = buildLink(newContact.type, newContact.value);
    const updatedMethods = [...contactMethods];
    updatedMethods[editingContactIndex] = { ...newContact, link };
    setContactMethods(updatedMethods);
    saveToFirebase(updatedMethods);
    setEditingContactIndex(null);
    setNewContact({ type: '', value: '' });
    setSnackbar({ open: true, message: 'פרטי קשר נשמרו בהצלחה', severity: 'success' });
  };

  const handleRemoveContact = (index) => {
    const updatedMethods = contactMethods.filter((_, i) => i !== index);
    setContactMethods(updatedMethods);
    saveToFirebase(updatedMethods);
    setSnackbar({ open: true, message: 'פרטי קשר הוסרו', severity: 'info' });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">ניהול דרכי יצירת קשר</Typography>
      <List>
        {contactMethods.map((method, index) => (
          <ListItem key={index} divider>
            <ListItemText primary={method.type} secondary={method.value} />
            <IconButton edge="end" onClick={() => handleEditContact(index)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" onClick={() => handleRemoveContact(index)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Select
          value={newContact.type}
          onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>בחר סוג</MenuItem>
          {TEMPLATES.map((template) => (
            <MenuItem key={template.type} value={template.type}>
              {template.icon} {template.type}
            </MenuItem>
          ))}
        </Select>

        <TextField
          placeholder="הכנס פרטי קשר"
          value={newContact.value}
          onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={editingContactIndex !== null ? handleSaveContact : handleAddContact}
        >
          {editingContactIndex !== null ? 'שמור' : 'הוסף'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

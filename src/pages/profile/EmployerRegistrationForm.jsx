import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

const EmployerRegistrationForm = ({ onSubmit, onCancel }) => {
  const [employerDetails, setEmployerDetails] = useState({
    companyName: '',
    companyDescription: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(employerDetails);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Employer Registration
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Company Name"
          name="companyName"
          value={employerDetails.companyName}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Company Description"
          name="companyDescription"
          value={employerDetails.companyDescription}
          onChange={handleChange}
          required
          multiline
          rows={3}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Business Type"
          name="businessType"
          value={employerDetails.businessType}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contact Email"
          name="contactEmail"
          type="email"
          value={employerDetails.contactEmail}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contact Phone"
          name="contactPhone"
          value={employerDetails.contactPhone}
          onChange={handleChange}
          required
          margin="normal"
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit Registration
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default EmployerRegistrationForm;
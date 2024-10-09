// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import {
//   Typography,
//   Box,
//   TextField,
//   Grid,
//   Button,
// } from '@mui/material';
// import { Save as SaveIcon } from '@mui/icons-material';

// export const EmployerDetails = ({
//   employerDetails,
//   setEmployerDetails,
//   editing,
//   handleUpdateEmployerDetails,
// }) => {
//   const { t } = useTranslation();

//   return (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         {t('Employer Details')}
//       </Typography>
//       <form onSubmit={handleUpdateEmployerDetails}>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label={t('Company Name')}
//               name="companyName"
//               value={employerDetails.companyName}
//               onChange={(e) => setEmployerDetails({ ...employerDetails, companyName: e.target.value })}
//               required
//               disabled={!editing}
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label={t('Company Description')}
//               name="companyDescription"
//               value={employerDetails.companyDescription}
//               onChange={(e) => setEmployerDetails({ ...employerDetails, companyDescription: e.target.value })}
//               multiline
//               rows={4}
//               disabled={!editing}
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label={t('Contact Email')}
//               name="contactEmail"
//               type="email"
//               value={employerDetails.contactEmail}
//               onChange={(e) => setEmployerDetails({ ...employerDetails, contactEmail: e.target.value })}
//               required
//               disabled={!editing}
//               variant="outlined"
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label={t('Contact Phone')}
//               name="contactPhone"
//               type="tel"
//               value={employerDetails.contactPhone}
//               onChange={(e) => setEmployerDetails({ ...employerDetails, contactPhone: e.target.value })}
//               disabled={!editing}
//               variant="outlined"
//             />
//           </Grid>
//         </Grid>
//         {editing && (
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             startIcon={<SaveIcon />}
//             fullWidth
//             sx={{ mt: 2 }}
//           >
//             {t('Save Employer Details')}
//           </Button>
//         )}
//       </form>
//     </Box>
//   );
// };

// export const EmployerUpgradeSection = ({ handleUpgradeToEmployer }) => {
//   const { t } = useTranslation();

//   return (
//     <Box sx={{ mb: 3 }}>
//       <Typography variant="h6" gutterBottom>
//         {t('Upgrade to Employer')}
//       </Typography>
//       <Typography variant="body2" sx={{ mb: 2 }}>
//         {t('Post jobs and find the best candidates for your company.')}
//       </Typography>
//       <Button variant="contained" color="primary" onClick={handleUpgradeToEmployer} fullWidth>
//         {t('Upgrade Now')}
//       </Button>
//     </Box>
//   );
// };

// export const PendingEmployerMessage = () => {
//   const { t } = useTranslation();

//   return (
//     <Box sx={{ mb: 3 }}>
//       <Typography variant="body1">
//         {t('Your employer registration is pending approval.')}
//       </Typography>
//     </Box>
//   );
// };
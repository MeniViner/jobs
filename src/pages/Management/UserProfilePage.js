import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { RatingDisplay, RatingInput } from '../../pages/RatingSystem';
import { useAuth } from '../../contexts/AuthContext';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedJobs, setCompletedJobs] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = { id: userId, ...userDoc.data() };
          setUser(userData);

          // Fetch completed jobs
          const jobsQuery = query(
            collection(db, 'jobs'),
            where('isCompleted', '==', true),
            where(userData.isEmployer ? 'employerId' : 'hiredWorkers', 'array-contains', userId)
          );
          const jobsSnapshot = await getDocs(jobsQuery);
          setCompletedJobs(jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } else {
          console.error('No user document found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h5">המשתמש לא נמצא</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, margin: 'auto', padding: 3 }}>
      <Paper elevation={4} sx={{ overflow: 'hidden', position: 'relative', borderRadius: 4 }}>
        <Box
          sx={{
            height: 200,
            background: user.isEmployer
              ? 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Avatar
            src={user.photoURL || '/placeholder.svg'}
            alt={user.name || 'User Name'}
            sx={{
              width: 150,
              height: 150,
              border: '5px solid white',
              position: 'absolute',
              top: 130,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </Box>

        <Box sx={{ mt: 12, p: 3 }}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
            {user.name || 'שם משתמש'}
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            {user.isEmployer ? 'מעסיק' : 'עובד'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <RatingDisplay userId={userId} isEmployer={user.isEmployer} />
          </Box>

          <List sx={{ mt: 3 }}>
            {user.location && (
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon color="action" />
                </ListItemIcon>
                <ListItemText primary={user.location} />
              </ListItem>
            )}
            {user.email && (
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="action" />
                </ListItemIcon>
                <ListItemText primary={user.email} />
              </ListItem>
            )}
            {user.phone && (
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="action" />
                </ListItemIcon>
                <ListItemText primary={user.phone} />
              </ListItem>
            )}
            {user.createdAt && (
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary={`חבר מאז ${new Date(user.createdAt.toDate()).toLocaleDateString('he-IL')}`} 
                />
              </ListItem>
            )}
          </List>

          <Divider sx={{ my: 3 }} />

          {user.isEmployer ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                אודות החברה
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {user.employerDetails?.companyDescription ||
                  'המעסיק לא סיפק תיאור חברה. צרו קשר למידע נוסף.'}
              </Typography>

              <List>
                {user.employerDetails?.businessType && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary={user.employerDetails.businessType} />
                  </ListItem>
                )}
                {user.employerDetails?.companyName && (
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary={user.employerDetails.companyName} />
                  </ListItem>
                )}
              </List>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                אודותיי
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {user.bio || 'המשתמש לא סיפק תיאור אישי.'}
              </Typography>

              {user.skills && user.skills.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    כישורים
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 3 }}>
                    {user.skills.map((skill, index) => (
                      <Chip key={index} label={skill} color="primary" variant="outlined" />
                    ))}
                  </Stack>
                </>
              )}

              <List>
                {user.education && (
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary="השכלה" secondary={user.education} />
                  </ListItem>
                )}
                {user.experience && (
                  <ListItem>
                    <ListItemIcon>
                      <WorkIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary="ניסיון תעסוקתי" secondary={user.experience} />
                  </ListItem>
                )}
                {user.languages && user.languages.length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon color="action" />
                    </ListItemIcon>
                    <ListItemText primary="שפות" secondary={user.languages.join(', ')} />
                  </ListItem>
                )}
              </List>
            </>
          )}

          {currentUser && currentUser.uid !== userId && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              component={Link}
              to={`/chat/${userId}`}
              sx={{ mt: 2 }}
            >
              שלח הודעה
            </Button>
          )}
        </Box>
      </Paper>

      <Paper elevation={4} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          דירוגים
        </Typography>
        <RatingDisplay userId={userId} showDetails={true} />
        {completedJobs.length > 0 && currentUser && currentUser.uid !== userId && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              דרג משתמש זה
            </Typography>
            {completedJobs.map((job) => (
              <Box key={job.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{job.title}</Typography>
                <RatingInput
                  jobId={job.id}
                  targetUserId={userId}
                  isEmployerRating={currentUser.uid === job.employerId}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfilePage;
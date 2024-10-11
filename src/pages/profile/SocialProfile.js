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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  Work as WorkIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { RatingDisplay, RatingInput } from '../rating/RatingSystem';
import { useAuth } from '../../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// עיצוב מותאם אישית ל-Paper
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const UserProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedJobs, setCompletedJobs] = useState([]);

  // שימוש ב-Media Query להתאמה לטלפונים ניידים
  const isMobile = useMediaQuery('(max-width:600px)');

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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        bgcolor="#f5f5f5"
      >
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        bgcolor="#f5f5f5"
      >
        <Typography variant="h5">המשתמש לא נמצא</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 2 }}>
      {/* Header עם תמונת פרופיל ושם */}
      <StyledPaper elevation={3} sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            height: isMobile ? 150 : 200,
            background: user.isEmployer
              ? user.bannerURL // Check if the user has a bannerURL
                ? `url(${encodeURI(user.bannerURL)})` // If bannerURL exists, show the image
                : 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' // Fallback to gradient
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Default gradient for non-employers
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 2,
          }}
        />
        <Avatar
          src={user.profileURL || user.photoURL}
          alt={user.name || 'User Name'}
          sx={{
            width: isMobile ? 100 : 150,
            height: isMobile ? 100 : 150,
            border: '5px solid white',
            position: 'absolute',
            top: isMobile ? 80 : 130,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        <Box sx={{ mt: isMobile ? 6 : 10, textAlign: 'center' }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold' }}>
            {user.name || 'שם משתמש'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user.isEmployer
              ? user.employerDetails?.companyName || 'מעסיק'
              : 'עובד'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <RatingDisplay userId={userId} isEmployer={user.isEmployer} />
          </Box>
          {currentUser && currentUser.uid !== userId && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ChatIcon />}
                component={Link}
                to={`/chat/${userId}`}
                sx={{
                  borderRadius: 20,
                  px: isMobile ? 2 : 4,
                  py: isMobile ? 1 : 1.5,
                }}
              >
                שלח הודעה
              </Button>
            </Box>
          )}
        </Box>
      </StyledPaper>

      {/* פרטי משתמש ומידע נוסף */}
      <Grid container spacing={3} sx={{ mt: isMobile ? 2 : 4 }}>
        {/* עמודה שמאלית */}
        <Grid item xs={12} md={4}>
          {/* פרטי קשר */}
          <StyledPaper>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              פרטי קשר
            </Typography>
            <Stack spacing={1}>
              {user.location && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">{user.location}</Typography>
                </Box>
              )}
              {user.email && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
              )}
              {user.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">{user.phone}</Typography>
                </Box>
              )}
              {user.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    חבר מאז {new Date(user.createdAt.toDate()).getFullYear()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </StyledPaper>

          {/* כישורים או מידע על החברה */}
          {user.isEmployer ? (
            <StyledPaper sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                מידע על החברה
              </Typography>
              <Stack spacing={1}>
                {user.employerDetails?.businessType && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {user.employerDetails.businessType}
                    </Typography>
                  </Box>
                )}
                {user.employerDetails?.companyWebsite && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <a
                        href={user.employerDetails.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: '#1976d2' }}
                      >
                        {user.employerDetails.companyWebsite}
                      </a>
                    </Typography>
                  </Box>
                )}
              </Stack>
            </StyledPaper>
          ) : (
            user.skills &&
            user.skills.length > 0 && (
              <StyledPaper sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  כישורים
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {user.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </StyledPaper>
            )
          )}
        </Grid>

        {/* עמודה ימנית */}
        <Grid item xs={12} md={8}>
          {/* אודות */}
          <StyledPaper>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              {user.isEmployer ? 'אודות החברה' : 'אודותיי'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.isEmployer
                ? user.employerDetails?.companyDescription ||
                  'המעסיק לא סיפק תיאור חברה.'
                : user.bio || 'המשתמש לא סיפק תיאור אישי.'}
            </Typography>
          </StyledPaper>

          {/* מידע נוסף עבור עובדים */}
          {!user.isEmployer && (
            <>
              {/* ניסיון תעסוקתי */}
              {user.experience && (
                <StyledPaper sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    ניסיון תעסוקתי
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.experience}
                  </Typography>
                </StyledPaper>
              )}
              {/* השכלה */}
              {user.education && (
                <StyledPaper sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    השכלה
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.education}
                  </Typography>
                </StyledPaper>
              )}
              {/* שפות */}
              {user.languages && user.languages.length > 0 && (
                <StyledPaper sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    שפות
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.languages.join(', ')}
                  </Typography>
                </StyledPaper>
              )}
            </>
          )}

          {/* דירוגים */}
          <StyledPaper sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              דירוגים
            </Typography>
            <RatingDisplay userId={userId} showDetails={true} />
            {completedJobs.length > 0 &&
              currentUser &&
              currentUser.uid !== userId && (
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
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfilePage;

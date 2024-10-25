// CompanyInfoPage.js
import React from 'react';
import {
  Box, Typography, Button, Avatar, IconButton, Stack, Paper, Divider, Grid, Tooltip
} from '@mui/material';
import { WhatsApp, Telegram, Share, LinkedIn, Twitter, Work, People, Diversity3, TrendingUp } from '@mui/icons-material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import f1 from '../images/mv.jpg';
import f2 from '../images/yc.jpg';
const AnimatedBox = motion(Box);

const ContactButton = styled(Button)({
  borderRadius: 30,
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 'bold',
});

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const founders = [
  { name: 'יהודה קולינס', image: f2, role: 'מנכ"ל ומייסד '},
  { name: 'מני וינר', image: f1, role: 'סמנכ"ל טכנולוגיות ומייסד' },
  { name: 'הלל', image: '/images/founder3.jpg', role: 'עוד לא ידוע' },
];

export default function CompanyInfoPage() {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/yourPhoneNumber', '_blank');
  };

  const handleTelegramClick = () => {
    window.open('https://t.me/yourTelegramUsername', '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Social Jobs - התחבר, שתף פעולה, הצלח',
        text: 'גלה הזדמנויות עבודה מדהימות והתחבר עם אנשי מקצוע ב-Social Jobs!',
        url: window.location.href,
      }).catch((error) => console.error('שגיאה בשיתוף:', error));
    } else {
      alert('שיתוף אינו נתמך בדפדפן זה.');
    }
  };

  return (
    <AnimatedBox 
      sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        WorkMatch
      </Typography>
      <Typography variant="h5" align="center" gutterBottom sx={{ mb: 6, color: 'text.secondary' }}>
        התחבר, שתף פעולה וקדם את הקריירה שלך
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={3}>
          <FeatureCard elevation={3}>
            <Work sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>הזדמנויות עבודה</Typography>
            <Typography variant="body2">
              גלה מגוון רחב של משרות מחברות מובילות במגוון תעשיות.
            </Typography>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <FeatureCard elevation={3}>
            <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>רשת מקצועית</Typography>
            <Typography variant="body2">
              התחבר עם אנשי מקצוע בעלי תפיסה דומה והרחב את הרשת המקצועית שלך.
            </Typography>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <FeatureCard elevation={3}>
            <Diversity3 sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>פיתוח מיומנויות</Typography>
            <Typography variant="body2">
              גש למשאבים וקורסים כדי לשפר את המיומנויות שלך ולהישאר תחרותי.
            </Typography>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <FeatureCard elevation={3}>
            <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>צמיחה בקריירה</Typography>
            <Typography variant="body2">
              קבל תובנות ועצות כדי להאיץ את התקדמות הקריירה שלך.
            </Typography>
          </FeatureCard>
        </Grid>
      </Grid>

      <Paper 
        elevation={4} 
        sx={{ p: 4, mb: 6, borderRadius: 4, bgcolor: 'background.paper' }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          למה לבחור ב-Social Jobs?
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Social Jobs היא יותר מסתם לוח משרות. אנחנו קהילה המוקדשת לעזרה לאנשי מקצוע כמוך להשיג את יעדי הקריירה שלהם. 
          עם הפלטפורמה החדשנית שלנו, תוכל להתחבר עם מובילי תעשייה, להציג את הכישורים שלך ולמצוא הזדמנויות שמתאימות לשאיפות שלך.
        </Typography>
        <Typography variant="body1" paragraph align="center">
          הצטרף לאלפי משתמשים מרוצים שמצאו את עבודת החלומות שלהם וקידמו את הקריירה שלהם באמצעות Social Jobs. 
          בין אם אתה בוגר טרי או איש מקצוע מנוסה, יש לנו את הכלים והמשאבים לתמוך במסע שלך.
        </Typography>
      </Paper>

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        הכירו את המייסדים שלנו
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        {founders.map((founder, index) => (
          <Grid item key={index} xs={12} sm={4} md={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={founder.image}
                alt={founder.name}
                sx={{ width: 120, height: 120, margin: 'auto', mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>{founder.name}</Typography>
              <Typography variant="body2" color="text.secondary">{founder.role}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        התחל עוד היום
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 6 }}>
        <ContactButton
          variant="contained"
          color="primary"
          startIcon={<Work />}
          onClick={() => window.open('/jobs', '_self')}
        >
          חפש משרות
        </ContactButton>
        <ContactButton
          variant="outlined"
          color="primary"
          startIcon={<People />}
          onClick={() => window.open('/network', '_self')}
        >
          הרחב את הרשת שלך
        </ContactButton>
      </Box>

      <Divider sx={{ my: 6 }} />

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
       שתף את האתר ועזור לנו להגדיל את הקהילה
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Tooltip title="שתף">
          <IconButton color="primary" onClick={handleShare} size="large">
            <Share fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="LinkedIn">
          <IconButton color="primary" onClick={() => window.open('https://linkedin.com/company/socialjobs', '_blank')} size="large">
            <LinkedIn fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Twitter">
          <IconButton color="primary" onClick={() => window.open('https://twitter.com/socialjobs', '_blank')} size="large">
            <Twitter fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ p: 3, mt: 6, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}
      >
        <Typography variant="body1" align="center" sx={{ fontWeight: 'bold' }}>
          © {new Date().getFullYear()} Social Jobs. מעצימים קריירות, מחברים אנשי מקצוע.
        </Typography>
      </Paper>
    </AnimatedBox>
  );
}
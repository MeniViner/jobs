import React from 'react';
import { Box, Typography, Avatar, Paper, Stack, Rating } from '@mui/material';

export default function ReviewCard({ review }) {
    return (
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
          "{review.review}"
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <Avatar
            src={review.raterProfile?.profileURL || review.raterProfile?.photoURL}
            alt={review.raterProfile?.name || 'משתמש אנונימי'}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="subtitle2">
              {review.raterProfile?.name || 'משתמש אנונימי'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {review.createdAt instanceof Date
                ? review.createdAt.toLocaleDateString()
                : review.createdAt?.toDate().toLocaleDateString() || ''}
            </Typography>
          </Box>
          <Rating
            value={review.rating}
            readOnly
            precision={0.5}
            sx={{
              ml: 'auto',
              '& .MuiRating-iconFilled': {
                color: 'gold',
              },
            }}
          />
        </Stack>
      </Paper>
    );
}
  

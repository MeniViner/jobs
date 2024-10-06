import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useHistory } from 'react-router-dom';

const JobCard = ({ job }) => {
  const history = useHistory();

  const handleApply = () => {
    // In a real application, this would open a modal or navigate to an application page
    console.log(`Applying for job: ${job.id}`);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{job.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Location: {job.location}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Price: ${job.price}/hour
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required Level: {job.requiredLevel}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {job.description}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={handleApply}
        >
          Apply
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobCard;
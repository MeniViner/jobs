import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../services/firebase';
import { Typography, Avatar, Grid, Paper } from '@mui/material';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };

    fetchProfile();
  }, [id]);

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper sx={{ p: 2, margin: 'auto', maxWidth: 500, flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item>
          <Avatar sx={{ width: 100, height: 100 }}>{profile.name[0]}</Avatar>
        </Grid>
        <Grid item xs={12} sm container>
          <Grid item xs container direction="column" spacing={2}>
            <Grid item xs>
              <Typography gutterBottom variant="h4" component="div">
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {profile.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Level: {profile.level}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Score: {profile.score}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfilePage;
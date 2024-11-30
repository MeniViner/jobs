import React, { useEffect, useState } from "react";
import {
  Box,  Typography,  Grid,  Card,  CardContent,  CircularProgress,  Chip,  Stack, 
 Avatar,  Divider,  List,  ListItem,  ListItemAvatar, ListItemText,
} from "@mui/material";
import { db } from "services/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function EmployeeWorkedJobs({ userId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkedJobs = async () => {
      try {
        console.log(`Fetching jobs for user: ${userId}`);
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("User not found");
          setJobs([]);
          return;
        }

        const userData = userDoc.data();
        const workedJobs = userData.workedJobs || [];
        console.log("Worked Jobs Array:", workedJobs);

        if (!Array.isArray(workedJobs) || workedJobs.length === 0) {
          console.warn("No worked jobs found for this user");
          setJobs([]);
          return;
        }

        const jobsData = [];
        for (const jobId of workedJobs) {
          if (!jobId || typeof jobId !== "string") {
            console.warn("Invalid job ID:", jobId);
            continue;
          }

          try {
            const jobDocRef = doc(db, "jobs", jobId);
            const jobDoc = await getDoc(jobDocRef);
            if (jobDoc.exists()) {
              const jobData = jobDoc.data();

              // Fetch applicants for the job
              const applicantsSnapshot = await getDocs(
                collection(db, `jobs/${jobId}/applicants`)
              );
              const applicants = applicantsSnapshot.docs.map((applicantDoc) => ({
                id: applicantDoc.id,
                ...applicantDoc.data(),
              }));

              // Filter co-workers excluding current user
              const coWorkers = applicants.filter(
                (applicant) => applicant.applicantId !== userId
              );

              jobsData.push({
                id: jobId,
                ...jobData,
                coWorkers,
              });
            } else {
              console.warn(`Job with ID ${jobId} not found`);
            }
          } catch (error) {
            console.error(`Error fetching job with ID ${jobId}:`, error);
          }
        }

        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching worked jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkedJobs();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>
          Loading worked jobs...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Worked Jobs
      </Typography>
      {jobs.length === 0 ? (
        <Typography color="text.secondary">
          No worked jobs found for this user.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
                <CardContent>
                  {/* Job Title and Company */}
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                    {job.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {job.companyName}
                  </Typography>

                  {/* Job Details */}
                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip label={`Type: ${job.type}`} />
                    {job.requiresCar && <Chip label="Requires Car" color="primary" />}
                  </Stack>
                  <Typography variant="body2" gutterBottom>
                    <strong>Salary:</strong> {job.salary} ₪/hr
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Location:</strong> {job.location}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Description:</strong> {job.description}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Full Description:</strong> {job.fullDescription}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Completed At:</strong>{" "}
                    {job.completedAt ? job.completedAt.toDate().toLocaleString() : "N/A"}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Co-workers List */}
                  <Typography variant="h6" gutterBottom>
                    Co-workers
                  </Typography>
                  {job.coWorkers.length > 0 ? (
                    <List>
                      {job.coWorkers.map((coWorker) => (
                        <ListItem key={coWorker.id}>
                          <ListItemAvatar>
                            <Avatar>
                              {coWorker.applicantId?.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`Applicant ID: ${coWorker.applicantId}`}
                            secondary={`Hired: ${coWorker.hired ? "Yes" : "No"}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No co-workers for this job.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

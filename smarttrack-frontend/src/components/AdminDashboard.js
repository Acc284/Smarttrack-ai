import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid } from '@mui/material';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({ total_students: 0, attendance_today: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('http://localhost:5000/admin/summary');
        const data = await res.json();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch admin summary:', error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Paper sx={{ mx: 'auto', mt: 5, p: 4, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1">Total Students</Typography>
            <Typography variant="h4">{summary.total_students}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1">Attendance Today</Typography>
            <Typography variant="h4">{summary.attendance_today}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdminDashboard;

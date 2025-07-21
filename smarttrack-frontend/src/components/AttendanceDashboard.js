import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const AttendanceDashboard = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('http://localhost:5000/attendance');
        const data = await res.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <Paper sx={{ mt: 5, mx: 'auto', p: 4, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>Attendance Dashboard</Typography>
      <List>
        {records.map((rec, i) => (
          <ListItem key={i}>
            <ListItemText primary={rec.name} secondary={rec.timestamp} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AttendanceDashboard;

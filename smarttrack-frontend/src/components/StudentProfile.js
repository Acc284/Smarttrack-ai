import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box
} from '@mui/material';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/student/${id}`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setStudent(null);
        } else {
          setStudent(data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch student profile:", err);
        setError('Something went wrong while loading the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box p={3}>
        <Typography variant="h6">Student not found.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {student.name}'s Profile
      </Typography>

      <Typography variant="h6">Attendance Records:</Typography>
      <List>
        {Array.isArray(student.attendance) && student.attendance.length > 0 ? (
          student.attendance.map((att, index) => (
            <ListItem key={index}>
              <ListItemText primary={att.timestamp || att.date || att} />
            </ListItem>
          ))
        ) : (
          <Typography sx={{ mt: 2 }}>No attendance records found.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default StudentProfile;

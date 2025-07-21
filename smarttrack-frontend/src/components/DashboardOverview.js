import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Grid, CircularProgress,
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  DialogActions, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import axios from 'axios';

const DashboardOverview = () => {
  const [summary, setSummary] = useState({ total_students: 0, attended_today: 0 });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [absenteesDialog, setAbsenteesDialog] = useState(false);
  const [absenteesList, setAbsenteesList] = useState([]);
  const [studentStatusList, setStudentStatusList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/admin/summary', { withCredentials: true })
      .then(res => setSummary(res.data))
      .catch(err => console.error('❌ Error fetching summary:', err))
      .finally(() => setLoading(false));

    axios.get('http://localhost:5000/students-status', { withCredentials: true })
      .then(res => setStudentStatusList(res.data))
      .catch(err => {
  if (err.response?.status === 401) {
    alert('Session expired. Please log in again.');
    window.location.href = '/login'; // or wherever your login page is
  } else {
    console.error('❌ Error fetching student status:', err);
  }
});

  }, []);

  const handleOpenDialog = () => {
    axios.get('http://localhost:5000/attendance/today', { withCredentials: true })
      .then(res => {
        setAttendanceList(res.data);
        setOpenDialog(true);
      })
      .catch(err => console.error('❌ Error fetching attendance list:', err));
  };

  const handleOpenAbsentees = () => {
    axios.get('http://localhost:5000/attendance/absentees', { withCredentials: true })
      .then(res => {
        setAbsenteesList(res.data);
        setAbsenteesDialog(true);
      })
      .catch(err => console.error('❌ Error fetching absentees:', err));
  };

  const handleCloseDialog = () => setOpenDialog(false);

  if (loading) return <CircularProgress sx={{ m: 5 }} />;

  return (
    <>
      <Grid container spacing={3} sx={{ p: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6">Total Students</Typography>
              <Typography variant="h4" color="primary">{summary.total_students}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9', cursor: 'pointer' }} onClick={handleOpenDialog}>
            <CardContent>
              <Typography variant="h6">Attended Today</Typography>
              <Typography variant="h4" color="success.main">{summary.attended_today}</Typography>
              <Typography variant="body2" color="text.secondary">Click to view</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffebee', cursor: 'pointer' }} onClick={handleOpenAbsentees}>
            <CardContent>
              <Typography variant="h6">Absentees Today</Typography>
              <Typography variant="body1" color="error.main">Click to view</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ Student Status Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Today's Student Attendance</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentStatusList.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell sx={{
                        color: student.status === 'Present' ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {student.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Attendance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Students Present Today</DialogTitle>
        <DialogActions>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.open('http://127.0.0.1:5000/attendance/today_csv')}
          >
            Export CSV
          </Button>
        </DialogActions>
        <DialogContent>
          <List>
            {attendanceList.length === 0 ? (
              <Typography>No attendance marked today.</Typography>
            ) : (
              attendanceList.map((student) => (
                <ListItem key={student.id}>
                  <ListItemText
                    primary={student.name}
                    secondary={`Marked at: ${student.time}`}
                  />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* ✅ Absentees Dialog */}
      <Dialog open={absenteesDialog} onClose={() => setAbsenteesDialog(false)} fullWidth>
        <DialogTitle>Students Absent Today</DialogTitle>
        <DialogContent>
          <List>
            {absenteesList.length === 0 ? (
              <Typography>Everyone is present today 🎉</Typography>
            ) : (
              absenteesList.map((student) => (
                <ListItem key={student.id}>
                  <ListItemText primary={student.name} />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardOverview;

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Container, Box, Snackbar, Alert, Paper } from '@mui/material';

const MarkAttendance = () => {
  const videoRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [cameraStarted, setCameraStarted] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraStarted(true);
        }
      } catch (err) {
        console.error("❌ Error accessing webcam:", err);
        setSnackbar({ open: true, message: 'Webcam access denied!', severity: 'error' });
      }
    };

    startCamera();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const captureImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const image = canvas.toDataURL('image/jpeg');

      const response = await axios.post('http://localhost:5000/mark_attendance', {
        image,
      });

      if (response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: `✅ Attendance marked for ${response.data.name}`,
          severity: 'success',
        });
      } else {
        // Show exact error returned by backend
        setSnackbar({
          open: true,
          message: `❌ ${response.data.message}`,
          severity: 'warning',
        });
      }
    } catch (err) {
      console.error("❌ Error marking attendance:", err);
      const message =
        err.response?.data?.message || 'Error marking attendance. Please try again.';
      setSnackbar({
        open: true,
        message: `❌ ${message}`,
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Mark Attendance
        </Typography>

        <Box sx={{ mt: 2 }}>
          <video ref={videoRef} autoPlay style={{ width: '100%', borderRadius: 8 }} />
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={captureImage}
          disabled={!cameraStarted}
          sx={{ mt: 3 }}
        >
          Capture & Mark Attendance
        </Button>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarkAttendance;

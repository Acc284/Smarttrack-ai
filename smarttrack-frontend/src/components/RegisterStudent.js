import React, { useRef, useState } from 'react';
import {
  TextField, Button, Typography, Box, CircularProgress, Paper
} from '@mui/material';
import axios from 'axios';

const RegisterStudent = () => {
  const videoRef = useRef(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success' | 'error'

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        setMessage('❌ Unable to access camera');
        setMessageType('error');
      });
  };

  const captureAndRegister = () => {
    if (!name.trim()) {
      setMessage('⚠️ Please enter a name');
      setMessageType('error');
      return;
    }

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');

    setLoading(true);
    axios.post('http://localhost:5000/register_student', {
      name: name.trim(),
      image: imageData,
    })
      .then(res => {
        setMessage(`✅ ${res.data.message}`);
        setMessageType('success');
        setName('');
      })
      .catch(err => {
        console.error('❌ Error registering student:', err);
        setMessage('❌ Registration failed');
        setMessageType('error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          📋 Register New Student
        </Typography>

        <TextField
          label="Student Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <video
            ref={videoRef}
            autoPlay
            style={{
              width: '100%',
              maxHeight: '320px',
              borderRadius: '12px',
              objectFit: 'cover',
              backgroundColor: '#000'
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={startCamera}>
            Start Camera
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={captureAndRegister}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Capture & Register'}
          </Button>
        </Box>

        {message && (
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              color:
                messageType === 'success' ? 'green' :
                  messageType === 'error' ? 'red' : 'text.primary',
              textAlign: 'center'
            }}
          >
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RegisterStudent;

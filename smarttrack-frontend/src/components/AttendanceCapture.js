import React, { useRef, useState } from 'react';
import { Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const AttendanceCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  const startCamera = async () => {
    setResponseMsg('');
    setLoading(false);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const captureAndMark = async () => {
    setLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');

    try {
      const res = await axios.post('http://localhost:5000/mark-attendance', {
        image: dataUrl,
      }, { withCredentials: true });

      setResponseMsg(res.data.message || 'Marked successfully');
    } catch (err) {
      console.error('❌ Marking error:', err);
      setResponseMsg('❌ Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>Mark Attendance</Typography>
      <video ref={videoRef} autoPlay style={{ width: 300, borderRadius: 8 }}></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div style={{ marginTop: 10 }}>
        <Button variant="contained" onClick={startCamera} sx={{ mr: 2 }}>Start Camera</Button>
        <Button variant="outlined" color="success" onClick={captureAndMark} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Mark Attendance'}
        </Button>
      </div>
      <Typography sx={{ mt: 2 }}>{responseMsg}</Typography>
    </div>
  );
};

export default AttendanceCapture;

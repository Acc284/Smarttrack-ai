import React from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';

const WelcomeScreen = ({ onLoginClick }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
        textAlign: 'center',
        px: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: 5,
          borderRadius: 3
        }}
      >
        <Typography variant="h3" gutterBottom>SmartTrack AI Attendance</Typography>
        <Typography variant="subtitle1" gutterBottom>
          AI-powered Face Recognition for Smart, Secure Attendance
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          onClick={onLoginClick}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default WelcomeScreen;

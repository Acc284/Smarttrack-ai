// src/components/Login.js
import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomSnackbar from './CustomSnackbar';
import { useAuth } from '../context/AuthContext'; // use correct path

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, severity: '', message: '' });
  const navigate = useNavigate();
  const { login } = useAuth(); // from context

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setSnackbar({ open: true, severity: 'success', message: 'Login successful' });
        login(); // update context
        navigate('/dashboard');
      } else {
        setSnackbar({ open: true, severity: 'error', message: data.message || 'Login failed' });
      }
    } catch (err) {
      setSnackbar({ open: true, severity: 'error', message: 'Login request failed' });
    }
  };

  return (
    <Paper sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h5" mb={2}>Admin Login</Typography>
      <TextField
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>

      <CustomSnackbar
        open={snackbar.open}
        handleClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Paper>
  );
};

export default Login;

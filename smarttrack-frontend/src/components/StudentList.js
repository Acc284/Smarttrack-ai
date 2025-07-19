import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/students', { withCredentials: true });
      setStudents(res.data);
    } catch (err) {
      console.error('❌ Failed to load students:', err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/student/${id}`, { withCredentials: true });
      fetchStudents(); // reload after delete
    } catch (err) {
      console.error('❌ Failed to delete student:', err);
    }
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ p: 2 }}>Student List</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell align="center">
                <IconButton onClick={() => navigate(`/student/${student.id}`)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(student.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentList;

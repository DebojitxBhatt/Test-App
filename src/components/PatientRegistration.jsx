import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Paper, Typography, Snackbar, MenuItem, CircularProgress } from '@mui/material';
import { addPatient } from '../db/dbOperations';
import { dbInitPromise } from '../db/config';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const PatientRegistration = ({ onPatientAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    medicalHistory: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Wait for database initialization
    dbInitPromise
      .then(() => setDbReady(true))
      .catch(error => {
        console.error('Database initialization failed:', error);
        setSnackbar({
          open: true,
          message: 'Failed to initialize database. Please refresh the page.',
          severity: 'error'
        });
      });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 0 || formData.age > 150) {
      newErrors.age = 'Please enter a valid age between 0 and 150';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const newPatient = await addPatient(
        formData.name,
        parseInt(formData.age),
        formData.gender,
        formData.medicalHistory
      );
      setSnackbar({
        open: true,
        message: 'Patient registered successfully!',
        severity: 'success'
      });
      setFormData({ name: '', age: '', gender: '', medicalHistory: '' });
      if (onPatientAdded) onPatientAdded(newPatient);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error registering patient: ' + error.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!dbReady) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Patient Registration
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2 } }}>
        <TextField
          fullWidth
          required
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          disabled={isLoading}
        />
        <TextField
          fullWidth
          required
          type="number"
          label="Age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          error={!!errors.age}
          helperText={errors.age}
          disabled={isLoading}
          inputProps={{ min: 0, max: 150 }}
        />
        <TextField
          fullWidth
          required
          select
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          error={!!errors.gender}
          helperText={errors.gender}
          disabled={isLoading}
        >
          {GENDER_OPTIONS.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Medical History"
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Enter any relevant medical history..."
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Registering...
            </Box>
          ) : (
            'Register Patient'
          )}
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Paper>
  );
};

export default PatientRegistration; 
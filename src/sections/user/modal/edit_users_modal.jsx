import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Grid, TextField, Button, MenuItem, Box, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { updateUser } from '../../../redux/actionCreators/authActions';

export const EditUsersModal = ({ user, open, setOpen }) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { loading, error, isSuccess } = useSelector((state) => state.auth);
  const [role, setRole] = useState('');

  useEffect(() => {
    setFirstName(user?.first_name || '')
    setLastName(user?.last_name)
    setEmail(user?.email || '')
    setPhoneNumber(user?.phone_number || '')
    setRole(user?.role || '')
  }, [user])

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'clerk', label: 'Clerk' },
  ];

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }

    if (isSuccess) {
      enqueueSnackbar('User account updated successfully', {variant: 'success'})
      setOpen(false)
    }
  }, [error, isSuccess, enqueueSnackbar]);

  const handleSaveUser = () => {
    if(!email || !firstName || !lastName || !role){
      enqueueSnackbar('Please provide all the required fields', {variant: 'error'})
      return 
    }

   dispatch(updateUser({email,firstName, lastName, phoneNumber, role})
   )
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '16px',
    boxShadow: 24,
    p: 4,
  };
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box sx={style}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Edit User Records
          </Typography>
          <Grid container spacing={2} style={{ marginBottom: '20px' }}>
            <Grid item size={6}>
              <TextField
                fullWidth
                placeholder="First Name"
                name="first_name"
                label="First Name"
                value={firstName}
                autoComplete="given-name"
                required
                onChange={(e) => setFirstName(e.target.value)}
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item size={6}>
              <TextField
                fullWidth
                placeholder="Last Name"
                value={lastName}
                autoComplete="family-name"
                required
                name="last_name"
                label="Last Name"
                onChange={(e) => setLastName(e.target.value)}
                style={{ width: '100%' }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item size={6}>
              <TextField
                fullWidth
                placeholder="Email Address"
                type="email"
                name="email"
                label="Email Address"
                value={email}
                autoComplete="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item size={6}>
              <TextField
                fullWidth
                placeholder="Phone Number"
                type="tel"
                name="phone_number"
                label="Phone Number"
                value={phoneNumber}
                autoComplete="tel"
                minLength={10}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: '100%' }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item size={6}>
              <TextField
                fullWidth
                select
                name="role"
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Button variant="contained" color="inherit" onClick={handleSaveUser}>
            {loading ? 'Loading...' : 'Save user'}
          </Button>
      </Box>
    </Modal>
  );
};

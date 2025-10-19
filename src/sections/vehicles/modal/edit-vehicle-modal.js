import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Grid,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { updateVehicle } from '../../../redux/actionCreators/vehiclesActions.js';

export function EditVehicleModal({ open, setOpen, vehicle }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, success, message } = useSelector((state) => state.vehicles);
  const [formData, setFormData] = useState({
    reg_number: '',
    number_of_passengers: '',
    vehicle_type: '',
    transmission_type: '',
    is_active: true,
    last_service_date: '',
    notes: '',
  });


  useEffect(() => {
    if(vehicle){
        setFormData({
            id: vehicle?.id,
            reg_number: vehicle?.reg_number,
            number_of_passengers: vehicle?.number_of_passengers,
            vehicle_type: vehicle?.vehicle_type,
            transmission_type: vehicle?.transmission_type,
            is_active: vehicle?.is_active,
            last_service_date: vehicle?.last_service_date,
            notes: vehicle?.notes,
        })
    }
  }, [vehicle])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.reg_number &&
      formData.vehicle_type &&
      formData.transmission_type &&
      formData.last_service_date &&
      formData.number_of_passengers &&
      formData.id
    ) {
      dispatch(updateVehicle(formData, vehicle.id));
    } else {
      enqueueSnackbar('Please fill in all the fields', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(message, { variant: 'error' });
    } else if (success) {
      setFormData({
        reg_number: '',
        number_of_passengers: '',
        vehicle_type: '',
        transmission_type: '',
        is_active: true,
        last_service_date: '',
        notes: '',
      });
      enqueueSnackbar('Vehicle record added successfully.', { variant: 'success' });
      setOpen(false);
    }
  }, [error, success, message, enqueueSnackbar]);

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
          Edit Vehicle Records
        </Typography>
        <form onSubmit={handleSubmit} method="post">
          <Grid style={{ marginBottom: '20px' }}>
            {/* Registration Number */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <OutlinedInput
                fullWidth
                name="reg_number"
                value={formData.reg_number}
                onChange={handleChange}
                placeholder="Registration Number"
                style={{ width: '100%' }}
                required
              />
            </Grid>

            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <OutlinedInput
                fullWidth
                name="number_of_passengers"
                value={formData.number_of_passengers}
                onChange={handleChange}
                placeholder="Number of Passengers"
                style={{ width: '100%' }}
                required
              />
            </Grid>

            {/* Vehicle Type (Dropdown) */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <TextField
                select
                fullWidth
                name="vehicle_type"
                label="Vehicle Type"
                value={formData.vehicle_type}
                onChange={handleChange}
                style={{ width: '100%' }}
                required
              >
                <MenuItem value="car">Car</MenuItem>
                <MenuItem value="van">Truck</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
                <MenuItem value="motorcycle">Motorcycle</MenuItem>
                {/* add your VEHICLE_TYPE_CHOICES */}
              </TextField>
            </Grid>

            {/* Vehicle Type (Dropdown) */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <TextField
                select
                fullWidth
                name="transmission_type"
                label="Transmission Type"
                value={formData.transmission_type}
                onChange={handleChange}
                style={{ width: '100%' }}
                required
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="automatic">Automatic</MenuItem>
                <MenuItem value="highbrid">Highbrid</MenuItem>
                {/* add your VEHICLE_TYPE_CHOICES */}
              </TextField>
            </Grid>

            {/* Active Checkbox */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <FormControlLabel
                control={
                  <Checkbox checked={formData.is_active} onChange={handleChange} name="is_active" />
                }
                label="Active"
              />
            </Grid>

            {/* Last Service Date */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <TextField
                type="date"
                fullWidth
                name="last_service_date"
                label="Last Service Date"
                InputLabelProps={{ shrink: true }}
                value={formData.last_service_date}
                onChange={handleChange}
                style={{ width: '100%' }}
                required
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button disabled={loading} type="submit" variant="contained" color="inherit">
                {loading ? 'Saving...' : 'Save Vehicle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
}

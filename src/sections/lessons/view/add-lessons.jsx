import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { OutlinedInput, Card } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

export function AddLessonsViewView() {
  const [sortBy, setSortBy] = useState('latest');

  const handleSort = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Add New Vehicle
        </Typography>
      </Box>

     <Card style={{ padding: '24px' }}>
               <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item lg={6} md={6} sm={12}>
                <OutlinedInput
                    fullWidth
                    placeholder="First Name"
                    sx={{ maxWidth: 320 }}
                />
            </Grid>
            <Grid item lg={6} md={6} sm={12}>
                <OutlinedInput
                    fullWidth
                    placeholder="Last Name"
                    sx={{ maxWidth: 320 }}
                />
            </Grid>
        </Grid>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item lg={6} md={6} sm={12}>
                <OutlinedInput
                    fullWidth
                    placeholder="Email Address"
                    sx={{ maxWidth: 320 }}
                />
            </Grid>
            <Grid item lg={6} md={6} sm={12}>
                <OutlinedInput
                    fullWidth
                    placeholder="Phone Number"
                    sx={{ maxWidth: 320 }}
                />
            </Grid>
        </Grid>
        <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item lg={6} md={6} sm={12}>
                <OutlinedInput
                    fullWidth
                    placeholder="Password"
                    sx={{ maxWidth: 320 }}
                />
            </Grid>
            <Grid item lg={6} md={6} sm={12}>
                <OutlinedInput
                    fullWidth
                    placeholder="Confirm password"
                    sx={{ maxWidth: 320 }}
                />
            </Grid>
        </Grid>
        <Button
          variant="contained"
          color="inherit"
        >
          Save user
        </Button> 
     </Card>

      <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />
    </DashboardContent>
  );
}

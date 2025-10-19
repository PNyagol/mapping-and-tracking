/* eslint-disable consistent-return */
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import dayjs from 'dayjs';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Iconify } from '../../../components/iconify'
import {
  Button,
  TextField,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material'
import { useSnackbar } from 'notistack';
// ----------------------------------------------------------------------

export function UserDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState()
  const [isLoading, setIsLoading] = useState('')
  const [data, setData] = useState({})
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword] = useMutation(REST_MY_PASSWORD);
const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});
  useEffect(() => {
    const account = sessionStorage.getItem("_user");
    if(account){
        setUser(JSON.parse(account))
    }
  }, [])
  const { data: userData, refetch } = useQuery(GET_USER_DATA, { variables: { email: user?.email } });


  useEffect(() => {
    setData(userData?.getUser || {})
  }, [userData])
  useEffect(() => {
    document.title = 'My Locations - Mazingira Concept';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    if(!formData?.oldPassword || !formData?.newPassword || !formData?.confirmPassword){
        enqueueSnackbar('Please fill all the required fields.', {
            variant: 'error',
        });
        setIsLoading(false);
        return false;
    }

    if(formData?.newPassword !== formData?.confirmPassword){
        enqueueSnackbar('New password do not match!!!.', {
            variant: 'error',
        });
        setIsLoading(false);
        return false;
    }

    try{
     const { data } = await resetPassword({
        variables: {
          email: user?.email,
          oldPassword: formData.oldPassword,
          password: formData.newPassword,
        },
      });

      const { success, message } = data.resetPassword;

      if (success) {
        setFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
        enqueueSnackbar("Password reset successfully.", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(`Error: ${message}`, { variant: "error" });
      }
    }catch(error){
        enqueueSnackbar("Password reset successfully.", {
          variant: "success",
        });
    } finally{
        setIsLoading(false);
    }
  } 

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
          My Details
        </Typography>
      </Box>

      <Card>

        <Scrollbar sx={{ padding: '16px' }}>
            <Typography>Full Name: {data?.firstName} {data?.lastName}</Typography>
            <Typography>Email Address: {data?.email}</Typography>
            <Typography>Phone Number: {data?.Phone}</Typography>
            <Typography>Physical Address: {data?.physicalAddress}</Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>Is Active: {data.isActive ?
                <Iconify width={22} icon="lets-icons:check-fill" sx={{ color: 'success.main' }} />
            :
                <Iconify width={22} icon="icon-park-solid:close-one" sx={{ color: 'error.main' }} />
            }</Typography>
            <Typography>Last Loggin: {dayjs(data?.lastLogin).format('YYYY-MM-DD')}</Typography>
            <Typography>Date Created: {dayjs(data?.addedDate).format('YYYY-MM-DD')}</Typography>
            <Typography>Waste Reported: {data?.geolocationSet?.length}</Typography>

            <Typography sx={{ marginTop: '40px' }} >
                <Typography variant='h4' sx={{ display: 'inline-block', marginBottom: '20px' }}>Reset Password</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={12} sx={{ marginBottom: '20px' }}>
                    <TextField
                        fullWidth
                        name="oldPassword"
                        label="Enter Old Password"
                        value={ formData?.oldPassword}
                        onChange={handleChange}
                        type={showPassword ? 'text' : 'password'}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} sx={{ marginBottom: '20px' }}>
                    <TextField
                        fullWidth
                        name="newPassword"
                        label="Enter New Password"
                        value={formData?.newPassword}
                        onChange={handleChange}
                        type={showPassword ? 'text' : 'password'}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                </IconButton>
                            </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} sx={{ marginBottom: '20px' }}>
                    <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    value={formData?.confirmPassword}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                            </IconButton>
                        </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                    />
                  </Grid>

                {/* Action Buttons */}
                <Box mt={3} display="flex" gap={2}>
                  <Button
                    loading={isLoading}
                    disabled={isLoading}
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </Typography>
        </Scrollbar>
      </Card>
    </DashboardContent>
  );
}

const REST_MY_PASSWORD = gql`
    mutation resetPassword($email: String!, $oldPassword: String!, $password: String!){
        resetPassword(email: $email, oldPassword: $oldPassword, password: $password){
            success
            message
        }
    }
`

const GET_USER_DATA = gql`
  query getUser($email: String!) {
    getUser(email: $email) {
    id
    email
    firstName
    lastName
    Phone
    physicalAddress
    isActive
    lastLogin
    addedDate
    geolocationSet {
        id
        county
        country
    }
    }
  }
`;

// ----------------------------------------------------------------------

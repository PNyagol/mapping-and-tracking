import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useSnackbar } from 'notistack';
import { useParams } from "react-router-dom";
import { gql, useMutation } from '@apollo/client';

const RESET_USER_PASSWORD = gql`
  mutation resetUserPassword($email: String!, $password: String!) {
    resetUserPassword(email: $email, password: $password) {
      success
      message
    }
  }
`;

export function ResetPasswordView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { uid, token } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
    const [resetUserPassword, { loading, error }] = useMutation(RESET_USER_PASSWORD);

  useEffect(() => {
    const email = sessionStorage.getItem('_email');
    console.log("****************************TOKENS")
    console.log(uid, token, email)
    console.log("****************************TOKENS")
    setEmail(email || '');
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      enqueueSnackbar('Password reset successful', { variant: 'success' });
      router.push('/');
    }
  }, [error, isAuthenticated, enqueueSnackbar, router]);

  const handleResetPassword = useCallback(async () => {
    if (!email || !password || !confirmPassword) {
      enqueueSnackbar('Please fill in all fields.', { variant: 'warning' });
      return;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar('Passwords do not match.', { variant: 'error' });
      return;
    }

    if (password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters long.', {
        variant: 'warning',
      });
      return;
    }

    try {
      const { data } = await resetUserPassword({
        variables: { email, password },
      });

      const { success, message } = data.resetUserPassword;

      if (success) {
        enqueueSnackbar('Password reset successful!', { variant: 'success' });
        router.push('/');
      } else {
        enqueueSnackbar(message || 'Failed to reset password.', {
          variant: 'error',
        });
      }
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
    }
  }, [email, password, confirmPassword, enqueueSnackbar, resetUserPassword, router]);

  const handleNavigateToLogin = useCallback(() => {
    router.push('/')
  }, [router])

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="email"
        label="Email address"
        defaultValue={email}
        sx={{ mb: 3 }}
        onChange={(e) => setEmail(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        defaultValue={password}
        type={showPassword ? 'text' : 'password'}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(e) => setPassword(e.target.value)}
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

      <TextField
        fullWidth
        name="password"
        label="Confirm Password"
        defaultValue={confirmPassword}
        type={showPassword ? 'text' : 'password'}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(e) => setConfirmPassword(e.target.value)}
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

      <Link variant="body2" color="inherit" sx={{ mb: 1.5, cursor: 'pointer' }} onClick={handleNavigateToLogin}>
        Back to Login
      </Link>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleResetPassword}
      >
        { loading ? 'Resetting...' : 'Reset Password' }
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Reset Password</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Lost your password? Let&apos;s help reset it.
        </Typography>
      </Box>

      {renderForm}

      {/* <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>

      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box> */}
    </>
  );
}

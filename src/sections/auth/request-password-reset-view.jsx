import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'notistack';
import { requestResetPassword } from '../../redux/actionCreators/authActions';

export function RequestResetPasswordView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('hello@gmail.com');
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, resetUID, resetToken, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    if (resetUID && resetToken) {
      enqueueSnackbar('Password reset request success', { variant: 'success' });
      router.push(`/reset-password/${resetUID}/${resetToken}`);
    }
  }, [error, isAuthenticated, enqueueSnackbar, router, resetUID, resetToken]);

  const handleRequestResetPassword = useCallback(() => {
    dispatch(requestResetPassword(email));
  }, [router, email, dispatch]);

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

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }} onClick={handleNavigateToLogin}>
        Back to Login
      </Link>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleRequestResetPassword}
      >
        {loading ? 'Requesting...' : 'Request Reset Password'}
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
        <Typography variant="h5">Request Reset Password</Typography>
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
    </>
  );
}

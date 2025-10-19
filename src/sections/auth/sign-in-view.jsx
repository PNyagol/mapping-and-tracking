import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { gql, useMutation } from '@apollo/client';

export function SignInView() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const dispatch = useDispatch();

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER_MUTATION);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
        var token = sessionStorage.getItem('_authToken');
        var roles = sessionStorage.getItem('_userRole');
        if(token && roles){
          router.push('/dashboard');
        }
  }, [])

  const handleSignIn = useCallback(async () => {
    if (!email || !password) {
      enqueueSnackbar('Please fill in all fields.', { variant: 'warning' });
      return;
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });
      const { success, message, userRole, token, user } = data.loginUser;

      if (success) {
        const allowedRoles = ['User', 'Epr', 'B2b', 'B2c', 'Government'];
        if (!allowedRoles.includes(userRole)) {
          enqueueSnackbar("You don't have permissions to access this resource.", {
            variant: 'warning',
          });
          return;
        }

        // Save login session locally
        sessionStorage.setItem('_authToken', token);
        sessionStorage.setItem('_userRole', userRole);
        sessionStorage.setItem(
          '_user',
          JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          })
        );
         enqueueSnackbar('Login successful!', { variant: 'success' });
        router.push('/dashboard');
      }
    } catch (err) {
      enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' });
    }
  }, [email, password, loginUser, enqueueSnackbar, router]);

  const handleResetPassword = useCallback(() => {
    router.push('/reset-password');
  }, [router]);

  const handleSignInAnonymously = () => {
    router.push('/dashboard');
  }

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Button
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="outlined"
          onClick={handleSignInAnonymously}
          disabled={loading}
        >
          Continue Anonymously
        </Button>
      </Box>
      <Box sx={{ padding: '20px', width: '100%', textAlign: 'center' }}>
        OR
      </Box>

      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

      <Link variant="body2" onClick={handleResetPassword} color="inherit" sx={{ mb: 1.5, cursor: 'pointer' }}>
        Forgot password?
      </Link>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
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
        <Typography variant="h5">Sign in</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Welcome back!, let&apos;s log you in.
        </Typography>
      </Box>

      {renderForm}
    </>
  );
}


const LOGIN_USER_MUTATION = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      userRole
      message
      token
      user {
        firstName
        lastName
        email
        Phone
      }
    }
  }
`;
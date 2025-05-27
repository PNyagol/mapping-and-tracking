import { Grid, Tab, Tabs, Box, Typography, Container } from "@mui/material";
import { useState, useEffect } from "react";
import { Signup } from "../../components/Signup/Signup";
import { Login } from "../../components/Login/Login";
import { ResetPassword } from "../../components/ResetPassword/ResetPassword";
import { signInWithPopup } from 'firebase/auth';
import { gql, useMutation } from "@apollo/client";
import { auth, googleProvider, facebookProvider } from '../../firebase';
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export const Authentication = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);
  const [loginUserWithGoogle] = useMutation(LOGIN_WITH_GOOGLE_MUTATION);

    useEffect(() => {
      document.title = "Authentication - Mazingira Concept";
    }, []);

    useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const loginNewUser = async (Phone, email, firstName, lastName, password, physicalAddress) => {
      const { data } = await loginUserWithGoogle({ variables: { Phone, email, firstName, lastName, password, physicalAddress } });
      const { success, message, userRole, token, user } = data.loginUserWithGoogle;
      if (success) {
        const allowedRoles = ["User", "Epr", "B2b", "B2c", "Government"];

        if (!allowedRoles.includes(userRole)) {
          enqueueSnackbar(
            "You don't have permissions to access this resource.",
            { variant: "warning" }
          );
          navigate("/authentication");
          return;
        }

        localStorage.setItem("_authToken", token);
        localStorage.setItem("_userRole", userRole);
        localStorage.setItem(
          "_user",
          JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          })
        );
        enqueueSnackbar("Login successful.", { variant: "success" });
        navigate("/dashboard");
      }else{
        enqueueSnackbar("Login Failed!.", { variant: "error" });
      }
  }

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Google User:', user);
    const names = user.displayName.split(" ")
    const firstName = names[0]
    const lastName = names[1]
    const userEmail = user.email
    const userPhone = user?.phoneNumber || ""

    loginNewUser(userPhone, userEmail, firstName, lastName, "", "No Address")
  } catch (error) {
    console.error(error);
  }
};

const handleFacebookLogin = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    console.log('Facebook User:', user);
    // Send token to your backend to create session
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="authentication_form" style={{ minHeight: '100dvh', width: '100dvw' }}>
        <Container style={{ height: '100%', minHeight: '100dvh',  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ mt: 2 }} style={{ width: '50%', minWidth: '300px' }}>
              {value === 0 && <Login handlePageChange={handleChange}  handleFacebookLogin={handleFacebookLogin} handleGoogleLogin={handleGoogleLogin}/>}
              {value === 1 && <Signup  handlePageChange={handleChange} handleFacebookLogin={handleFacebookLogin} handleGoogleLogin={handleGoogleLogin}/>}
              {value === 2 && <ResetPassword handlePageChange={handleChange}/> }
          </Box>
        </Container>
    </div>
  );
};


const LOGIN_WITH_GOOGLE_MUTATION = gql`
  mutation loginUserWithGoogle(
      $Phone: String
      $email: String!
      $firstName: String
      $lastName: String
      $password: String
      $physicalAddress: String
  ) {
    loginUserWithGoogle(
      Phone: $Phone
      email: $email
      firstName: $firstName
      lastName: $lastName
      password: $password
      physicalAddress: $physicalAddress
    ) {
      success
      userRole
      message
      token
      user {
        firstName
        lastName
        email
      }
    }
  }
`;
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { FacebookOutlined, Google } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from "notistack";

export const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginUser] = useMutation(LOGIN_USER_MUTATION);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required!";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid!";
    }

    if (!formData.password) {
      newErrors.password = "Password is required!";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password is too short. Minimum 6 characters required!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const { email, password } = formData;
    console.log("Submitting login with:", formData); 

    setIsLoading(true);

    try {
      const { data } = await loginUser({ variables: { email, password } });
      const { success, message, userRole, token, user } = data.loginUser;
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
      } else {
        enqueueSnackbar(`Error: ${message}`, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mx: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" align="center">
          Login
        </Typography>
        <Typography variant="body2" align="center">
          Welcome back, just a few details to get you in.
        </Typography>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          required
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          required
        />

        <Button
          variant="contained"
          size="large"
          color="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </Box>

      <div className="long_gray_line">
        <div className="or_text">OR</div>
      </div>
      <div className="button_containers">
        <IconButton className="auth_call_to_action_buttons">
          <Google />
        </IconButton>
        <IconButton className="auth_call_to_action_buttons">
          <FacebookOutlined />
        </IconButton>
      </div>
    </>
  );
};

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

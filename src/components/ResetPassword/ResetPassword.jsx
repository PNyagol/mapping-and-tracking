import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from "notistack";

export const ResetPassword = ({ handlePageChange }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [resetUserPassword] = useMutation(RESET_USER_PASSWORD);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email || !emailPattern.test(formData.email))
      errors.email = "Enter a valid email";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const {
      email,
      password,
      confirmPassword,
    } = formData;

    if (!validate()) {
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match.", { variant: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetUserPassword({
        variables: {
          email,
          password,
        },
      });

      console.log("********************************************rest")
      console.log(response)

      enqueueSnackbar("Password reset was successfull", {
        variant: "success",
      });
      handlePageChange(0)
    //   navigate(`/authentication`);
    } catch (err) {
      console.error("Error creating user:", err);
      enqueueSnackbar("Error reseting user password", { variant: "error" });
    }

    setIsLoading(false);
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
        <Typography variant="h5" align="center" fontWeight="bold">
          Reset Password
        </Typography>
        <Typography align="center" variant="body2">
          Forgot your password? Just a few details we get your account back.
        </Typography>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
          required
          error={!!formErrors.email}
          helperText={formErrors.email}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          fullWidth
          required
          error={!!formErrors.password}
          helperText={formErrors.password}
        />

        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          fullWidth
          required
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', marginBottom: '10px' }}>
          <Link onClick={() => {handlePageChange(0)}}>Have account already? Login</Link>
          <Link onClick={() => {handlePageChange(1)}}>Don't have account?</Link>
        </Box>

        <Button
          variant="contained"
          size="large"
          color="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Reset Password"}
        </Button>
      </Box>
    </>
  );
};

export const RESET_USER_PASSWORD = gql`
  mutation resetUserPassword(
    $email: String!
    $password: String!
  ) {
    resetUserPassword(
      email: $email
      password: $password
    ) {
      success
      message
    }
  }
`;

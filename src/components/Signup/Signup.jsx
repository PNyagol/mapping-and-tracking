import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import { FacebookOutlined, Google } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from "notistack";

export const Signup = ({ handlePageChange, handleFacebookLogin, handleGoogleLogin }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "User",
  });

  const [formErrors, setFormErrors] = useState({});

  const [createUser] = useMutation(CREATE_USER_REGISTRATION);

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
    const phonePattern = /^[0-9]{10}$/;

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email || !emailPattern.test(formData.email))
      errors.email = "Enter a valid email";
    if (!formData.phone || !phonePattern.test(formData.phone))
      errors.phone = "Enter a valid 10-digit phone number";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!formData.role) errors.role = "Role is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      password,
      confirmPassword,
      role,
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
      const response = await createUser({
        variables: {
          firstName,
          lastName,
          email,
          phone,
          address,
          password,
          role,
        },
      });

      enqueueSnackbar(response.data.createUserRegistration.message, {
        variant: "success",
      });

      handlePageChange(0)
    } catch (err) {
      console.error("Error creating user:", err);
      enqueueSnackbar("Error creating user", { variant: "error" });
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
          Sign Up
        </Typography>
        <Typography align="center" variant="body2">
          Fill the form to create an account or use Google or Facebook
        </Typography>

        <Grid container spacing={2} justifyContent={'space-between'}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
          </Grid>
        </Grid>

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
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          fullWidth
          required
          error={!!formErrors.phone}
          helperText={formErrors.phone}
        />

        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          fullWidth
          required
          error={!!formErrors.address}
          helperText={formErrors.address}
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

        <Box
          sx={{
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          <Link
            onClick={() => {
              handlePageChange(0);
            }}
          >
            Have account already? Login
          </Link>
        </Box>

        <Button
          variant="contained"
          size="large"
          color="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </Box>

      <div className="long_gray_line">
        <div className="or_text">OR</div>
      </div>

      <div className="button_containers">
        <IconButton className="auth_call_to_action_buttons" onClick={handleGoogleLogin}>
          <Google />
        </IconButton>
        <IconButton className="auth_call_to_action_buttons" onClick={handleFacebookLogin}>
          <FacebookOutlined />
        </IconButton>
      </div>
    </>
  );
};

export const CREATE_USER_REGISTRATION = gql`
  mutation createUserRegistration(
    $phone: String!
    $address: String!
    $email: String!
    $firstName: String!
    $lastName: String!
    $password: String!
    $role: String!
  ) {
    createUserRegistration(
      Phone: $phone
      address: $address
      email: $email
      firstName: $firstName
      lastName: $lastName
      password: $password
      roles: $role
    ) {
      success
      message
    }
  }
`;

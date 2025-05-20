import React, { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";
import { Card, CardContent, Container, Typography } from "@mui/material";
import { TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { gql, useMutation, useQuery } from "@apollo/client";
import moment from "moment/moment";

export const Profile = () => {
  const [role, setRole] = useState("User");
  const [userObj, setUserObj] = useState(null);
  const userRole = localStorage.getItem("_userRole");
  const user = localStorage.getItem("_user");
  const { enqueueSnackbar } = useSnackbar();
  const { data } = useQuery(USER_PROFILE);
  const [resetPassword] = useMutation(RESET_PASSWORD);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values) => {
    const { oldPasswords, passwords, passwordAgain } = values;

    if (passwords.length < 6) {
      enqueueSnackbar("Password should be greater than 6 characters", {
        variant: "error",
      });
      return;
    }

    if (passwords !== passwordAgain) {
      enqueueSnackbar("Passwords do not match.", { variant: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await resetPassword({
        variables: {
          email: "", // Set this to the user's email or get it from context/store
          oldPassword: oldPasswords,
          password: passwords,
        },
      });

      const { success, message } = data.resetPassword;

      if (success) {
        reset(); // Clear form
        enqueueSnackbar("Password reset successfully.", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(`Error: ${message}`, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      const user_obj = JSON.parse(user);
      setUserObj(user_obj);
      setRole(userRole);
    }
  }, [user, userRole]);

  return (
    <Dashboard>
      <Container style={{ paddingTop: "100px" }}>
        <Card
          style={{ marginTop: "30px", marginBottom: "30px" }}
          className="card"
        >
          <CardContent>
            <Typography>
              Name: {userObj?.firstName} {userObj?.lastName}
            </Typography>
            <Typography>Email: {userObj?.email}</Typography>
            <Typography>Phone Number: {data?.getUserProfile.Phone}</Typography>
            <Typography>Address: {data?.getUserProfile.physicalAddress}</Typography>
            <Typography>Account Created On: {moment(data?.getUserProfile?.addedDate).format("DD/MM/YYYY")}</Typography>
            <Typography>Role: {role}</Typography>
          </CardContent>
        </Card>
        <Card
          style={{ marginTop: "30px", marginBottom: "30px" }}
          className="card"
        >
          <CardContent>
          <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '30px' }}>Reset Password</Typography>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="p-3" style={{ width: "100%", maxWidth: 400 }}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Old Password"
                  type="password"
                  {...register("oldPasswords", {
                    required: "Old password is required",
                  })}
                  error={!!errors.oldPasswords}
                  helperText={errors.oldPasswords?.message}
                />

                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="New Password"
                  type="password"
                  {...register("passwords", {
                    required: "New password is required",
                  })}
                  error={!!errors.passwords}
                  helperText={errors.passwords?.message}
                />

                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  {...register("passwordAgain", {
                    required: "Confirm password is required",
                  })}
                  error={!!errors.passwordAgain}
                  helperText={errors.passwordAgain?.message}
                />

                <div style={{ marginTop: 16 }}>
                  <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    loading={isLoading}
                  >
                    Reset Password
                  </LoadingButton>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Dashboard>
  );
};

const RESET_PASSWORD = gql`
  mutation resetPassword(
    $email: String
    $oldPassword: String
    $password: String!
  ) {
    resetPassword(
      email: $email
      oldPassword: $oldPassword
      password: $password
    ) {
      success
      message
    }
  }
`;

const USER_PROFILE = gql`
  query getUserProfile {
    getUserProfile {
      id
      email
      firstName
      lastName
      Phone
      physicalAddress
      roles
      addedDate
    }
  }
`;

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider, useDemoRouter } from "@toolpad/core/internal";
import UserMenu from "../UserMenu/UserMenu";
import {
  Typography,
  Stack,
  Button,
} from "@mui/material";
import {  LocationOnOutlined } from "@mui/icons-material";
import { AddLocationDrawer } from "../AddLocationDrawer/AddLocationDrawer";
import { PersonOutline } from "@mui/icons-material";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from "notistack";

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const Dashboard = ({ window, children, fetchData, refetchMappings }) => {
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate();
  const navlocation = useLocation();
  const currentUser = localStorage.getItem("_authToken");
  const userRole = localStorage.getItem("_userRole");

  useEffect(() => {
    if(!currentUser || !userRole){
      navigate("/authentication");
    }
  }, [currentUser, userRole, navigate])

    useEffect(() => {
    if (!currentUser) {
      enqueueSnackbar("You are not logged in", { variant: "error" });
      navigate("/authentication");
    }

    const allowedRoles = ["User", "Epr", "B2b", "B2c", "Government"];

    const allowedURLs = ["/", "", "/auth/reset-password"];
    if (
      !allowedRoles.includes(userRole) &&
      currentUser &&
      !allowedURLs.includes(navlocation.pathname)
    ) {
      enqueueSnackbar("You don't have permissions to access this resource.", {
        variant: "warning",
      });
      navigate("/authentication");
    }
  }, [navigate, currentUser, userRole, enqueueSnackbar, navlocation]);

  // const navItems = useToolpadNavigation(NAVIGATION)
  const demoWindow = window !== undefined ? window() : undefined;
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(null);
  // const router = useDemoRouter('/dashboard');


  const getLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (err) => {
        setLocation(null);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  
  function CustomAppTitle() {
    return (
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h6">Mazingira Concept</Typography>
        <Button variant="contained" onClick={() => { setOpen(true) }}>
          {" "}
          <LocationOnOutlined /> Add Location
        </Button>
      </Stack>
    );
  }

  function UserAction() {
    return <UserMenu />;
  }

const NAVIGATION = [
  {
    key: 1,
    kind: "header",
    title: "Mapping Section",
  },
  {
    key: 2,
    title: "Dashboard",
    // path: "/dashboard",
    segment: "dashboard",
    icon: <DashboardIcon />,
  },
  {
    key: 3,
    title: "My Locations",
    segment: "my_locations",
    // path: "/my_locations",
    icon: <LocationOnOutlined />,
  },
  {
    key: 4,
    kind: "divider",
  },
  {
    key: 5,
    kind: "header",
    title: "Analytics",
  },
  {
    key: 6,
    title: "Reports",
    segment: "reports",
    // path: "/reports",
    icon: <BarChartIcon />,
  },
  {
    key: 7,
    title: "My Profile",
    segment: "profile",
    // path: "/profile",
    icon: <PersonOutline />,
  },
];


  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        navigation={NAVIGATION}
        // router={router}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout
          slots={{
            appTitle: CustomAppTitle,
            toolbarAccount: UserAction,
          }}
        >
          {children}
        </DashboardLayout>
      </AppProvider>
      <AddLocationDrawer
        open={open}
        setOpen={setOpen}
        location={location}
        fetchData={fetchData}
        refetchMappings={refetchMappings}
      />
    </DemoProvider>
  );
};

Dashboard.propTypes = {
  window: PropTypes.func,
};

export default Dashboard;
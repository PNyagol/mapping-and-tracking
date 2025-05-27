// Dashboard.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  LocationOnOutlined,
  BarChart as BarChartIcon,
  PersonOutline,
  Menu as MenuIcon,
  LogoutOutlined,
} from "@mui/icons-material";

import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import UserMenu from "../UserMenu/UserMenu";
import { AddLocationDrawer } from "../AddLocationDrawer/AddLocationDrawer";
import { useSnackbar } from "notistack";
import { MenuOpenRounded } from "@mui/icons-material";

const navItems = [
  {
    title: "Mapping",
    children: [
      { title: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
      {
        title: "My Locations",
        path: "/my_locations",
        icon: <LocationOnOutlined />,
      },
    ],
  },
  {
    title: "Reports",
    children: [{ title: "Reports", path: "/reports", icon: <BarChartIcon /> }],
  },
  {
    title: "My Profile",
    children: [
      { title: "My Profile", path: "/profile", icon: <PersonOutline /> },
      { title: "Logout", path: "", icon: <LogoutOutlined /> }
    ],
  },
];



export default function Dashboard({ window, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const container =
    window !== undefined ? () => window().document.body : undefined;

  const currentUser = localStorage.getItem("_authToken");
  const userRole = localStorage.getItem("_userRole");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [resizeMenu, setResizeMenu] = useState(false)
  const [drawerWidth, setDrawerWidth] = useState(300);

  const logoutUser = () => {
    localStorage.removeItem("_userRole");
    localStorage.removeItem("_user")
    
    navigate("/authentication")
  }

  useEffect(() => {
    setDrawerWidth(resizeMenu ? 100 : 300)
  }, [resizeMenu])
  // Access control
  useEffect(() => {
    if (!currentUser || !userRole) {
      enqueueSnackbar("You are not logged in", { variant: "error" });
      navigate("/authentication");
    }
  }, [currentUser, userRole, enqueueSnackbar, navigate]);

  useEffect(() => {
    const allowedRoles = ["User", "Epr", "B2b", "B2c", "Government"];
    const allowedURLs = ["/", "", "/auth/reset-password"];
    if (
      !allowedRoles.includes(userRole) &&
      currentUser &&
      !allowedURLs.includes(location.pathname)
    ) {
      enqueueSnackbar("You don't have permissions to access this resource.", {
        variant: "warning",
      });
      navigate("/authentication");
    }
  }, [location.pathname, userRole, currentUser, enqueueSnackbar, navigate]);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ latitude, longitude });
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  const handleDrawerToggle = () => {
    sessionStorage.setItem("_navItemSmall", false)
    setMobileOpen(!mobileOpen)
  };

  const drawer = (
    <div>
      <Toolbar />
      <List style={{ padding: '16px' }}>
        {navItems.map((item) => (
          <Box style={{ marginBottom: "20px" }}>
            <Typography>{item.title.toUpperCase()}</Typography>
            <Box>
              {item.children.map((navItem) => (
                <ListItem
                  button
                  key={navItem.title}
                  selected={location.pathname === navItem.path}
                  onClick={() => {
                    if(navItem.title === "Logout"){
                      logoutUser()
                    }else{
                      navigate(navItem.path)}}
                    }
                  style={resizeMenu ? { display: 'block', textAlign: 'center' } : {}}
                >
                  <ListItemIcon>{navItem.icon}</ListItemIcon>
                  <ListItemText primary={navItem.title} />
                </ListItem>
              ))}
            </Box>
          </Box>
        ))}
      </List>
    </div>
  );

  const handleNavSize = () => {
    setResizeMenu(!resizeMenu)
    sessionStorage.setItem("_navItemSmall", !resizeMenu)
  }

  useEffect(() => {
    const getNav = sessionStorage.getItem("_navItemSmall")
    if(getNav){
      setResizeMenu(getNav === "true" ? true : false)
    }
  }, [])
  return (
    <Box sx={{ display: "flex", backgroundColor: "rgb(255, 255, 255)" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button sx={{ display: { xs: "none", sm: "none", lg: "block", xl: "block", md: "block" }}} style={{ backgroundColor: 'inherit' }} onClick={handleNavSize} color="white"><MenuOpenRounded /></Button>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography sx={{ display: { xs: "none", sm: "none", lg: "block", xl: "block", md: "block" }}} variant="h6" noWrap component="div">
              Mazingira Concept
            </Typography>
            <Button style={{ backgroundColor: "#00A599", color: "#ffffff" }} onClick={() => setOpenDrawer(true)}>
              <LocationOnOutlined /> Add Location
            </Button>
          </Stack>
          <UserMenu />
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          className="mobileMenuNavigationBar"
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          style={{ zIndex: '345435444' }}
        >
          <div className="page_brand">
            <img src="/logo.svg" alt="" />
          </div>
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          style={{ zIndex: '345435444' }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        className="mapping_container_page"
        sx={{
          flexGrow: 1,
          // p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {/* <Outlet /> */}
        {children}
      </Box>

      {/* Location Drawer */}
      <AddLocationDrawer
        open={openDrawer}
        setOpen={setOpenDrawer}
        location={userLocation}
        fetchData={() => {}}
        refetchMappings={() => {}}
      />
    </Box>
  );
}

Dashboard.propTypes = {
  window: PropTypes.func,
};

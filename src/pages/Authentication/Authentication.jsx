import { Grid, Tab, Tabs, Box, Typography, Container } from "@mui/material";
import { useState, useEffect } from "react";
import { Signup } from "../../components/Signup/Signup";
import { Login } from "../../components/Login/Login";

export const Authentication = () => {
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

    useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="authentication_form">
        <Grid container className="auth_grid_container">
          <Grid item xs={isMobile ? 12 : 12} md={isMobile ? 12 : 12} sm={isMobile ? 12 : 12} className={isMobile ? "mobile_view_full_height" : "full_height_rows"}>
            <div className="form_section">
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="auth tabs"
                className="auth_tabs"
              >
                <Tab
                  iconPosition="start"
                  label="Login"
                />
                <Tab
                  iconPosition="start"
                  label="Sign Up"
                />
              </Tabs>
              <Container>
                <Box sx={{ mt: 2 }} style={{ width: '100%' }}>
                    {value === 0 && <Login />}
                    {value === 1 && <Signup />}
                </Box>
              </Container>
            </div>
          </Grid>
          {!isMobile &&  <Grid item xs={12} md={6} sm={12} className="full_height_rows has_background">
            <Container>
                <div className="text_section">
                    <div style={{ maxWidth: '50%' }}>
                        <Typography variant="h4">
                            See It. Report It. Keep Our Community Clean.
                        </Typography>
                        <Typography>
                            If you notice illegal dumping, overflowing bins, or any form of
                            unmanaged waste, don’t ignore it—report it! Your action helps
                            create a cleaner, safer, and healthier environment for everyone.
                        </Typography>
                    </div>
                </div>
            </Container>
          </Grid>}
        </Grid>
    </div>
  );
};

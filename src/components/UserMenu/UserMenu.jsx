// src/components/UserMenu.jsx
import React, { useEffect, useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const UserMenu = () => {
  const navigate = useNavigate()
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [color, setColor] = useState();
  const [bgColor, setBgColor] = useState();
  const [userObj, setUserObj] = useState(null)
  const [userFirstLetter, setUserFirstLetter] = useState(null)
  const userRole = localStorage.getItem("_userRole");
  const user = localStorage.getItem("_user")
  
  const logoutUser = () => {
    localStorage.removeItem("_userRole");
    localStorage.removeItem("_user")
    
    navigate("/authentication")
  }
  
  const settings = [
    {title: 'Profile', fn: () => { navigateToProfile("/profile"); handleCloseUserMenu(); }},
    {title: 'Dashboard', fn: () => {navigateToProfile("/dashboard"); handleCloseUserMenu()}},
    {title: 'Logout', fn: () => { logoutUser(); handleCloseUserMenu()}}
  ];
  useEffect(() => {
    if(user){
      const user_obj = JSON.parse(user);
      setUserObj(user_obj)
      setUserFirstLetter(user_obj?.firstName[0] || 'N')
    }
  }, [user, userRole])


  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function getColorByLetter(letter) {
    const normalized = letter.toUpperCase();

    if (/[A-D]/.test(normalized)) {
      return { color: "#084C61", backgroundColor: "#DFF6FF" }; // Deep blue + light blue
    } else if (/[E-H]/.test(normalized)) {
      return { color: "#0B8457", backgroundColor: "#D1F7E2" }; // Green + mint
    } else if (/[I-L]/.test(normalized)) {
      return { color: "#A0522D", backgroundColor: "#FFF0E6" }; // Brown + beige
    } else if (/[M-P]/.test(normalized)) {
      return { color: "#9C27B0", backgroundColor: "#F3E5F5" }; // Purple + lavender
    } else if (/[Q-T]/.test(normalized)) {
      return { color: "#FF9800", backgroundColor: "#FFF3E0" }; // Orange + light orange
    } else if (/[U-Z]/.test(normalized)) {
      return { color: "#D32F2F", backgroundColor: "#FFEBEE" }; // Red + pink
    } else {
      return { color: "#333", backgroundColor: "#eee" }; // Fallback gray
    }
  }

  const setUserNames = (name) => {
    if(name){
      if(name.length > 14){
        return `${name.substring(0, 14)}...`;
      }else{
        return name;
      }
    }
  }

  const navigateToProfile = (path) => {
    navigate(path);
  }

  useEffect(() => {
    const { color, backgroundColor } = getColorByLetter("R");
    setColor(color)
    setBgColor(backgroundColor)
  },[])

  return (
    <>
      <Box sx={{flexGrow: 0,  display: { xs: "none", sm: "none", lg: "block", xl: "block", md: "block" }}}>
        <Typography style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }} className="user_profile_card">
          <Tooltip title="Open settings">
            <IconButton size='large' onClick={handleOpenUserMenu} sx={{ color: color, backgroundColor: bgColor, height: '40px', width: '40px', borderRadius: '50%' }}>
              <span style={{ fontSize: '16px' }}><b>{userFirstLetter}</b></span>
            </IconButton>
          </Tooltip>
          <div className="user_details">
            <div className="fname" style={{ fontSize: '14px' }}>{setUserNames(userObj?.firstName)}</div>
            <div className="fname" style={{ fontSize: '14px' }}>{setUserNames(userObj?.email)}</div>
          </div>
        </Typography>
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          container={anchorElUser?.ownerDocument?.body}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          {settings.map((setting, index) => (
            <MenuItem key={index} onClick={setting.fn}>
              <Typography textAlign="center">{setting.title}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </>
  );
};

export default UserMenu;

/* eslint-disable consistent-return */
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { _langs, _notifications } from 'src/_mock';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { navData } from '../nav-config-dashboard';
import { MainSection } from '../core/main-section';
import { _workspaces } from '../nav-config-workspace';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountPopover } from '../components/account-popover';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import imageCompression from 'browser-image-compression';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Iconify } from '../../components/iconify/iconify';
import { useSnackbar } from 'notistack';
import { gql, useMutation } from '@apollo/client';

// ----------------------------------------------------------------------

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [openForm, setOpenForm] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [boundaryData, setBoundaryData] = useState(null);
  const mapRef = useRef();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [photo, setPhoto] = useState(null);
  const [createGeoLocation] = useMutation(CREATE_GEO_LOCATION);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isTakingPictures, setIsTakingPictures] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    fileInputRef.current.click(); // Trigger the hidden input
  };
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    latitude: latitude || '',
    longitude: longitude || '',
    description: '',
    wasteType: '',
    wbProneArea: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

    useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLatitude(latitude);
          setLongitude(longitude);
          setFormData({
                        ...formData,
                        latitude,
                        longitude
                      })
        },
        (error) => {
          console.error('Error getting location:', error.message);
        },
        {
          enableHighAccuracy: true, // use GPS if available
          timeout: 10000, // stop trying after 10 seconds
          maximumAge: 0, // do not use cached location
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      enqueueSnackbar('Geolocation is not supported by this browser.', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.wasteType) {
      enqueueSnackbar('Please select the waste type', { variant: 'error' });
      setIsLoading(false);
      return false;
    }
    if (!photo) {
      enqueueSnackbar('Please make sure you upload an image', {
        variant: 'error',
      });
      setIsLoading(false);
      return false;
    }
    enqueueSnackbar('Submiting details', { variant: 'info' });
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    )
      .then((res) => res.json())
      .then(async (data) => {
        const address = data.address;
        var country = address.country;
        var county = address?.city || address.state;
        var subCounty = address.state_district || address.suburb;
        var locality = address.city || address.town || address.village;
        // var latitude = latitude;
        // var longitude = longitude;
        var description = formData.description;
        var imageUrl = photo;
        // var imageUrl = imageURL;
        var wasteType = formData.wasteType;
        var wbProneArea = formData.wbProneArea;

        // return false
        await saveLocationDetails(
          country,
          county,
          subCounty,
          description,
          imageUrl,
          latitude,
          locality,
          longitude,
          wasteType,
          wbProneArea
        );

        setIsLoading(false);
      });
    setIsLoading(false);
  };

  const saveLocationDetails = async (
    country,
    county,
    subCounty,
    description,
    imageurl,
    latitude,
    locality,
    longitude,
    wasteType,
    wbProneArea
  ) => {
    try {
      const { data } = await createGeoLocation({
        variables: {
          country,
          county,
          subCounty,
          description,
          imageurl,
          latitude,
          locality,
          longitude,
          wasteType,
          wbProneArea,
        },
      });

      if (!data || !data.createGeoLocation) {
        throw new Error('Unexpected response from server.');
      }

      const { success, message } = data.createGeoLocation;

      if (success) {
        enqueueSnackbar('Details saved successfully', { variant: 'success' });
        // fetchData();
        // refetchMappings();
        setOpenForm(false);
        navigate("/dashboard")
      } else {
        enqueueSnackbar(`Error: ${message || 'Unknown error occurred'}`, {
          variant: 'error',
        });
      }
    } catch (err) {
      // Log full error for debugging
      console.error('Failed to save location details:', err);

      // Show user-friendly error
      enqueueSnackbar(
        `Failed to save location: ${err.message || 'An unexpected error occurred.'}`,
        { variant: 'error' }
      );
    } finally {
      // setIsUpdatingForm(true)
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsTakingPictures(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasBackCamera = devices.some(
        (device) => device.kind === 'videoinput' && device.label.toLowerCase().includes('back')
      );

      const constraints = {
        video: {
          facingMode: hasBackCamera ? { ideal: 'environment' } : 'user',
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      enqueueSnackbar(
        'Error accessing camera. Please check your camera permissions. or make sure no browser is using the cammera',
        { variant: 'error' }
      );
      console.error('Error accessing camera:', err);
    }
  };

  useEffect(() => {
    if (openPhoto && !photo) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          startCamera();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [openPhoto, photo]);

  const litterTypeOptions = ['Plastic', 'Glass', 'Mixed Waste'];

  async function compressImageToBase64(file) {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
    return base64;
  }

  const handleImageChange = async (event) => {
    const file = await compressImageToBase64(event.target.files[0]);
    setPhoto(file);
  };

  const handleClickOpen = () => {
    setOpenForm(true);
  };
  const handleClose = () => {
    setOpenForm(false);
  };


  useEffect(() => {
    const token = sessionStorage.getItem('_authToken');

    // Check: no token AND not already on /dashboard
    if (!token && location.pathname !== '/dashboard') {
      navigate('/');
    }
  }, [navigate, location.pathname]);


  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
      },
    };
    

    const headerSlots = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/* Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile data={navData} open={open} onClose={onClose} workspaces={_workspaces} />
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 4 } }}>
          {/* Language popover */}
          <Button variant="contained" onClick={handleClickOpen}>
            {' '}
            <Iconify width={22} icon="mdi:location-add-outline" sx={{ marginRight: '5px' }} /> Add
            Location
          </Button>
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={openForm}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Report Waste Location
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                {/* Location warning */}
                {(!latitude || !longitude) && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    If your latitude and longitude is not pre-filled, please enable location access
                    and reload the page.
                  </Typography>
                )}

                {/* Latitude & Longitude */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      disabled
                      label="Latitude"
                      name="latitude"
                      value={latitude}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      disabled
                      label="Longitude"
                      name="longitude"
                      value={longitude}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                {/* Litter Type Checkboxes */}
                <Box mt={3}>
                  <TextField
                    select
                    fullWidth
                    label="Litter Type"
                    name="wasteType"
                    value={formData.wasteType || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wasteType: e.target.value,
                      })
                    }
                  >
                    {litterTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Open Waste Burning Checkbox */}
                <Box mt={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.wbProneArea || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wbProneArea: e.target.checked,
                          })
                        }
                        name="wbProneArea"
                      />
                    }
                    label="Area is prone to open waste burning"
                  />
                </Box>

                {/* Image Upload Section */}
                <Box mt={3}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <Button variant="contained" onClick={handleClick}>
                    Take a picture
                  </Button>

                  {!isTakingPictures && photo && (
                    <Box mt={2} className="image_file_design">
                      <div className="taken_picture_card">
                        <div className="close_card_button">
                          <IconButton
                            onClick={() => {
                              setPhoto(null);
                              setIsTakingPictures(false);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </div>
                        <img
                          src={photo}
                          alt="Captured"
                          style={{ marginTop: 10, maxWidth: '100%' }}
                        />
                      </div>
                    </Box>
                  )}
                </Box>

                {/* Description */}
                <Box mt={3}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Description"
                    name="description"
                    placeholder="Write your message here"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Box>

                {/* Action Buttons */}
                <Box mt={3} display="flex" gap={2}>
                  <Button
                    loading={isLoading}
                    disabled={isLoading}
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' color='error' onClick={handleClose}>
                Close
              </Button>
            </DialogActions>
          </BootstrapDialog>

          {/* Account drawer */}
          <AccountPopover data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;
  useEffect(() => {
    if (latitude && longitude) {
      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [latitude, longitude]);


  return (
    <LayoutSection
      headerSection={renderHeader()}
      sidebarSection={
        <NavDesktop data={navData} layoutQuery={layoutQuery} workspaces={_workspaces} />
      }
      footerSection={renderFooter()}
      cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}

const CREATE_GEO_LOCATION = gql`
  mutation createGeoLocation(
    $country: String!
    $county: String!
    $subCounty: String!
    $description: String!
    $imageurl: Upload!
    $latitude: Float!
    $locality: String!
    $longitude: Float!
    $wasteType: String
    $wbProneArea: Boolean!
  ) {
    createGeoLocation(
      country: $country
      county: $county
      subCounty: $subCounty
      description: $description
      imageurl: $imageurl
      latitude: $latitude
      locality: $locality
      longitude: $longitude
      wasteType: $wasteType
      wbProneArea: $wbProneArea
    ) {
      success
      message
    }
  }
`;

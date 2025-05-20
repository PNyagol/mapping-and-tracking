import React, { useState, useRef, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from "notistack";
import { DialogTitle, IconButton, DialogContent, Typography, DialogActions, Button, Dialog, Box, TextField, Grid } from "@mui/material";
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { CameraAltOutlined } from '@mui/icons-material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export const AddLocationDrawer = ({
  open,
  setOpen,
  location,
  fetchData,
  refetchMappings,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [photo, setPhoto] = useState(null);
  const [createGeoLocation] = useMutation(CREATE_GEO_LOCATION);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isTakingPictures, setIsTakingPictures] = useState(false);
  const folderInputRef = useRef(null);
  const [formData, setFormData] = useState({
    latitude: location?.latitude || '',
    longitude: location?.longitude || '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function uploadBase64ToCloudinary(base64Image) {
    const cloudName = "dwvjgc2l0";
    const uploadPreset = "mazingira_concept_trial";

    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imageURL = await uploadBase64ToCloudinary(photo);
    if(!imageURL){
      enqueueSnackbar("Please make sure you upload an image", { variant: "error" });
      return false;
    }
    enqueueSnackbar("Submiting details", { variant: "info" });
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${location?.latitude}&lon=${location?.longitude}&format=json`
    )
      .then((res) => res.json())
      .then(async (data) => {
        const address = data.address;
        var country = address.country;
        var county = address?.city || address.state;
        var subCounty = address.state_district || address.suburb;
        var locality = address.city || address.town || address.village;
        var latitude = location?.latitude;
        var longitude = location?.longitude;
        var description = formData.description;
        var imageUrl = imageURL;

        await saveLocationDetails(
          country,
          county,
          subCounty,
          description,
          imageUrl,
          latitude,
          locality,
          longitude
        );
      });
  };

  const saveLocationDetails = async (
    country,
    county,
    subCounty,
    description,
    imageurl,
    latitude,
    locality,
    longitude
  ) => {
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
      },
    });
    const { success, message } = data.createGeoLocation;
    if (success) {
      enqueueSnackbar("Details saved successfully", { variant: "success" });
      fetchData();
      refetchMappings();
      setOpen(false);
    } else {
      enqueueSnackbar(`Error:, ${message}`, { variant: "error" });
    }
  };

    useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsTakingPictures(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasBackCamera = devices.some(device =>
        device.kind === 'videoinput' && device.label.toLowerCase().includes('back')
      );
  
      const constraints = {
        video: {
          facingMode: hasBackCamera ? { exact: 'environment' } : 'user',
        },
      };
  
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };
  

  const takePicture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    setPhoto(imageDataUrl);
    setIsTakingPictures(false);
  };

  const handlePickFolder = () => {
    folderInputRef.current.click();
  };

  const onFilesPicked = (event) => {
    const files = event.target.files;
    for (let file of files) {
      console.log(file.webkitRelativePath || file.name);
    }
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
    
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setPhoto(dataUrl);
      };

  
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setOpen(false)
    setIsTakingPictures(false)
    setPhoto(null)
  }
  return <>
  <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        className="home_page_modal_zindex"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Take a picture and report waste dumping.
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
      {(!location?.latitude || !location?.longitude) && (
        <Typography color="error" sx={{ mb: 2 }}>
          If your latitude and longitude is not pre-filled, please enable location access and reload the page.
        </Typography>
      )}

      {/* Latitude & Longitude */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Latitude"
            name="latitude"
            value={location?.latitude}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Longitude"
            name="longitude"
            value={location?.longitude}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      {/* Image Upload Section */}
      <Box mt={3}>
        <Typography variant="subtitle1" gutterBottom>
          Take/Upload a Picture
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button fullWidth variant="contained" onClick={startCamera}>
              Take a picture
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button fullWidth variant="outlined" onClick={handlePickFolder}>
              Upload a picture
            </Button>
          </Grid>
        </Grid>

        <input
          type="file"
          name="image_url"
          ref={folderInputRef}
          onChange={onFilesPicked}
          style={{ display: 'none' }}
        />

        <Box mt={2} className="image_file_design">
          {isTakingPictures && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', maxWidth: '100%' }}
              />
              <IconButton
                onClick={takePicture}
                className="take_picture_positioned_button"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'white',
                }}
              >
                <CameraAltOutlined />
              </IconButton>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </>
          )}
          {!isTakingPictures && photo && (
            <div className="taken_picture_card">
              <div className="close_card_button">
                <IconButton onClick={() => { setPhoto(null); setIsTakingPictures(false) }}><CloseIcon /></IconButton>
              </div>
              <img
                src={photo}
                alt="Captured"
                style={{ marginTop: 10, maxWidth: '100%' }}
              />
            </div>
          )}
        </Box>
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
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>
    </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
  </>;
};

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
    ) {
      success
      message
    }
  }
`;


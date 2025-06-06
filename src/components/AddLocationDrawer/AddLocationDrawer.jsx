import React, { useState, useRef, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from "notistack";
import {
  DialogTitle,
  IconButton,
  DialogContent,
  Typography,
  DialogActions,
  Button,
  Dialog,
  Box,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import imageCompression from "browser-image-compression";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const AddLocationDrawer = ({
  open,
  setOpen,
  location,
  fetchData = () => {},
  refetchMappings = () => {},
  setIsUpdatingForm = () => {},
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [photo, setPhoto] = useState(null);
  const [createGeoLocation] = useMutation(CREATE_GEO_LOCATION);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isTakingPictures, setIsTakingPictures] = useState(false);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click(); // Trigger the hidden input
  };
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    latitude: location?.latitude || "",
    longitude: location?.longitude || "",
    description: "",
    wasteType: "",
    wbProneArea: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.wasteType) {
      enqueueSnackbar("Please select the waste type", { variant: "error" });
      setIsLoading(false);
      return false;
    }
    if (!photo) {
      enqueueSnackbar("Please make sure you upload an image", {
        variant: "error",
      });
      setIsLoading(false);
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
        throw new Error("Unexpected response from server.");
      }

      const { success, message } = data.createGeoLocation;

      if (success) {
        enqueueSnackbar("Details saved successfully", { variant: "success" });
        fetchData();
        refetchMappings();
        setOpen(false);
      } else {
        enqueueSnackbar(`Error: ${message || "Unknown error occurred"}`, {
          variant: "error",
        });
      }
    } catch (err) {
      // Log full error for debugging
      console.error("Failed to save location details:", err);

      // Show user-friendly error
      enqueueSnackbar(
        `Failed to save location: ${err.message || "An unexpected error occurred."}`,
        { variant: "error" }
      );
    } finally {
      setIsUpdatingForm(true)
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
        (device) =>
          device.kind === "videoinput" &&
          device.label.toLowerCase().includes("back")
      );

      const constraints = {
        video: {
          facingMode: hasBackCamera ? { ideal: "environment" } : "user",
        },
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      enqueueSnackbar(
        "Error accessing camera. Please check your camera permissions. or make sure no browser is using the cammera",
        { variant: "error" }
      );
      console.error("Error accessing camera:", err);
    }
  };

  useEffect(() => {
    if (open && !photo) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          startCamera();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, photo]);

  const litterTypeOptions = ["Plastic", "Glass", "Mixed Waste"];

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
    // if (file) {
    //   const reader = new FileReader();

    //   reader.onloadend = () => {
    //     setPhoto(reader.result);
    //     console.log("Data URL:", reader.result);
    //   };

    //   reader.readAsDataURL(file);
    // }
  };

  const handleClose = () => {
    setOpen(false);
    setIsTakingPictures(false);
    setPhoto(null);
  };
  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        className="home_page_modal_zindex"
        style={{ zIndex: "" }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Take a picture and report waste dumping.
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2 }}
          >
            {/* Location warning */}
            {(!location?.latitude || !location?.longitude) && (
              <Typography color="error" sx={{ mb: 2 }}>
                If your latitude and longitude is not pre-filled, please enable
                location access and reload the page.
              </Typography>
            )}

            {/* Latitude & Longitude */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  disabled={true}
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
                  disabled={true}
                  label="Longitude"
                  name="longitude"
                  value={location?.longitude}
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
                value={formData.wasteType || ""}
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
                style={{ display: "none" }}
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
                      style={{ marginTop: 10, maxWidth: "100%" }}
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
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
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

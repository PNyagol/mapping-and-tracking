/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { Typography } from "@mui/material";

// Custom red icon
const redIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "red-marker",
});

// Custom Search Control Component
const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false, // Disable marker
      showPopup: false, // Disable popup
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

export const Mapping = ({ data = [], latitude, longitude }) => {
  const mapStyle = 'street'
  const tileLayers = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  };

  return (
    <div className="h-100" style={{ position: "relative" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={7}
        style={{ height: "100vh" }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url={tileLayers[mapStyle]}
        />
        <SearchControl />
        {data.map(({ id, county, subCounty, latitude, longitude, user, imageUrl }) => (
          <Marker key={id} position={[latitude, longitude]} icon={redIcon}>
            <Popup>
              <div>
                <div>
                  <b>County:</b> {county}
                </div>
                <div>
                  <b>Sub-County:</b> {subCounty}
                </div>
                <div>
                  <b>User:</b> {user?.firstName} {user?.lastName}
                </div>
                <Typography variant="div">
                  <img
                    srcSet={`${imageUrl}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    src={imageUrl}
                    alt={subCounty}
                    loading="lazy"
                    style={{ width: '200px' }}
                  />
                </Typography>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

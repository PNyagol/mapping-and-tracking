import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { Typography } from '@mui/material';
import osmtogeojson from 'osmtogeojson';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material'

// Custom red icon
const redIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'red-marker',
});

const SearchControl = ({ onSearch }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      const placeName = result?.location?.raw.name || result?.location?.label;
      const latlng = [result.location.y, result.location.x];
      onSearch(result?.location?.raw);
    });

    return () => map.removeControl(searchControl);
  }, [map, onSearch]);

  return null;
};

export const Mapping = ({ data = [], latitude, longitude, setSeeAllLocations, seeAllLocations }) => {
  const [boundaryData, setBoundaryData] = useState(null);
  const mapRef = useRef();

  const handleSearch = async (placeData) => {
    const { osm_type, osm_id, lat, lon, display_name } = placeData;

    let query = '';
    let isReverseLookup = false;

    if (osm_type === 'relation') {
      query = `[out:json];relation(${osm_id});out geom;`;
    } else if (osm_type === 'way') {
      query = `[out:json];way(${osm_id});out geom;`;
    } else if (osm_type === 'node') {
      isReverseLookup = true;
      query = `
        [out:json];
        is_in(${lat}, ${lon})->.a;
        (
          rel(pivot.a)["boundary"="administrative"];
        );
        out geom;
      `;
    } else {
      console.warn("Unsupported osm_type for boundary:", osm_type);
      return;
    }

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      const data = await response.json();

      
      if (data?.elements?.length > 0) {
        const smallestFeature = data?.elements.reduce((smallest, current) => {
          const getArea = (bounds) =>
            (bounds.maxlat - bounds.minlat) * (bounds.maxlon - bounds.minlon);

          const smallestArea = getArea(smallest.bounds || {});
          const currentArea = getArea(current.bounds || {});

          return currentArea < smallestArea ? current : smallest;
        });

        const details = {
          ...data,
          elements: [smallestFeature]
        }
        const geojson = osmtogeojson(details);
        setBoundaryData(geojson);

        if (mapRef.current && geojson.features?.[0]?.geometry) {
          const bounds = L.geoJSON(geojson).getBounds();
          mapRef.current.fitBounds(bounds);
        }
      } else {
        if (osm_type === 'node') {
          const marker = L.marker([lat, lon])
            .addTo(mapRef.current)
            .bindPopup(`Location: ${display_name}`);
          mapRef.current.setView([lat, lon], 16);
        } else {
          console.warn("No boundary data found.");
        }
      }
    } catch (error) {
      console.error("Error fetching boundary data:", error);
    }
  };

  return (
    <div className="h-100" style={{ position: 'relative' }}>
      <div className="see_all_locations_toggle">
        <FormGroup>
          <FormControlLabel control={<Checkbox onClick={() => { setSeeAllLocations(!seeAllLocations) }}/>} label="See All" />
        </FormGroup>
      </div>
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        style={{ height: '100vh' }}
        scrollWheelZoom={true}
        zoomControl={true}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchControl onSearch={handleSearch} />

        {boundaryData && (
          <GeoJSON
            key={JSON.stringify(boundaryData)} // re-render on new data
            data={boundaryData}
            style={{ color: 'blue', weight: 2 }}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(
                `Boundary: ${feature.properties.name || 'Unnamed'}`
              );
            }}
          />
        )}

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

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  GeoJSON,
} from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import osmtogeojson from 'osmtogeojson';
import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';
import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material'
import { gql, useQuery } from '@apollo/client';


const redIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'red-marker',
});

const SearchControl = ({ onSearch, setCenterLocation }) => {
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
      setCenterLocation({lat: latlng[0], lng: latlng[1]})
      onSearch(result?.location?.raw);
    });

    return () => map.removeControl(searchControl);
  }, [map, onSearch]);

  return null;
};

export function OverviewAnalyticsView() {
  const today = new Date();
  const currentDate = today.toISOString().slice(0, 10).replaceAll("-", "/");

  const twoMonthsFromNowUnFromated = new Date(
    today.getFullYear(),
    today.getMonth() - 3,
    today.getDate()
  );
  const twoMonthsFromNow = twoMonthsFromNowUnFromated
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "/");

  const startDate = twoMonthsFromNow;
  const endDate = currentDate;

    const { enqueueSnackbar } = useSnackbar();
    const [openForm, setOpenForm] = useState(false);
    const [boundaryData, setBoundaryData] = useState(null);
    const mapRef = useRef();
    const [latitude, setLatitude] = useState(-1.2921);
    const [longitude, setLongitude] = useState(36.8219);
    const [seeAllLocations, setSeeAllLocations] = useState(false)
    const { data: reports } = useQuery(GET_USER_REPORT);
    const [locationData, setLocationData] = useState([]);
    const { data, refetch } = useQuery(GET_USER_ALL_GEOLOCATION, {
      variables: { startDate, endDate },
    });
    const { data: dataAll, refetch: refetchAll } = useQuery(GET_ALL_GEOLOCATION, {
      variables: { startDate, endDate },
    });

    useEffect(() => {
      const isLoggedInUser = sessionStorage.getItem("_authToken")
      if(!isLoggedInUser){
        setSeeAllLocations(true);
      }
    }, [])

    useEffect(() => {
      if (seeAllLocations) {
        setLocationData(dataAll?.allGeoLocations || []);
      } else {
        setLocationData(data?.allUserLocations || []);
      }
    }, [data, dataAll, seeAllLocations]);

    const refetchAllDetails = () => {
      if(seeAllLocations){
        refetchAll();
      }else{
        refetch();
      }
    };
    
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            setLatitude(latitude)
            setLongitude(longitude)
            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);
          },
          (error) => {
            console.error("Error getting location:", error.message);
          },
          {
            enableHighAccuracy: true, // use GPS if available
            timeout: 10000,           // stop trying after 10 seconds
            maximumAge: 0             // do not use cached location
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        enqueueSnackbar("Geolocation is not supported by this browser.", { variant: 'error' })
      }
    }, [enqueueSnackbar])
  
    const [centerLocation, setCenterLocation] = useState({ lat: latitude, lng: longitude })
  
  
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
  
      useEffect(() => {
      if(latitude && longitude) {
        setCenterLocation({ lat: latitude, lng: longitude });
      } 
    }, [latitude, longitude]);
  
  
    const MapCenterUpdater = ({ center }) => {
      const map = useMap();
      useEffect(() => {
        map.setView(center);
      }, [center]);
      return null;
    };
  return (
    <DashboardContent maxWidth="xl">
    <div className="h-100 w-100" style={{ position: 'relative' }}>
      <div className="see_all_locations_toggle">
        <FormGroup>
          <FormControlLabel control={<Checkbox onClick={() => { setSeeAllLocations(!seeAllLocations) }}/>} label="See All" />
        </FormGroup>
      </div>
      <MapContainer
        center={[centerLocation?.lat, centerLocation?.lng]}
        zoom={18}
        style={{ height: '100vh' }}
        scrollWheelZoom
        zoomControl
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <MapCenterUpdater center={[centerLocation?.lat, centerLocation?.lng]} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <SearchControl onSearch={handleSearch} setCenterLocation={setCenterLocation}/>

        {boundaryData && (
          <GeoJSON
            key={JSON.stringify(boundaryData)}
            data={boundaryData}
            style={{ color: 'blue', weight: 2 }}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(
                `Boundary: ${feature.properties.name || 'Unnamed'}`
              );
            }}
          />
        )}

        {locationData.map(({ id, county, subCounty, latitude, longitude, user, imageUrl }) => (
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
    </DashboardContent>
  );
}


const GET_USER_ALL_GEOLOCATION = gql`
  query allUserLocations($startDate: String, $endDate: String) {
    allUserLocations(startDate: $startDate, endDate: $endDate) {
      id
      user {
        firstName
        lastName
      }
      county
      country
      subCounty
      ward
      latitude
      longitude
      imageUrl
      description
      isAssigned
      isCollected
      dateAdded
      projectSet {
        id
        projectName {
          county
          subCounty
          ward
        }
        projectTimelineFrom
      }
      assignwasteSet {
        id
        user {
          DriverName
        }
      }
    }
  }
`;

const GET_ALL_GEOLOCATION = gql`
  query allGeoLocations($startDate: String, $endDate: String) {
    allGeoLocations(startDate: $startDate, endDate: $endDate) {
      id
      user {
        firstName
        lastName
      }
      county
      country
      subCounty
      ward
      latitude
      longitude
      imageUrl
      description
      isAssigned
      isCollected
      dateAdded
      projectSet {
        id
        projectName {
          county
          subCounty
          ward
        }
        projectTimelineFrom
      }
      assignwasteSet {
        id
        user {
          DriverName
        }
      }
    }
  }
`;

const GET_USER_REPORT = gql`
  query getUserDataReport {
    getUserDataReport {
      reported {
        month
        total
      }
      assigned {
        month
        total
      }
      inProgress {
        month
        total
      }
      completed {
        month
        total
      }
    }
  }
`;
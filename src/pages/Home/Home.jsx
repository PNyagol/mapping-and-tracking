import React, { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";
import { Mapping } from "../../components/Mapping/Mapping";
import { gql, useQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
// import { Grid, Card, CardContent, Typography } from "@mui/material";
// import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export const Home = () => {
  const [latitude, setLatitude] = useState(-1.286389);
  const [longitude, setLongitude] = useState(36.817223);
  const { data: reports } = useQuery(GET_USER_REPORT);
  const [collection, setCollection] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [seeAllLocations, setSeeAllLocations] = useState(false);
  const [locationData, setLocationData] = useState([]);
  const [isUpdatingForm, setIsUpdatingForm] = useState(false);

  useEffect(() => {
    document.title = "Dashboard - Mazingira Concept";
  }, []);

  useEffect(() => {
    if (reports?.getUserDataReport) {
      const res = reports?.getUserDataReport;
      setCollection(res?.reported || []);
      setCompleted(res?.completed || []);
      setInProgress(res?.inProgress || []);
      setScheduled(res?.assigned || []);
    }
  }, [reports]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
      },
      (err) => {

        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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

  const { data, refetch } = useQuery(GET_USER_ALL_GEOLOCATION, {
    variables: { startDate, endDate },
  });

  const { data: dataAll, refetch: refetchAll } = useQuery(GET_ALL_GEOLOCATION, {
    variables: { startDate, endDate },
  });

  useEffect(() => {
    if (seeAllLocations) {
      setLocationData(dataAll?.allGeoLocations || []);
    } else {
      setLocationData(data?.allUserLocations || []);
    }
  }, [data, dataAll, seeAllLocations]);

  const refetchAllDetails = () => {
    refetchAll();
    refetch();
  };

  useEffect(() => {
    document.title = "Mazingira Concept | Dashboard";
  }, []);

  useEffect(() => {
    getLocation();
  }, [isUpdatingForm]);

  return (
    <>
      <Dashboard
        fetchData={refetchAllDetails}
        refetchMappings={refetchAllDetails}
        setIsUpdatingForm={setIsUpdatingForm}
      >
        <div className="content" style={{ position: "relative" }}>
          <Mapping
            data={locationData}
            latitude={latitude}
            longitude={longitude}
            setSeeAllLocations={setSeeAllLocations}
            seeAllLocations={seeAllLocations}
          />
        </div>
      </Dashboard>
    </>
  );
};

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

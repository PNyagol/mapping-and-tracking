import React, { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";
import { Mapping } from "../../components/Mapping/Mapping";
import { gql, useQuery } from "@apollo/client";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export const Home = () => {
  const [latitude, setLatitude] = useState(-1.286389);
  const [longitude, setLongitude] = useState(36.817223);
  const { data: reports } = useQuery(GET_USER_REPORT);
  const [collection, setCollection] = useState([])
  const [completed, setCompleted] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [scheduled, setScheduled] = useState([])

  useEffect(() => {
    document.title = "Dashboard - Mazingira Concept";
  }, []);

  useEffect(() => {
    if(reports?.getUserDataReport){
      const res = reports?.getUserDataReport
      setCollection(res?.reported || [])
      setCompleted(res?.completed || [])
      setInProgress(res?.inProgress || [])
      setScheduled(res?.assigned || [])
    }
  }, [reports])

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
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

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

  useEffect(() => {
    document.title = "Mazingira Concept | Dashboard";
  }, []);

  useEffect(() => {
    refetch();
  }, [startDate, endDate, refetch]);


  const reportData = [
    { title: "Reported Litter", data: collection },
    { title: "Scheduled for clean up", data: scheduled },
    { title: "In Progress", data: inProgress },
    { title: "Completed cleanups", data: completed },
  ];
  return (
    <>
      <Dashboard fetchData={refetch} refetchMappings={refetch}>
        <div className="content" style={{ position: "relative" }}>
          <Mapping data={data?.allUserLocations || []} latitude={latitude} longitude={longitude}/>
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
`
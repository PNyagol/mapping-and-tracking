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
          <div className="overlayed_over_map">
            <Grid container spacing={3} justifyContent={"space-between"}>
              {reportData.map((map, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ minHeight: 150, width: "100%" }} className="card">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <b>{map.title}</b>
                      </Typography>
                      <Typography variant="body2">
                          <Typography variant="h5"><b>Total: {map.data.reduce((acc, rep) => acc + rep.total, 0)}</b></Typography>
                          {/* <Typography style={{ color : 'hsl(220, 20%, 35%)', fontSize: '12px' }}>In the last 30 days</Typography> */}
                        </Typography>
                      <div className="graph_content">
                        <ResponsiveContainer width="100%" height={40}>
                          <AreaChart
                            data={map.data}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            
                          >
                            <defs>
                              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgb(82, 188, 82)" stopOpacity={0.5} />
                                <stop offset="50%" stopColor="rgb(82, 188, 82)" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="rgb(82, 188, 82)" stopOpacity={0} />
                              </linearGradient>
                            </defs>

                            <XAxis dataKey="month" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "none",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                              }}
                              cursor={false}
                            />
                            <Area
                              type="linear"
                              dataKey="total"
                              stroke="rgb(82, 188, 82)"
                              strokeWidth={2}
                              fill="url(#colorGreen)"
                              strokeOpacity={1}
                              dot={false}
                              isAnimationActive={true}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
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